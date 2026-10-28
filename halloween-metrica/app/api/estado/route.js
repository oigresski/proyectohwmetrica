import { faseDe } from '@/lib/config';
import { leerModo, votantes } from '@/lib/store';
import { json, manejar } from '@/lib/api';

export const dynamic = 'force-dynamic';

export function GET() {
  return manejar(async () => {
    const [modo, v] = await Promise.all([leerModo(), votantes()]);
    return json({ fase: faseDe(modo), yaVotaron: Object.keys(v) });
  });
}
