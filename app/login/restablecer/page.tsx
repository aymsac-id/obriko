'use client';

// Paso 2 de recuperar contraseña — se abre desde el enlace del correo. Supabase detecta el
// token de recuperación en la URL y crea una sesión temporal automáticamente (detectSessionInUrl,
// activo por defecto en createBrowserClient); aquí solo pedimos la contraseña nueva y la
// guardamos con supabase.auth.updateUser.

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { FunnelHeader, PrimaryCta, useStepReveal } from '@/components/onboarding/ui';
import { crearClienteSupabase } from '@/lib/supabase/client';

export default function RestablecerPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState<'cargando' | 'valido' | 'invalido'>('cargando');
  const { contenedor, item } = useStepReveal(0.08);

  useEffect(() => {
    const supabase = crearClienteSupabase();
    supabase.auth.getSession().then(({ data }) => setListo(data.session ? 'valido' : 'invalido'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setError(null);
    setEnviando(true);
    const supabase = crearClienteSupabase();
    const { error: errorAuth } = await supabase.auth.updateUser({ password });
    setEnviando(false);
    if (errorAuth) {
      setError('No pudimos guardar la contraseña. Pide un enlace nuevo e intenta de nuevo.');
      return;
    }
    router.push('/app');
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
      <FunnelHeader />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-8 pt-8">
        {listo === 'cargando' ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 size={24} className="animate-spin" color="var(--text-tertiary)" aria-hidden="true" />
          </div>
        ) : listo === 'invalido' ? (
          <div className="text-center">
            <h1 className="text-[22px] font-bold [font-family:var(--font-display)]">Este enlace ya no es válido</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Pide un enlace nuevo desde "¿Olvidaste tu contraseña?" en la pantalla de entrar.
            </p>
          </div>
        ) : (
          <motion.div variants={contenedor} initial="hidden" animate="visible">
            <motion.h1
              variants={item}
              className="text-balance text-[28px] font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]"
            >
              Elige tu nueva contraseña
            </motion.h1>

            <motion.form variants={item} onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3" noValidate>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[var(--text-secondary)]">Contraseña nueva</span>
                <div className="flex h-14 items-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] px-4">
                  <Lock size={18} color="var(--text-tertiary)" aria-hidden="true" />
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    autoFocus
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="h-full w-full bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((v) => !v)}
                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="shrink-0 text-[var(--text-tertiary)]"
                  >
                    {mostrarPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </label>

              {error ? (
                <p role="alert" className="text-sm text-[var(--danger)]">
                  {error}
                </p>
              ) : null}

              <div className="mt-1">
                <PrimaryCta type="submit" disabled={enviando}>
                  {enviando ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                      Guardando…
                    </span>
                  ) : (
                    'Guardar y entrar'
                  )}
                </PrimaryCta>
              </div>
            </motion.form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
