'use client';

import { ChevronRight } from 'lucide-react';

// Primitives DS (§12): dipakai lintas halaman Fase 3. Token warna dari tailwind.

export function PageHeader({
  section,
  title,
  action,
}: {
  section: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <nav
        className="mb-2 flex items-center gap-1 font-mono text-xs text-paper-faint"
        aria-label="Breadcrumb"
      >
        <span>{section}</span>
        <ChevronRight size={12} aria-hidden />
        <span className="text-paper-dim">{title}</span>
      </nav>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-xl font-extrabold tracking-tight">{title}</h1>
        {action}
      </div>
    </div>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-card border border-line bg-ink-800 p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  const styles: Record<string, string> = {
    primary: 'bg-flash text-ink-900 font-semibold hover:opacity-90',
    ghost: 'border border-line text-paper-dim hover:border-flash hover:text-paper',
    danger: 'border border-down/50 text-down hover:bg-down/10',
  };
  return (
    <button
      className={`rounded-chip px-3 py-2 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-xs text-paper-faint">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-paper-faint">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-input border border-line bg-ink-900 px-3 py-2 text-sm text-paper outline-none placeholder:text-paper-faint focus:border-flash';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputCls} {...props} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputCls} min-h-[100px] resize-y`} {...props} />;
}

export function Alert({ kind, children }: { kind: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const map = {
    error: 'border-down/40 bg-down/10 text-down',
    success: 'border-up/40 bg-up/10 text-up',
    info: 'border-info/40 bg-info/10 text-info',
  };
  return (
    <div className={`rounded-input border px-3 py-2 text-sm ${map[kind]}`} role="status">
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-ink-800 p-8 text-center text-sm text-paper-dim">
      {children}
    </div>
  );
}

export function Spinner({ label = 'Memuat…' }: { label?: string }) {
  return <p className="py-8 text-center text-sm text-paper-dim">{label}</p>;
}

// Salin ke clipboard (CRE-05).
export function CopyButton({ text }: { text: string }) {
  return (
    <Button
      variant="ghost"
      onClick={() => void navigator.clipboard.writeText(text)}
      className="text-xs"
    >
      Salin
    </Button>
  );
}
