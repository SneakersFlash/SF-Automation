'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { api, apiUpload, ApiError } from '@/lib/api';
import { useFetch } from '@/lib/hooks';
import {
  Alert,
  Button,
  Card,
  CopyButton,
  Field,
  PageHeader,
  Select,
  TextInput,
  Textarea,
} from '@/components/ui/primitives';

// Metadata tiap tipe konten. Harus sinkron dengan CONTENT_TYPES di
// api/src/creative/dto/creative.dto.ts (kontrak skill content-brief v2).
const TYPE_META: Record<string, { label: string; kind: 'visual' | 'text' }> = {
  carousel: { label: 'Carousel', kind: 'visual' },
  image: { label: 'Single Image', kind: 'visual' },
  video_core: { label: 'Video Core', kind: 'visual' },
  ads: { label: 'Ads', kind: 'visual' },
  feeds9: { label: '9-Feeds Konsisten', kind: 'visual' },
  story: { label: 'Story', kind: 'text' },
  short_video: { label: 'Short Video', kind: 'text' },
  thread: { label: 'Thread', kind: 'text' },
  email: { label: 'Email', kind: 'text' },
  blog: { label: 'Blog', kind: 'text' },
};

interface BrandProfile {
  id: string;
  brandName: string;
  isDefault: boolean;
}

interface ContentItem {
  productName: string;
  description: string;
  goal: string;
  message: string;
  cta: string;
  visualStyle: string;
}

// Status generate per item. Tiap item digenerate lewat request terpisah agar
// hasilnya muncul begitu selesai (progress nyata, bukan nunggu seluruh batch).
type ItemGen =
  | { status: 'pending' }
  | { status: 'done'; result: unknown }
  | { status: 'error'; error: string };

function emptyItem(): ContentItem {
  return { productName: '', description: '', goal: '', message: '', cta: '', visualStyle: '' };
}

// CRE-06: generate gambar asli via kie.ai dari asset visual (image_prompt).
interface VisualAsset {
  role?: string;
  media?: string;
  image_prompt?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
}

function getVisualAssets(result: unknown): VisualAsset[] {
  const assets = (result as { assets?: unknown })?.assets;
  return Array.isArray(assets) ? (assets as VisualAsset[]) : [];
}

// nano-banana-2 terima aspect_ratio yang sama dengan yang dihasilkan skill
// content-brief (4:5, 9:16, 16:9, dst) -- kirim langsung, fallback 'auto'
// kalau di luar daftar yang didukung (jaga-jaga varian tak terduga dari LLM).
const SUPPORTED_ASPECT = new Set([
  '1:1', '1:4', '1:8', '2:3', '3:2', '3:4', '4:1', '4:3', '4:5', '5:4',
  '8:1', '9:16', '16:9', '21:9', 'auto',
]);
function resolveAspect(aspectRatio?: string): string {
  return aspectRatio && SUPPORTED_ASPECT.has(aspectRatio) ? aspectRatio : 'auto';
}

type ImgGenState =
  | { status: 'idle' }
  | { status: 'busy' }
  | { status: 'pending'; id: string }
  | { status: 'done'; urls: string[] }
  | { status: 'error'; error: string };

// Unduh gambar hasil (cross-origin) via blob -- <a download> saja tak selalu
// berhasil untuk resource beda origin. Fallback: buka tab baru kalau fetch gagal.
async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank');
  }
}

// Zona upload klik-atau-drag&drop untuk 1 foto (produk/referensi).
function PhotoDropZone({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div>
      <span className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-paper-faint">
        {label}
      </span>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onChange(f);
        }}
        className={`flex min-h-[44px] cursor-pointer items-center justify-center rounded-chip border border-dashed px-3 py-2 text-center text-xs transition-colors ${
          dragOver
            ? 'border-flash bg-flash-soft/20 text-flash'
            : 'border-line/60 text-paper-faint hover:border-line'
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        {file ? file.name : 'Klik atau drag & drop foto ke sini'}
      </label>
    </div>
  );
}

function ImageGenAsset({
  asset,
  brandProfileId,
}: {
  asset: VisualAsset;
  brandProfileId: string;
}) {
  const [state, setState] = useState<ImgGenState>({ status: 'idle' });
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [referencePhoto, setReferencePhoto] = useState<File | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // Polling status sampai done/error (kie.ai handle async-nya sendiri via
  // webhook; polling ini fallback dari sisi FE kalau user masih di halaman).
  useEffect(() => {
    if (state.status !== 'pending') return;
    const id = state.id;
    const t = setInterval(async () => {
      try {
        const row = await api<{
          status: string;
          resultImageUrls: string[];
          errorMessage?: string;
        }>(`/creative/images/${id}`);
        if (row.status === 'done') setState({ status: 'done', urls: row.resultImageUrls });
        else if (row.status === 'error') {
          setState({ status: 'error', error: row.errorMessage || 'Generate gambar gagal.' });
        }
      } catch {
        // error transient (network) -- biarkan polling lanjut ke tick berikutnya
      }
    }, 3000);
    return () => clearInterval(t);
  }, [state]);

  async function runGenerate(referenceImageUrls?: string[]) {
    try {
      const row = await api<{ id: string }>('/creative/images', {
        method: 'POST',
        body: {
          prompt: asset.image_prompt,
          negativePrompt: asset.negative_prompt,
          size: resolveAspect(asset.aspect_ratio),
          referenceImageUrls,
          brandProfileId: brandProfileId || undefined,
        },
      });
      setState({ status: 'pending', id: row.id });
    } catch (err) {
      setState({
        status: 'error',
        error: err instanceof ApiError ? err.message : 'Gagal generate gambar.',
      });
    }
  }

  async function handleGenerateWithPhotos() {
    const picked = [productPhoto, referencePhoto].filter((f): f is File => Boolean(f));
    if (picked.length === 0) return;
    setState({ status: 'busy' });
    try {
      // Urutan dijaga: foto produk dulu baru referensi -- filesUrl kie.ai
      // memperlakukan gambar pertama sbg basis utama untuk image-edit.
      const uploaded = await Promise.all(
        picked.map((f) => apiUpload<{ url: string }>('/creative/images/upload', f)),
      );
      await runGenerate(uploaded.map((u) => u.url));
    } catch (err) {
      setState({
        status: 'error',
        error: err instanceof ApiError ? err.message : 'Upload foto gagal.',
      });
    }
  }

  if (asset.media && asset.media !== 'image') return null; // shot list video, bukan target kie.ai

  return (
    <div className="mt-2 rounded-chip border border-line/60 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs text-paper-faint">{asset.role ?? 'asset'}</span>
        {(state.status === 'idle' || state.status === 'error') && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="text-xs"
              onClick={() => {
                setState({ status: 'busy' });
                void runGenerate();
              }}
            >
              Generate Gambar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-xs"
              onClick={() => setShowUpload((s) => !s)}
            >
              Tambah Foto & Generate
            </Button>
          </div>
        )}
      </div>

      {showUpload && (state.status === 'idle' || state.status === 'error') && (
        <div className="mb-2 space-y-2 rounded-chip border border-line/40 p-2">
          <PhotoDropZone label="Foto Produk" file={productPhoto} onChange={setProductPhoto} />
          <PhotoDropZone
            label="Foto Referensi (gaya/pose, opsional)"
            file={referencePhoto}
            onChange={setReferencePhoto}
          />
          <Button
            type="button"
            className="text-xs"
            disabled={!productPhoto && !referencePhoto}
            onClick={handleGenerateWithPhotos}
          >
            Generate dengan Foto
          </Button>
        </div>
      )}

      {(state.status === 'busy' || state.status === 'pending') && (
        <div className="flex items-center gap-2" aria-live="polite">
          <div className="h-20 w-20 animate-pulse rounded bg-line" />
          <span className="font-mono text-xs text-paper-faint">
            {state.status === 'busy' ? 'Upload & mulai generate…' : 'Generating gambar…'}
          </span>
        </div>
      )}

      {state.status === 'error' && <Alert kind="error">{state.error}</Alert>}

      {state.status === 'done' && (
        <div className="flex flex-wrap gap-3">
          {state.urls.map((u, i) => (
            <div key={u} className="space-y-1">
              <a href={u} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={u}
                  alt={asset.role ?? 'hasil gambar'}
                  className="h-40 w-40 rounded object-cover transition-opacity hover:opacity-80"
                />
              </a>
              <button
                type="button"
                onClick={() => downloadImage(u, `${(asset.role ?? 'image').replace(/\s+/g, '-')}-${i + 1}.png`)}
                className="w-full rounded-chip border border-line px-2 py-1 text-[11px] text-paper-dim transition-colors hover:border-flash hover:text-paper"
              >
                Unduh
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ContentTypePage() {
  // Semua hook dipanggil tanpa syarat dulu, baru notFound() (jaga urutan hook).
  const params = useParams<{ type: string }>();
  const type = String(params.type ?? '');
  const meta = TYPE_META[type];

  const brands = useFetch<BrandProfile[]>(() => api('/brand-profiles'));
  const [brandProfileId, setBrandProfileId] = useState('');
  const [items, setItems] = useState<ContentItem[]>([emptyItem()]);
  const [gen, setGen] = useState<ItemGen[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Timer elapsed selama generate — sinyal anti-freeze buat wait ~1 menit.
  useEffect(() => {
    if (!busy) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  if (!meta) notFound();

  function updateItem(idx: number, patch: Partial<ContentItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }
  function removeItem(idx: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    // Snapshot item saat submit; tiap item dikunci ke tipe halaman ini.
    const snapshot = items.map((it) => ({ ...it, contentType: type }));
    setGen(snapshot.map(() => ({ status: 'pending' })));
    setBusy(true);

    // N request paralel, 1 item per request. Konkurensi sama seperti sebelumnya
    // (backend memang Promise.all), tapi tiap hasil bisa render begitu selesai.
    await Promise.all(
      snapshot.map(async (item, idx) => {
        try {
          const res = await api<{ results: unknown[] }>('/creative/content-brief', {
            method: 'POST',
            body: { brandProfileId: brandProfileId || undefined, items: [item] },
          });
          setGen((prev) =>
            prev
              ? prev.map((g, i) => (i === idx ? { status: 'done', result: res.results[0] } : g))
              : prev,
          );
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : 'Gagal generate item ini.';
          setGen((prev) =>
            prev ? prev.map((g, i) => (i === idx ? { status: 'error', error: msg } : g)) : prev,
          );
        }
      }),
    );

    setBusy(false);
  }

  const settled = gen?.filter((g) => g.status !== 'pending').length ?? 0;
  const total = gen?.length ?? 0;
  const doneResults =
    gen?.filter((g) => g.status === 'done').map((g) => (g as { result: unknown }).result) ?? [];

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader section="Content" title={meta.label} />

      <Card className="mb-6">
        <form onSubmit={generate} className="space-y-4">
          <div className="sm:max-w-xs">
            <Field label="Brand Profile">
              <Select value={brandProfileId} onChange={(e) => setBrandProfileId(e.target.value)}>
                <option value="">Default</option>
                {brands.data?.map((b) => (
                  <option key={b.id} value={b.id}>{b.brandName}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="space-y-4">
            {items.map((it, idx) => (
              <div key={idx} className="rounded-card border border-line bg-ink-900/40 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-paper-faint">
                    Konten {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1 || busy}
                    className="text-xs text-down disabled:opacity-30"
                  >
                    Hapus
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nama Produk">
                    <TextInput
                      required
                      value={it.productName}
                      onChange={(e) => updateItem(idx, { productName: e.target.value })}
                      placeholder="Nike Dunk Low Panda"
                    />
                  </Field>
                  <Field label="Manfaat / Goal">
                    <TextInput
                      value={it.goal}
                      onChange={(e) => updateItem(idx, { goal: e.target.value })}
                      placeholder="awareness restock / drive checkout"
                    />
                  </Field>
                  <Field label="Deskripsi">
                    <TextInput
                      value={it.description}
                      onChange={(e) => updateItem(idx, { description: e.target.value })}
                      placeholder="black/white, sizerun lengkap, 1.9jt"
                    />
                  </Field>
                  <Field label="Pesan">
                    <TextInput
                      value={it.message}
                      onChange={(e) => updateItem(idx, { message: e.target.value })}
                      placeholder="restock terbatas, gercep"
                    />
                  </Field>
                  <Field label="CTA">
                    <TextInput
                      value={it.cta}
                      onChange={(e) => updateItem(idx, { cta: e.target.value })}
                      placeholder="checkout di Shopee Mall"
                    />
                  </Field>
                  {meta.kind === 'visual' && (
                    <Field label="Gaya Visual">
                      <Textarea
                        value={it.visualStyle}
                        onChange={(e) => updateItem(idx, { visualStyle: e.target.value })}
                        placeholder="clean studio, kontras hitam-putih, editorial"
                      />
                    </Field>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="ghost" onClick={addItem} disabled={busy}>
              + Tambah konten
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? `Generating… ${elapsed}s` : 'Generate'}
            </Button>
            {busy && (
              <span className="font-mono text-xs text-paper-faint">
                {settled}/{total} selesai · biasanya ~1 menit/item (paralel)
              </span>
            )}
          </div>
        </form>
      </Card>

      {gen && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-paper-faint">
              {settled}/{total} selesai
              {doneResults.length > 0 && ' — JSON siap oper ke AI'}
            </span>
            {doneResults.length > 0 && (
              <CopyButton text={JSON.stringify(doneResults, null, 2)} />
            )}
          </div>

          {gen.map((g, idx) => (
            <Card key={idx}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-flash">
                  {meta.label} · {idx + 1}
                </span>
                {g.status === 'done' && (
                  <CopyButton text={JSON.stringify(g.result, null, 2)} />
                )}
              </div>

              {g.status === 'pending' && (
                <div className="space-y-2" aria-live="polite">
                  <span className="font-mono text-xs text-paper-faint">Generating… {elapsed}s</span>
                  <div className="h-3 w-3/4 animate-pulse rounded bg-line" />
                  <div className="h-3 w-full animate-pulse rounded bg-line" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-line" />
                </div>
              )}

              {g.status === 'error' && <Alert kind="error">{g.error}</Alert>}

              {g.status === 'done' && (
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-paper-dim">
                  {JSON.stringify(g.result, null, 2)}
                </pre>
              )}

              {g.status === 'done' && meta.kind === 'visual' &&
                getVisualAssets(g.result).map((asset, ai) => (
                  <ImageGenAsset key={ai} asset={asset} brandProfileId={brandProfileId} />
                ))}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
