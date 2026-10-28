import { AREAS, PERSONAS, faseDe } from '@/lib/config';
import { fijarModo, leerModo, reiniciar, votantes, hayBase } from '@/lib/store';
import { json, manejar } from '@/lib/api';

export const dynamic = 'force-dynamic';

const CLAVE = process.env.ADMIN_CLAVE || (process.env.NODE_ENV !== 'production' ? 'prueba' : '');

export function POST(req) {
  return manejar(async () => {
    const { clave, accion, confirmacion } = await req.json().catch(() => ({}));
    if (!CLAVE) return json({ error: 'Falta configurar ADMIN_CLAVE en Vercel.' }, 503);
    if (clave !== CLAVE) return json({ error: 'Clave incorrecta.' }, 401);

    if (accion === 'abrir') await fijarModo('abierta');
    else if (accion === 'cerrar') await fijarModo('cerrada');
    else if (accion === 'horario') await fijarModo('auto');
    else if (accion === 'reiniciar') {
      if (confirmacion !== 'BORRAR') return json({ error: 'Escribe BORRAR para confirmar.' }, 400);
      await reiniciar();
    }

    const [modo, v] = await Promise.all([leerModo(), votantes()]);
    return json({
      fase: faseDe(modo),
      modo,
      base: hayBase,
      total: Object.keys(v).length,
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
