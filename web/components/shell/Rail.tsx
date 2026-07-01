'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from '@/lib/nav';
import { currentUser } from '@/lib/session';

// Left rail persisten (IA §11, DS §8.1 & §12.8). Item difilter per peran.
export function Rail() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-ink-900 md:flex">
      <div className="px-5 py-5">
        <span className="font-display text-lg font-extrabold tracking-tight">
          SNKRS<span className="text-flash">.</span>
        </span>
      </div>

      <nav className="flex-1 space-y-6 px-2 pb-6" aria-label="Navigasi utama">
        {NAV.map((group) => {
          const items = group.items.filter((i) => i.roles.includes(currentUser.role));
          if (items.length === 0) return null;
          return (
            <div key={group.section}>
              <p className="mb-1 px-3 font-mono text-xs tracking-widest text-paper-faint">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={`relative flex items-center gap-3 rounded-input px-3 py-2 text-sm transition-colors ${
                          active
                            ? 'text-paper'
                            : 'text-paper-dim hover:bg-ink-800 hover:text-paper'
                        }`}
                      >
                        {active && (
                          <span className="absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full bg-flash" />
                        )}
                        <Icon size={20} aria-hidden />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
