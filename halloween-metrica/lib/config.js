// Todo lo que se puede cambiar del concurso vive en este archivo.

// Horario (hora de Lima). La votación abre sola a esta hora.
export const APERTURA_ISO = '2026-10-29T11:00:00-05:00';
// Si nadie la cierra antes desde /admin, se cierra sola a esta hora.
export const CIERRE_ISO = '2026-10-29T23:59:00-05:00';
export const APERTURA_TEXTO = 'jueves 29 a las 11:00 a. m.';

// Solo se aceptan correos de estos dominios.
export const DOMINIOS = ['metrica.pe', 'metricaperu.com'];

export const AREAS = [
  { id: 'pr', nombre: 'Relaciones Públicas' },
  { id: 'digital', nombre: 'Digital' },
  { id: 'monadm', nombre: 'Monitoreo + Admi' },
];

const LISTAS = {
  pr: [
    'Lorenzo de la Lama', 'Alvaro Barclay', 'Jason Torres', 'Fabiola Narvaez', 'Valeria Arana',
    'Ariana Torres', 'Angela Rodríguez', 'Bryan Robles', 'Camila Sánchez', 'Alessia Aparcana',
    'Luciana Levaggi', 'Almendra Chávez', 'Arantza Marcial', 'Mia Herrera', 'Marcelo Tapia',
    'Maria Fe Camino', 'Ricardo Ramos', 'Enrique Chávez', 'Pablo Cateriano Bellido',
    'Pablo Cateriano Llosa', 'Ariana Molina', 'Michelle Levy',
  ],
  digital: [
    'Alexandra Tello', 'Carol Delgado', 'Diego Cadillo', 'Axel Mateo', 'Yessica Collantes',
    'Jorge Benites', 'Ariana Ccasani', 'Sabrina Acosta', 'Camila Amorin', 'Nickolas Schipper',
    'Kiara Chacón', 'Akemi Calderón', 'Martina Trelles', 'Sergio Saldaña',
  ],
  monadm: [
    'Francisco Puelles', 'Carlos Soto', 'Gianfranco Loayza', 'Rubén Coronado', 'Alberto Mayorga',
    'Jose Carlos Aguilar', 'Edwin Diego', 'Erika Pomacaja', 'Luis Sánchez Valencia',
    'Maria Cristina Apolinario', 'Paola Babilonia', 'Kassandra Murguia', 'Martin Mendoza', 'Katy',
  ],
};

export function normalizar(t) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
const slug = (t) => normalizar(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// { pr: [{ id, nombre, area }], ... } ordenado alfabéticamente
export const PERSONAS = Object.fromEntries(
  Object.entries(LISTAS).map(([area, nombres]) => [
    area,
    nombres
      .map((nombre) => ({ id: slug(nombre), nombre, area }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
  ]),
);

export const POR_ID = Object.fromEntries(Object.values(PERSONAS).flat().map((p) => [p.id, p]));
export const otrasAreas = (area) => AREAS.filter((a) => a.id !== area);
export const nombreArea = (id) => AREAS.find((a) => a.id === id)?.nombre ?? id;

export function correoValido(correo) {
  const m = /^[a-z0-9._%+-]+@([a-z0-9.-]+)$/i.exec((correo || '').trim());
  return !!m && DOMINIOS.includes(m[1].toLowerCase());
}

export function faseDe(modo, ahora = Date.now()) {
  if (modo === 'cerrada' || ahora >= Date.parse(CIERRE_ISO)) return 'cerrada';
  if (modo === 'abierta' || ahora >= Date.parse(APERTURA_ISO)) return 'abierta';
  return 'antes';
}
