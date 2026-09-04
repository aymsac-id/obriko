'use client';

// Navegación inferior de la app interna — 4 destinos (regla de UX 3-5 destinos): Buscar
// (protagonista), Mi Cuadrilla (la libreta), Proyectos (obras con su propia cuadrilla armada)
// y Ajustes.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Search, Settings, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/app', label: 'Buscar', icon: Search },
  { href: '/app/cuadrilla', label: 'Cuadrilla', icon: Users },
  { href: '/app/proyectos', label: 'Proyectos', icon: Briefcase },
  { href: '/app/ajustes', label: 'Ajustes', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const activo = href === '/app' ? pathname === '/app' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? 'page' : undefined}
              className="flex min-w-[64px] flex-1 flex-col items-center gap-1 py-2.5 [touch-action:manipulation]"
            >
              <span
                className={`flex size-9 items-center justify-center rounded-[var(--radius-button)] ${
                  activo ? 'bg-[var(--chip-bg)]' : ''
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={activo ? 2.4 : 2}
                  color={activo ? 'var(--accent)' : 'var(--text-tertiary)'}
                  aria-hidden="true"
                />
              </span>
              <span
                className={`text-[12px] font-medium ${
                  activo ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
