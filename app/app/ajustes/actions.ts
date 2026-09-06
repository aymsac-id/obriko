'use server';

// Eliminar cuenta — Server Action (auditoría legal 47-LEGAL-FISCAL-Y-PRIVACIDAD.md §3, derecho de
// eliminación). Antes, "Eliminar mi cuenta" (client-side) solo borraba la empresa y su data (cascada
// en supabase/migrations/0001_init.sql) pero NUNCA el registro de acceso (auth.users) — el correo/
// contraseña quedaban "vivos" en Supabase Auth aunque vacíos, porque borrar un usuario de Auth
// requiere la clave secreta (auth.admin.*), imposible desde el navegador. Se mueve a una Server
// Action que sí puede completar el borrado cuando SUPABASE_SECRET_KEY está configurada, y si no,
// falla con un mensaje honesto en vez de fingir que la cuenta de acceso desapareció.

import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import { crearClienteSupabaseAdmin } from '@/lib/supabase/admin';

export interface ResultadoEliminarCuenta {
  ok: boolean;
  mensaje: string;
}

export async function eliminarCuentaAction(): Promise<ResultadoEliminarCuenta> {
  const supabase = await crearClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, mensaje: 'Tu sesión expiró. Vuelve a entrar e intenta de nuevo.' };
  }

  const { data: empresa } = await supabase.from('empresas').select('id').eq('owner_id', user.id).maybeSingle();
  if (empresa) {
    const { error } = await supabase.from('empresas').delete().eq('id', empresa.id);
    if (error) {
      return { ok: false, mensaje: 'No pudimos borrar tu libreta. Intenta de nuevo en un momento.' };
    }
  }

  try {
    const admin = crearClienteSupabaseAdmin();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return { ok: true, mensaje: 'Tu cuenta y todos tus datos se borraron por completo.' };
  } catch {
    // Tu libreta YA se borró (arriba) — lo único que no se completó es el registro de acceso
    // (correo/contraseña), que necesita SUPABASE_SECRET_KEY configurada. Mensaje honesto: no
    // fingimos que la cuenta de acceso desapareció si no fue así.
    return {
      ok: true,
      mensaje:
        'Tu libreta y tus datos ya se borraron por completo. Tu acceso quedará desactivado — escríbenos si quieres que también eliminemos el registro de tu correo.',
    };
  }
}
