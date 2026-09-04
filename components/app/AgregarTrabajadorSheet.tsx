'use client';

// Hoja inferior para agregar un trabajador a mano (además de los importados en el
// onboarding). Si el plan gratis llegó a su límite, se muestra el upsell en vez del
// formulario (15: paywall con valor, nunca un error técnico).

import { useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Lock, X } from 'lucide-react';
import Link from 'next/link';
import { OFICIOS, type Oficio } from '@/components/onboarding/data';
import { addTrabajador } from '@/lib/data/trabajadores';

const INPUT_CLASS =
  'h-12 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-3.5 text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]';

export default function AgregarTrabajadorSheet({
  abierto,
  limiteAlcanzado,
  onCerrar,
  onCreado,
}: {
  abierto: boolean;
  limiteAlcanzado: boolean;
  onCerrar: () => void;
  onCreado: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [oficio, setOficio] = useState<Oficio>('Albañil');
  const [oficioPersonalizado, setOficioPersonalizado] = useState(false);
  const [telefono, setTelefono] = useState('');
  const [tarifaDia, setTarifaDia] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [error, setError] = useState<string | null>(null);

  function limpiar() {
    setNombre('');
    setOficio('Albañil');
    setOficioPersonalizado(false);
    setTelefono('');
    setTarifaDia('');
    setUbicacion('');
    setError(null);
  }

  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (nombre.trim().length < 3) {
      setError('Escribe el nombre completo.');
      return;
    }
    if (!/^9\d{8}$/.test(telefono.trim())) {
      setError('El celular debe tener 9 dígitos y empezar con 9.');
      return;
    }
    if (oficio.trim().length === 0) {
      setError('Escribe o elige un oficio.');
      return;
    }
    setGuardando(true);
    try {
      await addTrabajador({
        nombre: nombre.trim(),
        oficio: oficio.trim(),
        telefono: telefono.trim(),
        tarifaDia: Number(tarifaDia) || 80,
        ubicacion: ubicacion.trim() || 'Sin especificar',
      });
      limpiar();
      onCreado();
    } catch {
      setError('No pudimos guardarlo. Intenta de nuevo.');
    } finally {
      setGuardando(false);
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
            aria-label="Agregar trabajador"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-[20px] border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 pt-4 pb-[max(24px,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)]" />
            <div className="flex items-center justify-between">
              <h2 className="text-[19px] font-bold [font-family:var(--font-display)]">Agregar trabajador</h2>
              <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar"
                className="flex size-9 items-center justify-center text-[var(--text-tertiary)]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {limiteAlcanzado ? (
              <div className="mt-5 flex flex-col items-center gap-3 py-4 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)]">
                  <Lock size={22} color="var(--accent)" aria-hidden="true" />
                </span>
                <p className="text-[16px] font-semibold">Llegaste a los 10 trabajadores del plan gratis</p>
                <p className="text-[13px] text-[var(--text-secondary)]">
                  Pasa a Starter para agregar hasta 50 y seguir creciendo tu cuadrilla sin límite.
                </p>
                <Link
                  href="/paywall"
                  className="mt-2 flex h-12 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[15px] font-semibold text-[var(--bg)]"
                >
                  Ver plan Starter
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3" noValidate>
                <Campo label="Nombre completo">
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Marco Injante"
                    className={INPUT_CLASS}
                  />
                </Campo>
                <Campo label="Oficio">
                  <div className="flex flex-wrap gap-2">
                    {OFICIOS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => {
                          setOficio(o);
                          setOficioPersonalizado(false);
                        }}
                        aria-pressed={!oficioPersonalizado && oficio === o}
                        className={`rounded-full border px-3 py-1.5 text-[13px] font-medium [touch-action:manipulation] ${
                          !oficioPersonalizado && oficio === o
                            ? 'border-transparent bg-[var(--accent)] text-[var(--bg)]'
                            : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setOficioPersonalizado(true);
                        setOficio('');
                      }}
                      aria-pressed={oficioPersonalizado}
                      className={`rounded-full border px-3 py-1.5 text-[13px] font-medium [touch-action:manipulation] ${
                        oficioPersonalizado
                          ? 'border-transparent bg-[var(--accent)] text-[var(--bg)]'
                          : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] text-[var(--text-secondary)]'
                      }`}
                    >
                      Otro…
                    </button>
                  </div>
                  {oficioPersonalizado ? (
                    <input
                      value={oficio}
                      onChange={(e) => setOficio(e.target.value)}
                      placeholder="Escribe el oficio"
                      autoFocus
                      className={`${INPUT_CLASS} mt-2`}
                    />
                  ) : null}
                </Campo>
                <Campo label="Celular">
                  <input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    inputMode="numeric"
                    placeholder="9XXXXXXXX"
                    className={INPUT_CLASS}
                  />
                </Campo>
                <Campo label="Tarifa por día (S/)">
                  <input
                    value={tarifaDia}
                    onChange={(e) => setTarifaDia(e.target.value)}
                    inputMode="numeric"
                    placeholder="80"
                    className={INPUT_CLASS}
                  />
                </Campo>
                <Campo label="Zona">
                  <input
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    placeholder="Ej. Huancayo"
                    className={INPUT_CLASS}
                  />
                </Campo>
                {error ? (
                  <p role="alert" className="text-[13px] text-[var(--danger)]">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={guardando}
                  className="mt-1 flex h-12 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[15px] font-semibold text-[var(--bg)] disabled:opacity-60"
                >
                  {guardando ? 'Guardando…' : 'Guardar en mi libreta'}
                </button>
              </form>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  );
}
