import { faseDe } from '@/lib/config';
import { leerModo, leerRevelado, votantes } from '@/lib/store';
import { json, manejar } from '@/lib/api';

export const dynamic = 'force-dynamic';

export function GET() {
  return manejar(async () => {
    const [modo, v, revelado] = await Promise.all([leerModo(), votantes(), leerRevelado()]);
    const fase = faseDe(modo);
    return json({ fase, revelado: fase === 'cerrada' && revelado, yaVotaron: Object.keys(v) });
  });
}
