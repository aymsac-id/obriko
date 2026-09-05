'use client';

// Buscar cuadrilla — la pantalla protagonista (Sesión 5). Dirección "B — Comando de
// Búsqueda": filtros siempre visibles arriba + franja semanal de disponibilidad por fila +
// "Armar cuadrilla" para seleccionar varios y ver el resumen.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Bell, SlidersHorizontal, Users2, X } from 'lucide-react';
import FiltrosBusqueda from '@/components/app/FiltrosBusqueda';
import TrabajadorRow from '@/components/app/TrabajadorRow';
import CuadrillaResumenSheet from '@/components/app/CuadrillaResumenSheet';
import PedirDisponibilidadSheet from '@/components/app/PedirDisponibilidadSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { getTrabajadores, migrarImportacionDeOnboarding, type Oficio, type Trabajador } from '@/lib/data/trabajadores';
import { getRecordatorio } from '@/lib/data/empresa';
import { getProximosDias } from '@/lib/data/fechas';
import { crearClienteSupabase } from '@/lib/supabase/client';
import { logEvento } from '@/lib/data/logging';

const RECORDATORIO_VISTO_KEY = 'obriko_recordatorio_visto_v1';
const SESION_REGISTRADA_KEY = 'obriko_sesion_registrada_v1';

function hoyIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function BuscarPage() {
  const router = useRouter();
  const dias = useMemo(() => getProximosDias(7), []);
  const [trabajadores, setTrabajadores] = useState<Trabajador[] | null>(null);
  const [oficio, setOficio] = useState<Oficio | 'todos'>('todos');
  const [fechaIso, setFechaIso] = useState(dias[0]?.iso ?? '');
  const [fechaHastaIso, setFechaHastaIso] = useState<string | null>(null);
  const [confiabilidadMin, setConfiabilidadMin] = useState(0);
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [resumenAbierto, setResumenAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarRecordatorio, setMostrarRecordatorio] = useState(false);
  const [pedirAbierto, setPedirAbierto] = useState(false);

  useEffect(() => {
    migrarImportacionDeOnboarding()
      .catch(() => {
        // Si falla, los datos siguen en localStorage y se reintenta la próxima vez que
        // se abra esta pantalla — no bloquea ver la cuadrilla ya existente en la nube.
      })
      .finally(cargar);

    getRecordatorio()
      .then((r) => {
        if (!r) return;
        const ahora = new Date();
        const yaLoVioHoy = window.localStorage.getItem(RECORDATORIO_VISTO_KEY) === hoyIso();
        if (r.diaSemana === ahora.getDay() && ahora.getHours() >= r.hora && !yaLoVioHoy) {
          setMostrarRecordatorio(true);
        }
      })
      .catch(() => {
        // sin recordatorio configurado o falló la carga — no bloquea la pantalla
      });

    // "sesión abierta" una vez por día — es la base real de la retención D1/D7/D30 del panel
    // de administración: sin este evento no hay forma honesta de medir si alguien vuelve.
    if (window.localStorage.getItem(SESION_REGISTRADA_KEY) !== hoyIso()) {
      (async () => {
        try {
          const { data } = await crearClienteSupabase().from('empresas').select('id').maybeSingle();
          if (data?.id) {
            await logEvento('sesion_abierta', data.id);
            window.localStorage.setItem(SESION_REGISTRADA_KEY, hoyIso());
          }
        } catch {
          // medir uso no debe romper la pantalla
        }
      })();
    }
  }, []);

  function descartarRecordatorio() {
    window.localStorage.setItem(RECORDATORIO_VISTO_KEY, hoyIso());
    setMostrarRecordatorio(false);
  }

  function cargar() {
    setError(null);
    getTrabajadores()
      .then(setTrabajadores)
      .catch(() => setError('No pudimos cargar tu cuadrilla. Revisa tu conexión e intenta de nuevo.'));
  }

  // "Cuándo lo necesitas" es un filtro de verdad, no solo un orden (pedido explícito del
  // usuario). Con un rango (obras de varios días), solo cuenta como candidato quien está libre
  // TODOS los días del rango — no sirve alguien que falle a mitad de la obra.
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
          (oficio === 'todos' || t.oficio === oficio) &&
          t.confiabilidad >= confiabilidadMin &&
          rangoDias.every((iso) => t.disponibilidad[iso] === 'disponible')
      )
      .sort((a, b) => b.confiabilidad - a.confiabilidad);
  }, [trabajadores, oficio, confiabilidadMin, rangoDias]);

  const disponiblesHoy = filtrados.length;
  const seleccionados = (trabajadores ?? []).filter((t) => seleccion.includes(t.id));

  function toggleSeleccion(id: string) {
    setSeleccion((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function cancelarSeleccion() {
    setModoSeleccion(false);
    setSeleccion([]);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-4 pb-1 pt-5">
        <h1 className="text-[26px] font-bold leading-tight [font-family:var(--font-display)]">Buscar cuadrilla</h1>
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

      {error ? (
        <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-3.5 py-3">
          <p className="text-[13px] text-[var(--text-primary)]">{error}</p>
          <button type="button" onClick={cargar} className="shrink-0 text-[13px] font-semibold text-[var(--accent)]">
            Reintentar
          </button>
        </div>
      ) : null}

      {mostrarRecordatorio ? (
        <div className="mx-4 mt-3 flex items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-[var(--chip-bg)] px-3.5 py-3">
          <Bell size={18} color="var(--accent)" className="shrink-0" aria-hidden="true" />
          <p className="flex-1 text-[13px] text-[var(--text-primary)]">Hoy toca pedir disponibilidad a tu equipo.</p>
          <button
            type="button"
            onClick={() => {
              setPedirAbierto(true);
              descartarRecordatorio();
            }}
            className="shrink-0 text-[13px] font-semibold text-[var(--accent)]"
          >
            Pedir ahora
          </button>
          <button
            type="button"
            onClick={descartarRecordatorio}
            aria-label="Descartar aviso"
            className="shrink-0 text-[var(--text-tertiary)]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-[13px] font-semibold text-[var(--text-secondary)]">
          {trabajadores === null ? (
            'Buscando…'
          ) : (
            <>
              <span className="text-[var(--text-primary)]">{disponiblesHoy}</span>{' '}
              {disponiblesHoy === 1 ? 'disponible' : 'disponibles'}
              {fechaHastaIso ? ' todo el rango' : ''} de {trabajadores.length} en tu libreta
            </>
          )}
        </p>
        {modoSeleccion ? (
          <button type="button" onClick={cancelarSeleccion} className="text-[13px] font-semibold text-[var(--accent)]">
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setModoSeleccion(true)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)]"
          >
            <Users2 size={15} aria-hidden="true" /> Armar cuadrilla
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pt-3">
        {trabajadores === null ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[84px] w-full rounded-[var(--radius-card)] bg-[var(--surface)]" />
          ))
        ) : filtrados.length === 0 ? (
          <EmptyBuscador
            onQuitarFiltros={() => {
              setOficio('todos');
              setConfiabilidadMin(0);
              setFechaHastaIso(null);
            }}
          />
        ) : (
          filtrados.map((t, i) => (
            <TrabajadorRow
              key={t.id}
              trabajador={t}
              indice={i}
              fechaIso={fechaIso}
              modoSeleccion={modoSeleccion}
              seleccionado={seleccion.includes(t.id)}
              onToggleSeleccion={() => toggleSeleccion(t.id)}
              onAbrir={() => router.push(`/app/cuadrilla/${t.id}`)}
            />
          ))
        )}
      </div>

      {modoSeleccion && seleccion.length > 0 ? (
        <motion.button
          type="button"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setResumenAbierto(true)}
          className="fixed inset-x-4 bottom-24 z-30 mx-auto flex h-[52px] max-w-md items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[15px] font-semibold text-[var(--bg)] shadow-[0_8px_30px_color-mix(in_oklab,var(--accent)_30%,transparent)]"
        >
          Armar cuadrilla ({seleccion.length})
        </motion.button>
      ) : null}

      <CuadrillaResumenSheet
        abierto={resumenAbierto}
        seleccionados={seleccionados}
        onCerrar={() => setResumenAbierto(false)}
        onQuitar={(id) => setSeleccion((prev) => prev.filter((x) => x !== id))}
      />

      <PedirDisponibilidadSheet
        abierto={pedirAbierto}
        trabajadores={trabajadores ?? []}
        onCerrar={() => setPedirAbierto(false)}
      />
    </div>
  );
}

function EmptyBuscador({ onQuitarFiltros }: { onQuitarFiltros: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] px-6 py-10 text-center">
      <SlidersHorizontal size={28} color="var(--text-tertiary)" aria-hidden="true" />
      <p className="text-[15px] font-semibold">Nadie cumple estos filtros</p>
      <p className="text-[13px] text-[var(--text-secondary)]">Prueba bajar la confiabilidad mínima o cambiar el oficio.</p>
      <button
        type="button"
        onClick={onQuitarFiltros}
        className="mt-1 rounded-[var(--radius-button)] bg-[var(--chip-bg)] px-4 py-2 text-[13px] font-semibold text-[var(--accent)]"
      >
        Quitar filtros
      </button>
    </div>
  );
}
