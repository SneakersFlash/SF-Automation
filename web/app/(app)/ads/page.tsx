'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAction, useFetch } from '@/lib/hooks';
import {
  Alert,
  Button,
  Card,
  Field,
  PageHeader,
  Spinner,
  TextInput,
} from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth';

interface AdVariant {
  id: string;
  angle: string;
  hook: string;
  primaryText: string;
  headline: string;
  cta: string;
}
interface Generation { id: string; adVariants: AdVariant[] }
interface AdAction { id: string; type: string; status: string }
interface BrandProfile { id: string; brandName: string }

export default function AdsPage() {
  const { user } = useAuth();
  const brands = useFetch<BrandProfile[]>(() => api('/brand-profiles'));
  const actions = useFetch<AdAction[]>(() => api('/ads/actions'));
  const { busy, error, run } = useAction();
  const [brandProfileId, setBrandProfileId] = useState('');
  const [subject, setSubject] = useState('');
  const [variants, setVariants] = useState<AdVariant[]>([]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setVariants([]);
    await run(async () => {
      const res = await api<Generation>('/ads/generate', {
        method: 'POST',
        body: { brandProfileId: brandProfileId || undefined, subject: { name: subject } },
      });
      setVariants(res.adVariants);
    });
  }

  async function decide(id: string, decision: 'approve' | 'reject') {
    await run(() => api(`/ads/actions/${id}/${decision}`, { method: 'POST' }));
    actions.reload();
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader section="Ops" title="Ads Engine" />

      <Card className="mb-6">
        <h2 className="mb-3 font-display text-sm font-bold">Generate Ad Variants (4 angle)</h2>
        <form onSubmit={generate} className="grid gap-3 sm:grid-cols-3">
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
          <div className="flex items-end">
            <Button type="submit" disabled={busy}>{busy ? 'Generating…' : 'Generate'}</Button>
          </div>
        </form>
        {error && <div className="mt-3"><Alert kind="error">{error}</Alert></div>}
      </Card>

      {variants.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {variants.map((v) => (
            <Card key={v.id}>
              <span className="rounded-chip bg-flash-soft px-2 py-0.5 font-mono text-xs text-flash">{v.angle}</span>
              <h3 className="mt-2 font-display font-bold">{v.headline}</h3>
              <p className="mt-1 text-sm text-paper">{v.hook}</p>
              <p className="mt-2 text-sm text-paper-dim">{v.primaryText}</p>
              <p className="mt-2 font-mono text-xs text-info">CTA: {v.cta}</p>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mb-3 font-display text-sm font-bold">Approval Queue</h2>
      <p className="mb-3 text-xs text-paper-faint">
        Aksi berbayar (publish/scale) default read-only — wajib approval Owner (Golden Rule #3).
      </p>
      {actions.loading ? (
        <Spinner />
      ) : actions.error ? (
        <Alert kind="error">{actions.error}</Alert>
      ) : actions.data && actions.data.length > 0 ? (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left font-mono text-xs text-paper-faint">
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {actions.data.map((a) => (
                <tr key={a.id} className="border-b border-line/50">
                  <td className="px-4 py-3 font-mono">{a.type}</td>
                  <td className="px-4 py-3">{a.status}</td>
                  <td className="px-4 py-3 text-right">
                    {a.status === 'pending_approval' && user?.role === 'owner' && (
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" className="text-xs" onClick={() => decide(a.id, 'approve')}>Approve</Button>
                        <Button variant="danger" className="text-xs" onClick={() => decide(a.id, 'reject')}>Reject</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Alert kind="info">Belum ada aksi menunggu approval.</Alert>
      )}
    </div>
  );
}
