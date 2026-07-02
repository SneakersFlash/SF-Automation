'use client';

import { api } from '@/lib/api';
import { useFetch } from '@/lib/hooks';
import { Alert, Card, EmptyState, PageHeader, Spinner } from '@/components/ui/primitives';

interface Metrics { followers?: number; reach?: number; engagement_rate?: number; profile_visits?: number }
interface SocialAccount {
  id: string;
  platform: string;
  handle: string | null;
  latest: Metrics | null;
}
interface Performance { note?: string; accounts: SocialAccount[] }

export default function SocialPage() {
  const { data, loading, error } = useFetch<Performance>(() => api('/social/performance'));

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader section="Insights" title="Social Performance" />

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert kind="error">{error}</Alert>
      ) : (
        <>
          {data?.note && <div className="mb-4"><Alert kind="info">{data.note}</Alert></div>}
          {data && data.accounts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.accounts.map((a) => (
                <Card key={a.id}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display font-bold">{a.handle ?? a.id}</h3>
                    <span className="font-mono text-xs text-paper-faint">{a.platform}</span>
                  </div>
                  {a.latest ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Metric label="Followers" value={a.latest.followers} />
                      <Metric label="Reach" value={a.latest.reach} />
                      <Metric label="Engagement" value={a.latest.engagement_rate} suffix="%" />
                      <Metric label="Profile visits" value={a.latest.profile_visits} />
                    </div>
                  ) : (
                    <p className="text-sm text-paper-faint">Belum ada snapshot metrik.</p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            !data?.note && <EmptyState>Belum ada akun terhubung.</EmptyState>
          )}
        </>
      )}
    </div>
  );
}

function Metric({ label, value, suffix = '' }: { label: string; value?: number; suffix?: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-paper-faint">{label}</p>
      <p className="font-display text-lg font-bold">{value !== undefined ? `${value}${suffix}` : '—'}</p>
    </div>
  );
}
