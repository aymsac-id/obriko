// Cliente de Supabase con la clave SECRETA — SOLO se importa desde código de servidor (Server
// Actions / Route Handlers), nunca desde un componente de cliente. Único uso hoy: crear
// usuarios manualmente desde el panel de administración (auth.admin.*, imposible con RLS).

import { createClient } from '@supabase/supabase-js';

export function crearClienteSupabaseAdmin() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'Falta SUPABASE_SECRET_KEY en el servidor. Pégala en .env.local (o en las variables de entorno de Vercel) — nunca en el chat.'
    );
  }
  return createClient(process.env.SUPABASE_URL!, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
