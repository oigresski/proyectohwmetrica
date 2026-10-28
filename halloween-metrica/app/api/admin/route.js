import { AREAS, PERSONAS, faseDe } from '@/lib/config';
import {
  conteos, fijarDesempate, fijarModo, fijarRevelado, hayBase,
  leerDesempates, leerModo, leerRevelado, reiniciar, votantes,
} from '@/lib/store';
import { armarResultados } from '@/lib/resultados';
import { json, manejar } from '@/lib/api';

export const dynamic = 'force-dynamic';

const CLAVE = process.env.ADMIN_CLAVE || (process.env.NODE_ENV !== 'production' ? 'prueba' : '');

async function resultadosActuales() {
  const [c, d] = await Promise.all([conteos(), leerDesempates()]);
  return armarResultados(c, d);
}

export function POST(req) {
  return manejar(async () => {
    const { clave, accion, confirmacion, area, id } = await req.json().catch(() => ({}));
    if (!CLAVE) return json({ error: 'Falta configurar ADMIN_CLAVE en Vercel.' }, 503);
    if (clave !== CLAVE) return json({ error: 'Clave incorrecta.' }, 401);

    if (accion === 'abrir') {
      await fijarModo('abierta');
      await fijarRevelado(false);
    } else if (accion === 'cerrar') {
      await fijarModo('cerrada'); // cierra la votación, pero NO muestra los ganadores
    } else if (accion === 'horario') {
      await fijarModo('auto');
      await fijarRevelado(false);
    } else if (accion === 'desempate') {
      const r = (await resultadosActuales()).find((x) => x.area === area);
      if (!r?.empate) return json({ error: 'En esa área no hay empate.' }, 400);
      if (!r.empatados.some((p) => p.id === id)) return json({ error: 'Esa persona no está en el empate.' }, 400);
      await fijarDesempate(area, id);
    } else if (accion === 'revelar') {
      if (faseDe(await leerModo()) !== 'cerrada') return json({ error: 'Primero cierra la votación.' }, 400);
      const pend = (await resultadosActuales()).filter((r) => r.pendiente);
      if (pend.length) return json({ error: `Falta elegir el desempate en ${pend.map((r) => r.nombre).join(' y ')}.` }, 400);
      await fijarRevelado(true);
    } else if (accion === 'ocultar') {
      await fijarRevelado(false);
    } else if (accion === 'reiniciar') {
      if (confirmacion !== 'BORRAR') return json({ error: 'Escribe BORRAR para confirmar.' }, 400);
      await reiniciar();
    }

    const [modo, v, revelado, resultados] = await Promise.all([leerModo(), votantes(), leerRevelado(), resultadosActuales()]);
    const fase = faseDe(modo);
    return json({
      fase,
      modo,
      revelado: fase === 'cerrada' && revelado,
      base: hayBase,
      total: Object.keys(v).length,
      resultados,
      areas: AREAS.map((a) => ({
        id: a.id,
        nombre: a.nombre,
        personas: PERSONAS[a.id].length,
        votaron: PERSONAS[a.id].filter((p) => v[p.id]).length,
        faltan: PERSONAS[a.id].filter((p) => !v[p.id]).map((p) => p.nombre),
      })),
    });
  });
}
