'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Marca } from './Escena';
import { APERTURA_TEXTO } from '@/lib/config';

const FASES = { antes: 'Aún no abre', abierta: 'Abierta', cerrada: 'Cerrada: ganadores revelados' };
const MODOS = { auto: `Sigue el horario (abre el ${APERTURA_TEXTO})`, abierta: 'Abierta a mano', cerrada: 'Cerrada a mano' };

export default function Admin() {
  const [clave, setClave] = useState('');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [borrar, setBorrar] = useState('');

  async function accion(acc, extra = {}) {
    setOcupado(true);
    setError('');
    try {
      const r = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave, accion: acc, ...extra }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setDatos(j);
      setBorrar('');
    } catch (e) {
      setError(e.message);
    } finally {
      setOcupado(false);
    }
  }

  const confirmar = (texto, acc) => () => { if (window.confirm(texto)) accion(acc); };

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
              <span className="nota">Estado</span>
              <strong className={`fase fase-${datos.fase}`}>{FASES[datos.fase]}</strong>
              <span className="nota">{MODOS[datos.modo]}</span>
            </div>
            <button className="btn-texto" onClick={() => accion('ver')} disabled={ocupado}>Actualizar</button>
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

          <div className="acciones">
            {datos.fase !== 'cerrada' && (
              <button className="btn btn-full" disabled={ocupado} onClick={confirmar('¿Cerrar la votación y revelar a los ganadores? Todos podrán verlos.', 'cerrar')}>
                Cerrar votación y revelar ganadores
              </button>
            )}
            {datos.fase !== 'abierta' && (
              <button className="btn btn-sec btn-full" disabled={ocupado} onClick={confirmar('¿Abrir la votación ahora?', 'abrir')}>
                {datos.fase === 'cerrada' ? 'Reabrir votación' : 'Abrir ahora'}
              </button>
            )}
            {datos.modo !== 'auto' && (
              <button className="btn-texto" disabled={ocupado} onClick={() => accion('horario')}>
                Volver al horario automático
              </button>
            )}
            <Link className="btn-texto" href="/resultados">Ver página de ganadores</Link>
          </div>

          <details className="peligro">
            <summary>Borrar todos los votos (para pruebas)</summary>
            <p className="nota">Borra todos los votos y vuelve al horario automático. No se puede deshacer. Escribe BORRAR para confirmar.</p>
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
