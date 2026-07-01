import { ChevronRight } from 'lucide-react';

// Kerangka halaman Fase 2 (breadcrumb IA §13 + judul + area konten placeholder).
export function PagePlaceholder({
  section,
  title,
  desc,
}: {
  section: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="mx-auto max-w-[1200px]">
      <nav
        className="mb-2 flex items-center gap-1 font-mono text-xs text-paper-faint"
        aria-label="Breadcrumb"
      >
        <span>{section}</span>
        <ChevronRight size={12} aria-hidden />
        <span className="text-paper-dim">{title}</span>
      </nav>

      <h1 className="font-display text-xl font-extrabold tracking-tight">{title}</h1>

      <div className="mt-6 rounded-card border border-dashed border-line bg-ink-800 p-8 text-sm text-paper-dim">
        <p className="mb-2 font-mono text-xs uppercase tracking-wider text-paper-faint">
          Skeleton — Fase 2
        </p>
        <p>{desc}</p>
        <p className="mt-3 text-paper-faint">
          Komponen detail, logika, &amp; interaksi dibangun di Fase 3 (UF + DS).
        </p>
      </div>
    </div>
  );
}
