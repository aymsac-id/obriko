'use client';

// Hoja inferior para crear una obra nueva — mismo patrón visual que AgregarTrabajadorSheet.
// Se usa desde la lista de Proyectos y también desde el paso de asignación en Buscar (para
// crear la obra ahí mismo si el usuario todavía no tiene ninguna).

import { useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { addProyecto, type Proyecto } from '@/lib/data/proyectos';

const INPUT_CLASS =
  'h-12 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-3.5 text-[length:var(--text-body)] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]';

function hoyIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function CrearProyectoSheet({
  abierto,
  onCerrar,
  onCreado,
}: {
  abierto: boolean;
  onCerrar: () => void;
  onCreado: (proyecto: Proyecto) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [fechaInicio, setFechaInicio] = useState(hoyIso());
  const [error, setError] = useState<string | null>(null);

  function limpiar() {
    setNombre('');
    setUbicacion('');
    setFechaInicio(hoyIso());
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (nombre.trim().length < 4) {
      setError('Ponle un nombre a la obra, ej. "Ampliación segundo piso".');
      return;
    }
    if (ubicacion.trim().length < 2) {
      setError('Escribe la zona o dirección de la obra.');
      return;
    }
    try {
      const proyecto = await addProyecto({
        nombre: nombre.trim(),
        ubicacion: ubicacion.trim(),
        fechaInicio,
      });
      limpiar();
      onCreado(proyecto);
    } catch {
      setError('No pudimos crear la obra. Intenta de nuevo.');
    }
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
            aria-label="Crear proyecto"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-[var(--radius-sheet)] border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 pt-4 pb-[max(24px,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)]" />
            <div className="flex items-center justify-between">
              <h2 className="text-[length:var(--text-sheet-title)] font-bold [font-family:var(--font-display)]">Nueva obra</h2>
              <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar"
                className="flex size-9 items-center justify-center text-[var(--text-tertiary)]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3" noValidate>
              <Campo label="Nombre de la obra">
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Ampliación segundo piso - Av. Los Álamos"
                  className={INPUT_CLASS}
                />
              </Campo>
              <Campo label="Zona o dirección">
                <input
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej. El Tambo"
                  className={INPUT_CLASS}
                />
              </Campo>
              <Campo label="Fecha de inicio">
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className={INPUT_CLASS}
                />
              </Campo>
              {error ? (
                <p role="alert" className="text-[length:var(--text-small)] text-[var(--danger)]">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="mt-1 flex h-12 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--text-body)] font-semibold text-[var(--bg)]"
              >
                Crear obra
              </button>
            </form>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[length:var(--text-small)] font-medium text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  );
}
