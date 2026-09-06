// La empresa del usuario autenticado — plan real (fuente de verdad para los límites de la
// libreta) y la preferencia de recordatorio semanal de disponibilidad.
//
// IMPORTANTE (bug real corregido 2026-09-05): desde que existe el panel de administración, la
// tabla `empresas` tiene UNA política RLS adicional de solo-lectura para admins
// (`admin_lee_empresas`, using es_admin()) que se combina con la política original
// (`empresas_select_own`) por OR. Para una cuenta admin, cualquier `select` SIN filtro explícito
// por `owner_id` devuelve TODAS las empresas, no solo la suya — y `.maybeSingle()` truena
// ("multiple rows returned") en vez de devolver 1 fila. La única forma correcta de pedir "MI
// empresa" es filtrar explícitamente por el dueño autenticado, nunca confiar en que RLS ya lo
// acotó — RLS acota "lo que puedo ver", no "lo que estoy pidiendo".

import { crearClienteSupabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

/** El id de la empresa del usuario autenticado — SIEMPRE filtrando por su propio owner_id. */
export async function getEmpresaId(supabase: SupabaseClient): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('No encontramos tu sesión. Cierra sesión y vuelve a entrar.');
  const { data, error } = await supabase.from('empresas').select('id').eq('owner_id', userId).maybeSingle();
  if (error || !data) throw new Error('No encontramos tu empresa. Cierra sesión y vuelve a entrar.');
  return data.id as string;
}

export async function getPlanEmpresa(): Promise<'gratis' | 'starter'> {
  const supabase = crearClienteSupabase();
  const empresaId = await getEmpresaId(supabase);
  const { data } = await supabase.from('empresas').select('plan').eq('id', empresaId).maybeSingle();
  return data?.plan === 'starter' ? 'starter' : 'gratis';
}

export interface Recordatorio {
  /** 0 = domingo … 6 = sábado (igual que Date.getDay()). */
  diaSemana: number;
  /** 0-23. */
  hora: number;
}

export async function getRecordatorio(): Promise<Recordatorio | null> {
  const supabase = crearClienteSupabase();
  const empresaId = await getEmpresaId(supabase);
  const { data } = await supabase
    .from('empresas')
    .select('recordatorio_dia_semana, recordatorio_hora')
    .eq('id', empresaId)
    .maybeSingle();
  if (!data || data.recordatorio_dia_semana === null || data.recordatorio_hora === null) return null;
  return { diaSemana: data.recordatorio_dia_semana, hora: data.recordatorio_hora };
}

export async function setRecordatorio(r: Recordatorio | null): Promise<void> {
  const supabase = crearClienteSupabase();
  const empresaId = await getEmpresaId(supabase);
  const { error } = await supabase
    .from('empresas')
    .update({
      recordatorio_dia_semana: r?.diaSemana ?? null,
      recordatorio_hora: r?.hora ?? null,
    })
    .eq('id', empresaId);
  if (error) throw error;
}
