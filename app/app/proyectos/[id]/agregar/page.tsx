'use client';

// Agregar trabajadores a un proyecto — reusa el mismo buscador (filtros + resultados) de
// app/app/page.tsx, pero excluye a quienes ya están en la cuadrilla de esta obra y el CTA
// final AGREGA al proyecto en vez de solo mostrar un resumen suelto.

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import FiltrosBusqueda from '@/components/app/FiltrosBusqueda';
import TrabajadorRow from '@/components/app/TrabajadorRow';
import { Skeleton } from '@/components/ui/skeleton';
import { getTrabajadores, type Oficio, type Trabajador } from '@/lib/data/trabajadores';
import { getProximosDias } from '@/lib/data/fechas';
import { asignarTrabajadores, getProyectoPorId, type Proyecto } from '@/lib/data/proyectos';

export default function AgregarATrabajadoresProyectoPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const dias = useMemo(() => getProximosDias(7), []);
  const [proyecto, setProyecto] = useState<Proyecto | null | undefined>(undefined);
  const [trabajadores, setTrabajadores] = useState<Trabajador[] | null>(null);
  const [oficio, setOficio] = useState<Oficio | 'todos'>('todos');
  const [fechaIso, setFechaIso] = useState(dias[0]?.iso ?? '');
  const [fechaHastaIso, setFechaHastaIso] = useState<string | null>(null);
  const [confiabilidadMin, setConfiabilidadMin] = useState(0);
  const [seleccion, setSeleccion] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    getProyectoPorId(id)
      .then((p) => setProyecto(p ?? null))
      .catch(() => setProyecto(null));
    getTrabajadores()
      .then(setTrabajadores)
      .catch(() => setTrabajadores([]));
  }, [id]);

  const yaAsignados = new Set(proyecto?.trabajadorIds ?? []);

  const rangoDias = useMemo(() => {
    if (!fechaHastaIso) return [fechaIso];
    return getProximosDias(14)
      .map((d) => d.iso)
      .filter((iso) => iso >= fechaIso && iso <= fechaHastaIso);
  }, [fechaIso, fechaHastaIso]);

  const filtrados = useMemo(() => {
    if (!trabajadores) return [];
    return trabajadores
      .filter(
        (t) =>
          !yaAsignados.has(t.id) &&
          (oficio === 'todos' || t.oficio === oficio) &&
          t.confiabilidad >= confiabilidadMin &&
          rangoDias.every((iso) => t.disponibilidad[iso] === 'disponible')
      )
      .sort((a, b) => b.confiabilidad - a.confiabilidad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trabajadores, oficio, confiabilidadMin, rangoDias, proyecto]);

  function toggleSeleccion(tid: string) {
    setSeleccion((prev) => (prev.includes(tid) ? prev.filter((x) => x !== tid) : [...prev, tid]));
  }

  async function confirmar() {
    if (!proyecto || seleccion.length === 0) return;
    await asignarTrabajadores(proyecto.id, seleccion);
    router.push(`/app/proyectos/${proyecto.id}`);
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

  return (
    <div className="flex min-h-dvh flex-col pb-28">
      <header className="flex items-center gap-2 px-2 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
          className="flex size-10 items-center justify-center text-[var(--text-secondary)]"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[length:var(--text-subtitle)] font-bold leading-tight [font-family:var(--font-display)]">
            Agregar a {proyecto?.nombre ?? 'la obra'}
          </h1>
        </div>
      </header>

      <FiltrosBusqueda
        oficio={oficio}
        onOficio={setOficio}
        fechaIso={fechaIso}
        onFecha={setFechaIso}
        fechaHastaIso={fechaHastaIso}
        onFechaHasta={setFechaHastaIso}
        confiabilidadMin={confiabilidadMin}
        onConfiabilidadMin={setConfiabilidadMin}
      />

      <p className="px-4 pt-3 text-[length:var(--text-small)] font-semibold text-[var(--text-secondary)]">
        {trabajadores === null ? 'Buscando…' : `${filtrados.length} disponibles de tu libreta para agregar`}
      </p>

      <div className="flex flex-col gap-2 px-4 pt-3">
        {trabajadores === null ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-[var(--radius-card)] bg-[var(--surface)]" />
          ))
        ) : filtrados.length === 0 ? (
          <EmptySinCandidatos
            onQuitarFiltros={() => {
              setOficio('todos');
              setConfiabilidadMin(0);
            }}
          />
        ) : (
          filtrados.map((t, i) => (
            <TrabajadorRow
              key={t.id}
              trabajador={t}
              indice={i}
              fechaIso={fechaIso}
              modoSeleccion
              seleccionado={seleccion.includes(t.id)}
              onToggleSeleccion={() => toggleSeleccion(t.id)}
              onAbrir={() => toggleSeleccion(t.id)}
            />
          ))
        )}
      </div>

      {seleccion.length > 0 ? (
        <motion.button
          type="button"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileTap={{ scale: 0.97 }}
          onClick={confirmar}
          className="fixed inset-x-4 bottom-24 z-40 mx-auto flex h-12 max-w-md items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--text-body)] font-semibold text-[var(--bg)] shadow-[0_8px_30px_color-mix(in_oklab,var(--accent)_30%,transparent)]"
        >
          Agregar a la obra ({seleccion.length})
        </motion.button>
      ) : null}
    </div>
  );
}

function EmptySinCandidatos({ onQuitarFiltros }: { onQuitarFiltros: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] px-6 py-10 text-center">
      <SlidersHorizontal size={28} color="var(--text-tertiary)" aria-hidden="true" />
      <p className="text-[length:var(--text-body)] font-semibold">Nadie más cumple estos filtros</p>
      <p className="text-[length:var(--text-small)] text-[var(--text-secondary)]">
        O ya están todos asignados a esta obra. Prueba bajar la confiabilidad mínima o cambiar el oficio.
      </p>
      <button
        type="button"
        onClick={onQuitarFiltros}
        className="mt-1 rounded-[var(--radius-button)] bg-[var(--chip-bg)] px-4 py-2 text-[length:var(--text-small)] font-semibold text-[var(--accent)]"
      >
        Quitar filtros
      </button>
    </div>
  );
}
