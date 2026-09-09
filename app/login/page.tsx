'use client';

// Login/registro de Jornivo — Sesión 6: Supabase Auth real (email+password). El botón de
// Google se retira por ahora (requiere configurar OAuth en Google Cloud Console, fuera del
// alcance de esta sesión) — mejor no mostrarlo a medias que mostrar un botón que no hace lo
// que promete (regla UX #11). Vuelve cuando esté conectado de verdad.

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { FunnelHeader, PrimaryCta, StepFooter, useStepReveal } from '@/components/onboarding/ui';
import { crearClienteSupabase } from '@/lib/supabase/client';
import { logEvento } from '@/lib/data/logging';

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<'crear' | 'entrar'>('crear');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revisaCorreo, setRevisaCorreo] = useState(false);
  // Consentimiento explícito al registrar (47-LEGAL-FISCAL-Y-PRIVACIDAD.md §2): checkbox NO
  // premarcado, obligatorio solo al CREAR cuenta (no al entrar a una ya existente).
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const { contenedor, item } = useStepReveal(0.08);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes('@')) {
      setError('Escribe un correo válido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (modo === 'crear' && !aceptaTerminos) {
      setError('Acepta los Términos y la Política de Privacidad para continuar.');
      return;
    }
    setEnviando(true);
    const supabase = crearClienteSupabase();
    const { data, error: errorAuth } =
      modo === 'crear'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
    setEnviando(false);
    if (errorAuth) {
      setError(
        errorAuth.message.includes('already registered') || errorAuth.message.includes('already exists')
          ? 'Ese correo ya tiene una cuenta — intenta entrar en vez de crear una nueva.'
          : errorAuth.message.includes('Invalid login')
            ? 'Correo o contraseña incorrectos.'
            : errorAuth.message.includes('invalid') && errorAuth.message.toLowerCase().includes('email')
              ? 'Escribe un correo real — este no lo aceptamos.'
              : errorAuth.message.includes('rate limit')
                ? 'Demasiados intentos seguidos. Espera un momento e intenta de nuevo.'
                : 'Algo falló. Intenta de nuevo en un momento.'
      );
      return;
    }
    if (modo === 'crear' && !data.session) {
      // Supabase pide confirmar el correo antes de abrir sesión — no hay forma de entrar a
      // /app todavía (el middleware lo rebotaría). Al confirmar y volver a "Entrar" sí habrá
      // sesión, y ahí migrarImportacionDeOnboarding sube lo que importó en el onboarding.
      setRevisaCorreo(true);
      return;
    }
    if (modo === 'crear' && data.session) {
      const { data: empresa } = await supabase.from('empresas').select('id').maybeSingle();
      logEvento('cuenta_creada', empresa?.id ?? null);
    }
    router.push('/app');
    router.refresh();
  }

  if (revisaCorreo) {
    return (
      <div className="flex min-h-dvh flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
        <FunnelHeader />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-8 text-center">
          <Mail size={32} color="var(--accent)" aria-hidden="true" />
          <h1 className="mt-4 text-[22px] font-bold [font-family:var(--font-display)]">Revisa tu correo</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Te enviamos un enlace a <span className="font-semibold text-[var(--text-primary)]">{email}</span> para
            confirmar tu cuenta. Ábrelo y vuelve aquí para entrar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
      <FunnelHeader />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-8 pt-8">
        <motion.div variants={contenedor} initial="hidden" animate="visible">
          <motion.h1
            variants={item}
            className="text-balance text-[32px] font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]"
          >
            {modo === 'crear' ? 'Guarda tu cuadrilla' : 'Entra a tu cuadrilla'}
          </motion.h1>
          <motion.p variants={item} className="mt-2 text-sm text-[var(--text-secondary)]">
            {modo === 'crear'
              ? 'Crea tu cuenta gratis para verla desde cualquier celular, cuando quieras.'
              : 'Ingresa con el correo y la contraseña de tu cuenta.'}
          </motion.p>

          <motion.form variants={item} onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3" noValidate>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Correo</span>
              <div className="flex h-14 items-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] px-4">
                <Mail size={18} color="var(--text-tertiary)" aria-hidden="true" />
                <input
                  type="email"
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="h-full w-full bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Contraseña</span>
              <div className="flex h-14 items-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] px-4">
                <Lock size={18} color="var(--text-tertiary)" aria-hidden="true" />
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  autoComplete={modo === 'crear' ? 'new-password' : 'current-password'}
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

            {modo === 'entrar' ? (
              <Link
                href="/login/recuperar"
                className="self-end text-[13px] font-medium text-[var(--text-secondary)] underline-offset-4 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            ) : null}

            {modo === 'crear' ? (
              <label className="flex items-start gap-2.5 text-[13px] text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
                />
                <span>
                  Al crear tu cuenta aceptas los{' '}
                  <Link href="/terminos" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
                    Términos
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacidad" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
                    Política de Privacidad
                  </Link>
                  .
                </span>
              </label>
            ) : null}

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
                    Un momento…
                  </span>
                ) : modo === 'crear' ? (
                  'Crear mi cuenta gratis'
                ) : (
                  'Entrar'
                )}
              </PrimaryCta>
            </div>
          </motion.form>

          <motion.p variants={item} className="mt-5 text-center text-sm text-[var(--text-secondary)]">
            {modo === 'crear' ? (
              <>
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setModo('entrar')}
                  className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
                >
                  Inicia sesión
                </button>
              </>
            ) : (
              <>
                ¿Aún no tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setModo('crear')}
                  className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
                >
                  Crea una gratis
                </button>
              </>
            )}
          </motion.p>
        </motion.div>
      </div>
      <StepFooter>
        <p className="text-center text-[12px] text-[var(--text-tertiary)]">
          Tu libreta es privada — nunca la vendemos ni la publicamos.
        </p>
      </StepFooter>
    </div>
  );
}
