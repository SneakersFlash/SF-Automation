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
  TextInput,
} from '@/components/ui/primitives';

const FORMATS = ['carousel', 'story', 'short_video', 'static_ad', 'long_video', 'thread', 'email', 'blog'];
interface BrandProfile { id: string; brandName: string; isDefault: boolean }

export default function ContentBriefPage() {
  const brands = useFetch<BrandProfile[]>(() => api('/brand-profiles'));
  const { busy, error, run } = useAction();
  const [brandProfileId, setBrandProfileId] = useState('');
  const [subject, setSubject] = useState('');
  const [formats, setFormats] = useState<string[]>(['carousel']);
  const [result, setResult] = useState<Record<string, string> | null>(null);

  function toggleFormat(f: string) {
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    await run(async () => {
      const res = await api<{ briefs: Record<string, string> }>('/creative/content-brief', {
        method: 'POST',
        body: { brandProfileId: brandProfileId || undefined, subject: { name: subject }, formats },
      });
      setResult(res.briefs);
    });
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader section="Creative" title="Content Brief" />

      <Card className="mb-6">
        <form onSubmit={generate} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Brand Profile">
              <select
                value={brandProfileId}
                onChange={(e) => setBrandProfileId(e.target.value)}
                className="w-full rounded-input border border-line bg-ink-900 px-3 py-2 text-sm text-paper outline-none focus:border-flash"
              >
                <option value="">Default</option>
                {brands.data?.map((b) => <option key={b.id} value={b.id}>{b.brandName}</option>)}
              </select>
            </Field>
            <Field label="Subject (produk/campaign)">
              <TextInput required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Jordan 1 Reverse Mocha, 2.4jt" />
            </Field>
          </div>

          <Field label="Format (multi-select)">
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => toggleFormat(f)}
                  className={`rounded-chip px-3 py-1.5 font-mono text-xs ${
                    formats.includes(f) ? 'bg-flash text-ink-900' : 'border border-line text-paper-dim'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Field>

          <Button type="submit" disabled={busy || formats.length === 0}>
            {busy ? 'Generating…' : 'Generate Brief'}
          </Button>
        </form>
        {error && <div className="mt-3"><Alert kind="error">{error}</Alert></div>}
      </Card>

      {result && (
        <div className="space-y-4">
          {Object.entries(result).map(([fmt, text]) => (
            <Card key={fmt}>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-flash">{fmt}</span>
                <CopyButton text={text} />
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm text-paper-dim">{text}</pre>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
