'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/hooks';
import { Alert, Card, EmptyState, PageHeader, Spinner } from '@/components/ui/primitives';

interface Generation {
  id: string;
  skill: string;
  status: string;
  userId: string | null;
  createdAt: string;
}
interface AdAction {
  id: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function AuditLogPage() {
  const [tab, setTab] = useState<'generations' | 'actions'>('generations');
  const gens = useFetch<Generation[]>(() => api('/audit/generations'));
  const acts = useFetch<AdAction[]>(() => api('/audit/actions'));

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader section="Settings" title="Audit Log" />

      <div className="mb-4 flex gap-2">
        {(['generations', 'actions'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-chip px-3 py-1.5 text-sm ${
              tab === t ? 'bg-flash text-ink-900' : 'border border-line text-paper-dim'
            }`}
          >
            {t === 'generations' ? 'Generations' : 'Ad Actions'}
          </button>
        ))}
      </div>

      {tab === 'generations' ? (
        gens.loading ? <Spinner /> : gens.error ? <Alert kind="error">{gens.error}</Alert> :
        gens.data && gens.data.length > 0 ? (
          <Card className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left font-mono text-xs text-paper-faint">
                  <th className="px-4 py-3">Skill</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {gens.data.map((g) => (
                  <tr key={g.id} className="border-b border-line/50">
                    <td className="px-4 py-3 font-mono">{g.skill}</td>
                    <td className="px-4 py-3">{g.status}</td>
                    <td className="px-4 py-3 text-paper-dim">{g.userId ?? '—'}</td>
                    <td className="px-4 py-3 text-paper-faint">{new Date(g.createdAt).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : <EmptyState>Belum ada generation.</EmptyState>
      ) : (
        acts.loading ? <Spinner /> : acts.error ? <Alert kind="error">{acts.error}</Alert> :
        acts.data && acts.data.length > 0 ? (
          <Card className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left font-mono text-xs text-paper-faint">
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {acts.data.map((a) => (
                  <tr key={a.id} className="border-b border-line/50">
                    <td className="px-4 py-3 font-mono">{a.type}</td>
                    <td className="px-4 py-3">{a.status}</td>
                    <td className="px-4 py-3 text-paper-faint">{new Date(a.createdAt).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : <EmptyState>Belum ada ad action.</EmptyState>
      )}
    </div>
  );
}
