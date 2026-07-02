'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, UserCircle } from 'lucide-react';
import { BRAND_SWITCHER_ROUTES } from '@/lib/nav';
import { useAuth } from '@/lib/auth';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';

// Top bar global (IA §2.2, §11.1). Brand switcher hanya di CREATIVE & Social.
export function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const showBrand = BRAND_SWITCHER_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-ink-900 px-6">
      <div className="flex items-center gap-3">
        {showBrand && (
          <>
            <button
              type="button"
              className="flex items-center gap-2 rounded-chip border border-line bg-ink-800 px-3 py-1.5 font-mono text-sm text-paper-dim transition-colors hover:border-flash"
            >
              SNKRS Flash
              <span className="rounded-full bg-flash-soft px-1.5 text-xs text-flash">default</span>
              <ChevronDown size={16} aria-hidden />
            </button>
            <span className="rounded-chip border border-line px-3 py-1.5 font-mono text-xs text-paper-faint">
              subject: —
            </span>
          </>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 text-sm text-paper-dim transition-colors hover:text-paper"
          aria-label="Menu profil"
          aria-expanded={menuOpen}
        >
          <UserCircle size={20} aria-hidden />
          <span>{user?.name ?? user?.email ?? '—'}</span>
          <ChevronDown size={16} aria-hidden />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-card border border-line bg-ink-800 py-1 text-sm shadow-card">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setPwOpen(true);
              }}
              className="block w-full px-3 py-2 text-left text-paper-dim hover:bg-ink-700 hover:text-paper"
            >
              Ganti Password
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                void logout();
              }}
              className="block w-full px-3 py-2 text-left text-paper-dim hover:bg-ink-700 hover:text-paper"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </header>
  );
}
