'use client';

import { api } from '@/lib/api';
import { useFetch } from '@/lib/hooks';
import { Alert, Button, Card, PageHeader, Spinner } from '@/components/ui/primitives';

interface Revenue {
  tanggal?: string;
  revenue?: { value: number };
  order?: { value: number };
  aov?: { value: number };
  top_sku?: { nama: string; revenue: number }[];
  per_channel?: Record<string, number>;
  anomali?: { tipe: string; catatan: string }[];
}

const fmt = (n?: number) =>
  n === undefined ? '—' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function RevenuePage() {
  const { data, loading, error, reload } = useFetch<Revenue>(() => api('/revenue'));

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        section="Insights"
        title="Revenue"
        action={<Button variant="ghost" onClick={reload}>Refresh</Button>}
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert kind="error">{error}</Alert>
      ) : data ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="font-mono text-xs text-paper-faint">REVENUE</p>
              <p className="mt-1 font-display text-2xl font-extrabold">{fmt(data.revenue?.value)}</p>
            </Card>
            <Card>
              <p className="font-mono text-xs text-paper-faint">ORDER</p>
              <p className="mt-1 font-display text-2xl font-extrabold">{data.order?.value ?? '—'}</p>
            </Card>
            <Card>
              <p className="font-mono text-xs text-paper-faint">AOV</p>
              <p className="mt-1 font-display text-2xl font-extrabold">{fmt(data.aov?.value)}</p>
            </Card>
          </div>

          {data.anomali && data.anomali.length > 0 && (
            <div className="mb-6 space-y-2">
              {data.anomali.map((a, i) => (
                <Alert key={i} kind="error">{a.tipe}: {a.catatan}</Alert>
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="mb-3 font-mono text-xs uppercase tracking-wider text-paper-faint">Top SKU</p>
              {data.top_sku && data.top_sku.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {data.top_sku.map((s, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="text-paper-dim">{s.nama}</span>
                      <span>{fmt(s.revenue)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-paper-faint">—</p>}
            </Card>
            <Card>
              <p className="mb-3 font-mono text-xs uppercase tracking-wider text-paper-faint">Per Channel</p>
              {data.per_channel ? (
                <ul className="space-y-2 text-sm">
                  {Object.entries(data.per_channel).map(([ch, v]) => (
                    <li key={ch} className="flex justify-between">
                      <span className="text-paper-dim">{ch}</span>
                      <span>{fmt(v)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-paper-faint">—</p>}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
