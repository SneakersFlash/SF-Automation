'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

// Halaman publik Login (IA §5.1, UF-01). Sukses → redirect /content/carousel.
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.replace('/content/carousel'); // UF-01 step 5
    } catch (err) {
      // E1 (kredensial salah) / E2 (akun nonaktif) — pesan dari backend.
      setError(err instanceof ApiError ? err.message : 'Gagal masuk. Coba lagi.');
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-ink-800 p-8 shadow-card">
        <h1 className="mb-1 font-display text-xl font-extrabold tracking-tight">
          SNKRS<span className="text-flash">.</span> Console
        </h1>
        <p className="mb-6 text-sm text-paper-dim">Masuk untuk lanjut.</p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block font-mono text-xs text-paper-faint">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@sneakersflash.com"
              className="w-full rounded-input border border-line bg-ink-900 px-3 py-2 text-sm text-paper outline-none placeholder:text-paper-faint focus:border-flash"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-paper-faint">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-input border border-line bg-ink-900 px-3 py-2 text-sm text-paper outline-none placeholder:text-paper-faint focus:border-flash"
            />
          </div>

          {error && (
            <p className="rounded-input border border-down/40 bg-down/10 px-3 py-2 text-sm text-down">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-chip bg-flash px-3 py-2 text-sm font-semibold text-ink-900 transition-opacity disabled:opacity-60"
          >
            {busy ? 'Masuk…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
