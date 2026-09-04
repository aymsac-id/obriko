'use client';

// Onboarding de Obriko — Sesión 4. 4 pasos internos (bienvenida → importar →
// marcar confiables → resultado) antes de pasar a /paywall (SECUENCIA-MAESTRA-CONSTRUCCION.md).
// Estado en localStorage (lib/onboarding-storage.ts) — sin backend todavía.
// Copy trazado a FICHA-AVATAR.md en docs/copy/onboarding-paywall.md.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { leerEstadoOnboarding, guardarEstadoOnboarding } from '@/lib/onboarding-storage';
import { Paso1Bienvenida } from '@/components/onboarding/Paso1Bienvenida';
import { Paso2Importar } from '@/components/onboarding/Paso2Importar';
import { Paso3Marcar } from '@/components/onboarding/Paso3Marcar';
import { Paso4Resultado } from '@/components/onboarding/Paso4Resultado';

const TOTAL_PASOS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [confiables, setConfiables] = useState<string[]>([]);
  const [direccion, setDireccion] = useState(1);

  useEffect(() => {
    const estado = leerEstadoOnboarding();
    if (estado.confiables.length > 0) setConfiables(estado.confiables);
  }, []);

  function ir(nuevoPaso: number, dir: 1 | -1) {
    setDireccion(dir);
    setPaso(nuevoPaso);
  }

  function actualizarConfiables(ids: string[]) {
    setConfiables(ids);
    guardarEstadoOnboarding({ confiables: ids });
  }

  function finalizarOnboarding() {
    guardarEstadoOnboarding({ importado: true, confiables });
    router.push('/paywall');
  }

  const variantes = {
    entra: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    centro: { x: 0, opacity: 1 },
    sale: (dir: number) => ({ x: dir > 0 ? -24 : 24, opacity: 0 }),
  };

  return (
    <main aria-live="polite">
      <AnimatePresence mode="wait" custom={direccion}>
        <motion.div
          key={paso}
          custom={direccion}
          variants={variantes}
          initial="entra"
          animate="centro"
          exit="sale"
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {paso === 1 && <Paso1Bienvenida onContinuar={() => ir(2, 1)} />}
          {paso === 2 && (
            <Paso2Importar onContinuar={() => ir(3, 1)} onAtras={() => ir(1, -1)} />
          )}
          {paso === 3 && (
            <Paso3Marcar
              confiables={confiables}
              onCambiar={actualizarConfiables}
              onContinuar={() => ir(4, 1)}
              onAtras={() => ir(2, -1)}
            />
          )}
          {paso === 4 && (
            <Paso4Resultado
              confiables={confiables}
              onContinuar={finalizarOnboarding}
              onAtras={() => ir(3, -1)}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">
        Paso {paso} de {TOTAL_PASOS}
      </span>
    </main>
  );
}
