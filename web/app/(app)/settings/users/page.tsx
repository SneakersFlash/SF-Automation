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

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: 'owner' | 'member';
  isActive: boolean;
}

export default function UsersPage() {
  const { data, loading, error, reload } = useFetch<UserRow[]>(() => api('/users'));
  const { busy, error: actErr, run } = useAction();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(() =>
      api('/users', { method: 'POST', body: { email, name, password } }),
    );
    if (ok) {
      setEmail('');
      setName('');
      setPassword('');
      reload();
    }
  }

  async function toggle(u: UserRow) {
    await run(() => api(`/users/${u.id}`, { method: 'PATCH', body: { isActive: !u.isActive } }));
    reload();
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader section="Settings" title="Users" />

      <Card className="mb-6">
        <h2 className="mb-3 font-display text-sm font-bold">Tambah Member</h2>
        <form onSubmit={addMember} className="grid gap-3 sm:grid-cols-4">
          <Field label="Email">
            <TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Nama">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Password sementara">
            <TextInput type="text" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={busy}>{busy ? 'Menyimpan…' : 'Tambah'}</Button>
          </div>
        </form>
        {actErr && <div className="mt-3"><Alert kind="error">{actErr}</Alert></div>}
      </Card>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert kind="error">{error}</Alert>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left font-mono text-xs text-paper-faint">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Peran</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.map((u) => (
                <tr key={u.id} className="border-b border-line/50">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 text-paper-dim">{u.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-chip bg-ink-700 px-2 py-0.5 font-mono text-xs">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={u.isActive ? 'text-up' : 'text-paper-faint'}>
                      {u.isActive ? 'aktif' : 'nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" className="text-xs" onClick={() => toggle(u)}>
                      {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
