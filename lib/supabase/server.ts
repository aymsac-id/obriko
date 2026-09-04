// Cliente de Supabase para Server Components / Route Handlers — lee/escribe la sesión en
// cookies httpOnly (nunca en localStorage). Estructura canónica: 51-STACK-PINEADO.md §3.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function crearClienteSupabaseServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Se llama desde un Server Component sin permiso de escritura — el middleware
            // ya refresca la sesión en cada request, así que esto es seguro de ignorar.
          }
        },
      },
    }
  );
}
