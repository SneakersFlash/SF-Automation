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
  knowledge: string | null;
  examples: string | null;
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
  const [knowledge, setKnowledge] = useState('');
  const [examples, setExamples] = useState('');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(() =>
      api('/brand-profiles', {
        method: 'POST',
        body: { brandName, audience, voiceAdjectives: voice, knowledge, examples },
      }),
    );
    if (ok) {
      setBrandName('');
      setAudience('');
      setVoice('');
      setKnowledge('');
      setExamples('');
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
          <Field label="Brand Knowledge">
            <Textarea
              value={knowledge}
              onChange={(e) => setKnowledge(e.target.value)}
              placeholder="Fakta/aturan brand yang dipakai AI: jadwal drop, cara nyebut produk, hal yang dihindari, CTA…"
            />
          </Field>
          <Field label="Contoh Konten (few-shot)">
            <Textarea
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              placeholder="Tempel 2-3 caption/brief asli yang kamu suka sebagai contoh gaya. AI bakal niru nadanya."
            />
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
              <p className="mt-1 text-xs text-paper-faint">
                Knowledge: {bp.knowledge ? '✓ terisi' : '—'} · Contoh: {bp.examples ? '✓ terisi' : '—'}
              </p>
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
              <KnowledgeEditor bp={bp} onSaved={reload} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Editor inline untuk knowledge + examples pada profil yang sudah ada (PATCH).
// Knowledge ini yang disuntik backend ke OpenClaw supaya output tidak generik.
function KnowledgeEditor({ bp, onSaved }: { bp: BrandProfile; onSaved: () => void }) {
  const { busy, error, run } = useAction();
  const [open, setOpen] = useState(false);
  const [knowledge, setKnowledge] = useState(bp.knowledge ?? '');
  const [examples, setExamples] = useState(bp.examples ?? '');

  async function save() {
    const ok = await run(() =>
      api(`/brand-profiles/${bp.id}`, { method: 'PATCH', body: { knowledge, examples } }),
    );
    if (ok) {
      setOpen(false);
      onSaved();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-xs text-flash underline-offset-2 hover:underline"
      >
        Edit knowledge & contoh
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2 border-t border-paper-faint/20 pt-3">
      <Field label="Brand Knowledge">
        <Textarea
          value={knowledge}
          onChange={(e) => setKnowledge(e.target.value)}
          placeholder="Fakta/aturan brand: jadwal drop, cara nyebut produk, hal yang dihindari…"
        />
      </Field>
      <Field label="Contoh Konten (few-shot)">
        <Textarea
          value={examples}
          onChange={(e) => setExamples(e.target.value)}
          placeholder="2-3 caption/brief asli yang kamu suka sebagai contoh gaya."
        />
      </Field>
      {error && <Alert kind="error">{error}</Alert>}
      <div className="flex gap-2">
        <Button className="text-xs" disabled={busy} onClick={save}>
          {busy ? 'Menyimpan…' : 'Simpan'}
        </Button>
        <Button variant="ghost" className="text-xs" onClick={() => setOpen(false)}>
          Batal
        </Button>
      </div>
    </div>
  );
}
