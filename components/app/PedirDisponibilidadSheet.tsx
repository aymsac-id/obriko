'use client';

// Pedir disponibilidad a todo el equipo de una vez — con cuadrillas grandes (20+), abrir la
// ficha de cada trabajador para copiar y mandar su enlace es tedioso (pedido directo del
// usuario). Esta pantalla arma, para cada trabajador elegido, un botón de WhatsApp ya listo con
// su mensaje y su enlace — un toque abre WhatsApp con todo escrito, se manda, se sigue con el
// siguiente. WhatsApp no permite un solo botón que mande a todos a la vez sin su API de pago
// (ver ESTADO.md) — esta es la vía rápida sin costo extra.

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, MessageCircle, X } from 'lucide-react';
import type { Trabajador } from '@/lib/data/trabajadores';

function mensajePara(trabajador: Trabajador): string {
  const link = `${window.location.origin}/disponibilidad/${trabajador.enlaceToken}`;
  return `Hola ${trabajador.nombre.split(' ')[0]}, ¿me confirmas tu disponibilidad para los próximos días? Márcala aquí, te toma unos segundos: ${link}`;
}

export default function PedirDisponibilidadSheet({
  abierto,
  trabajadores,
  onCerrar,
}: {
  abierto: boolean;
  trabajadores: Trabajador[];
  onCerrar: () => void;
}) {
  const [seleccion, setSeleccion] = useState<Set<string>>(() => new Set(trabajadores.map((t) => t.id)));
  const [enviados, setEnviados] = useState<Set<string>>(new Set());

  const seleccionados = useMemo(() => trabajadores.filter((t) => seleccion.has(t.id)), [trabajadores, seleccion]);

  function toggle(id: string) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function enviar(t: Trabajador) {
    window.open(`https://wa.me/51${t.telefono}?text=${encodeURIComponent(mensajePara(t))}`, '_blank');
    setEnviados((prev) => new Set(prev).add(t.id));
  }

  function cerrar() {
    setEnviados(new Set());
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
            onClick={cerrar}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Pedir disponibilidad"
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-[var(--radius-sheet)] border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 pt-4 pb-[max(24px,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)]" />
            <div className="mb-1 flex shrink-0 items-center justify-between">
              <h2 className="text-[19px] font-bold [font-family:var(--font-display)]">Pedir disponibilidad</h2>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="flex size-9 items-center justify-center text-[var(--text-tertiary)]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <p className="mb-3 shrink-0 text-[13px] text-[var(--text-secondary)]">
              Toca "Enviar" para cada uno — se abre WhatsApp con el mensaje y su enlace ya escritos.
            </p>

            {trabajadores.length === 0 ? (
              <p className="text-[14px] text-[var(--text-secondary)]">Todavía no tienes trabajadores en tu libreta.</p>
            ) : (
              <>
                <div className="mb-2 flex shrink-0 items-center justify-between">
                  <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
                    {seleccion.size} de {trabajadores.length} elegidos
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSeleccion(seleccion.size === trabajadores.length ? new Set() : new Set(trabajadores.map((t) => t.id)))
                    }
                    className="text-[12px] font-semibold text-[var(--accent)]"
                  >
                    {seleccion.size === trabajadores.length ? 'Ninguno' : 'Todos'}
                  </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2">
                  {trabajadores.map((t) => {
                    const elegido = seleccion.has(t.id);
                    const enviado = enviados.has(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`flex items-center gap-3 rounded-[var(--radius-card)] border px-3.5 py-3 transition-colors ${
                          elegido
                            ? 'border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface-2)]'
                            : 'border-transparent opacity-50'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggle(t.id)}
                          aria-label={elegido ? `Quitar a ${t.nombre}` : `Elegir a ${t.nombre}`}
                          aria-pressed={elegido}
                          className={`flex size-6 shrink-0 items-center justify-center rounded-[8px] border [touch-action:manipulation] ${
                            elegido ? 'border-transparent bg-[var(--accent)]' : 'border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)]'
                          }`}
                        >
                          {elegido ? <Check size={15} color="var(--bg)" aria-hidden="true" /> : null}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold">{t.nombre}</p>
                          <p className="text-[12px] text-[var(--text-secondary)]">{t.oficio}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => enviar(t)}
                          disabled={!elegido}
                          className={`flex h-9 shrink-0 items-center gap-1.5 rounded-[var(--radius-button)] px-3 text-[13px] font-semibold [touch-action:manipulation] disabled:opacity-40 ${
                            enviado ? 'bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[var(--success)]' : 'bg-[var(--chip-bg)] text-[var(--accent)]'
                          }`}
                        >
                          {enviado ? (
                            <>
                              <Check size={14} aria-hidden="true" /> Enviado
                            </>
                          ) : (
                            <>
                              <MessageCircle size={14} aria-hidden="true" /> Enviar
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {seleccionados.length > 0 && enviados.size < seleccionados.length ? (
                  <p className="mt-2 shrink-0 text-center text-[12px] text-[var(--text-tertiary)]">
                    {enviados.size} de {seleccionados.length} enviados
                  </p>
                ) : null}
              </>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
