// Resumen — lo primero que ve el dueño al entrar al panel. Avisos arriba (21-BACKOFFICE.md:
// "el panel no solo muestra, avisa"), números reales debajo. Server Component: se calcula todo
// en el servidor con la sesión ya autenticada, sin spinners de carga en el cliente.

import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import { getAvisos, getResumenNegocio } from '@/lib/data/admin';
import AvisoBanner from '@/components/admin/AvisoBanner';
import StatCard from '@/components/admin/StatCard';

export default async function AdminResumenPage() {
  const supabase = await crearClienteSupabaseServidor();
  const [resumen, avisos] = await Promise.all([getResumenNegocio(supabase), getAvisos(supabase)]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold [font-family:var(--font-display)]">Resumen</h1>
        <p className="text-[13px] text-[var(--text-secondary)]">Cómo está Jornivo hoy, de un vistazo.</p>
      </div>

      <AvisoBanner avisos={avisos} />

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Cuentas</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatCard etiqueta="Total de cuentas" valor={String(resumen.totalCuentas)} />
          <StatCard
            etiqueta="Nuevas (7 días)"
            valor={String(resumen.cuentasUltimos7Dias)}
            insight={resumen.totalCuentas > 0 ? `${Math.round((resumen.cuentasUltimos7Dias / resumen.totalCuentas) * 100)}% del total` : undefined}
          />
          <StatCard etiqueta="Plan Starter" valor={String(resumen.cuentasStarter)} />
          <StatCard etiqueta="Plan Gratis" valor={String(resumen.cuentasGratis)} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          Actividad en la app
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatCard etiqueta="Trabajadores registrados" valor={String(resumen.totalTrabajadores)} />
          <StatCard etiqueta="Obras creadas" valor={String(resumen.totalProyectos)} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          Ventas y ganancia real
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatCard etiqueta="Ingresos del mes" valor="" sinDatos />
          <StatCard etiqueta="Ganancia real" valor="" sinDatos />
          <StatCard etiqueta="MRR" valor="" sinDatos />
          <StatCard etiqueta="Churn" valor="" sinDatos />
        </div>
      </div>
    </div>
  );
}
