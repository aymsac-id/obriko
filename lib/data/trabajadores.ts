// Capa de datos de la libreta de trabajadores — Sesión 6: Supabase real (antes localStorage).
// RLS en la tabla `trabajadores` ya filtra por la empresa del usuario autenticado
// (empresa_id_actual() en supabase/migrations/0001_init.sql) — estas funciones no necesitan
// repetir ese filtro, solo autenticarse con el cliente del navegador.

import { crearClienteSupabase } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { leerEstadoOnboarding, guardarEstadoOnboarding } from '@/lib/onboarding-storage';
import { logEvento } from '@/lib/data/logging';
import { getEmpresaId } from '@/lib/data/empresa';

export type Oficio = string;
export type EstadoDisponibilidad = 'disponible' | 'ocupado' | 'consultar';

export interface Evaluacion {
  id: string;
  fecha: string; // ISO datetime
  obra: string;
  calidad: number; // 1-5
  puntualidad: number; // 1-5
  /** Nuevos desde 2026-09-10 (pedido del usuario) — nulos en evaluaciones creadas antes. */
  rendimiento: number | null; // 1-5
  trabajoEquipo: number | null; // 1-5
  cumplimiento: number | null; // 1-5
  seguridad: number | null; // 1-5
  recomendaria: boolean;
  comentario: string;
}

export interface Trabajador {
  id: string;
  nombre: string;
  oficio: Oficio;
  telefono: string;
  tarifaDia: number; // soles/día
  ubicacion: string;
  obrasJuntos: number;
  confiabilidad: number; // 0-99
  disponibilidad: Record<string, EstadoDisponibilidad>; // fecha ISO -> estado
  evaluaciones: Evaluacion[];
  origen: 'importado' | 'manual';
  enlaceToken: string; // link sin login para que el trabajador marque su disponibilidad
  creadoEn: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

interface FilaTrabajador {
  id: string;
  nombre: string;
  oficio: string;
  telefono: string;
  tarifa_dia: number;
  ubicacion: string;
  obras_juntos: number;
  confiabilidad: number;
  origen: 'importado' | 'manual';
  enlace_token: string;
  creado_en: string;
  evaluaciones: {
    id: string;
    obra: string;
    calidad: number;
    puntualidad: number;
    rendimiento: number | null;
    trabajo_equipo: number | null;
    cumplimiento: number | null;
    seguridad: number | null;
    recomendaria: boolean;
    comentario: string;
    creado_en: string;
  }[];
  disponibilidad: { fecha: string; estado: EstadoDisponibilidad }[];
}

function filaATrabajador(fila: FilaTrabajador): Trabajador {
  const disponibilidad: Record<string, EstadoDisponibilidad> = {};
  for (const d of fila.disponibilidad) disponibilidad[d.fecha] = d.estado;
  return {
    id: fila.id,
    nombre: fila.nombre,
    oficio: fila.oficio,
    telefono: fila.telefono,
    tarifaDia: fila.tarifa_dia,
    ubicacion: fila.ubicacion,
    obrasJuntos: fila.obras_juntos,
    confiabilidad: fila.confiabilidad,
    disponibilidad,
    origen: fila.origen,
    enlaceToken: fila.enlace_token,
    creadoEn: new Date(fila.creado_en).getTime(),
    evaluaciones: fila.evaluaciones
      .map((ev) => ({
        id: ev.id,
        fecha: ev.creado_en,
        obra: ev.obra,
        calidad: ev.calidad,
        puntualidad: ev.puntualidad,
        rendimiento: ev.rendimiento,
        trabajoEquipo: ev.trabajo_equipo,
        cumplimiento: ev.cumplimiento,
        seguridad: ev.seguridad,
        recomendaria: ev.recomendaria,
        comentario: ev.comentario,
      }))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
  };
}

const SELECT_TRABAJADOR = '*, evaluaciones(*), disponibilidad(fecha, estado)';

export async function getTrabajadores(): Promise<Trabajador[]> {
  const supabase = crearClienteSupabase();
  const empresaId = await getEmpresaId(supabase);
  const { data, error } = await supabase
    .from('trabajadores')
    .select(SELECT_TRABAJADOR)
    .eq('empresa_id', empresaId)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as FilaTrabajador[]).map(filaATrabajador);
}

export async function getTrabajadorPorId(id: string): Promise<Trabajador | undefined> {
  const supabase = crearClienteSupabase();
  const empresaId = await getEmpresaId(supabase);
  const { data, error } = await supabase
    .from('trabajadores')
    .select(SELECT_TRABAJADOR)
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .maybeSingle();
  if (error) throw error;
  return data ? filaATrabajador(data as unknown as FilaTrabajador) : undefined;
}

export interface NuevoTrabajadorInput {
  nombre: string;
  oficio: Oficio;
  telefono: string;
  tarifaDia: number;
  ubicacion: string;
  origen?: 'importado' | 'manual';
}

async function eraLibretaVacia(supabase: SupabaseClient, empresaId: string): Promise<boolean> {
  const { count } = await supabase.from('trabajadores').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId);
  return (count ?? 0) === 0;
}

export async function addTrabajador(input: NuevoTrabajadorInput): Promise<Trabajador> {
  const supabase = crearClienteSupabase();
  const empresaId = await getEmpresaId(supabase);
  const eraPrimero = await eraLibretaVacia(supabase, empresaId);
  const { data, error } = await supabase
    .from('trabajadores')
    .insert({
      empresa_id: empresaId,
      nombre: input.nombre,
      oficio: input.oficio,
      telefono: input.telefono,
      tarifa_dia: input.tarifaDia,
      ubicacion: input.ubicacion,
      origen: input.origen ?? 'manual',
    })
    .select(SELECT_TRABAJADOR)
    .single();
  if (error) throw error;
  if (eraPrimero) logEvento('primer_trabajador_agregado', empresaId);
  return filaATrabajador(data as unknown as FilaTrabajador);
}

/** Agrega varios trabajadores en un solo viaje a la base de datos (importación real). */
export async function addTrabajadoresEnLote(inputs: NuevoTrabajadorInput[]): Promise<Trabajador[]> {
  if (inputs.length === 0) return [];
  const supabase = crearClienteSupabase();
  const empresaId = await getEmpresaId(supabase);
  const eraPrimero = await eraLibretaVacia(supabase, empresaId);
  const filas = inputs.map((input) => ({
    empresa_id: empresaId,
    nombre: input.nombre,
    oficio: input.oficio,
    telefono: input.telefono,
    tarifa_dia: input.tarifaDia,
    ubicacion: input.ubicacion,
    origen: 'importado' as const,
  }));
  const { data, error } = await supabase.from('trabajadores').insert(filas).select(SELECT_TRABAJADOR);
  if (error) throw error;
  if (eraPrimero) logEvento('primer_trabajador_agregado', empresaId);
  return ((data ?? []) as unknown as FilaTrabajador[]).map(filaATrabajador);
}

export function getLimiteDelPlan(plan: 'gratis' | 'starter' | null): number {
  return plan === 'starter' ? 50 : 10;
}

/** Saca a un trabajador de la libreta para siempre (su historial y disponibilidad se borran en
 * cascada — ver `on delete cascade` en supabase/migrations/0001_init.sql). */
export async function eliminarTrabajador(id: string): Promise<void> {
  const supabase = crearClienteSupabase();
  const { error } = await supabase.from('trabajadores').delete().eq('id', id);
  if (error) throw error;
}

/**
 * El trabajador marca su propia disponibilidad sin login (enlace con su `enlaceToken`) — el
 * dueño también puede tocarla a mano desde la ficha, mismo destino final. Ver
 * app/disponibilidad/[token]/page.tsx y la función `actualizar_disponibilidad_publica` de la
 * migración SQL para el lado sin sesión.
 */
export async function setDisponibilidad(id: string, fechaIso: string, estado: EstadoDisponibilidad): Promise<void> {
  const supabase = crearClienteSupabase();
  const { error } = await supabase
    .from('disponibilidad')
    .upsert({ trabajador_id: id, fecha: fechaIso, estado }, { onConflict: 'trabajador_id,fecha' });
  if (error) throw error;
  const { data: fila } = await supabase.from('trabajadores').select('empresa_id').eq('id', id).maybeSingle();
  logEvento('disponibilidad_marcada_manual', fila?.empresa_id ?? null);
}

export interface NuevaEvaluacionInput {
  obra: string;
  calidad: number;
  puntualidad: number;
  rendimiento: number;
  trabajoEquipo: number;
  cumplimiento: number;
  seguridad: number;
  recomendaria: boolean;
  comentario: string;
}

/** Calificar tras una obra: la "inversión" del loop de retención — mejora la búsqueda de mañana.
 * Confiabilidad = promedio de los 6 criterios (parejo, sin uno más importante que otro — pedido
 * directo del usuario de sumar más criterios) con el mismo ajuste por recomendación de siempre. */
export async function addEvaluacion(id: string, input: NuevaEvaluacionInput): Promise<Trabajador | undefined> {
  const actual = await getTrabajadorPorId(id);
  if (!actual) return undefined;
  const supabase = crearClienteSupabase();
  const promedioCriterios =
    (input.calidad + input.puntualidad + input.rendimiento + input.trabajoEquipo + input.cumplimiento + input.seguridad) / 6;
  const puntajeEvaluacion = promedioCriterios * 20 - (input.recomendaria ? 0 : 15);
  const confiabilidad = Math.round(clamp(actual.confiabilidad * 0.65 + puntajeEvaluacion * 0.35, 10, 99));

  const { error: errorEval } = await supabase.from('evaluaciones').insert({
    trabajador_id: id,
    obra: input.obra,
    calidad: input.calidad,
    puntualidad: input.puntualidad,
    rendimiento: input.rendimiento,
    trabajo_equipo: input.trabajoEquipo,
    cumplimiento: input.cumplimiento,
    seguridad: input.seguridad,
    recomendaria: input.recomendaria,
    comentario: input.comentario,
  });
  if (errorEval) throw errorEval;

  const { error: errorUpdate } = await supabase
    .from('trabajadores')
    .update({ confiabilidad, obras_juntos: actual.obrasJuntos + 1 })
    .eq('id', id);
  if (errorUpdate) throw errorUpdate;

  const { data: fila } = await supabase.from('trabajadores').select('empresa_id').eq('id', id).maybeSingle();
  logEvento('evaluacion_registrada', fila?.empresa_id ?? null);

  return getTrabajadorPorId(id);
}

/**
 * Se llama una vez al entrar a /app tras crear la cuenta: sube los trabajadores que el dueño
 * importó de verdad durante el onboarding (Paso2Importar, guardados en localStorage porque
 * todavía no existía la cuenta) y aplica el plan elegido en el paywall. Los 12 trabajadores de
 * demostración de CUADRILLA_SEMILLA (Paso 3 "marcar confiables") NO se copian aquí — son solo
 * la simulación del "momento wow" del onboarding, nunca datos reales de una cuenta.
 */
export async function migrarImportacionDeOnboarding(): Promise<void> {
  const estado = leerEstadoOnboarding();
  if (estado.trabajadoresImportados.length === 0) return;
  const pendientes = estado.trabajadoresImportados;
  // Se limpia ANTES de subirlos (y antes de cualquier `await`) para que sea imposible subirlos
  // dos veces: React StrictMode ejecuta este efecto dos veces seguidas en desarrollo, y sin
  // esto ambas llamadas verían la misma lista pendiente y crearían al trabajador duplicado.
  guardarEstadoOnboarding({ trabajadoresImportados: [] });
  await addTrabajadoresEnLote(pendientes);
  if (estado.planElegido === 'starter') {
    const supabase = crearClienteSupabase();
    const empresaId = await getEmpresaId(supabase);
    await supabase.from('empresas').update({ plan: 'starter' }).eq('id', empresaId);
  }
}

export { iniciales };
