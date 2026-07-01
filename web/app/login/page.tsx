// Halaman publik Login (IA §5.1, UF-01). Fase 2: skeleton statis (disabled),
// wiring auth di Fase 3.
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-ink-800 p-8 shadow-card">
        <h1 className="mb-1 font-display text-xl font-extrabold tracking-tight">
          SNKRS<span className="text-flash">.</span> Console
        </h1>
        <p className="mb-6 text-sm text-paper-dim">Masuk untuk lanjut.</p>

        <form className="space-y-3">
          <div>
            <label className="mb-1 block font-mono text-xs text-paper-faint">Email</label>
            <input
              type="email"
              disabled
              placeholder="you@sneakersflash.com"
              className="w-full rounded-input border border-line bg-ink-900 px-3 py-2 text-sm text-paper placeholder:text-paper-faint"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs text-paper-faint">Password</label>
            <input
              type="password"
              disabled
              placeholder="••••••••"
              className="w-full rounded-input border border-line bg-ink-900 px-3 py-2 text-sm text-paper placeholder:text-paper-faint"
            />
          </div>
          <button
            type="button"
            disabled
            className="w-full rounded-chip bg-flash px-3 py-2 text-sm font-semibold text-ink-900 opacity-60"
          >
            Login
          </button>
        </form>

        <p className="mt-4 font-mono text-xs text-paper-faint">
          Skeleton — auth diwire di Fase 3 (UF-01).
        </p>
      </div>
    </div>
  );
}
