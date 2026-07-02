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

interface BrandProfile { id: string; brandName: string }
interface CopyResult {
  hooks?: string[];
  caption?: string;
  ctas?: Record<string, string>;
  hashtags?: string[];
}

export default function CopywritingPage() {
  const brands = useFetch<BrandProfile[]>(() => api('/brand-profiles'));
  const { busy, error, run } = useAction();
  const [brandProfileId, setBrandProfileId] = useState('');
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [result, setResult] = useState<CopyResult | null>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    await run(async () => {
      const res = await api<CopyResult>('/creative/copywriting', {
        method: 'POST',
        body: { brandProfileId: brandProfileId || undefined, subject: { name: subject }, goal },
      });
      setResult(res);
    });
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader section="Creative" title="Copywriting" />

      <Card className="mb-6">
        <form onSubmit={generate} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
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
            <Field label="Subject">
              <TextInput required value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <Field label="Goal">
              <TextInput value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="awareness / konversi" />
            </Field>
          </div>
          <Button type="submit" disabled={busy}>{busy ? 'Generating…' : 'Generate Copy'}</Button>
        </form>
        {error && <div className="mt-3"><Alert kind="error">{error}</Alert></div>}
      </Card>

      {result && (
        <div className="space-y-4">
          {result.hooks && (
            <Card>
              <p className="mb-2 font-mono text-xs uppercase tracking-wider text-flash">Hooks</p>
              <ul className="space-y-1 text-sm text-paper-dim">
                {result.hooks.map((h, i) => <li key={i}>• {h}</li>)}
              </ul>
            </Card>
          )}
          {result.caption && (
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-wider text-flash">Caption</p>
                <CopyButton text={result.caption} />
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm text-paper-dim">{result.caption}</pre>
            </Card>
          )}
          {result.ctas && (
            <Card>
              <p className="mb-2 font-mono text-xs uppercase tracking-wider text-flash">CTA</p>
              <ul className="space-y-1 text-sm text-paper-dim">
                {Object.entries(result.ctas).map(([k, v]) => <li key={k}><span className="text-paper-faint">{k}:</span> {v}</li>)}
              </ul>
            </Card>
          )}
          {result.hashtags && (
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-wider text-flash">Hashtags</p>
                <CopyButton text={result.hashtags.join(' ')} />
              </div>
              <p className="text-sm text-info">{result.hashtags.join(' ')}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
