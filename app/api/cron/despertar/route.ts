// Despertador diario — el plan gratis de Supabase pausa la base tras varios días sin uso, y con
// pocos usuarios eso ya tumbó la app dos veces (oct-2026). Vercel Cron llama a esta ruta una vez
// al día (vercel.json) y hace una consulta mínima para que la base cuente como "en uso".
//
// Usa la clave PÚBLICA (RLS activo: la consulta no devuelve datos de nadie) — no hace falta la
// secreta para tocar la base. Si existe CRON_SECRET en Vercel, solo Vercel Cron puede llamarla.

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (secreto && request.headers.get('authorization') !== `Bearer ${secreto}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { error } = await supabase.from('empresas').select('id', { count: 'exact', head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, revisado: new Date().toISOString() });
}
