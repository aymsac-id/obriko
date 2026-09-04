'use client';

// Ajustes — cerrar sesión, ver el plan actual, legales. Pantalla secundaria (sin revisor
// formal: checklist + medición propia).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, FileText, LogOut, ShieldCheck, Trash2 } from 'lucide-react';
import { getTrabajadores } from '@/lib/data/trabajadores';
import { getPlanEmpresa, getRecordatorio, setRecordatorio, type Recordatorio } from '@/lib/data/empresa';
import { crearClienteSupabase } from '@/lib/supabase/client';

const DIAS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const HORAS = Array.from({ length: 24 }, (_, h) => h);

function etiquetaHora(h: number): string {
  if (h === 0) return '12 a.m.';
  if (h === 12) return '12 p.m.';
  return h < 12 ? `${h} a.m.` : `${h - 12} p.m.`;
}

// Estado del onboarding sigue en localStorage (es pre-cuenta) — se limpia también al eliminar
// la cuenta para que un dispositivo compartido no arrastre datos de la sesión anterior.
const CLAVES_LOCALSTORAGE = ['obriko_onboarding_v1'];

export default function AjustesPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [plan, setPlan] = useState<'gratis' | 'starter' | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [recordatorio, setRecordatorioLocal] = useState<Recordatorio | null | undefined>(undefined);
  const [guardandoRecordatorio, setGuardandoRecordatorio] = useState(false);

  useEffect(() => {
    const supabase = crearClienteSupabase();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    getPlanEmpresa()
      .then(setPlan)
      .catch(() => setPlan('gratis'));
    getRecordatorio()
      .then(setRecordatorioLocal)
      .catch(() => setRecordatorioLocal(null));
    getTrabajadores()
      .then((lista) => setTotal(lista.length))
      .catch(() => setTotal(0));
  }, []);

  async function guardarRecordatorio(r: Recordatorio | null) {
    setGuardandoRecordatorio(true);
    try {
      await setRecordatorio(r);
      setRecordatorioLocal(r);
    } catch {
      window.alert('No pudimos guardar el recordatorio. Intenta de nuevo.');
    } finally {
      setGuardandoRecordatorio(false);
    }
  }

  async function cerrarSesion() {
    const supabase = crearClienteSupabase();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  async function eliminarCuenta() {
    const ok = window.confirm(
      'Esto borra tu libreta de trabajadores y tus proyectos para siempre. No se puede deshacer. ¿Continuar?'
    );
    if (!ok) return;
    setEliminando(true);
    const supabase = crearClienteSupabase();
    try {
      const { data: empresa } = await supabase.from('empresas').select('id').maybeSingle();
      if (empresa) {
        await supabase.from('empresas').delete().eq('id', empresa.id);
      }
      for (const clave of CLAVES_LOCALSTORAGE) window.localStorage.removeItem(clave);
      await supabase.auth.signOut();
      router.push('/');
    } catch {
      setEliminando(false);
      window.alert('No pudimos borrar tu cuenta. Intenta de nuevo en un momento.');
    }
  }

  return (
    <div className="flex min-h-dvh flex-col px-4 pb-6 pt-5">
      <h1 className="text-[26px] font-bold leading-tight [font-family:var(--font-display)]">Ajustes</h1>

      <div className="mt-5 rounded-[var(--radius-card)] bg-[var(--surface)] px-4 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Tu cuenta</p>
        <p className="mt-1 text-[15px] font-medium">{email ?? 'Sesión activa'}</p>
      </div>

      <div className="mt-3 rounded-[var(--radius-card)] bg-[var(--surface)] px-4 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Tu plan</p>
        <p className="mt-1 text-[15px] font-medium">
          {plan === 'starter' ? 'Starter' : 'Gratis'} · {total ?? '…'} trabajadores en tu libreta
        </p>
        {plan !== 'starter' ? (
          <Link href="/paywall" className="mt-3 inline-flex text-[13px] font-semibold text-[var(--accent)]">
            Conocer Starter →
          </Link>
        ) : null}
      </div>

      <div className="mt-3 rounded-[var(--radius-card)] bg-[var(--surface)] px-4 py-4">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          <Bell size={13} aria-hidden="true" /> Recordatorio semanal
        </p>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
          Te avisamos en la app cuándo toca pedir disponibilidad a tu equipo.
        </p>

        {recordatorio === undefined ? null : (
          <>
            <div className="mt-3 flex gap-1.5">
              {DIAS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => guardarRecordatorio({ diaSemana: i, hora: recordatorio?.hora ?? 18 })}
                  disabled={guardandoRecordatorio}
                  aria-pressed={recordatorio?.diaSemana === i}
                  className={`flex size-9 items-center justify-center rounded-full text-[12px] font-semibold [touch-action:manipulation] disabled:opacity-50 ${
                    recordatorio?.diaSemana === i
                      ? 'bg-[var(--accent)] text-[var(--bg)]'
                      : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {recordatorio ? (
              <div className="mt-3 flex items-center gap-2">
                <select
                  value={recordatorio.hora}
                  onChange={(e) => guardarRecordatorio({ diaSemana: recordatorio.diaSemana, hora: Number(e.target.value) })}
                  disabled={guardandoRecordatorio}
                  className="h-10 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface-2)] px-3 text-[13px] font-medium text-[var(--text-primary)]"
                >
                  {HORAS.map((h) => (
                    <option key={h} value={h}>
                      {etiquetaHora(h)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => guardarRecordatorio(null)}
                  disabled={guardandoRecordatorio}
                  className="text-[13px] font-semibold text-[var(--text-tertiary)] disabled:opacity-50"
                >
                  Desactivar
                </button>
              </div>
            ) : (
              <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">Elige un día para activarlo.</p>
            )}
          </>
        )}
      </div>

      <div className="mt-3 flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--surface)]">
        <Link
          href="/privacidad"
          className="flex items-center gap-3 border-b border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] px-4 py-3.5 text-[14px]"
        >
          <ShieldCheck size={17} color="var(--text-tertiary)" aria-hidden="true" /> Privacidad
        </Link>
        <Link href="/terminos" className="flex items-center gap-3 px-4 py-3.5 text-[14px]">
          <FileText size={17} color="var(--text-tertiary)" aria-hidden="true" /> Términos
        </Link>
      </div>

      <button
        type="button"
        onClick={cerrarSesion}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--danger)_40%,transparent)] text-[15px] font-semibold text-[var(--danger)] [touch-action:manipulation]"
      >
        <LogOut size={17} aria-hidden="true" /> Cerrar sesión
      </button>

      <button
        type="button"
        onClick={eliminarCuenta}
        disabled={eliminando}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 text-[14px] font-medium text-[var(--text-tertiary)] [touch-action:manipulation] disabled:opacity-50"
      >
        <Trash2 size={16} aria-hidden="true" /> {eliminando ? 'Borrando…' : 'Eliminar mi cuenta y mis datos'}
      </button>
    </div>
  );
}
