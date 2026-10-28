import { faseDe } from '@/lib/config';
import { conteos, leerDesempates, leerModo, leerRevelado } from '@/lib/store';
import { armarResultados, paraPublico } from '@/lib/resultados';
import { json, manejar } from '@/lib/api';

export const dynamic = 'force-dynamic';

// Los ganadores solo salen cuando la votación cerró Y el admin decidió revelarlos.
export function GET() {
  return manejar(async () => {
    const [modo, revelado] = await Promise.all([leerModo(), leerRevelado()]);
    const fase = faseDe(modo);
    if (fase !== 'cerrada' || !revelado) return json({ fase, revelado: false });
    const res = armarResultados(await conteos(), await leerDesempates());
    if (res.some((r) => r.pendiente)) return json({ fase, revelado: false });
    return json({ fase, revelado: true, areas: res.map(paraPublico) });
  });
}
