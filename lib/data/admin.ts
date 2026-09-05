// Consultas agregadas para el panel de administración — todas dependen de las políticas RLS
// "admin_lee_*" (solo se ejecutan de verdad si el usuario autenticado es admin; para cualquier
// otro devuelven cero filas, nunca un error que delate estructura). Se llaman desde Server
// Components con el cliente de servidor, así que la sesión ya viene en las cookies.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Aviso } from '@/components/admin/AvisoBanner';

export interface ResumenNegocio {
  totalCuentas: number;
  cuentasUltimos7Dias: number;
  totalTrabajadores: number;
  totalProyectos: number;
  cuentasStarter: number;
  cuentasGratis: number;
}

export async function getResumenNegocio(supabase: SupabaseClient): Promise<ResumenNegocio> {
  const hace7Dias = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [empresas, recientes, trabajadores, proyectos, starter] = await Promise.all([
    supabase.from('empresas').select('id', { count: 'exact', head: true }),
    supabase.from('empresas').select('id', { count: 'exact', head: true }).gte('creado_en', hace7Dias),
    supabase.from('trabajadores').select('id', { count: 'exact', head: true }),
    supabase.from('proyectos').select('id', { count: 'exact', head: true }),
    supabase.from('empresas').select('id', { count: 'exact', head: true }).eq('plan', 'starter'),
  ]);

  const totalCuentas = empresas.count ?? 0;
  const cuentasStarter = starter.count ?? 0;

  return {
    totalCuentas,
    cuentasUltimos7Dias: recientes.count ?? 0,
    totalTrabajadores: trabajadores.count ?? 0,
    totalProyectos: proyectos.count ?? 0,
    cuentasStarter,
    cuentasGratis: totalCuentas - cuentasStarter,
  };
}

export async function getAvisos(supabase: SupabaseClient): Promise<Aviso[]> {
  const hace7Dias = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const avisos: Aviso[] = [];

  const { count: errores } = await supabase
    .from('error_log')
    .select('id', { count: 'exact', head: true })
    .gte('creado_en', hace7Dias);

  if (errores && errores > 0) {
    avisos.push({
      nivel: 'atencion',
      texto: `${errores} ${errores === 1 ? 'error registrado' : 'errores registrados'} esta semana — revisa la sección Salud.`,
    });
  }

  // Ventas/IA dependen de Hotmart, que todavía no está conectado — se avisa una vez, en vez de
  // fingir con datos financieros que no existen (regla: "Sin datos", nunca inventar).
  avisos.push({
    nivel: 'info',
    texto: 'Los avisos de ventas, ganancia real e IA están apagados: conecta Hotmart para activarlos.',
  });

  return avisos;
}

export interface FilaEmpresaAdmin {
  id: string;
  nombre: string;
  plan: string;
  creado_en: string;
  owner_email: string;
  total_trabajadores: number;
  total_proyectos: number;
}

export async function getListaEmpresas(supabase: SupabaseClient): Promise<FilaEmpresaAdmin[]> {
  const { data, error } = await supabase.rpc('admin_lista_empresas');
  if (error) throw error;
  return (data ?? []) as FilaEmpresaAdmin[];
}

export interface ResumenEvento {
  tipo: string;
  total: number;
}

export async function getResumenEventos(supabase: SupabaseClient, dias = 30): Promise<ResumenEvento[]> {
  const desde = new Date(Date.now() - dias * 86_400_000).toISOString();
  const { data, error } = await supabase.from('event_log').select('tipo').gte('creado_en', desde);
  if (error) throw error;
  const conteo = new Map<string, number>();
  for (const fila of data ?? []) {
    conteo.set(fila.tipo, (conteo.get(fila.tipo) ?? 0) + 1);
  }
  return Array.from(conteo.entries()).map(([tipo, total]) => ({ tipo, total }));
}

export interface PuntoSerieDiaria {
  fecha: string; // yyyy-mm-dd
  total: number;
}

/** Cuentas nuevas por día, últimos N días — para el gráfico de tendencia (17-VISUALIZACION-DATOS). */
export async function getCuentasPorDia(supabase: SupabaseClient, dias = 30): Promise<PuntoSerieDiaria[]> {
  const desde = new Date();
  desde.setDate(desde.getDate() - (dias - 1));
  desde.setHours(0, 0, 0, 0);

  const { data, error } = await supabase.from('empresas').select('creado_en').gte('creado_en', desde.toISOString());
  if (error) throw error;

  const porDia = new Map<string, number>();
  for (let i = 0; i < dias; i++) {
    const d = new Date(desde);
    d.setDate(d.getDate() + i);
    porDia.set(isoLocal(d), 0);
  }
  for (const fila of data ?? []) {
    const iso = isoLocal(new Date(fila.creado_en));
    if (porDia.has(iso)) porDia.set(iso, (porDia.get(iso) ?? 0) + 1);
  }
  return Array.from(porDia.entries()).map(([fecha, total]) => ({ fecha, total }));
}

function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface Retencion {
  cohorteSize: number;
  retenidos: number;
}

/** null = todavía no hay ninguna cuenta que cumpla exactamente N días de antigüedad hoy. */
export async function getRetencion(supabase: SupabaseClient, dias: number): Promise<Retencion | null> {
  const { data, error } = await supabase.rpc('admin_retencion', { p_dias: dias });
  if (error) throw error;
  const fila = (data ?? [])[0] as { cohorte_size: number; retenidos: number } | undefined;
  if (!fila || fila.cohorte_size === 0) return null;
  return { cohorteSize: fila.cohorte_size, retenidos: fila.retenidos };
}

export interface FilaError {
  id: string;
  mensaje: string;
  contexto: string;
  creado_en: string;
}

export async function getErroresRecientes(supabase: SupabaseClient, limite = 20): Promise<FilaError[]> {
  const { data, error } = await supabase
    .from('error_log')
    .select('id, mensaje, contexto, creado_en')
    .order('creado_en', { ascending: false })
    .limit(limite);
  if (error) throw error;
  return data ?? [];
}

export async function getTotalErrores(supabase: SupabaseClient, dias: number): Promise<number> {
  const desde = new Date(Date.now() - dias * 86_400_000).toISOString();
  const { count } = await supabase.from('error_log').select('id', { count: 'exact', head: true }).gte('creado_en', desde);
  return count ?? 0;
}
