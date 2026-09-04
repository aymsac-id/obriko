'use client';

// Hoja inferior de "Armar cuadrilla": resumen de seleccionados, contacto directo por
// WhatsApp/llamada, costo estimado del día, y el paso final de asignarla a una obra
// (Proyectos) — elegir un proyecto existente o crear uno nuevo ahí mismo.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronRight, MessageCircle, Plus, X } from 'lucide-react';
import ScoreBadge from '@/components/app/ScoreBadge';
import { iniciales, type Trabajador } from '@/lib/data/trabajadores';
import { addProyecto, asignarTrabajadores, getProyectos, type Proyecto } from '@/lib/data/proyectos';

function hoyIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CuadrillaResumenSheet({
  abierto,
  seleccionados,
  onCerrar,
  onQuitar,
}: {
  abierto: boolean;
  seleccionados: Trabajador[];
  onCerrar: () => void;
  onQuitar: (id: string) => void;
}) {
  const total = seleccionados.reduce((acc, t) => acc + t.tarifaDia, 0);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoId, setProyectoId] = useState<string | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [ubicacionNuevo, setUbicacionNuevo] = useState('');
  const [asignadoA, setAsignadoA] = useState<string | null>(null);

  useEffect(() => {
    if (abierto) {
      getProyectos()
        .then(setProyectos)
        .catch(() => setProyectos([]));
      setAsignadoA(null);
    }
  }, [abierto]);

  async function crearYSeleccionar() {
    if (nombreNuevo.trim().length < 4) return;
    const nuevo = await addProyecto({
      nombre: nombreNuevo.trim(),
      ubicacion: ubicacionNuevo.trim() || 'Sin especificar',
      fechaInicio: hoyIso(),
    });
    setProyectos((prev) => [nuevo, ...prev]);
    setProyectoId(nuevo.id);
    setCreandoNuevo(false);
    setNombreNuevo('');
    setUbicacionNuevo('');
  }

  async function asignar() {
    if (!proyectoId || seleccionados.length === 0) return;
    const proyecto = await asignarTrabajadores(
      proyectoId,
      seleccionados.map((t) => t.id)
    );
    setAsignadoA(proyecto?.nombre ?? null);
  }

  return (
    <AnimatePresence>
      {abierto ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onCerrar}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Tu cuadrilla armada"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto rounded-t-[var(--radius-sheet)] border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)]" />
            <div className="flex items-center justify-between">
              <h2 className="text-[length:var(--text-sheet-title)] font-bold [font-family:var(--font-display)]">
                Tu cuadrilla ({seleccionados.length})
              </h2>
              <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar"
                className="flex size-9 items-center justify-center text-[var(--text-tertiary)]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {seleccionados.length === 0 ? (
              <p className="mt-6 mb-2 text-center text-sm text-[var(--text-secondary)]">
                Toca a los trabajadores de la lista para agregarlos aquí.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {seleccionados.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-[var(--radius-card)] bg-[var(--surface-2)] px-3 py-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] text-[12px] font-bold [font-family:var(--font-heading-name)]">
                      {iniciales(t.nombre)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[length:var(--text-body)] font-semibold [font-family:var(--font-heading-name)]">{t.nombre}</p>
                      <p className="text-[12px] text-[var(--text-secondary)]">
                        {t.oficio} · S/ {t.tarifaDia}/día
                      </p>
                    </div>
                    <ScoreBadge score={t.confiabilidad} size="sm" />
                    <a
                      href={`https://wa.me/51${t.telefono}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Escribir a ${t.nombre} por WhatsApp`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]"
                    >
                      <MessageCircle size={16} color="var(--accent)" aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      onClick={() => onQuitar(t.id)}
                      aria-label={`Quitar a ${t.nombre} de la cuadrilla`}
                      className="flex size-9 shrink-0 items-center justify-center text-[var(--text-tertiary)]"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between border-t border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] pt-3 text-[length:var(--text-small)]">
                  <span className="text-[var(--text-secondary)]">Costo estimado del día</span>
                  <span className="font-bold tabular-nums">S/ {total}</span>
                </div>

                <div className="mt-4 border-t border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] pt-4">
                  {asignadoA ? (
                    <div className="flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--chip-bg)] px-3.5 py-3 text-[length:var(--text-small)] font-semibold text-[var(--accent)]">
                      <Check size={16} aria-hidden="true" /> Cuadrilla asignada a &quot;{asignadoA}&quot;
                    </div>
                  ) : (
                    <>
                      <p className="text-[length:var(--text-small)] font-semibold text-[var(--text-secondary)]">
                        Asignar esta cuadrilla a una obra
                      </p>
                      <div className="mt-2 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {proyectos.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setProyectoId(p.id);
                              setCreandoNuevo(false);
                            }}
                            aria-pressed={proyectoId === p.id}
                            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[length:var(--text-small)] font-medium [touch-action:manipulation] ${
                              proyectoId === p.id
                                ? 'border-transparent bg-[var(--accent)] text-[var(--bg)]'
                                : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface-2)] text-[var(--text-secondary)]'
                            }`}
                          >
                            {p.nombre}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setCreandoNuevo(true);
                            setProyectoId(null);
                          }}
                          aria-pressed={creandoNuevo}
                          className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3.5 py-2 text-[length:var(--text-small)] font-medium [touch-action:manipulation] ${
                            creandoNuevo
                              ? 'border-transparent bg-[var(--accent)] text-[var(--bg)]'
                              : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface-2)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <Plus size={13} aria-hidden="true" /> Nueva obra
                        </button>
                      </div>

                      {creandoNuevo ? (
                        <div className="mt-3 flex flex-col gap-2">
                          <input
                            value={nombreNuevo}
                            onChange={(e) => setNombreNuevo(e.target.value)}
                            placeholder="Nombre de la obra"
                            className="h-11 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-3.5 text-[length:var(--text-body)] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                          />
                          <input
                            value={ubicacionNuevo}
                            onChange={(e) => setUbicacionNuevo(e.target.value)}
                            placeholder="Zona o dirección"
                            className="h-11 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-3.5 text-[length:var(--text-body)] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                          />
                          <button
                            type="button"
                            onClick={crearYSeleccionar}
                            className="flex h-11 items-center justify-center gap-1 rounded-[var(--radius-button)] bg-[var(--chip-bg)] text-[length:var(--text-small)] font-semibold text-[var(--accent)] [touch-action:manipulation]"
                          >
                            Crear y elegir esta obra <ChevronRight size={14} aria-hidden="true" />
                          </button>
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={asignar}
                        disabled={!proyectoId}
                        className="mt-3 flex h-12 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--text-body)] font-semibold text-[var(--bg)] disabled:opacity-40 [touch-action:manipulation]"
                      >
                        Asignar a esta obra
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
