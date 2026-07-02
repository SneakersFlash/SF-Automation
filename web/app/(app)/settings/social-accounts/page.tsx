'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAction, useFetch } from '@/lib/hooks';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  Spinner,
  TextInput,
} from '@/components/ui/primitives';

interface Account {
  id: string;
  brandProfileId: string;
  platform: string;
  accountId: string;
  handle: string | null;
}
interface BrandProfile {
  id: string;
  brandName: string;
}

export default function SocialAccountsPage() {
  const accounts = useFetch<Account[]>(() => api('/social/accounts'));
  const brands = useFetch<BrandProfile[]>(() => api('/brand-profiles'));
  const { busy, error: actErr, run } = useAction();

  const [platform, setPlatform] = useState('instagram');
  const [brandProfileId, setBrandProfileId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [handle, setHandle] = useState('');
  const [tokenRef, setTokenRef] = useState('');

  async function connect(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(() =>
      api(`/social/accounts/connect/${platform}`, {
        method: 'POST',
        body: { brandProfileId, accountId, handle, tokenRef },
      }),
    );
    if (ok) {
      setAccountId('');
      setHandle('');
      setTokenRef('');
      accounts.reload();
    }
  }

  async function disconnect(id: string) {
    if (!confirm('Putuskan akun ini?')) return;
    await run(() => api(`/social/accounts/${id}`, { method: 'DELETE' }));
    accounts.reload();
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader section="Settings" title="Social Accounts" />

      <Card className="mb-6">
        <h2 className="mb-1 font-display text-sm font-bold">Hubungkan Akun</h2>
        <p className="mb-3 text-xs text-paper-faint">
          Simpan referensi token (tokenRef), bukan token mentah. OAuth penuh menyusul saat kredensial Meta/TikTok tersedia.
        </p>
        <form onSubmit={connect} className="grid gap-3 sm:grid-cols-2">
          <Field label="Platform">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-input border border-line bg-ink-900 px-3 py-2 text-sm text-paper outline-none focus:border-flash"
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </Field>
          <Field label="Brand Profile">
            <select
              required
              value={brandProfileId}
              onChange={(e) => setBrandProfileId(e.target.value)}
              className="w-full rounded-input border border-line bg-ink-900 px-3 py-2 text-sm text-paper outline-none focus:border-flash"
            >
              <option value="">— pilih —</option>
              {brands.data?.map((b) => (
                <option key={b.id} value={b.id}>{b.brandName}</option>
              ))}
            </select>
          </Field>
          <Field label="Account ID">
            <TextInput required value={accountId} onChange={(e) => setAccountId(e.target.value)} />
          </Field>
          <Field label="Handle">
            <TextInput value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@brand" />
          </Field>
          <Field label="Token Ref">
            <TextInput required value={tokenRef} onChange={(e) => setTokenRef(e.target.value)} placeholder="ref ke secret manager" />
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={busy}>{busy ? 'Menghubungkan…' : 'Hubungkan'}</Button>
          </div>
        </form>
        {actErr && <div className="mt-3"><Alert kind="error">{actErr}</Alert></div>}
      </Card>

      {accounts.loading ? (
        <Spinner />
      ) : accounts.error ? (
        <Alert kind="error">{accounts.error}</Alert>
      ) : accounts.data && accounts.data.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {accounts.data.map((a) => (
            <Card key={a.id} className="flex items-center justify-between">
              <div>
                <p className="font-display font-bold">{a.handle ?? a.accountId}</p>
                <p className="font-mono text-xs text-paper-faint">{a.platform}</p>
              </div>
              <Button variant="danger" className="text-xs" onClick={() => disconnect(a.id)}>
                Disconnect
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState>Belum ada akun terhubung.</EmptyState>
      )}
    </div>
  );
}
