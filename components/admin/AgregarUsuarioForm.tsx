'use client';

// Alta manual de usuarios — para cuando el acceso no le llega a alguien o el dueño quiere
// agregar a una persona directo. Envía una invitación real por correo (Supabase Auth) para que
// esa persona elija su propia contraseña — nunca se crea ni se ve una contraseña desde aquí.

import { useState, type FormEvent } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { agregarUsuarioAction } from '@/app/admin/usuarios/actions';

export default function AgregarUsuarioForm() {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setResultado(null);
    const formData = new FormData();
    formData.set('nombre', nombre);
    formData.set('email', email);
    const res = await agregarUsuarioAction(formData);
    setEnviando(false);
    setResultado(res);
    if (res.ok) {
      setNombre('');
      setEmail('');
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex h-11 w-fit items-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] px-4 text-[13px] font-semibold text-[var(--bg)] [touch-action:manipulation]"
      >
        <UserPlus size={16} aria-hidden="true" /> Agregar usuario manualmente
      </button>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--surface)] p-4">
      <p className="mb-3 text-[14px] font-semibold">Agregar usuario manualmente</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">Nombre</span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            className="h-10 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-3 text-[13px] text-[var(--text-primary)] outline-none"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">Correo</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="h-10 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-3 text-[13px] text-[var(--text-primary)] outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={enviando}
          className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] px-4 text-[13px] font-semibold text-[var(--bg)] disabled:opacity-50 [touch-action:manipulation]"
        >
          {enviando ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : 'Invitar'}
        </button>
      </form>
      {resultado ? (
        <p role="alert" className={`mt-2.5 text-[13px] ${resultado.ok ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
          {resultado.mensaje}
        </p>
      ) : null}
    </div>
  );
}
