'use client';

// Ficha del trabajador — disponibilidad editable, contacto directo y calificar tras una
// obra (la "inversión" del loop de retención).

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, MessageCircle, Phone, Star, Trash2 } from 'lucide-react';
import ScoreBadge from '@/components/app/ScoreBadge';
import DisponibilidadEditor from '@/components/app/DisponibilidadEditor';
import EnlaceDisponibilidad from '@/components/app/EnlaceDisponibilidad';
import CalificarSheet from '@/components/app/CalificarSheet';
import { eliminarTrabajador, getTrabajadorPorId, iniciales, type Trabajador } from '@/lib/data/trabajadores';

export default function FichaTrabajadorPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [trabajador, setTrabajador] = useState<Trabajador | null | undefined>(undefined);
  const [calificarAbierto, setCalificarAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  async function eliminar() {
    if (!trabajador) return;
    if (!window.confirm(`¿Quitar a ${trabajador.nombre} de tu libreta? No se puede deshacer.`)) return;
    setEliminando(true);
    try {
      await eliminarTrabajador(trabajador.id);
      router.push('/app/cuadrilla');
    } catch {
      setEliminando(false);
      window.alert('No pudimos eliminarlo. Intenta de nuevo.');
    }
  }

  useEffect(() => {
    if (!id) return;
    recargar();
  }, [id]);

  function recargar() {
    if (!id) return;
    getTrabajadorPorId(id)
      .then((t) => setTrabajador(t ?? null))
      .catch(() => setTrabajador(null));
  }

  if (trabajador === undefined) {
    return (
      <div className="min-h-dvh px-4 pt-6">
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)]" />
      </div>
    );
  }

  if (trabajador === null) {
    return (
      <div className="flex min-h-dvh flex-col items-center gap-3 px-4 pt-16 text-center">
        <p className="text-[16px] font-semibold">No encontramos a este trabajador</p>
        <button
          type="button"
          onClick={() => router.push('/app/cuadrilla')}
          className="text-[14px] font-semibold text-[var(--accent)]"
        >
          Volver a mi cuadrilla
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <header className="flex items-center gap-2 px-2 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Volver"
          className="flex size-10 items-center justify-center text-[var(--text-secondary)]"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
      </header>

      <div className="flex flex-col items-center px-4 pt-2 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-[var(--surface-2)] text-[26px] font-bold [font-family:var(--font-heading-name)]">
          {iniciales(trabajador.nombre)}
        </span>
        <h1 className="mt-3 text-[24px] font-bold [font-family:var(--font-display)]">{trabajador.nombre}</h1>
        <p className="text-[14px] text-[var(--text-secondary)]">
          {trabajador.oficio} · {trabajador.ubicacion}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <ScoreBadge score={trabajador.confiabilidad} />
          <div className="text-left text-[12px] leading-tight text-[var(--text-tertiary)]">
            <p>Confiabilidad</p>
            <p>{trabajador.obrasJuntos} obras juntos</p>
          </div>
        </div>

        <div className="mt-4 flex w-full gap-2">
          <a
            href={`tel:${trabajador.telefono}`}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] text-[14px] font-semibold [touch-action:manipulation]"
          >
            <Phone size={16} aria-hidden="true" /> Llamar
          </a>
          <a
            href={`https://wa.me/51${trabajador.telefono}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--chip-bg)] text-[14px] font-semibold text-[var(--accent)] [touch-action:manipulation]"
          >
            <MessageCircle size={16} aria-hidden="true" /> WhatsApp
          </a>
        </div>
      </div>

      <section className="mt-6 px-4">
        <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
          Disponibilidad esta semana
        </h2>
        <p className="mb-3 text-[12px] text-[var(--text-tertiary)]">
          Marca cómo está esta semana, o comparte el enlace para que {trabajador.nombre.split(' ')[0]} la marque él mismo.
        </p>
        <EnlaceDisponibilidad token={trabajador.enlaceToken} />
        <DisponibilidadEditor trabajadorId={trabajador.id} disponibilidad={trabajador.disponibilidad} onCambio={recargar} />
      </section>

      <section className="mt-6 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            Historial de obras
          </h2>
          <button
            type="button"
            onClick={() => setCalificarAbierto(true)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)]"
          >
            <Star size={14} aria-hidden="true" /> Calificar
          </button>
        </div>
        {trabajador.evaluaciones.length === 0 ? (
          <p className="mt-3 text-[13px] text-[var(--text-secondary)]">
            Todavía no calificaste ninguna obra con {trabajador.nombre.split(' ')[0]}. Hazlo apenas termine la próxima
            — así tu búsqueda de mañana es más precisa.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {trabajador.evaluaciones.map((ev) => (
              <div key={ev.id} className="rounded-[var(--radius-card)] bg-[var(--surface)] px-3.5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-semibold">{ev.obra}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    {new Date(ev.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <p className="mt-1 text-[12.5px] text-[var(--text-secondary)]">
                  Calidad {ev.calidad}/5 · Puntualidad {ev.puntualidad}/5 ·{' '}
                  {ev.recomendaria ? 'Lo recomendaría' : 'No lo recomendaría'}
                </p>
                {ev.comentario ? <p className="mt-1 text-[13px] text-[var(--text-primary)]">"{ev.comentario}"</p> : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 px-4">
        <button
          type="button"
          onClick={eliminar}
          disabled={eliminando}
          className="flex h-11 w-full items-center justify-center gap-2 text-[13px] font-medium text-[var(--text-tertiary)] [touch-action:manipulation] disabled:opacity-50"
        >
          <Trash2 size={15} aria-hidden="true" /> {eliminando ? 'Quitando…' : 'Quitar de mi libreta'}
        </button>
      </div>

      <CalificarSheet
        abierto={calificarAbierto}
        nombre={trabajador.nombre}
        trabajadorId={trabajador.id}
        confiabilidadActual={trabajador.confiabilidad}
        onCerrar={() => setCalificarAbierto(false)}
        onGuardado={recargar}
      />
    </div>
  );
}
