// Usuarios — lista de todas las cuentas reales (correo del dueño vía admin_lista_empresas(),
// nunca expuesto por RLS normal) + alta manual para cuando el acceso no le llega a alguien.

import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import { getListaEmpresas } from '@/lib/data/admin';
import AgregarUsuarioForm from '@/components/admin/AgregarUsuarioForm';

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminUsuariosPage() {
  const supabase = await crearClienteSupabaseServidor();
  const empresas = await getListaEmpresas(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold [font-family:var(--font-display)]">Usuarios</h1>
          <p className="text-[13px] text-[var(--text-secondary)]">{empresas.length} cuentas en total.</p>
        </div>
      </div>

      <AgregarUsuarioForm />

      <div className="overflow-x-auto rounded-[var(--radius-card)] bg-[var(--surface)]">
        <table className="w-full min-w-[560px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Trabajadores</th>
              <th className="px-4 py-3">Obras</th>
              <th className="px-4 py-3">Alta</th>
            </tr>
          </thead>
          <tbody>
            {empresas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[var(--text-tertiary)]">
                  Todavía no hay cuentas registradas.
                </td>
              </tr>
            ) : (
              empresas.map((e) => (
                <tr key={e.id} className="border-b border-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)] last:border-0">
                  <td className="px-4 py-3 font-medium">{e.owner_email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        e.plan === 'starter' ? 'bg-[var(--chip-bg)] text-[var(--accent)]' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {e.plan === 'starter' ? 'Starter' : 'Gratis'}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{e.total_trabajadores}</td>
                  <td className="px-4 py-3 tabular-nums">{e.total_proyectos}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatearFecha(e.creado_en)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
