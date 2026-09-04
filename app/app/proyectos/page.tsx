'use client';

// Proyectos — cada obra tiene su propia cuadrilla armada (mejora post-Sesión 5: dolor #10 de
// FICHA-AVATAR.md, "mientras más obras acepto, más difícil se vuelve controlar quién va a
// cada una"). Lista de obras + CTA para crear la primera si todavía no hay ninguna.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { HardHat, Plus } from 'lucide-react';
import ProyectoCard from '@/components/app/ProyectoCard';
import CrearProyectoSheet from '@/components/app/CrearProyectoSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { getProyectos, type Proyecto } from '@/lib/data/proyectos';
import { getTrabajadores, type Trabajador } from '@/lib/data/trabajadores';

export default function ProyectosPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<Proyecto[] | null>(null);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [sheetAbierto, setSheetAbierto] = useState(false);

  useEffect(() => {
    getProyectos()
      .then(setProyectos)
      .catch(() => setProyectos([]));
    getTrabajadores()
      .then(setTrabajadores)
      .catch(() => setTrabajadores([]));
  }, []);

  const trabajadoresPorId = useMemo(() => {
    const mapa = new Map<string, Trabajador>();
    trabajadores.forEach((t) => mapa.set(t.id, t));
    return mapa;
  }, [trabajadores]);

  function cuadrillaDe(p: Proyecto): Trabajador[] {
    return p.trabajadorIds.map((id) => trabajadoresPorId.get(id)).filter((t): t is Trabajador => Boolean(t));
  }

  return (
    <div className="flex min-h-dvh flex-col px-4 pb-6 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[length:var(--text-page-title)] font-bold leading-tight [font-family:var(--font-display)]">
            Proyectos
          </h1>
          <p className="text-[length:var(--text-small)] text-[var(--text-secondary)]">
            {proyectos === null
              ? 'Cargando…'
              : proyectos.length === 0
                ? 'Todavía no tienes obras creadas'
                : `${proyectos.length} ${proyectos.length === 1 ? 'obra' : 'obras'} en marcha`}
          </p>
        </div>
        {proyectos && proyectos.length > 0 ? (
          <button
            type="button"
            onClick={() => setSheetAbierto(true)}
            aria-label="Crear obra"
            className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[var(--bg)] shadow-[0_8px_24px_color-mix(in_oklab,var(--accent)_28%,transparent)] [touch-action:manipulation]"
          >
            <Plus size={22} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {proyectos === null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[var(--radius-card)] bg-[var(--surface)]" />
          ))
        ) : proyectos.length === 0 ? (
          <EmptyProyectos onCrear={() => setSheetAbierto(true)} />
        ) : (
          proyectos.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: Math.min(i, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProyectoCard proyecto={p} cuadrilla={cuadrillaDe(p)} onClick={() => router.push(`/app/proyectos/${p.id}`)} />
            </motion.div>
          ))
        )}
      </div>

      <CrearProyectoSheet
        abierto={sheetAbierto}
        onCerrar={() => setSheetAbierto(false)}
        onCreado={(proyecto) => {
          setSheetAbierto(false);
          router.push(`/app/proyectos/${proyecto.id}`);
        }}
      />
    </div>
  );
}

function EmptyProyectos({ onCrear }: { onCrear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-[var(--chip-bg)]">
        <HardHat size={26} color="var(--accent)" aria-hidden="true" />
      </span>
      <p className="text-[length:var(--text-subtitle)] font-semibold [font-family:var(--font-heading-name)]">
        Arma la cuadrilla de tu próxima obra
      </p>
      <p className="text-[length:var(--text-small)] text-[var(--text-secondary)]">
        Crea un proyecto por cada obra y asígnale solo a los trabajadores de tu libreta que
        necesitas ahí — sin mezclar a todos en la misma bolsa.
      </p>
      <button
        type="button"
        onClick={onCrear}
        className="mt-2 flex h-12 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-[length:var(--text-body)] font-semibold text-[var(--bg)] [touch-action:manipulation]"
      >
        Crear tu primer proyecto
      </button>
    </div>
  );
}
