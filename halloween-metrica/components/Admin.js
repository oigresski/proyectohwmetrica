'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Marca } from './Escena';
import { APERTURA_TEXTO } from '@/lib/config';

const FASES = { antes: 'Aún no abre', abierta: 'Abierta', cerrada: 'Cerrada' };
const MODOS = { auto: `Sigue el horario (abre el ${APERTURA_TEXTO})`, abierta: 'Abierta a mano', cerrada: 'Cerrada a mano' };

export default function Admin() {
  const [clave, setClave] = useState('');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [borrar, setBorrar] = useState('');
  const claveRef = useRef('');
  claveRef.current = clave;

  const pedir = useCallback(async (acc, extra = {}) => {
    const r = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave: claveRef.current, accion: acc, ...extra }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error);
    return j;
  }, []);

  async function accion(acc, extra = {}) {
    setOcupado(true);
    setError('');
    try {
      setDatos(await pedir(acc, extra));
      setBorrar('');
    } catch (e) {
      setError(e.message);
    } finally {
      setOcupado(false);
    }
  }

  // Se actualiza sola cada 15 segundos mientras estás dentro.
  const dentro = !!datos;
  useEffect(() => {
    if (!dentro) return;
    const t = setInterval(() => { pedir('ver').then(setDatos).catch(() => {}); }, 15000);
    return () => clearInterval(t);
  }, [dentro, pedir]);

  const confirmar = (texto, acc) => () => { if (window.confirm(texto)) accion(acc); };
  const pendientes = datos?.resultados?.filter((r) => r.pendiente) ?? [];

  return (
    <main className="admin">
      <header className="admin-cab">
        <Marca chica />
        <h1>Control del concurso</h1>
      </header>

      {!datos ? (
        <form className="panel" onSubmit={(e) => { e.preventDefault(); accion('ver'); }}>
          <label className="campo">
            <span>Clave de organización</span>
            <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="current-password" />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-full" disabled={!clave || ocupado}>Entrar</button>
        </form>
      ) : (
        <div className="panel">
          <div className="estado-fila">
            <div>
              <span className="nota">Votación</span>
              <strong className={`fase fase-${datos.fase}`}>{FASES[datos.fase]}</strong>
              <span className="nota">{MODOS[datos.modo]}</span>
            </div>
            <div className="estado-der">
              <span className="nota">Pantalla de ganadores</span>
              <strong className={`fase ${datos.revelado ? 'fase-abierta' : ''}`}>{datos.revelado ? 'Visible para todos' : 'Oculta'}</strong>
              <button className="btn-texto" onClick={() => accion('ver')} disabled={ocupado}>Actualizar</button>
            </div>
          </div>
          {!datos.base && <p className="error">Modo de prueba: los votos se guardan solo en memoria. Conecta Upstash Redis en Vercel.</p>}

          <h2>{datos.total} {datos.total === 1 ? 'persona votó' : 'personas votaron'}</h2>
          {datos.areas.map((a) => (
            <details key={a.id} className="part">
              <summary>
                <span>{a.nombre}</span>
                <span>{a.votaron} de {a.personas}</span>
                <i className="part-barra"><b style={{ width: `${(a.votaron / a.personas) * 100}%` }} /></i>
              </summary>
              <p className="nota">Falta votar: {a.faltan.length ? a.faltan.join(', ') : 'nadie'}</p>
            </details>
          ))}

          {/* ---------- Vista previa privada */}
          <section className="previa">
            <h2>Resultados <small>solo los ves tú</small></h2>
            <p className="nota">
              {datos.fase === 'cerrada'
                ? 'Revisa los resultados. Si hay un empate, elige al ganador antes de revelar.'
                : 'Los números cambian mientras la votación siga abierta. Puedes revisar, pero elige el desempate al final.'}
            </p>
            {datos.resultados.map((r) => (
              <PreviaArea key={r.area} r={r} ocupado={ocupado} onElegir={(id) => accion('desempate', { area: r.area, id })} />
            ))}
          </section>

          <div className="acciones">
            {datos.fase !== 'cerrada' && (
              <button className="btn btn-full" disabled={ocupado} onClick={confirmar('¿Cerrar la votación? Nadie más podrá votar. Los ganadores todavía NO se muestran: eso lo haces después.', 'cerrar')}>
                1. Cerrar votación
              </button>
            )}
            {datos.fase === 'cerrada' && !datos.revelado && (
              <>
                <button
                  className="btn btn-full"
                  disabled={ocupado || pendientes.length > 0}
                  onClick={confirmar('¿Revelar a los ganadores? La pantalla de ganadores se activa para todos.', 'revelar')}
                >
                  2. Revelar ganadores en la pantalla
                </button>
                {pendientes.length > 0 && (
                  <p className="nota centro-txt aviso-empate">Primero elige el desempate en {pendientes.map((r) => r.nombre).join(' y ')}.</p>
                )}
              </>
            )}
            {datos.revelado && (
              <button className="btn btn-sec btn-full" disabled={ocupado} onClick={() => accion('ocultar')}>
                Ocultar ganadores otra vez
              </button>
            )}
            {datos.fase !== 'abierta' && (
              <button className="btn btn-sec btn-full" disabled={ocupado} onClick={confirmar('¿Abrir la votación ahora? Si los ganadores estaban visibles, se ocultan.', 'abrir')}>
                {datos.fase === 'cerrada' ? 'Reabrir votación' : 'Abrir ahora'}
              </button>
            )}
            {datos.modo !== 'auto' && (
              <button className="btn-texto" disabled={ocupado} onClick={() => accion('horario')}>
                Volver al horario automático
              </button>
            )}
            <Link className="btn-texto" href="/resultados" target="_blank">Abrir pantalla de ganadores (para proyectar)</Link>
          </div>

          <details className="peligro">
            <summary>Borrar todos los votos (para pruebas)</summary>
            <p className="nota">Borra todos los votos, los desempates y vuelve al horario automático. No se puede deshacer. Escribe BORRAR para confirmar.</p>
            <input className="buscador" value={borrar} onChange={(e) => setBorrar(e.target.value)} placeholder="BORRAR" autoCapitalize="characters" />
            <button className="btn btn-peligro btn-full" disabled={borrar !== 'BORRAR' || ocupado} onClick={() => accion('reiniciar', { confirmacion: 'BORRAR' })}>
              Borrar todos los votos
            </button>
          </details>
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </main>
  );
}

function PreviaArea({ r, ocupado, onElegir }) {
  const max = r.ranking[0]?.votos || 1;
  return (
    <div className={`previa-area${r.pendiente ? ' con-empate' : ''}`}>
      <div className="previa-cab">
        <strong>{r.nombre}</strong>
        <span className="nota">{r.total} {r.total === 1 ? 'voto' : 'votos'}</span>
      </div>

      {r.ranking.length === 0 && <p className="nota">Todavía sin votos.</p>}

      {r.empate && (
        <div className="empate">
          <p className="empate-tit">
            {r.pendiente ? '⚠ Empate' : '✓ Empate resuelto'} a {r.empatados[0].votos} {r.empatados[0].votos === 1 ? 'voto' : 'votos'}
          </p>
          <p className="nota">{r.pendiente ? '¿Quién gana? Toca un nombre.' : 'Puedes cambiar tu elección antes de revelar.'}</p>
          <div className="empate-opciones">
            {r.empatados.map((p) => {
              const activo = r.ganador?.id === p.id;
              return (
                <button key={p.id} type="button" className={`nombre${activo ? ' activo' : ''}`} disabled={ocupado} onClick={() => !activo && onElegir(p.id)}>
                  <span>{p.nombre}</span>
                  {activo && <small>Ganador elegido</small>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {r.ganador && !r.empate && (
        <p className="previa-gana">Ganador: <strong>{r.ganador.nombre}</strong></p>
      )}

      {r.ranking.length > 0 && (
        <ol className="ranking">
          {r.ranking.slice(0, 6).map((p) => (
            <li key={p.id} className={r.ganador?.id === p.id ? 'top' : ''}>
              <span className="ranking-nom">{p.nombre}</span>
              <i className="ranking-barra"><b style={{ width: `${(p.votos / max) * 100}%` }} /></i>
              <span className="ranking-n">{p.votos}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
