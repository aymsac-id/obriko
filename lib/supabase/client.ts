// Cliente de Supabase para componentes de cliente ('use client') — usa la publishable key,
// segura de exponer al navegador porque cada tabla está protegida por RLS (ver
// supabase/migrations/0001_init.sql). Estructura canónica: 51-STACK-PINEADO.md §3.

import { createBrowserClient } from '@supabase/ssr';

export function crearClienteSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
