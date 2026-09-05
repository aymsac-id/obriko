// Registro real de uso y errores para el panel de administración — nunca falla la acción
// principal si el registro falla (catch silencioso: medir no debe romper la app).

import { crearClienteSupabase } from '@/lib/supabase/client';

export type TipoEvento =
  | 'cuenta_creada'
  | 'primer_trabajador_agregado'
  | 'evaluacion_registrada'
  | 'disponibilidad_marcada_publica'
  | 'disponibilidad_marcada_manual'
  | 'sesion_abierta';

export async function logEvento(tipo: TipoEvento, empresaId: string | null, metadata: Record<string, unknown> = {}) {
  try {
    const supabase = crearClienteSupabase();
    await supabase.rpc('log_evento', { p_tipo: tipo, p_empresa_id: empresaId, p_metadata: metadata });
  } catch {
    // Medir uso no debe romper la acción real del usuario.
  }
}

export async function logErrorApp(mensaje: string, contexto: string, empresaId: string | null = null) {
  try {
    const supabase = crearClienteSupabase();
    await supabase.rpc('log_error_app', { p_mensaje: mensaje, p_contexto: contexto, p_empresa_id: empresaId });
  } catch {
    // Si ni el registro de errores funciona, no hay nada más que hacer del lado del cliente.
  }
}
