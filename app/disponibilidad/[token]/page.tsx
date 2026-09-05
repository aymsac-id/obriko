'use client';

// Enlace público sin login — el trabajador nunca instala nada (FICHA-AVATAR.md, objeción #2).
// El token es un UUID no adivinable (trabajadores.enlace_token); esta pantalla habla con
// Supabase SOLO a través de las 2 funciones RPC públicas de supabase/migrations/0001_init.sql
// (obtener_disponibilidad_publica / actualizar_disponibilidad_publica) — nunca lee las tablas
// reales directamente, así que el rol `anon` jamás ve datos de otro trabajador ni de otra obra.

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CircleCheck, CircleX, HelpCircle, Loader2 } from 'lucide-react';
import { crearClienteSupabase } from '@/lib/supabase/client';
import { getProximosDias, type DiaProximo } from '@/lib/data/fechas';
import { BrandLockup } from '@/components/LogoMark';

type EstadoDisponibilidad = 'disponible' | 'ocupado' | 'consultar';
const ORDEN: EstadoDisponibilidad[] = ['disponible', 'ocupado', 'consultar'];
const ETIQUETA: Record<EstadoDisponibilidad, string> = {
  disponible: 'Libre — puedo trabajar',
  ocupado: 'Ocupado',
  consultar: 'Pregúntame',
};
const ICONO: Record<EstadoDisponibilidad, typeof CircleCheck> = {
  disponible: CircleCheck,
  ocupado: CircleX,
  consultar: HelpCircle,
};

interface FilaPublica {
  nombre: string;
  oficio: string;
  fecha: string | null;
  estado: EstadoDisponibilidad | null;
}

export default function DisponibilidadPublicaPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  // 30 días en vez de 7 (pedido del usuario): que la persona marque todo un mes de una vez, en
  // lugar de tener que volver a pedirle disponibilidad cada semana.
  const dias = getProximosDias(30);
  const [estado, setEstado] = useState<'cargando' | 'invalido' | 'listo'>('cargando');
  const [nombre, setNombre] = useState('');
  const [oficio, setOficio] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<Record<string, EstadoDisponibilidad>>({});
  const [guardando, setGuardando] = useState<string | null>(null);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const supabase = crearClienteSupabase();
        const { data, error } = await supabase.rpc('obtener_disponibilidad_publica', { p_token: token });
        const filas = data as FilaPublica[] | null;
        if (error || !filas || filas.length === 0) {
          setEstado('invalido');
          return;
        }
        setNombre(filas[0].nombre);
        setOficio(filas[0].oficio);
        const mapa: Record<string, EstadoDisponibilidad> = {};
        for (const f of filas) if (f.fecha && f.estado) mapa[f.fecha] = f.estado;
        setDisponibilidad(mapa);
        setEstado('listo');
      } catch {
        setEstado('invalido');
      }
    })();
  }, [token]);

  async function marcar(dia: DiaProximo, siguiente: EstadoDisponibilidad) {
    if (!token) return;
    const anterior = disponibilidad[dia.iso] ?? 'consultar';
    setGuardando(dia.iso);
    setErrorGuardado(null);
    setDisponibilidad((prev) => ({ ...prev, [dia.iso]: siguiente }));
    const supabase = crearClienteSupabase();
    const { error } = await supabase.rpc('actualizar_disponibilidad_publica', {
      p_token: token,
      p_fecha: dia.iso,
      p_estado: siguiente,
    });
    if (error) {
      // Revertimos de verdad si falló — mejor mostrar el estado real que uno que no se guardó,
      // y avisar: el trabajador no debe irse pensando que ya quedó marcado.
      setDisponibilidad((prev) => ({ ...prev, [dia.iso]: anterior }));
      setErrorGuardado('No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.');
    } else {
      supabase.rpc('log_evento', { p_tipo: 'disponibilidad_marcada_publica', p_empresa_id: null, p_metadata: {} }).then(
        () => {},
        () => {}
      );
    }
    setGuardando(null);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center bg-[var(--bg)] px-4 py-6 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <BrandLockup size={32} />

      {estado === 'cargando' ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-[var(--text-secondary)]">
          <Loader2 size={24} className="animate-spin" aria-hidden="true" />
          <p className="text-[14px]">Cargando…</p>
        </div>
      ) : estado === 'invalido' ? (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="text-[16px] font-semibold">Este enlace ya no es válido</p>
          <p className="max-w-xs text-[13px] text-[var(--text-secondary)]">
            Pídele a quien te lo compartió que te envíe uno nuevo.
          </p>
        </div>
      ) : (
        <div className="mt-8 w-full max-w-md">
          <h1 className="text-balance text-center text-[24px] font-bold leading-tight [font-family:var(--font-display)]">
            Hola, {nombre.split(' ')[0]}
          </h1>
          <p className="mt-1.5 text-center text-[14px] text-[var(--text-secondary)]">
            {oficio} · Marca los días en que puedes trabajar este mes
          </p>

          {errorGuardado ? (
            <p role="alert" className="mt-4 text-center text-[13px] font-medium text-[var(--danger)]">
              {errorGuardado}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-2">
            {dias.map((d, i) => {
              const actual = disponibilidad[d.iso] ?? 'consultar';
              const mesCambio = i > 0 && d.mesCorto !== dias[i - 1]?.mesCorto;
              return (
                <div key={d.iso}>
                  {mesCambio ? (
                    <p className="mb-2 mt-3 px-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                      {d.mesCorto}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between rounded-[var(--radius-card)] bg-[var(--surface)] px-4 py-3">
                  <div>
                    <p className="text-[14px] font-semibold">
                      {d.esHoy ? 'Hoy' : d.diaCorto} · {d.diaNumero} {d.mesCorto}
                    </p>
                    <p className="text-[12px] text-[var(--text-tertiary)]">{ETIQUETA[actual]}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {ORDEN.map((opcion) => {
                      const Icono = ICONO[opcion];
                      const activo = actual === opcion;
                      const color =
                        opcion === 'disponible' ? 'var(--success)' : opcion === 'ocupado' ? 'var(--danger)' : 'var(--warning)';
                      return (
                        <button
                          key={opcion}
                          type="button"
                          onClick={() => marcar(d, opcion)}
                          disabled={guardando === d.iso}
                          aria-label={ETIQUETA[opcion]}
                          aria-pressed={activo}
                          style={activo ? { backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)` } : undefined}
                          className="flex size-10 items-center justify-center rounded-[var(--radius-button)] [touch-action:manipulation] disabled:opacity-50"
                        >
                          <Icono size={20} color={activo ? color : 'var(--text-tertiary)'} aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-[12px] text-[var(--text-tertiary)]">
            Se guarda solo — puedes cerrar esta página cuando quieras.
          </p>
        </div>
      )}
    </div>
  );
}
