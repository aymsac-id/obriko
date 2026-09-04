// Helper de fechas para la app interna — próximos 7 días desde hoy (buscador + franja de
// disponibilidad semanal, el dispositivo ownable de FICHA-ARTE.md). Sin dependencias externas.

export interface DiaProximo {
  iso: string;
  diaCorto: string;
  /** Abreviatura de 2 letras SIN colisión (Lu/Ma/Mi/Ju/Vi/Sa/Do) — para vistas compactas donde
   * `diaCorto` (1 letra) confundiría martes con miércoles. */
  diaDosLetras: string;
  diaNumero: number;
  mesCorto: string;
  esHoy: boolean;
}

const DIAS_CORTOS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const DIAS_DOS_LETRAS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

export function getProximosDias(n = 7): DiaProximo[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + i);
    return {
      iso: isoLocal(d),
      diaCorto: DIAS_CORTOS[d.getDay()] ?? '',
      diaDosLetras: DIAS_DOS_LETRAS[d.getDay()] ?? '',
      diaNumero: d.getDate(),
      mesCorto: MESES_CORTOS[d.getMonth()] ?? '',
      esHoy: i === 0,
    };
  });
}

function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "Hoy" / "Mañana" / "Vie 5 sep" para el selector "Cuándo" del buscador. */
export function etiquetaDia(iso: string, dias: DiaProximo[]): string {
  const idx = dias.findIndex((d) => d.iso === iso);
  if (idx === 0) return 'Hoy';
  if (idx === 1) return 'Mañana';
  const dia = dias[idx];
  if (!dia) return iso;
  const fecha = new Date(`${iso}T00:00:00`);
  return `${dia.diaCorto} ${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]}`;
}
