// Shell de la app interna — navegación inferior compartida por las 4 secciones (Buscar, Mi
// Cuadrilla, Proyectos, Ajustes). La sesión ya la protege `middleware.ts` en el SERVIDOR
// (redirige a /login antes de que esta página cargue si no hay sesión) — este layout no
// necesita guardarla de nuevo en el cliente.

import BottomNav from '@/components/app/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="flex-1 pb-24">{children}</div>
      <BottomNav />
    </div>
  );
}
