import { faseDe } from '@/lib/config';
import { conteos, leerModo } from '@/lib/store';
import { armarResultados } from '@/lib/resultados';
import { json, manejar } from '@/lib/api';

export const dynamic = 'force-dynamic';

// Los resultados solo salen cuando la votación cerró.
export function GET() {
  return manejar(async () => {
    const fase = faseDe(await leerModo());
    if (fase !== 'cerrada') return json({ fase });
    return json({ fase, areas: armarResultados(await conteos()) });
  });
}
