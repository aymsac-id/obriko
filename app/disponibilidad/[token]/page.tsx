// Server Component: SOLO arma el <title>/meta del enlace (lo que se ve al compartirlo por
// WhatsApp/SMS antes de que el trabajador ni siquiera toque el link) — a pedido del usuario,
// personalizado con quién pide la disponibilidad, igual que el saludo dentro de la pantalla.
// Toda la interacción real vive en DisponibilidadCliente.tsx (Client Component).

import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { DisponibilidadCliente } from './DisponibilidadCliente';

interface FilaMeta {
  nombre: string;
  oficio: string;
  empresa_nombre: string;
}

async function obtenerDatosPublicos(token: string): Promise<FilaMeta | null> {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { data, error } = await supabase.rpc('obtener_disponibilidad_publica', { p_token: token });
    const filas = data as FilaMeta[] | null;
    if (error || !filas || filas.length === 0) return null;
    return filas[0];
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const fila = await obtenerDatosPublicos(token);
  if (!fila) {
    return { title: 'Enlace de disponibilidad — Jornivo' };
  }
  const primerNombreCrudo = fila.nombre.split(' ')[0];
  const primerNombre = primerNombreCrudo.charAt(0).toUpperCase() + primerNombreCrudo.slice(1);
  const titulo = `${primerNombre}, ${fila.empresa_nombre} solicita tu disponibilidad`;
  const descripcion = `${fila.oficio} · Marca en segundos los días en que puedes trabajar este mes, sin instalar nada.`;
  return {
    title: titulo,
    description: descripcion,
    openGraph: { title: titulo, description: descripcion },
  };
}

export default function DisponibilidadPublicaPage() {
  return <DisponibilidadCliente />;
}
