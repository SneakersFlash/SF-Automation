'use client';

import { useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAction, useFetch } from '@/lib/hooks';
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

function emptyItem(): ContentItem {
  return { productName: '', description: '', goal: '', message: '', cta: '', visualStyle: '' };
}

export default function ContentTypePage() {
  // Semua hook dipanggil tanpa syarat dulu, baru notFound() (jaga urutan hook).
  const params = useParams<{ type: string }>();
  const type = String(params.type ?? '');
  const meta = TYPE_META[type];

  const brands = useFetch<BrandProfile[]>(() => api('/brand-profiles'));
  const { busy, error, run } = useAction();
  const [brandProfileId, setBrandProfileId] = useState('');
  const [items, setItems] = useState<ContentItem[]>([emptyItem()]);
  const [results, setResults] = useState<unknown[] | null>(null);

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
    setResults(null);
    await run(async () => {
      // Tiap item dikunci ke tipe halaman ini.
      const payloadItems = items.map((it) => ({ ...it, contentType: type }));
      const res = await api<{ results: unknown[] }>('/creative/content-brief', {
        method: 'POST',
        body: { brandProfileId: brandProfileId || undefined, items: payloadItems },
      });
      setResults(res.results);
    });
  }

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
                    disabled={items.length === 1}
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

          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={addItem}>+ Tambah konten</Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Generating…' : 'Generate'}
            </Button>
          </div>
        </form>
        {error && <div className="mt-3"><Alert kind="error">{error}</Alert></div>}
      </Card>

      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-paper-faint">
              {results.length} hasil — JSON siap oper ke AI
            </span>
            <CopyButton text={JSON.stringify(results, null, 2)} />
          </div>
          {results.map((r, idx) => (
            <Card key={idx}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-flash">
                  {meta.label} · {idx + 1}
                </span>
                <CopyButton text={JSON.stringify(r, null, 2)} />
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-paper-dim">
                {JSON.stringify(r, null, 2)}
              </pre>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
