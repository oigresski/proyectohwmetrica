import { POR_ID, correoValido, faseDe, otrasAreas, DOMINIOS } from '@/lib/config';
import { leerModo, registrarVoto } from '@/lib/store';
import { json, manejar } from '@/lib/api';

export const dynamic = 'force-dynamic';

export function POST(req) {
  return manejar(async () => {
    const body = await req.json().catch(() => ({}));
    const fase = faseDe(await leerModo());
    if (fase === 'antes') return json({ error: 'La votación todavía no abre.' }, 403);
    if (fase === 'cerrada') return json({ error: 'La votación ya cerró.' }, 403);

    const yo = POR_ID[body.votante];
    if (!yo) return json({ error: 'Elige tu nombre de la lista.' }, 400);
    const correo = String(body.correo || '').trim().toLowerCase();
    if (!correoValido(correo)) {
      return json({ error: `Usa tu correo de Métrica (@${DOMINIOS.join(' o @')}).` }, 400);
    }

    const votos = {};
    for (const area of otrasAreas(yo.area)) {
      const c = POR_ID[body.votos?.[area.id]];
      if (!c || c.area !== area.id) return json({ error: `Falta tu voto para ${area.nombre}.` }, 400);
      votos[area.id] = c.id;
    }

    const r = await registrarVoto({
      votante: yo.id,
      correo,
      votos,
      registro: { area: yo.area, correo, votos, en: new Date().toISOString() },
    });
    if (r === 'NOMBRE') return json({ error: `${yo.nombre} ya votó. Si no fuiste tú, avísale a quien organiza.` }, 409);
    if (r === 'CORREO') return json({ error: 'Ese correo ya se usó para votar.' }, 409);
    return json({ ok: true });
  });
}
