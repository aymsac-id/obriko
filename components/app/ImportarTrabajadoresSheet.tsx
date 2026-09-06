'use client';

// Importador REAL de trabajadores — Sesión 5. Reemplaza toda simulación previa.
// Dos rutas reales: (1) archivo Excel/CSV real, parseado con `xlsx` (lib/import/parseArchivo.ts)
// con mapeo de columnas cuando el encabezado no se detecta solo; (2) Contact Picker API nativa
// del navegador (SOLO Chrome/Edge en Android — se detecta su disponibilidad y se oculta el
// botón si no existe, nunca un botón que falla al tocarlo).
// Se usa en DOS lugares con el mismo componente: pantalla completa en el onboarding (modo
// "pantalla") y hoja inferior desde "Mi Cuadrilla" (modo "sheet").

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  CircleCheck,
  Contact as ContactIcon,
  FileSpreadsheet,
  IdCard,
  Loader2,
  Lock,
  Plus,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { OFICIOS, type Oficio } from '@/components/onboarding/data';
import { getLimiteDelPlan, type NuevoTrabajadorInput } from '@/lib/data/trabajadores';
import {
  ArchivoInvalidoError,
  detectarCampo,
  detectarOficio,
  normalizarTelefono,
  parseArchivoImportacion,
  parseArchivoVCard,
  type ArchivoParseado,
  type CampoDestino,
} from '@/lib/import/parseArchivo';

const CAMPOS_DESTINO: { valor: CampoDestino; etiqueta: string }[] = [
  { valor: 'nombre', etiqueta: 'Nombre' },
  { valor: 'telefono', etiqueta: 'Teléfono' },
  { valor: 'oficio', etiqueta: 'Oficio' },
  { valor: 'tarifa', etiqueta: 'Tarifa/día' },
  { valor: 'ubicacion', etiqueta: 'Zona' },
  { valor: 'ignorar', etiqueta: 'Ignorar' },
];

interface FilaImportacion {
  key: string;
  nombre: string;
  telefono: string;
  oficio: Oficio | '';
  tarifaDia: string;
  ubicacion: string;
}

function validarFila(fila: FilaImportacion): string | null {
  if (fila.nombre.trim().length < 3) return 'Falta el nombre completo';
  if (!/^9\d{8}$/.test(fila.telefono.trim())) return 'Celular inválido (9 dígitos, empieza con 9)';
  if (!fila.oficio) return 'Elige un oficio';
  return null;
}

// Contact Picker API — tipos mínimos (no está en el lib.dom.d.ts estándar de TS todavía).
interface ContactoNavegador {
  name?: string[];
  tel?: string[];
}
interface ContactsManagerLike {
  select: (properties: string[], options?: { multiple?: boolean }) => Promise<ContactoNavegador[]>;
}

function contactPickerDisponible(): boolean {
  if (typeof navigator === 'undefined') return false;
  return 'contacts' in navigator && 'ContactsManager' in window;
}

const INPUT_CLASS =
  'h-11 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--bg)] px-3 text-[length:var(--text-body)] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]';

type Paso = 'elegir' | 'mapear' | 'previsualizar';

interface Props {
  modo: 'sheet' | 'pantalla';
  abierto?: boolean;
  onCerrar?: () => void;
  plan: 'gratis' | 'starter' | null;
  totalActual: number;
  /** Quien usa este componente decide DÓNDE persistir: la app real los guarda en Supabase de
   * inmediato; el onboarding (sin cuenta todavía) los deja en localStorage hasta el signup. */
  onImportado: (nuevos: NuevoTrabajadorInput[]) => Promise<void>;
}

export default function ImportarTrabajadoresSheet({ modo, abierto = true, onCerrar, plan, totalActual, onImportado }: Props) {
  const [paso, setPaso] = useState<Paso>('elegir');
  const [archivo, setArchivo] = useState<ArchivoParseado | null>(null);
  const [mapeo, setMapeo] = useState<CampoDestino[]>([]);
  const [filas, setFilas] = useState<FilaImportacion[]>([]);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [cargandoContactos, setCargandoContactos] = useState(false);
  const [importando, setImportando] = useState(false);
  const [tieneContactPicker, setTieneContactPicker] = useState(false);
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const inputVCardRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTieneContactPicker(contactPickerDisponible());
  }, []);

  function reiniciar() {
    setPaso('elegir');
    setArchivo(null);
    setMapeo([]);
    setFilas([]);
    setErrorGeneral(null);
  }

  async function onArchivoElegido(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorGeneral(null);
    try {
      const parseado = await parseArchivoImportacion(file);
      setArchivo(parseado);
      setMapeo(parseado.encabezados.map((h) => detectarCampo(h)));
      setPaso('mapear');
    } catch (err) {
      setErrorGeneral(
        err instanceof ArchivoInvalidoError ? err.message : 'No pudimos leer ese archivo. Revisa el formato e intenta de nuevo.'
      );
    }
  }

  function confirmarMapeo() {
    if (!archivo) return;
    const idxNombre = mapeo.indexOf('nombre');
    const idxTelefono = mapeo.indexOf('telefono');
    if (idxNombre === -1 || idxTelefono === -1) return; // el botón ya está disabled en este caso
    const idxOficio = mapeo.indexOf('oficio');
    const idxTarifa = mapeo.indexOf('tarifa');
    const idxUbicacion = mapeo.indexOf('ubicacion');

    const nuevasFilas: FilaImportacion[] = archivo.filas.map((fila, i) => ({
      key: `archivo-${i}`,
      nombre: fila[idxNombre] ?? '',
      telefono: normalizarTelefono(fila[idxTelefono] ?? ''),
      oficio: idxOficio !== -1 ? detectarOficio(fila[idxOficio] ?? '') : '',
      tarifaDia: idxTarifa !== -1 ? (fila[idxTarifa] ?? '').replace(/[^\d]/g, '') : '',
      ubicacion: idxUbicacion !== -1 ? fila[idxUbicacion] ?? '' : '',
    }));
    setFilas(nuevasFilas);
    setPaso('previsualizar');
  }

  async function elegirContactos() {
    setErrorGeneral(null);
    setCargandoContactos(true);
    try {
      const manager = (navigator as unknown as { contacts: ContactsManagerLike }).contacts;
      const contactos = await manager.select(['name', 'tel'], { multiple: true });
      if (contactos.length === 0) {
        setCargandoContactos(false);
        return;
      }
      const nuevasFilas: FilaImportacion[] = contactos.map((c, i) => ({
        key: `contacto-${i}`,
        nombre: (c.name?.[0] ?? '').trim(),
        telefono: normalizarTelefono(c.tel?.[0] ?? ''),
        oficio: '',
        tarifaDia: '',
        ubicacion: '',
      }));
      setFilas(nuevasFilas);
      setPaso('previsualizar');
    } catch {
      setErrorGeneral('No pudimos acceder a tus contactos. Intenta de nuevo o usa el Excel/CSV.');
    } finally {
      setCargandoContactos(false);
    }
  }

  /** Reemplazo real del Contact Picker para iPhone y escritorio (ninguno de los dos tiene ese
   * API): el usuario exporta 1 o varios contactos como tarjeta (.vcf) desde su propia app de
   * Contactos — "Compartir contacto" → Guardar en Archivos — y la sube aquí. Cero tipeo. */
  async function onVCardElegido(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorGeneral(null);
    try {
      const contactos = await parseArchivoVCard(file);
      const nuevasFilas: FilaImportacion[] = contactos.map((c, i) => ({
        key: `vcard-${i}`,
        nombre: c.nombre,
        telefono: c.telefono,
        oficio: '',
        tarifaDia: '',
        ubicacion: '',
      }));
      setFilas(nuevasFilas);
      setPaso('previsualizar');
    } catch (err) {
      setErrorGeneral(
        err instanceof ArchivoInvalidoError
          ? err.message
          : 'No pudimos leer esa tarjeta de contacto. Intenta de nuevo.'
      );
    }
  }

  function filaVacia(): FilaImportacion {
    return { key: `manual-${Date.now()}-${Math.round(Math.random() * 1e6)}`, nombre: '', telefono: '', oficio: '', tarifaDia: '', ubicacion: '' };
  }

  /** No todos tienen un Excel a la mano ni un celular Android con Chrome (Contact Picker) — esta
   * es la vía que SIEMPRE funciona: escribir a la gente a mano, reusando la misma vista previa
   * editable de la importación real. */
  function agregarManualmente() {
    setErrorGeneral(null);
    setFilas([filaVacia()]);
    setPaso('previsualizar');
  }

  function actualizarFila(key: string, cambios: Partial<FilaImportacion>) {
    setFilas((prev) => prev.map((f) => (f.key === key ? { ...f, ...cambios } : f)));
  }

  function quitarFila(key: string) {
    setFilas((prev) => prev.filter((f) => f.key !== key));
  }

  const filasConError = useMemo(
    () => filas.map((f) => ({ fila: f, error: validarFila(f) })),
    [filas]
  );
  const filasValidas = filasConError.filter((f) => f.error === null).map((f) => f.fila);
  const limite = getLimiteDelPlan(plan);
  const cupoRestante = Math.max(0, limite - totalActual);
  const excedeElPlan = filasValidas.length > cupoRestante;
  const aImportar = excedeElPlan ? filasValidas.slice(0, cupoRestante) : filasValidas;

  async function confirmarImportacion() {
    if (aImportar.length === 0) return;
    setImportando(true);
    const inputs: NuevoTrabajadorInput[] = aImportar.map((f) => ({
      nombre: f.nombre.trim(),
      oficio: f.oficio as Oficio,
      telefono: f.telefono.trim(),
      tarifaDia: Number(f.tarifaDia) || 80,
      ubicacion: f.ubicacion.trim() || 'Sin especificar',
      origen: 'importado',
    }));
    try {
      await onImportado(inputs);
    } catch {
      setErrorGeneral('No pudimos guardar los trabajadores. Intenta de nuevo.');
    } finally {
      setImportando(false);
    }
  }

  const contenido = (
    <div className="flex min-h-0 flex-1 flex-col">
      <datalist id="obriko-oficios-sugeridos">
        {OFICIOS.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
      {errorGeneral ? (
        <div className="mb-3 flex items-start gap-2 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3.5 py-3">
          <AlertTriangle size={18} color="var(--danger)" className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[length:var(--text-small)] text-[var(--text-primary)]">{errorGeneral}</p>
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {paso === 'elegir' ? (
          <motion.div key="elegir" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
            <input
              ref={inputArchivoRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="sr-only"
              onChange={onArchivoElegido}
            />
            <input
              ref={inputVCardRef}
              type="file"
              accept=".vcf,text/vcard,text/x-vcard"
              className="sr-only"
              onChange={onVCardElegido}
            />

            {tieneContactPicker ? (
              <button
                type="button"
                onClick={elegirContactos}
                disabled={cargandoContactos}
                className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_28%,transparent)] bg-[var(--surface)] px-4 py-4 text-left transition-colors [touch-action:manipulation] hover:bg-[var(--surface-2)] disabled:opacity-70"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
                  {cargandoContactos ? (
                    <Loader2 size={22} color="var(--accent)" className="animate-spin" aria-hidden="true" />
                  ) : (
                    <ContactIcon size={22} color="var(--accent)" aria-hidden="true" />
                  )}
                </span>
                <span>
                  <span className="block text-[length:var(--text-body)] font-semibold">Elegir de mis contactos</span>
                  <span className="block text-[length:var(--text-small)] text-[var(--text-secondary)]">
                    {cargandoContactos ? 'Abriendo tus contactos…' : 'Trae nombre y celular directo del teléfono'}
                  </span>
                </span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => inputVCardRef.current?.click()}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_28%,transparent)] bg-[var(--surface)] px-4 py-4 text-left transition-colors [touch-action:manipulation] hover:bg-[var(--surface-2)]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
                <IdCard size={22} color="var(--accent)" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[length:var(--text-body)] font-semibold">Subir tarjeta de contacto (.vcf)</span>
                <span className="block text-[length:var(--text-small)] text-[var(--text-secondary)]">
                  En Contactos de tu celular: elige uno o varios → Compartir → Guardar archivo
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={agregarManualmente}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_28%,transparent)] bg-[var(--surface)] px-4 py-4 text-left transition-colors [touch-action:manipulation] hover:bg-[var(--surface-2)]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
                <UserPlus size={22} color="var(--accent)" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[length:var(--text-body)] font-semibold">Agregarlos yo mismo</span>
                <span className="block text-[length:var(--text-small)] text-[var(--text-secondary)]">
                  Escribe nombre y celular de cada uno — toma un minuto
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => inputArchivoRef.current?.click()}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_28%,transparent)] bg-[var(--surface)] px-4 py-4 text-left transition-colors [touch-action:manipulation] hover:bg-[var(--surface-2)]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
                <FileSpreadsheet size={22} color="var(--accent)" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[length:var(--text-body)] font-semibold">Importar desde Excel o CSV</span>
                <span className="block text-[length:var(--text-small)] text-[var(--text-secondary)]">
                  Si ya tienes tu lista en un archivo
                </span>
              </span>
            </button>
          </motion.div>
        ) : null}

        {paso === 'mapear' && archivo ? (
          <motion.div key="mapear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-0 flex-1 flex-col">
            <button
              type="button"
              onClick={reiniciar}
              className="mb-3 flex items-center gap-1 text-[length:var(--text-small)] font-medium text-[var(--text-secondary)]"
            >
              <ChevronLeft size={16} aria-hidden="true" /> Elegir otro archivo
            </button>
            <p className="mb-3 text-[length:var(--text-small)] text-[var(--text-secondary)]">
              Detectamos {archivo.encabezados.length} columnas. Revisa que cada una apunte al dato correcto.
            </p>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              {archivo.encabezados.map((h, i) => (
                <div
                  key={`${h}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)] px-3.5 py-2.5"
                >
                  <span className="min-w-0 truncate text-[length:var(--text-body)] font-medium">{h || `Columna ${i + 1}`}</span>
                  <span className="relative shrink-0">
                    <select
                      value={mapeo[i] ?? 'ignorar'}
                      onChange={(e) =>
                        setMapeo((prev) => prev.map((m, idx) => (idx === i ? (e.target.value as CampoDestino) : m)))
                      }
                      className="h-9 w-40 appearance-none rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface-2)] pl-3 pr-8 text-[length:var(--text-small)] font-medium"
                    >
                      {CAMPOS_DESTINO.map((c) => (
                        <option key={c.valor} value={c.valor}>
                          {c.etiqueta}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      color="var(--text-tertiary)"
                      aria-hidden="true"
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                    />
                  </span>
                </div>
              ))}
            </div>
            {mapeo.indexOf('nombre') === -1 || mapeo.indexOf('telefono') === -1 ? (
              <p className="mt-3 text-[length:var(--text-small)] text-[var(--warning)]">
                Asigna al menos Nombre y Teléfono a alguna columna para continuar.
              </p>
            ) : null}
            <button
              type="button"
              onClick={confirmarMapeo}
              disabled={mapeo.indexOf('nombre') === -1 || mapeo.indexOf('telefono') === -1}
              className="mt-3 flex h-12 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--text-body)] font-semibold text-[var(--bg)] disabled:opacity-50"
            >
              Ver vista previa
            </button>
          </motion.div>
        ) : null}

        {paso === 'previsualizar' ? (
          <motion.div key="previsualizar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-0 flex-1 flex-col">
            <button
              type="button"
              onClick={reiniciar}
              className="mb-3 flex items-center gap-1 text-[length:var(--text-small)] font-medium text-[var(--text-secondary)]"
            >
              <ChevronLeft size={16} aria-hidden="true" /> Empezar de nuevo
            </button>

            {filas.length === 0 ? (
              <p className="text-[length:var(--text-small)] text-[var(--text-secondary)]">No quedan filas por importar.</p>
            ) : (
              <>
                <p className="mb-2 text-[length:var(--text-small)] font-semibold text-[var(--text-secondary)]">
                  {filasValidas.length} de {filas.length} filas listas para importar
                </p>
                <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pb-1">
                  {filasConError.map(({ fila, error }, idx) => {
                    const fueraDeCupo = excedeElPlan && idx >= cupoRestante && error === null;
                    return (
                      <div
                        key={fila.key}
                        className={`rounded-[var(--radius-card)] border px-3.5 py-3 ${
                          error
                            ? 'border-[color-mix(in_oklab,var(--danger)_45%,transparent)] bg-[color-mix(in_oklab,var(--danger)_8%,transparent)]'
                            : fueraDeCupo
                              ? 'border-[color-mix(in_oklab,var(--warning)_45%,transparent)] bg-[color-mix(in_oklab,var(--warning)_8%,transparent)]'
                              : 'border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                            <input
                              value={fila.nombre}
                              onChange={(e) => actualizarFila(fila.key, { nombre: e.target.value })}
                              placeholder="Nombre completo"
                              className={`${INPUT_CLASS} col-span-2`}
                            />
                            <input
                              value={fila.telefono}
                              onChange={(e) => actualizarFila(fila.key, { telefono: e.target.value.replace(/\D/g, '') })}
                              inputMode="numeric"
                              placeholder="9XXXXXXXX"
                              className={INPUT_CLASS}
                            />
                            <input
                              value={fila.oficio}
                              onChange={(e) => actualizarFila(fila.key, { oficio: e.target.value })}
                              list="obriko-oficios-sugeridos"
                              placeholder="Oficio (o escribe uno propio)"
                              className={INPUT_CLASS}
                            />
                            <input
                              value={fila.tarifaDia}
                              onChange={(e) => actualizarFila(fila.key, { tarifaDia: e.target.value.replace(/\D/g, '') })}
                              inputMode="numeric"
                              placeholder="Tarifa/día (S/)"
                              className={INPUT_CLASS}
                            />
                            <input
                              value={fila.ubicacion}
                              onChange={(e) => actualizarFila(fila.key, { ubicacion: e.target.value })}
                              placeholder="Zona (opcional)"
                              className={INPUT_CLASS}
                            />
                          </div>
                          <div className="flex flex-col items-center gap-2 pt-1">
                            {error ? (
                              <AlertTriangle size={18} color="var(--danger)" aria-hidden="true" />
                            ) : (
                              <CircleCheck size={18} color="var(--success)" aria-hidden="true" />
                            )}
                            <button
                              type="button"
                              onClick={() => quitarFila(fila.key)}
                              aria-label="Quitar esta fila"
                              className="flex size-7 items-center justify-center text-[var(--text-tertiary)]"
                            >
                              <Trash2 size={15} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        {error ? <p className="mt-1.5 text-[length:var(--text-small)] text-[var(--danger)]">{error}</p> : null}
                        {fueraDeCupo ? (
                          <p className="mt-1.5 text-[length:var(--text-small)] text-[var(--warning)]">
                            No entra en tu plan gratis (10 trabajadores) — pasa a Starter para incluirla.
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setFilas((prev) => [...prev, filaVacia()])}
                  className="mt-2 flex h-10 items-center justify-center gap-1.5 rounded-[var(--radius-button)] border border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-[length:var(--text-small)] font-semibold text-[var(--text-secondary)] [touch-action:manipulation]"
                >
                  <Plus size={14} aria-hidden="true" /> Agregar otro
                </button>

                {excedeElPlan ? (
                  <div className="mt-3 flex flex-col gap-2 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--warning)_40%,transparent)] bg-[color-mix(in_oklab,var(--warning)_10%,transparent)] px-3.5 py-3">
                    <p className="flex items-center gap-2 text-[length:var(--text-small)] font-semibold">
                      <Lock size={16} color="var(--warning)" aria-hidden="true" />
                      Puedes importar {cupoRestante} de {filasValidas.length} trabajadores válidos con tu plan gratis
                    </p>
                    <p className="text-[length:var(--text-small)] text-[var(--text-secondary)]">
                      {filasValidas.length - cupoRestante} se quedarían afuera. Pasa a Starter para traerlos a todos (hasta 50).
                    </p>
                    <Link
                      href="/paywall"
                      className="mt-1 flex h-10 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_45%,transparent)] text-[length:var(--text-small)] font-semibold text-[var(--accent)]"
                    >
                      Ver plan Starter
                    </Link>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={confirmarImportacion}
                  disabled={aImportar.length === 0 || importando}
                  className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-[length:var(--text-body)] font-semibold text-[var(--bg)] disabled:opacity-50"
                >
                  {importando ? (
                    <>
                      <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Importando…
                    </>
                  ) : (
                    `Importar ${aImportar.length} trabajador${aImportar.length === 1 ? '' : 'es'}`
                  )}
                </button>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );

  if (modo === 'pantalla') {
    return <div className="flex min-h-0 flex-1 flex-col">{contenido}</div>;
  }

  return (
    <AnimatePresence>
      {abierto ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onCerrar}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Importar trabajadores"
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-[var(--radius-sheet)] border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4 pt-4 pb-[max(24px,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)]" />
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <h2 className="text-[length:var(--text-sheet-title)] font-bold [font-family:var(--font-display)]">Importar trabajadores</h2>
              <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar"
                className="flex size-9 items-center justify-center text-[var(--text-tertiary)]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            {contenido}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
