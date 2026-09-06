// Parseo real de archivos de importación (Excel/CSV) — Sesión 5.
// Usa `xlsx` (SheetJS) para leer .xlsx/.xls/.csv del dispositivo del usuario y devuelve
// filas crudas + encabezados detectados, para que la UI arme el mapeo de columnas.
// Nota de seguridad (anotada en ESTADO.md): la versión de `xlsx` en npm no tiene fix oficial
// para 2 CVEs conocidos (prototype pollution / ReDoS). El riesgo es acotado porque el archivo
// SIEMPRE lo elige el propio usuario en su dispositivo (nunca se procesa un archivo remoto o
// de un tercero) y el parseo corre 100% en el navegador, sin tocar backend.

import * as XLSX from 'xlsx';
import { OFICIOS, type Oficio } from '@/components/onboarding/data';

export type CampoDestino = 'nombre' | 'telefono' | 'oficio' | 'tarifa' | 'ubicacion' | 'ignorar';

export interface ArchivoParseado {
  encabezados: string[];
  filas: string[][]; // filas de datos, sin la fila de encabezado
}

export class ArchivoInvalidoError extends Error {}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Detecta a qué campo del trabajador corresponde un encabezado de columna, por nombre. */
export function detectarCampo(encabezado: string): CampoDestino {
  const h = normalizar(encabezado);
  if (/nombre/.test(h)) return 'nombre';
  if (/(telefono|celular|movil|phone|whatsapp)/.test(h)) return 'telefono';
  if (/(oficio|especialidad|rubro|puesto)/.test(h)) return 'oficio';
  if (/(tarifa|pago|sueldo|precio|dia)/.test(h)) return 'tarifa';
  if (/(ubicacion|zona|lugar|distrito|direccion)/.test(h)) return 'ubicacion';
  return 'ignorar';
}

/** Reconoce el oficio contra la lista de sugerencias (para usar mayúscula/tilde consistente);
 * si no matchea ninguna, el oficio es TEXTO LIBRE — se usa tal cual viene de la columna en vez
 * de descartarlo, porque el usuario puede tener rubros propios que no están en la lista. */
export function detectarOficio(texto: string): Oficio {
  const original = texto.trim();
  if (!original) return '';
  const h = normalizar(original);
  const match = OFICIOS.find((o) => normalizar(o) === h || h.includes(normalizar(o)) || normalizar(o).includes(h));
  return match ?? original;
}

/** Normaliza un teléfono peruano de 9 dígitos que empieza con 9, quitando +51/espacios/guiones. */
export function normalizarTelefono(texto: string): string {
  let digitos = texto.replace(/\D/g, '');
  if (digitos.length === 11 && digitos.startsWith('51')) digitos = digitos.slice(2);
  if (digitos.length === 12 && digitos.startsWith('051')) digitos = digitos.slice(3);
  if (digitos.length > 9) digitos = digitos.slice(-9);
  return digitos;
}

export interface ContactoVCard {
  nombre: string;
  telefono: string;
}

/** Desdobla y separa un texto .vcf en sus tarjetas, extrayendo nombre + celular de cada una.
 * Es el reemplazo real del Contact Picker en dispositivos donde ese API no existe (todo iPhone,
 * cualquier navegador de escritorio): el usuario exporta 1 o varios contactos como archivo desde
 * su propia app de Contactos y lo sube aquí — cero tipeo, igual que el selector de Android. */
export function parseVCard(texto: string): ContactoVCard[] {
  // Las líneas largas de un vCard pueden venir "plegadas" (continúan en la siguiente línea si
  // esta empieza con espacio o tab) — se desdobla antes de separar tarjeta por tarjeta.
  const desdoblado = texto.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
  const bloques = desdoblado.split(/BEGIN:VCARD/i).slice(1);
  const contactos: ContactoVCard[] = [];
  for (const bloque of bloques) {
    const lineas = bloque.split('\n').map((l) => l.trim()).filter(Boolean);
    let nombre = '';
    let telefono = '';
    let telefonoCelular = '';
    for (const linea of lineas) {
      const idx = linea.indexOf(':');
      if (idx === -1) continue;
      const clave = linea.slice(0, idx);
      const valor = linea.slice(idx + 1).trim();
      if (!valor) continue;
      const claveBase = clave.split(';')[0].toUpperCase();
      if (claveBase === 'FN' && !nombre) {
        nombre = valor;
      } else if (claveBase === 'N' && !nombre) {
        // N: Apellidos;Nombre;SegundoNombre;Prefijo;Sufijo — se arma "Nombre Apellidos".
        const partes = valor.split(';').filter(Boolean);
        nombre = partes.slice(0, 2).reverse().join(' ').trim();
      } else if (claveBase === 'TEL') {
        const numero = normalizarTelefono(valor);
        if (!numero) continue;
        if (!telefono) telefono = numero;
        if (!telefonoCelular && /CELL|MOBILE|CEL\b/i.test(clave)) telefonoCelular = numero;
      }
    }
    const telefonoFinal = telefonoCelular || telefono;
    if (nombre || telefonoFinal) contactos.push({ nombre, telefono: telefonoFinal });
  }
  return contactos;
}

/** Lee un archivo .vcf (una o varias tarjetas de contacto) y devuelve nombre + celular de cada una. */
export async function parseArchivoVCard(file: File): Promise<ContactoVCard[]> {
  if (file.size === 0) {
    throw new ArchivoInvalidoError('El archivo está vacío.');
  }
  const texto = await file.text();
  const contactos = parseVCard(texto);
  if (contactos.length === 0) {
    throw new ArchivoInvalidoError(
      'No encontramos ningún contacto ahí. Verifica que sea una tarjeta de contacto (.vcf) válida.'
    );
  }
  return contactos;
}

/** Lee un File (.xlsx/.xls/.csv) y devuelve encabezados + filas crudas como texto. */
export async function parseArchivoImportacion(file: File): Promise<ArchivoParseado> {
  if (file.size === 0) {
    throw new ArchivoInvalidoError('El archivo está vacío.');
  }
  // CSV se lee como TEXTO UTF-8 explícito (file.text() decodifica UTF-8 y respeta el BOM si
  // existe) — leerlo como binario aquí rompía los acentos ("Teléfono" -> "TelÃ©fono"), lo que
  // a su vez rompía la detección automática de columnas. .xlsx/.xls sí son binarios reales.
  const esCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv';
  let libro: XLSX.WorkBook;
  try {
    if (esCsv) {
      const texto = await file.text();
      libro = XLSX.read(texto, { type: 'string' });
    } else {
      const buffer = await file.arrayBuffer();
      libro = XLSX.read(buffer, { type: 'array' });
    }
  } catch {
    throw new ArchivoInvalidoError('No pudimos leer ese archivo. Usa un Excel (.xlsx) o CSV válido.');
  }
  const nombreHoja = libro.SheetNames[0];
  if (!nombreHoja) {
    throw new ArchivoInvalidoError('El archivo no tiene ninguna hoja con datos.');
  }
  const hoja = libro.Sheets[nombreHoja];
  const matriz = XLSX.utils.sheet_to_json<string[]>(hoja, { header: 1, blankrows: false, defval: '' });
  if (matriz.length === 0) {
    throw new ArchivoInvalidoError('El archivo está vacío.');
  }
  const [encabezadosCrudos, ...filas] = matriz;
  const encabezados = (encabezadosCrudos ?? []).map((h) => String(h ?? '').trim());
  if (encabezados.filter(Boolean).length === 0) {
    throw new ArchivoInvalidoError('No encontramos encabezados de columna en la primera fila.');
  }
  if (filas.length === 0) {
    throw new ArchivoInvalidoError('El archivo solo tiene encabezados, sin filas de trabajadores.');
  }
  return {
    encabezados,
    filas: filas.map((fila) => encabezados.map((_, i) => String(fila[i] ?? '').trim())),
  };
}
