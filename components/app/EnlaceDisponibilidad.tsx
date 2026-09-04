'use client';

// Enlace sin login para que el trabajador marque su propia disponibilidad — la promesa real
// de FICHA-AVATAR.md (objeción #2: "¿quién actualiza esto?"). Abre /disponibilidad/[token],
// que usa las funciones públicas de supabase/migrations/0001_init.sql (nunca expone las
// tablas reales a `anon`, solo lo que esas 2 funciones deciden devolver).

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';

export default function EnlaceDisponibilidad({ token }: { token: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const url = `${window.location.origin}/disponibilidad/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt('Copia este enlace y envíaselo por WhatsApp:', url);
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[var(--chip-bg)] text-[13px] font-semibold text-[var(--accent)] [touch-action:manipulation]"
    >
      {copiado ? (
        <>
          <Check size={15} aria-hidden="true" /> Enlace copiado — envíaselo por WhatsApp
        </>
      ) : (
        <>
          <Link2 size={15} aria-hidden="true" /> Copiar enlace para que él marque su disponibilidad
        </>
      )}
    </button>
  );
}
