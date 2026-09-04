// Estado del onboarding en localStorage — sin backend todavía (Sesión 4).
// TODO Sesión 6: reemplazar por la tabla `trabajadores` real en Supabase (RLS por empresa_id,
// ver ESTADO.md → Decisiones técnicas). Esta capa solo simula la persistencia para poder
// navegar y probar el flujo completo hoy.

import { CUADRILLA_SEMILLA, type TrabajadorSemilla } from '@/components/onboarding/data';
import type { NuevoTrabajadorInput } from '@/lib/data/trabajadores';

const KEY = 'obriko_onboarding_v1';

export interface EstadoOnboarding {
  importado: boolean;
  confiables: string[];
  planElegido: 'gratis' | 'starter' | null;
  /** Trabajadores REALES que el dueño importó en Paso2Importar antes de tener cuenta —
   * se suben a Supabase recién al crear la cuenta (ver migrarImportacionDeOnboarding). */
  trabajadoresImportados: NuevoTrabajadorInput[];
}

const DEFAULT_ESTADO: EstadoOnboarding = {
  importado: false,
  confiables: [],
  planElegido: null,
  trabajadoresImportados: [],
};

export function leerEstadoOnboarding(): EstadoOnboarding {
  if (typeof window === 'undefined') return DEFAULT_ESTADO;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_ESTADO;
    return { ...DEFAULT_ESTADO, ...JSON.parse(raw) } as EstadoOnboarding;
  } catch {
    return DEFAULT_ESTADO;
  }
}

export function guardarEstadoOnboarding(parcial: Partial<EstadoOnboarding>): EstadoOnboarding {
  const actual = leerEstadoOnboarding();
  const nuevo = { ...actual, ...parcial };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(nuevo));
    } catch {
      // localStorage no disponible (modo privado, cuota) — el flujo sigue en memoria.
    }
  }
  return nuevo;
}

export function trabajadoresConfiablesPrimero(confiables: string[]): TrabajadorSemilla[] {
  const set = new Set(confiables);
  return [...CUADRILLA_SEMILLA].sort((a, b) => {
    const aConf = set.has(a.id) ? 1 : 0;
    const bConf = set.has(b.id) ? 1 : 0;
    if (aConf !== bConf) return bConf - aConf;
    return b.obrasJuntos - a.obrasJuntos;
  });
}
