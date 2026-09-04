'use client';

// Mi Cuadrilla — la libreta privada: ver/gestionar trabajadores + agregar uno nuevo a mano.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Plus, Upload } from 'lucide-react';
import TrabajadorCard from '@/components/app/TrabajadorCard';
import AgregarTrabajadorSheet from '@/components/app/AgregarTrabajadorSheet';
import ImportarTrabajadoresSheet from '@/components/app/ImportarTrabajadoresSheet';
import PedirDisponibilidadSheet from '@/components/app/PedirDisponibilidadSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { addTrabajadoresEnLote, getLimiteDelPlan, getTrabajadores, type Trabajador } from '@/lib/data/trabajadores';
import { getPlanEmpresa } from '@/lib/data/empresa';

export default function CuadrillaPage() {
  const router = useRouter();
  const [trabajadores, setTrabajadores] = useState<Trabajador[] | null>(null);
  const [sheetAbierto, setSheetAbierto] = useState(false);
  const [importarAbierto, setImportarAbierto] = useState(false);
  const [pedirAbierto, setPedirAbierto] = useState(false);
  const [plan, setPlan] = useState<'gratis' | 'starter' | null>(null);

  useEffect(() => {
    recargar();
    getPlanEmpresa()
      .then(setPlan)
      .catch(() => setPlan('gratis'));
  }, []);

  const limiteAlcanzado = plan !== 'starter' && (trabajadores?.length ?? 0) >= getLimiteDelPlan(plan);

  function recargar() {
    getTrabajadores()
      .then(setTrabajadores)
      .catch(() => setTrabajadores([]));
  }

  return (
    <div className="flex min-h-dvh flex-col px-4 pb-6 pt-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[length:var(--text-page-title)] font-bold leading-tight [font-family:var(--font-display)]">
            Mi Cuadrilla
          </h1>
          <p className="text-[length:var(--text-small)] text-[var(--text-secondary)]">
            {trabajadores === null ? 'Cargando…' : `${trabajadores.length} trabajadores en tu libreta`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setPedirAbierto(true)}
            aria-label="Pedir disponibilidad a todos"
            className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_32%,transparent)] text-[var(--text-primary)] [touch-action:manipulation]"
          >
            <MessageCircle size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setImportarAbierto(true)}
            aria-label="Importar trabajadores"
            className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_32%,transparent)] text-[var(--text-primary)] [touch-action:manipulation]"
          >
            <Upload size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setSheetAbierto(true)}
            aria-label="Agregar trabajador"
            className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[var(--bg)] shadow-[0_8px_24px_color-mix(in_oklab,var(--accent)_28%,transparent)] [touch-action:manipulation]"
          >
            <Plus size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {trabajadores === null ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-[var(--radius-card)] bg-[var(--surface)]" />
          ))
        ) : (
          trabajadores
            .slice()
            .sort((a, b) => b.confiabilidad - a.confiabilidad)
            .map((t) => (
              <TrabajadorCard key={t.id} trabajador={t} onClick={() => router.push(`/app/cuadrilla/${t.id}`)} />
            ))
        )}
      </div>

      <AgregarTrabajadorSheet
        abierto={sheetAbierto}
        limiteAlcanzado={limiteAlcanzado}
        onCerrar={() => setSheetAbierto(false)}
        onCreado={() => {
          setSheetAbierto(false);
          recargar();
        }}
      />

      <ImportarTrabajadoresSheet
        modo="sheet"
        abierto={importarAbierto}
        plan={plan}
        totalActual={trabajadores?.length ?? 0}
        onCerrar={() => setImportarAbierto(false)}
        onImportado={async (inputs) => {
          await addTrabajadoresEnLote(inputs);
          setImportarAbierto(false);
          recargar();
        }}
      />

      <PedirDisponibilidadSheet
        abierto={pedirAbierto}
        trabajadores={trabajadores ?? []}
        onCerrar={() => setPedirAbierto(false)}
      />
    </div>
  );
}
