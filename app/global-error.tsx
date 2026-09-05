'use client';

// Red de seguridad de errores — Next.js reemplaza TODO el layout con este archivo cuando algo
// truena a nivel raíz, así que necesita su propio <html>/<body>. Registra el error real en
// error_log (panel de administración, sección Salud) antes de mostrar un mensaje humano.

import { useEffect } from 'react';
import { logErrorApp } from '@/lib/data/logging';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logErrorApp(error.message, 'global-error');
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[var(--bg)] px-4 text-center text-[var(--text-primary)]">
        <p className="text-lg font-semibold">Algo salió mal</p>
        <p className="text-sm text-[var(--text-secondary)]">Ya quedó registrado. Intenta de nuevo en un momento.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-2 rounded-[var(--radius-button)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--bg)]"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
