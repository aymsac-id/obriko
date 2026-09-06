'use client';

// Calificar tras una obra — la "inversión" del loop de retención (ESTADO.md): 10 segundos
// ahora, cuadrillas más precisas mañana. Calidad + puntualidad + ¿la recomendarías?

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Star, X } from 'lucide-react';
import { addEvaluacion } from '@/lib/data/trabajadores';
import ScoreBadge from '@/components/app/ScoreBadge';

export default function CalificarSheet({
  abierto,
  nombre,
  trabajadorId,
  confiabilidadActual,
  onCerrar,
  onGuardado,
}: {
  abierto: boolean;
  nombre: string;
  trabajadorId: string;
  /** Confiabilidad ANTES de esta calificación — para mostrar el cambio en la celebración. */
  confiabilidadActual: number;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [obra, setObra] = useState('');
  const [calidad, setCalidad] = useState(0);
  const [puntualidad, setPuntualidad] = useState(0);
  const [recomendaria, setRecomendaria] = useState<boolean | null>(null);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Micro-celebración de la "inversión" del loop de retención (ESTADO.md): tras guardar,
  // se muestra cuánto subió (o bajó) la confiabilidad antes de cerrar la ficha.
  const [resultado, setResultado] = useState<number | null>(null);
  // Bug real corregido (2026-09-06): sin este guard, un doble-toque en "Guardar calificación"
  // mandaba la misma calificación dos veces (2 filas reales en `evaluaciones`, confiabilidad
  // inflada al doble) porque el botón seguía habilitado mientras la primera petición viajaba.
  const [guardando, setGuardando] = useState(false);

  function limpiar() {
    setObra('');
    setCalidad(0);
    setPuntualidad(0);
    setRecomendaria(null);
    setComentario('');
    setError(null);
    setResultado(null);
    setGuardando(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (guardando) return;
    if (!calidad || !puntualidad || recomendaria === null) {
      setError('Completa calidad, puntualidad y si lo recomendarías.');
      return;
    }
    setGuardando(true);
    try {
      const actualizado = await addEvaluacion(trabajadorId, {
        obra: obra.trim() || 'Obra sin nombre',
        calidad,
        puntualidad,
        recomendaria,
        comentario: comentario.trim(),
      });
      onGuardado();
      setResultado(actualizado ? actualizado.confiabilidad : confiabilidadActual);
    } catch {
      setError('No pudimos guardar la calificación. Intenta de nuevo.');
      setGuardando(false);
    }
  }

  function cerrarCelebracion() {
    limpiar();
    onCerrar();
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
            onClick={resultado !== null ? cerrarCelebracion : onCerrar}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label={`Calificar a ${nombre}`}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-[20px] border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 pt-4 pb-[max(24px,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)]" />

            {resultado !== null ? (
              <motion.div
                key="celebracion"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-3 px-2 pt-2 pb-4 text-center"
              >
                <ScoreBadge score={resultado} />
                <div>
                  <p className="text-[16px] font-semibold text-[var(--text-primary)]">
                    Confiabilidad de {nombre.split(' ')[0]}{' '}
                    {resultado >= confiabilidadActual ? 'subió' : 'bajó'} a {resultado}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                    Tu búsqueda de mañana ya quedó más precisa.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cerrarCelebracion}
                  className="mt-2 flex h-11 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[15px] font-semibold text-[var(--bg)]"
                >
                  Listo
                </button>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-[19px] font-bold [font-family:var(--font-display)]">
                    Califica a {nombre.split(' ')[0]}
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
                <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                  10 segundos ahora, cuadrillas más precisas mañana.
                </p>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
              <Estrellas label="Calidad del trabajo" valor={calidad} onChange={setCalidad} />
              <Estrellas label="Puntualidad" valor={puntualidad} onChange={setPuntualidad} />

              <div>
                <p className="mb-1.5 text-[13px] font-medium text-[var(--text-secondary)]">
                  ¿Lo recomendarías para tu próxima obra?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRecomendaria(true)}
                    aria-pressed={recomendaria === true}
                    className={`h-11 flex-1 rounded-[var(--radius-button)] border text-[14px] font-semibold [touch-action:manipulation] ${
                      recomendaria === true
                        ? 'border-transparent bg-[var(--success)] text-[var(--bg)]'
                        : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Sí, sin duda
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecomendaria(false)}
                    aria-pressed={recomendaria === false}
                    className={`h-11 flex-1 rounded-[var(--radius-button)] border text-[14px] font-semibold [touch-action:manipulation] ${
                      recomendaria === false
                        ? 'border-transparent bg-[var(--danger)] text-[var(--bg)]'
                        : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] text-[var(--text-secondary)]'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-[var(--text-secondary)]">Obra (opcional)</span>
                <input
                  value={obra}
                  onChange={(e) => setObra(e.target.value)}
                  placeholder="Ej. Ampliación Jr. Los Pinos"
                  className="h-11 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-3.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-[var(--text-secondary)]">Comentario (opcional)</span>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={2}
                  placeholder="¿Algo que quieras recordar de esta obra?"
                  className="w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                />
              </label>

              {error ? (
                <p role="alert" className="text-[13px] text-[var(--danger)]">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={guardando}
                className="flex h-12 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[15px] font-semibold text-[var(--bg)] disabled:opacity-60"
              >
                {guardando ? 'Guardando…' : 'Guardar calificación'}
              </button>
                </form>
              </>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function Estrellas({ label, valor, onChange }: { label: string; valor: number; onChange: (n: number) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-[var(--text-secondary)]">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} de 5`} className="p-0.5">
            <Star size={26} strokeWidth={1.5} color="var(--accent)" fill={n <= valor ? 'var(--accent)' : 'transparent'} />
          </button>
        ))}
      </div>
    </div>
  );
}
