import { SinBase } from './store';

export const json = (data, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

export async function manejar(fn) {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    if (e instanceof SinBase) return json({ error: e.message }, 503);
    return json({ error: 'Algo falló en el servidor. Vuelve a intentar en unos segundos.' }, 500);
  }
}
