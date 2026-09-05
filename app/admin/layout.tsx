// Panel de administración — SOLO el dueño (ADMIN_EMAILS). proxy.ts ya bloquea esta ruta en el
// servidor si el correo no está en la lista; este layout repite la verificación (defensa en
// profundidad — nunca confiar en una sola capa) y sirve de guardia si algún día se olvida
// actualizar el matcher del proxy. Server Component: se resuelve antes de mandar nada al cliente.

import { redirect } from 'next/navigation';
import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import AdminNav from '@/components/admin/AdminNav';

function esCorreoAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await crearClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!esCorreoAdmin(user?.email)) {
    redirect('/app');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <header className="border-b border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] px-4 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Panel de administración
        </p>
        <AdminNav />
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
