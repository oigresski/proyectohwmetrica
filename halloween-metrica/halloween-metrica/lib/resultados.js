import { AREAS, PERSONAS } from './config';

export function armarResultados(conteo) {
  return AREAS.map((a) => {
    const lista = PERSONAS[a.id]
      .map((p) => ({ id: p.id, nombre: p.nombre, votos: conteo[a.id]?.[p.id] || 0 }))
      .filter((p) => p.votos > 0)
      .sort((x, y) => y.votos - x.votos || x.nombre.localeCompare(y.nombre, 'es'));
    const max = lista[0]?.votos || 0;
    return {
      area: a.id,
      nombre: a.nombre,
      total: lista.reduce((s, p) => s + p.votos, 0),
      ganadores: lista.filter((p) => p.votos === max && max > 0),
      podio: lista.slice(0, 5),
    };
  });
}
