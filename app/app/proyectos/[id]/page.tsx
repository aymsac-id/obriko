'use client';

// Detalle de un proyecto (obra) — su cuadrilla asignada con WeekStrip y confiabilidad (igual
// criterio visual que Buscar), y "Agregar más trabajadores" que reabre el buscador filtrado a
// quienes todavía no están en esta obra.

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, MapPin, UserPlus, Users2 } from 'lucide-react';
import TrabajadorRow from '@/components/app/TrabajadorRow';
import EstadoProyectoBadge from '@/components/app/EstadoProyectoBadge';
import {
  getProyectoPorId,
  quitarTrabajador,
  setEstadoProyecto,
  type EstadoProyecto,
  type Proyecto,
} from '@/lib/data/proyectos';
import { getTrabajadores, type Trabajador } from '@/lib/data/trabajadores';
import { getProximosDias } from '@/lib/data/fechas';

const ORDEN_ESTADOS: EstadoProyecto[] = ['activo', 'pausado', 'terminado'];

export default function DetalleProyectoPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const dias = useMemo(() => getProximosDias(7), []);
  const [proyecto, setProyecto] = useState<Proyecto | null | undefined>(undefined);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);

  useEffect(() => {
    if (!id) return;
    recargar();
    getTrabajadores()
      .then(setTrabajadores)
      .catch(() => setTrabajadores([]));
  }, [id]);

  function recargar() {
    if (!id) return;
    getProyectoPorId(id)
      .then((p) => setProyecto(p ?? null))
      .catch(() => setProyecto(null));
  }

  const cuadrilla = useMemo(() => {
    if (!proyecto) return [];
    const mapa = new Map(trabajadores.map((t) => [t.id, t]));
    return proyecto.trabajadorIds.map((tid) => mapa.get(tid)).filter((t): t is Trabajador => Boolean(t));
  }, [proyecto, trabajadores]);

  if (proyecto === undefined) {
    return (
      <div className="min-h-dvh px-4 pt-6">
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)]" />
      </div>
    );
  }

  if (proyecto === null) {
    return (
      <div className="flex min-h-dvh flex-col items-center gap-3 px-4 pt-16 text-center">
        <p className="text-[length:var(--text-body)] font-semibold">No encontramos esta obra</p>
        <button
          type="button"
          onClick={() => router.push('/app/proyectos')}
          className="text-[length:var(--text-small)] font-semibold text-[var(--accent)]"
        >
          Volver a Proyectos
        </button>
      </div>
    );
  }

  async function ciclarEstado() {
    if (!proyecto) return;
    const idx = ORDEN_ESTADOS.indexOf(proyecto.estado);
    const siguiente = ORDEN_ESTADOS[(idx + 1) % ORDEN_ESTADOS.length] as EstadoProyecto;
    await setEstadoProyecto(proyecto.id, siguiente);
    recargar();
  }

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <header className="flex items-center gap-2 px-2 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
          className="flex size-10 items-center justify-center text-[var(--text-secondary)]"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
      </header>

      <div className="px-4 pt-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="line-clamp-2 text-[length:var(--text-page-title)] font-bold leading-tight [font-family:var(--font-display)]">
            {proyecto.nombre}
          </h1>
          <button type="button" onClick={ciclarEstado} className="shrink-0 [touch-action:manipulation]">
            <EstadoProyectoBadge estado={proyecto.estado} interactivo />
          </button>
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[length:var(--text-small)] text-[var(--text-secondary)]">
          <MapPin size={13} aria-hidden="true" />
          {proyecto.ubicacion} · desde{' '}
          {new Date(`${proyecto.fechaInicio}T00:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
        </p>
        <p className="mt-1 text-[length:var(--text-small)] text-[var(--text-tertiary)]">
          Toca el estado para cambiarlo — activo, pausado o terminado.
        </p>
      </div>

      <section className="mt-6 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[length:var(--text-small)] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            Cuadrilla de esta obra ({cuadrilla.length})
          </h2>
          <button
            type="button"
            onClick={() => router.push(`/app/proyectos/${proyecto.id}/agregar`)}
            className="flex items-center gap-1.5 text-[length:var(--text-small)] font-semibold text-[var(--accent)] [touch-action:manipulation]"
          >
            <UserPlus size={15} aria-hidden="true" /> Agregar
          </button>
        </div>

        {cuadrilla.length === 0 ? (
          <EmptyCuadrilla onAgregar={() => router.push(`/app/proyectos/${proyecto.id}/agregar`)} />
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {cuadrilla.map((t, i) => (
              <div key={t.id} className="relative">
                <TrabajadorRow
                  trabajador={t}
                  indice={i}
                  fechaIso={dias[0]?.iso ?? ''}
                  modoSeleccion={false}
                  seleccionado={false}
                  onToggleSeleccion={() => {}}
                  onAbrir={() => router.push(`/app/cuadrilla/${t.id}`)}
                />
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!proyecto) return;
                    if (!window.confirm(`¿Quitar a ${t.nombre} de esta obra? Sigue en tu libreta general.`)) return;
                    await quitarTrabajador(proyecto.id, t.id);
                    recargar();
                  }}
                  className="absolute right-3 top-3 text-[length:var(--text-small)] font-semibold text-[var(--danger)] [touch-action:manipulation]"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyCuadrilla({ onAgregar }: { onAgregar: () => void }) {
  return (
    <div className="mt-3 flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] px-6 py-10 text-center">
      <Users2 size={26} color="var(--text-tertiary)" aria-hidden="true" />
      <p className="text-[length:var(--text-body)] font-semibold">Todavía no le asignaste a nadie</p>
      <p className="text-[length:var(--text-small)] text-[var(--text-secondary)]">
        Elige de tu libreta a los trabajadores que necesitas para esta obra.
      </p>
      <button
        type="button"
        onClick={onAgregar}
        className="mt-1 flex h-12 items-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-[length:var(--text-body)] font-semibold text-[var(--bg)] [touch-action:manipulation]"
      >
        Agregar trabajadores <ChevronRight size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
