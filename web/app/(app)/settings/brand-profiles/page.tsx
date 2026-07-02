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
  Textarea,
} from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth';

interface BrandProfile {
  id: string;
  brandName: string;
  audience: string | null;
  voiceAdjectives: string | null;
  platforms: string[];
  isDefault: boolean;
}

export default function BrandProfilesPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch<BrandProfile[]>(() => api('/brand-profiles'));
  const { busy, error: actErr, run } = useAction();
  const [brandName, setBrandName] = useState('');
  const [audience, setAudience] = useState('');
  const [voice, setVoice] = useState('');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(() =>
      api('/brand-profiles', {
        method: 'POST',
        body: { brandName, audience, voiceAdjectives: voice },
      }),
    );
    if (ok) {
      setBrandName('');
      setAudience('');
      setVoice('');
      reload();
    }
  }

  async function setDefault(id: string) {
    await run(() => api(`/brand-profiles/${id}/set-default`, { method: 'POST' }));
    reload();
  }

  async function remove(id: string) {
    if (!confirm('Hapus brand profile ini?')) return;
    await run(() => api(`/brand-profiles/${id}`, { method: 'DELETE' }));
    reload();
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader section="Settings" title="Brand Profiles" />

      <Card className="mb-6">
        <h2 className="mb-3 font-display text-sm font-bold">Brand Profile Baru</h2>
        <form onSubmit={create} className="space-y-3">
          <Field label="Nama Brand">
            <TextInput required value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          </Field>
          <Field label="Audience">
            <TextInput value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="mis. sneakerhead 18-30, urban" />
          </Field>
          <Field label="Voice (adjectives)">
            <Textarea value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="mis. hype, informal, to the point" />
          </Field>
          <Button type="submit" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan Profile'}</Button>
        </form>
        {actErr && <div className="mt-3"><Alert kind="error">{actErr}</Alert></div>}
      </Card>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert kind="error">{error}</Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data?.map((bp) => (
            <Card key={bp.id}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display font-bold">{bp.brandName}</h3>
                {bp.isDefault && (
                  <span className="rounded-full bg-flash-soft px-2 py-0.5 text-xs text-flash">default</span>
                )}
              </div>
              <p className="text-sm text-paper-dim">{bp.audience ?? 'Audience belum diisi'}</p>
              <p className="mt-1 text-xs text-paper-faint">{bp.voiceAdjectives ?? '—'}</p>
              <div className="mt-4 flex gap-2">
                {!bp.isDefault && (
                  <Button variant="ghost" className="text-xs" onClick={() => setDefault(bp.id)}>
                    Set default
                  </Button>
                )}
                {user?.role === 'owner' && (
                  <Button variant="danger" className="text-xs" onClick={() => remove(bp.id)}>
                    Hapus
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
