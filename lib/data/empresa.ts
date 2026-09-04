// La empresa del usuario autenticado — plan real (fuente de verdad para los límites de la
// libreta) y la preferencia de recordatorio semanal de disponibilidad.

import { crearClienteSupabase } from '@/lib/supabase/client';

export async function getPlanEmpresa(): Promise<'gratis' | 'starter'> {
  const supabase = crearClienteSupabase();
  const { data } = await supabase.from('empresas').select('plan').maybeSingle();
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
  const { data } = await supabase.from('empresas').select('recordatorio_dia_semana, recordatorio_hora').maybeSingle();
  if (!data || data.recordatorio_dia_semana === null || data.recordatorio_hora === null) return null;
  return { diaSemana: data.recordatorio_dia_semana, hora: data.recordatorio_hora };
}

export async function setRecordatorio(r: Recordatorio | null): Promise<void> {
  const supabase = crearClienteSupabase();
  const { data: empresa } = await supabase.from('empresas').select('id').maybeSingle();
  if (!empresa) throw new Error('No encontramos tu empresa. Cierra sesión y vuelve a entrar.');
  const { error } = await supabase
    .from('empresas')
    .update({
      recordatorio_dia_semana: r?.diaSemana ?? null,
      recordatorio_hora: r?.hora ?? null,
    })
    .eq('id', empresa.id);
  if (error) throw error;
}
