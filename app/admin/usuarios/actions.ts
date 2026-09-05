'use server';

// Alta manual de usuarios — Server Action, corre en el servidor. Vuelve a verificar el correo
// admin AQUÍ (no basta con que /admin ya esté protegido: una Server Action es su propio
// endpoint POST y hay que asumir que alguien podría intentar invocarla directo — 09-SEGURIDAD).

import { revalidatePath } from 'next/cache';
import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import { crearClienteSupabaseAdmin } from '@/lib/supabase/admin';

function esCorreoAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export interface ResultadoAgregarUsuario {
  ok: boolean;
  mensaje: string;
}

export async function agregarUsuarioAction(formData: FormData): Promise<ResultadoAgregarUsuario> {
  const supabaseSesion = await crearClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();

  if (!esCorreoAdmin(user?.email)) {
    return { ok: false, mensaje: 'No autorizado.' };
  }

  const nombre = String(formData.get('nombre') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();

  if (nombre.length < 2) return { ok: false, mensaje: 'Escribe un nombre válido.' };
  if (!email.includes('@')) return { ok: false, mensaje: 'Escribe un correo válido.' };

  let admin;
  try {
    admin = crearClienteSupabaseAdmin();
  } catch (err) {
    return { ok: false, mensaje: err instanceof Error ? err.message : 'No se pudo conectar como administrador.' };
  }

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { nombre },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://obriko.vercel.app'}/login/restablecer`,
  });

  if (error) {
    return {
      ok: false,
      mensaje: error.message.includes('already registered')
        ? 'Ese correo ya tiene una cuenta en Obriko.'
        : `No pudimos invitarlo: ${error.message}`,
    };
  }

  revalidatePath('/admin/usuarios');
  return { ok: true, mensaje: `Invitación enviada a ${email}. Le llegará un correo para crear su contraseña.` };
}
