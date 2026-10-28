// Guarda los votos en Upstash Redis (se conecta desde Vercel → Storage).
// Sin base conectada y fuera de producción, usa memoria para poder probar en local.
import { AREAS } from './config';

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const hayBase = !!(URL_ && TOKEN);
const enMemoria = !hayBase && process.env.NODE_ENV !== 'production' || process.env.HW_MEMORIA === '1';

const K = {
  votantes: 'hw26:votantes', // hash: id del votante → JSON del voto
  correos: 'hw26:correos', //   (ya no se usa; se mantiene para que «Borrar votos» limpie datos antiguos)
  modo: 'hw26:modo', //         auto | abierta | cerrada
  conteo: (a) => `hw26:conteo:${a}`, // hash: id del candidato → votos
  revelado: 'hw26:revelado', // '1' cuando el admin muestra los ganadores
  desempate: 'hw26:desempate', // hash: área → id elegido por el admin si hay empate
};

const LUA = `
if redis.call('HEXISTS', KEYS[1], ARGV[1]) == 1 then return 'NOMBRE' end
redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
redis.call('HINCRBY', KEYS[2], ARGV[3], 1)
redis.call('HINCRBY', KEYS[3], ARGV[4], 1)
return 'OK'`;

export class SinBase extends Error {}

async function cmd(c) {
  if (!hayBase) throw new SinBase('Falta conectar la base de votos (Upstash Redis) en Vercel.');
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(c),
    cache: 'no-store',
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

const aObjeto = (res) => {
  if (!res) return {};
  if (!Array.isArray(res)) return res;
  const o = {};
  for (let i = 0; i < res.length; i += 2) o[res[i]] = res[i + 1];
  return o;
};

// ---------- memoria (solo para probar en local)
const mem = (globalThis.__hw26 ??= {
  votantes: new Map(), correos: new Map(), modo: 'auto', revelado: false, desempate: {},
  conteo: Object.fromEntries(AREAS.map((a) => [a.id, new Map()])),
});

export async function leerModo() {
  if (enMemoria) return mem.modo;
  return (await cmd(['GET', K.modo])) || 'auto';
}

export async function fijarModo(modo) {
  if (enMemoria) { mem.modo = modo; return; }
  await cmd(['SET', K.modo, modo]);
}

export async function leerRevelado() {
  if (enMemoria) return !!mem.revelado;
  return (await cmd(['GET', K.revelado])) === '1';
}

export async function fijarRevelado(si) {
  if (enMemoria) { mem.revelado = !!si; return; }
  await cmd(si ? ['SET', K.revelado, '1'] : ['DEL', K.revelado]);
}

export async function leerDesempates() {
  if (enMemoria) return { ...(mem.desempate || {}) };
  return aObjeto(await cmd(['HGETALL', K.desempate]));
}

export async function fijarDesempate(area, id) {
  if (enMemoria) { (mem.desempate ??= {})[area] = id; return; }
  await cmd(['HSET', K.desempate, area, id]);
}

export async function votantes() {
  if (enMemoria) return Object.fromEntries([...mem.votantes].map(([k, v]) => [k, JSON.parse(v)]));
  const o = aObjeto(await cmd(['HGETALL', K.votantes]));
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, JSON.parse(v)]));
}

// Devuelve 'OK' o 'NOMBRE' (esa persona ya votó)
export async function registrarVoto({ votante, registro, votos }) {
  const [a, b] = Object.entries(votos);
  if (enMemoria) {
    if (mem.votantes.has(votante)) return 'NOMBRE';
    mem.votantes.set(votante, JSON.stringify(registro));
    for (const [area, cand] of [a, b]) mem.conteo[area].set(cand, (mem.conteo[area].get(cand) || 0) + 1);
    return 'OK';
  }
  return cmd(['EVAL', LUA, '3', K.votantes, K.conteo(a[0]), K.conteo(b[0]),
    votante, JSON.stringify(registro), a[1], b[1]]);
}

export async function conteos() {
  const out = {};
  for (const { id } of AREAS) {
    if (enMemoria) out[id] = Object.fromEntries(mem.conteo[id]);
    else out[id] = Object.fromEntries(Object.entries(aObjeto(await cmd(['HGETALL', K.conteo(id)]))).map(([k, v]) => [k, Number(v)]));
  }
  return out;
}

export async function reiniciar() {
  if (enMemoria) {
    mem.votantes.clear(); mem.correos.clear(); mem.modo = 'auto'; mem.revelado = false; mem.desempate = {};
    for (const m of Object.values(mem.conteo)) m.clear();
    return;
  }
  await cmd(['DEL', K.votantes, K.correos, K.modo, K.revelado, K.desempate, ...AREAS.map((a) => K.conteo(a.id))]);
}
