// Datos semilla del onboarding — nombres y oficios realistas de construcción peruana.
// Se usan para simular "importar cuadrilla" (32: nunca enseñar la app vacía) y para que
// el buscador del paso 4 muestre un resultado creíble. NO son datos reales de ningún
// trabajador — son datos de demostración para que Carlos sienta el mecanismo funcionando.

// El oficio es texto libre (cada empresa tiene sus propios rubros) — OFICIOS es solo la
// lista de SUGERENCIAS que se ofrecen primero; el usuario siempre puede escribir uno propio
// (ver AgregarTrabajadorSheet/ImportarTrabajadoresSheet: chips de sugerencia + campo "Otro").
export type Oficio = string;

export interface TrabajadorSemilla {
  id: string;
  nombre: string;
  oficio: Oficio;
  obrasJuntos: number;
  disponibleManana: boolean;
}

export const OFICIOS: Oficio[] = [
  'Albañil',
  'Electricista',
  'Gasfitero',
  'Pintor',
  'Carpintero',
  'Soldador',
  'Techista',
  'Fierrero',
  'Encofrador',
  'Operario',
  'Ayudante',
];

export const CUADRILLA_SEMILLA: TrabajadorSemilla[] = [
  { id: 'w1', nombre: 'Jhonny Quispe', oficio: 'Albañil', obrasJuntos: 14, disponibleManana: true },
  { id: 'w2', nombre: 'Rember Huamán', oficio: 'Albañil', obrasJuntos: 9, disponibleManana: true },
  { id: 'w3', nombre: 'Elmer Torres', oficio: 'Albañil', obrasJuntos: 3, disponibleManana: false },
  { id: 'w4', nombre: 'Yeison Palomino', oficio: 'Electricista', obrasJuntos: 11, disponibleManana: true },
  { id: 'w5', nombre: 'Wilder Ccorimanya', oficio: 'Electricista', obrasJuntos: 2, disponibleManana: false },
  { id: 'w6', nombre: 'Marco Injante', oficio: 'Gasfitero', obrasJuntos: 8, disponibleManana: true },
  { id: 'w7', nombre: 'Percy Ñahui', oficio: 'Gasfitero', obrasJuntos: 5, disponibleManana: false },
  { id: 'w8', nombre: 'Deyvis Rojas', oficio: 'Pintor', obrasJuntos: 6, disponibleManana: true },
  { id: 'w9', nombre: 'Alex Curasi', oficio: 'Pintor', obrasJuntos: 1, disponibleManana: true },
  { id: 'w10', nombre: 'Ronald Camayo', oficio: 'Carpintero', obrasJuntos: 10, disponibleManana: false },
  { id: 'w11', nombre: 'Edilberto Salas', oficio: 'Carpintero', obrasJuntos: 4, disponibleManana: true },
  { id: 'w12', nombre: 'Jorge Chuquillanqui', oficio: 'Albañil', obrasJuntos: 7, disponibleManana: true },
];
