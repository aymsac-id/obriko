'use client';

// Recuperar contraseña — paso 1: pedir el correo. Supabase manda un enlace mágico que abre
// /login/restablecer con una sesión temporal para poner una contraseña nueva. Gap real
// encontrado en producción: el usuario se quedó sin poder entrar y no había forma de resolverlo.

import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Loader2, Mail } from 'lucide-react';
import { FunnelHeader, PrimaryCta, useStepReveal } from '@/components/onboarding/ui';
import { crearClienteSupabase } from '@/lib/supabase/client';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { contenedor, item } = useStepReveal(0.08);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Escribe un correo válido.');
      return;
    }
    setError(null);
    setEnviando(true);
    const supabase = crearClienteSupabase();
    const { error: errorAuth } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/restablecer`,
    });
    setEnviando(false);
    if (errorAuth) {
      setError('No pudimos enviar el enlace. Intenta de nuevo en un momento.');
      return;
    }
    setEnviado(true);
  }

  return (
    <div className="flex min-h-dvh flex-col text-[var(--text-primary)] [font-family:var(--font-body)]">
      <FunnelHeader onBack={() => window.history.back()} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-8 pt-8">
        {enviado ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Mail size={32} color="var(--accent)" className="mx-auto" aria-hidden="true" />
            <h1 className="mt-4 text-[22px] font-bold [font-family:var(--font-display)]">Revisa tu correo</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Te enviamos un enlace a <span className="font-semibold text-[var(--text-primary)]">{email}</span> para
              elegir una contraseña nueva.
            </p>
          </motion.div>
        ) : (
          <motion.div variants={contenedor} initial="hidden" animate="visible">
            <motion.h1
              variants={item}
              className="text-balance text-[28px] font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]"
            >
              Recupera tu cuenta
            </motion.h1>
            <motion.p variants={item} className="mt-2 text-sm text-[var(--text-secondary)]">
              Escribe el correo con el que te registraste — te mandamos un enlace para elegir una contraseña nueva.
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
                      Enviando…
                    </span>
                  ) : (
                    'Enviar enlace'
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
