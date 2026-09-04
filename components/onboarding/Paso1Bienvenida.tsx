'use client';

// PASO 1 — Bienvenida. Fija la expectativa (02B regla 1: valor en <30s, antes del registro)
// y nombra el mecanismo bautizado de la landing ("el Comando de Cuadrilla") para que el
// onboarding se sienta continuidad de la promesa, no un formulario nuevo.

import { motion } from 'motion/react';
import { Search, UserCheck, Users, type LucideIcon } from 'lucide-react';
import { FunnelHeader, PasoShell, PrimaryCta, StepFooter, useStepReveal } from './ui';
import { Hairline, IconChip } from '@/components/landing/ui';
import { MarkedCopy } from '@/components/landing/MarkedCopy';

export function Paso1Bienvenida({ onContinuar }: { onContinuar: () => void }) {
  const { contenedor, item } = useStepReveal();

  return (
    <PasoShell>
      <FunnelHeader progreso={8} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-6">
        <motion.div variants={contenedor} initial="hidden" animate="visible" className="flex flex-col">
          <motion.p
            variants={item}
            className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]"
          >
            Te toma 2 minutos
          </motion.p>
          <motion.h1
            variants={item}
            className="text-balance text-[32px] font-bold leading-[1.1] tracking-tight [font-family:var(--font-display)]"
          >
            <MarkedCopy text="Arma tu cuadrilla y sabe quién está [acento]libre mañana[/acento]" />
          </motion.h1>
          <motion.p variants={item} className="mt-3 text-[16px] leading-relaxed text-[var(--text-secondary)]">
            Importa tu gente, marca en quién confías y prueba la búsqueda — sin llamar a nadie.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3">
            <PasoResumen
              icon={Users}
              titulo="Importa tu cuadrilla"
              detalle="Tus contactos de obra, organizados por oficio en segundos."
              destacado
            />
            <PasoResumen
              icon={UserCheck}
              titulo="Marca a tus confiables"
              detalle="Los que ya te demostraron que trabajan bien."
            />
            <PasoResumen
              icon={Search}
              titulo="Prueba la búsqueda"
              detalle="Ve quién está disponible para mañana, ordenado por confianza."
            />
          </motion.div>
        </motion.div>
      </div>
      <StepFooter>
        <PrimaryCta onClick={onContinuar}>Armar mi cuadrilla</PrimaryCta>
      </StepFooter>
    </PasoShell>
  );
}

function PasoResumen({
  icon,
  titulo,
  detalle,
  destacado = false,
}: {
  icon: LucideIcon;
  titulo: string;
  detalle: string;
  /** Envuelve la card en el <Hairline> degradé del kit (1-3 por vista, nunca todas). */
  destacado?: boolean;
}) {
  const interior = (
    <div className="flex items-start gap-3 p-4">
      <IconChip icon={icon} />
      <div className="min-w-0">
        <p className="text-[16px] font-semibold text-[var(--text-primary)]">{titulo}</p>
        <p className="mt-0.5 text-sm leading-snug text-[var(--text-secondary)]">{detalle}</p>
      </div>
    </div>
  );
  if (destacado) {
    return <Hairline>{interior}</Hairline>;
  }
  return (
    <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)]">
      {interior}
    </div>
  );
}
