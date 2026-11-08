// Medición propia del camino de venta (visita → onboarding → registro → planes → pago), sin
// analítica de terceros: cada paso es un evento más en event_log, con un identificador anónimo
// del navegador (no es el correo ni la cuenta) y el origen de la visita. Así el panel de admin
// cuenta visitantes únicos por paso y sabe qué grupo de WhatsApp o red trajo a cada uno.
//
// Origen = el primero que se vio en este navegador (first-touch): ?de=grupo-maestros,
// ?utm_source=whatsapp&utm_campaign=..., o el dominio de donde vino; si no hay nada, "directo".

import { logEvento, type TipoEvento } from '@/lib/data/logging';

const CLAVE_VISITANTE = 'jornivo_visitante';
const CLAVE_ORIGEN = 'jornivo_origen';
const CLAVE_PASOS = 'jornivo_pasos_sesion';

interface Origen {
  origen: string;
  campana: string | null;
}

/** Texto corto y limpio: lo escribe cualquiera en la URL, así que nunca se guarda tal cual. */
function limpiar(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const limpio = valor.toLowerCase().trim().replace(/[^a-z0-9._-]+/g, '-').slice(0, 60);
  return limpio || null;
}

function idVisitante(): string {
  try {
    const existente = localStorage.getItem(CLAVE_VISITANTE);
    if (existente) return existente;
    const nuevo = crypto.randomUUID();
    localStorage.setItem(CLAVE_VISITANTE, nuevo);
    return nuevo;
  } catch {
    // Modo privado / almacenamiento bloqueado: se cuenta igual, como visitante de una sola vez.
    return 'sin-almacenamiento';
  }
}

function origenDeEstaVisita(): Origen {
  const params = new URLSearchParams(window.location.search);
  const deUrl = limpiar(params.get('de')) ?? limpiar(params.get('utm_source'));
  const campana = limpiar(params.get('utm_campaign'));
  if (deUrl) return { origen: deUrl, campana };

  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, '');
      if (host && host !== window.location.hostname.replace(/^www\./, '')) {
        return { origen: limpiar(host) ?? 'directo', campana };
      }
    }
  } catch {
    // Referrer ilegible: se trata como visita directa.
  }
  return { origen: 'directo', campana };
}

function origenGuardado(): Origen {
  const actual = origenDeEstaVisita();
  try {
    const guardado = localStorage.getItem(CLAVE_ORIGEN);
    if (guardado) return JSON.parse(guardado) as Origen;
    localStorage.setItem(CLAVE_ORIGEN, JSON.stringify(actual));
  } catch {
    // Sin almacenamiento: vale el origen de esta visita.
  }
  return actual;
}

/** Ya se registró este paso en esta sesión del navegador? (recargar la página no infla el conteo) */
function yaRegistrado(tipo: TipoEvento): boolean {
  try {
    const pasos = JSON.parse(sessionStorage.getItem(CLAVE_PASOS) ?? '[]') as string[];
    if (pasos.includes(tipo)) return true;
    sessionStorage.setItem(CLAVE_PASOS, JSON.stringify([...pasos, tipo]));
  } catch {
    // Sin almacenamiento de sesión: se registra igual.
  }
  return false;
}

export type PasoEmbudo =
  | 'visita_landing'
  | 'onboarding_iniciado'
  | 'registro_enviado'
  | 'paywall_visto'
  | 'checkout_abierto';

/** Registra un paso del camino de venta una vez por sesión. Nunca lanza ni bloquea. */
export function registrarPaso(tipo: PasoEmbudo): Promise<void> {
  if (typeof window === 'undefined' || yaRegistrado(tipo)) return Promise.resolve();
  const { origen, campana } = origenGuardado();
  return logEvento(tipo, null, { visitante: idVisitante(), origen, campana });
}
