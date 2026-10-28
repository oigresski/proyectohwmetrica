import { AREAS, PERSONAS } from './config';

// Resultado completo por área (para el admin).
// Si hay empate en el primer lugar, el ganador es el que eligió el admin en `desempates`.
export function armarResultados(conteo, desempates = {}) {
  return AREAS.map((a) => {
    const ranking = PERSONAS[a.id]
      .map((p) => ({ id: p.id, nombre: p.nombre, votos: conteo[a.id]?.[p.id] || 0 }))
      .filter((p) => p.votos > 0)
      .sort((x, y) => y.votos - x.votos || x.nombre.localeCompare(y.nombre, 'es'));
    const max = ranking[0]?.votos || 0;
    const empatados = ranking.filter((p) => p.votos === max && max > 0);
    const empate = empatados.length > 1;
    const elegido = empate ? empatados.find((p) => p.id === desempates[a.id]) || null : null;
    return {
      area: a.id,
      nombre: a.nombre,
      total: ranking.reduce((s, p) => s + p.votos, 0),
      ranking,
      empatados,
      empate,
      pendiente: empate && !elegido, // hay empate y el admin todavía no elige
      ganador: empate ? elegido : empatados[0] || null,
      porDesempate: empate && !!elegido,
    };
  });
}

// Lo único que ve el público: el ganador de cada área (sin el resto del ranking).
export function paraPublico(r) {
  return {
    area: r.area,
    nombre: r.nombre,
    total: r.total,
    porDesempate: r.porDesempate,
    ganador: r.ganador ? { nombre: r.ganador.nombre, votos: r.ganador.votos } : null,
  };
}
