'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Escena, { Marca } from './Escena';
import { Calabaza, Gorro, Telarana } from './Dibujos';

export default function Resultados() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [vistos, setVistos] = useState({});

  const cargar = useCallback(async () => {
    try {
      const r = await fetch('/api/resultados', { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setDatos(j);
      setError('');
    } catch (e) {
      setError(e.message || 'No se pudo conectar.');
    }
  }, []);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 10000);
    return () => clearInterval(t);
  }, [cargar]);

  const cerrada = datos?.fase === 'cerrada';
  const todos = cerrada && datos.areas.every((a) => vistos[a.area]);

  return (
    <main>
      <Escena chica>
        <Marca chica />
        <h1 className="titulo">Los ganadores</h1>
      </Escena>

      <section className="panel">
        <Telarana className="panel-tela" />
        {!datos && !error && <p className="cargando">Revolviendo el caldero…</p>}
        {error && <p className="error">{error}</p>}

        {datos && !cerrada && (
          <div className="centro">
            <Calabaza className="cal-grande" encendida={false} />
            <h2>Todavía no se revelan</h2>
            <p className="nota">Los ganadores aparecen aquí apenas cierre la votación. Esta página se actualiza sola.</p>
            <Link className="btn" href="/">Ir a votar</Link>
          </div>
        )}

        {cerrada && (
          <>
            <p className="nota centro-txt">Toca cada tarjeta para revelar al ganador.</p>
            <div className="tarjetas">
              {datos.areas.map((a) => (
                <Tarjeta key={a.area} a={a} visto={!!vistos[a.area]} onRevelar={() => setVistos((v) => ({ ...v, [a.area]: true }))} />
              ))}
            </div>
            {!todos && (
              <button
                className="btn-texto"
                onClick={() => setVistos(Object.fromEntries(datos.areas.map((a) => [a.area, true])))}
              >
                Revelar todos
              </button>
            )}
          </>
        )}
      </section>
      <footer className="pie"><Link href="/">Inicio</Link></footer>
    </main>
  );
}

function Tarjeta({ a, visto, onRevelar }) {
  const empate = a.ganadores.length > 1;
  return (
    <button type="button" className={`tarjeta${visto ? ' volteada' : ''}`} onClick={onRevelar} aria-label={visto ? undefined : `Revelar ganador de ${a.nombre}`}>
      <div className="tarjeta-in">
        <div className="cara cara-frente">
          <span className="cara-area">{a.nombre}</span>
          <Calabaza className="cara-cal" />
          <span className="cara-accion">Toca para revelar</span>
        </div>
        <div className="cara cara-dorso">
          <span className="cara-area">{a.nombre}</span>
          {a.ganadores.length === 0 ? (
            <p className="ganador">Sin votos</p>
          ) : (
            <>
              <Gorro className="ganador-gorro" />
              {a.ganadores.map((g) => <p key={g.id} className="ganador">{g.nombre}</p>)}
              <p className="ganador-votos">
                {empate ? 'Empate con ' : ''}{a.ganadores[0].votos} {a.ganadores[0].votos === 1 ? 'voto' : 'votos'} de {a.total}
              </p>
              {a.podio.length > a.ganadores.length && (
                <ol className="podio">
                  {a.podio.slice(a.ganadores.length, a.ganadores.length + 3).map((p) => (
                    <li key={p.id}><span>{p.nombre}</span><span>{p.votos}</span></li>
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  );
}
