'use client';

import { useState } from 'react';
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

const VISUAL_TYPES = [
  { v: 'carousel', label: 'Carousel' },
  { v: 'image', label: 'Single Image' },
  { v: 'video_core', label: 'Video Core' },
  { v: 'ads', label: 'Ads' },
  { v: 'feeds9', label: '9-Feeds Konsisten' },
];
const TEXT_TYPES = [
  { v: 'story', label: 'Story' },
  { v: 'short_video', label: 'Short Video' },
  { v: 'thread', label: 'Thread' },
  { v: 'email', label: 'Email' },
  { v: 'blog', label: 'Blog' },
];

interface BrandProfile { id: string; brandName: string; isDefault: boolean }

interface ContentItem {
  contentType: string;
  productName: string;
  description: string;
  goal: string;
  message: string;
  cta: string;
  visualStyle: string;
}

interface Asset {
  role?: string;
  media?: string;
  image_prompt?: string;
  aspect_ratio?: string;
  text_overlay?: string;
  negative_prompt?: string;
  motion?: string;
  duration_s?: number;
  audio_cue?: string;
}

interface ResultItem {
  contentType: string;
  kind: 'visual' | 'text';
  concept?: string;
  assets?: Asset[];
  copy?: {
    caption?: string;
    cta?: string;
    hashtags?: string[];
    headline?: string;
    primary_text?: string;
  };
  brief?: string;
}

function emptyItem(contentType = 'carousel'): ContentItem {
  return { contentType, productName: '', description: '', goal: '', message: '', cta: '', visualStyle: '' };
}

const LABELS: Record<string, string> = Object.fromEntries(
  [...VISUAL_TYPES, ...TEXT_TYPES].map((t) => [t.v, t.label]),
);

export default function ContentBriefPage() {
  const brands = useFetch<BrandProfile[]>(() => api('/brand-profiles'));
  const { busy, error, run } = useAction();
  const [brandProfileId, setBrandProfileId] = useState('');
  const [items, setItems] = useState<ContentItem[]>([emptyItem()]);
  const [results, setResults] = useState<ResultItem[] | null>(null);

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
      const res = await api<{ results: ResultItem[] }>('/creative/content-brief', {
        method: 'POST',
        body: { brandProfileId: brandProfileId || undefined, items },
      });
      setResults(res.results);
    });
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader section="Creative" title="Content Builder" />

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
                  <div className="flex-1">
                    <Field label="Tipe Konten">
                      <Select
                        value={it.contentType}
                        onChange={(e) => updateItem(idx, { contentType: e.target.value })}
                      >
                        <optgroup label="Visual (JSON prompt)">
                          {VISUAL_TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
                        </optgroup>
                        <optgroup label="Teks (brief)">
                          {TEXT_TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
                        </optgroup>
                      </Select>
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="mt-5 text-xs text-down disabled:opacity-30"
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
                  <Field label="Gaya Visual">
                    <Textarea
                      value={it.visualStyle}
                      onChange={(e) => updateItem(idx, { visualStyle: e.target.value })}
                      placeholder="clean studio, kontras hitam-putih, editorial"
                    />
                  </Field>
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
          {results.map((r, idx) => (
            <ResultCard key={idx} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: ResultItem }) {
  const label = LABELS[result.contentType] ?? result.contentType;
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-flash">{label}</span>
        <CopyButton text={JSON.stringify(result, null, 2)} />
      </div>

      {result.concept && (
        <p className="mb-3 text-sm text-paper">
          <span className="font-mono text-xs text-paper-faint">CONCEPT — </span>
          {result.concept}
        </p>
      )}

      {result.kind === 'text' && result.brief && (
        <pre className="whitespace-pre-wrap font-sans text-sm text-paper-dim">{result.brief}</pre>
      )}

      {result.kind === 'visual' && result.assets && (
        <div className="space-y-3">
          {result.assets.map((a, i) => (
            <div key={i} className="rounded-input border border-line bg-ink-900/50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-paper-dim">
                  {a.role ?? `asset ${i + 1}`}
                  {a.aspect_ratio ? ` · ${a.aspect_ratio}` : ''}
                  {a.media ? ` · ${a.media}` : ''}
                </span>
                <CopyButton text={JSON.stringify(a, null, 2)} />
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-paper-dim">
                {JSON.stringify(a, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      {result.copy && (
        <div className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
          {result.copy.headline && (
            <p><span className="font-mono text-xs text-paper-faint">HEADLINE — </span>{result.copy.headline}</p>
          )}
          {result.copy.primary_text && (
            <p className="text-paper-dim">{result.copy.primary_text}</p>
          )}
          {result.copy.caption && (
            <p className="whitespace-pre-wrap text-paper-dim">{result.copy.caption}</p>
          )}
          {result.copy.cta && (
            <p><span className="font-mono text-xs text-paper-faint">CTA — </span>{result.copy.cta}</p>
          )}
          {result.copy.hashtags && result.copy.hashtags.length > 0 && (
            <p className="font-mono text-xs text-flash">{result.copy.hashtags.join(' ')}</p>
          )}
        </div>
      )}
    </Card>
  );
}
