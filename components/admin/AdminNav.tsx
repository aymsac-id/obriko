'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Activity, ShieldAlert, DollarSign } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/uso', label: 'Uso', icon: Activity },
  { href: '/admin/salud', label: 'Salud', icon: ShieldAlert },
  { href: '/admin/ventas', label: 'Ventas', icon: DollarSign },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 mt-2 flex gap-1 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {NAV.map((item) => {
        const Icon = item.icon;
        const activo = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors [touch-action:manipulation] ${
              activo ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={14} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
