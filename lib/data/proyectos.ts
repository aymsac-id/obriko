// Capa de datos de Proyectos (obras) — Sesión 6: Supabase real (antes localStorage). La
// cuadrilla de cada obra vive en la tabla join `proyecto_trabajador` (RLS en
// supabase/migrations/0001_init.sql).

import { crearClienteSupabase } from '@/lib/supabase/client';
import { getEmpresaId } from '@/lib/data/empresa';

export type EstadoProyecto = 'activo' | 'pausado' | 'terminado';

export interface Proyecto {
  id: string;
  nombre: string;
  ubicacion: string;
  fechaInicio: string; // ISO date (yyyy-mm-dd)
  estado: EstadoProyecto;
  trabajadorIds: string[];
  creadoEn: number;
}

interface FilaProyecto {
  id: string;
  nombre: string;
  ubicacion: string;
  fecha_inicio: string;
  estado: EstadoProyecto;
  creado_en: string;
  proyecto_trabajador: { trabajador_id: string }[];
}

const SELECT_PROYECTO = '*, proyecto_trabajador(trabajador_id)';

function filaAProyecto(fila: FilaProyecto): Proyecto {
  return {
    id: fila.id,
    nombre: fila.nombre,
    ubicacion: fila.ubicacion,
    fechaInicio: fila.fecha_inicio,
    estado: fila.estado,
    trabajadorIds: fila.proyecto_trabajador.map((pt) => pt.trabajador_id),
    creadoEn: new Date(fila.creado_en).getTime(),
  };
}

export async function getProyectos(): Promise<Proyecto[]> {
  const supabase = crearClienteSupabase();
  const empresaId = await getEmpresaId(supabase);
  const { data, error } = await supabase
    .from('proyectos')
    .select(SELECT_PROYECTO)
    .eq('empresa_id', empresaId)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as FilaProyecto[]).map(filaAProyecto);
}

export async function getProyectoPorId(id: string): Promise<Proyecto | undefined> {
  const supabase = crearClienteSupabase();
  const empresaId = await getEmpresaId(supabase);
  const { data, error } = await supabase
    .from('proyectos')
    .select(SELECT_PROYECTO)
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .maybeSingle();
  if (error) throw error;
  return data ? filaAProyecto(data as unknown as FilaProyecto) : undefined;
}

export interface NuevoProyectoInput {
  nombre: string;
  ubicacion: string;
  fechaInicio: string;
  estado?: EstadoProyecto;
  trabajadorIds?: string[];
}

export async function addProyecto(input: NuevoProyectoInput): Promise<Proyecto> {
  const supabase = crearClienteSupabase();
  const empresaId = await getEmpresaId(supabase);
  const { data, error } = await supabase
    .from('proyectos')
    .insert({
      empresa_id: empresaId,
      nombre: input.nombre,
      ubicacion: input.ubicacion,
      fecha_inicio: input.fechaInicio,
      estado: input.estado ?? 'activo',
    })
    .select(SELECT_PROYECTO)
    .single();
  if (error) throw error;
  const proyecto = filaAProyecto(data as unknown as FilaProyecto);
  if (input.trabajadorIds && input.trabajadorIds.length > 0) {
    return (await asignarTrabajadores(proyecto.id, input.trabajadorIds)) ?? proyecto;
  }
  return proyecto;
}

/** Agrega uno o más trabajadores a la cuadrilla del proyecto, sin duplicar. */
export async function asignarTrabajadores(proyectoId: string, trabajadorIds: string[]): Promise<Proyecto | undefined> {
  if (trabajadorIds.length === 0) return getProyectoPorId(proyectoId);
  const supabase = crearClienteSupabase();
  const filas = trabajadorIds.map((trabajadorId) => ({ proyecto_id: proyectoId, trabajador_id: trabajadorId }));
  const { error } = await supabase.from('proyecto_trabajador').upsert(filas, { onConflict: 'proyecto_id,trabajador_id' });
  if (error) throw error;
  return getProyectoPorId(proyectoId);
}

export async function asignarTrabajador(proyectoId: string, trabajadorId: string): Promise<Proyecto | undefined> {
  return asignarTrabajadores(proyectoId, [trabajadorId]);
}

export async function quitarTrabajador(proyectoId: string, trabajadorId: string): Promise<Proyecto | undefined> {
  const supabase = crearClienteSupabase();
  const { error } = await supabase
    .from('proyecto_trabajador')
    .delete()
    .eq('proyecto_id', proyectoId)
    .eq('trabajador_id', trabajadorId);
  if (error) throw error;
  return getProyectoPorId(proyectoId);
}

export async function setEstadoProyecto(proyectoId: string, estado: EstadoProyecto): Promise<Proyecto | undefined> {
  const supabase = crearClienteSupabase();
  const { error } = await supabase.from('proyectos').update({ estado }).eq('id', proyectoId);
  if (error) throw error;
  return getProyectoPorId(proyectoId);
}
