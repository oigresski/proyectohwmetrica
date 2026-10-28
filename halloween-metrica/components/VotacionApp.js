'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Escena, { Marca } from './Escena';
import Cuenta from './Cuenta';
import { Arana, Calabaza, Telarana } from './Dibujos';
import {
  AREAS, PERSONAS, POR_ID, APERTURA_ISO, APERTURA_TEXTO,
  normalizar, otrasAreas, nombreArea,
} from '@/lib/config';

const LS = 'hw26-voto';

function Buscador({ valor, onChange, placeholder }) {
  return (
    <input
      className="buscador"
      type="search"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      enterKeyHint="search"
    />
  );
}

function Nombres({ personas, elegido, onElegir, bloqueados = [], etiquetaBloqueado }) {
  const [q, setQ] = useState('');
  const visibles = useMemo(() => {
    const n = normalizar(q);
    return n ? personas.filter((p) => normalizar(p.nombre).includes(n)) : personas;
  }, [q, personas]);
  return (
    <>
      {personas.length > 10 && <Buscador valor={q} onChange={setQ} placeholder="Busca un nombre" />}
      <div className="nombres" role="radiogroup">
        {visibles.map((p) => {
          const bloqueado = bloqueados.includes(p.id);
          const activo = elegido === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={activo}
              disabled={bloqueado}
              className={`nombre${activo ? ' activo' : ''}`}
              onClick={() => onElegir(p.id)}
            >
              {activo && <Calabaza className="nombre-cal" />}
              <span>{p.nombre}</span>
              {bloqueado && <small>{etiquetaBloqueado}</small>}
            </button>
          );
        })}
        {visibles.length === 0 && <p className="vacio">No hay nadie con ese nombre en esta lista.</p>}
      </div>
    </>
  );
}

export default function VotacionApp() {
  const [estado, setEstado] = useState(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [previo, setPrevio] = useState(null);
  const [paso, setPaso] = useState('registro');
  const [area, setArea] = useState(null);
  const [yo, setYo] = useState(null);
  const [votos, setVotos] = useState({});
  const [confirmar, setConfirmar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      const r = await fetch('/api/estado', { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setEstado(j);
      setErrorCarga('');
    } catch (e) {
      setErrorCarga(e.message || 'No se pudo conectar. Revisa tu internet.');
    }
  }, []);

  useEffect(() => {
    try {
      const v = localStorage.getItem(LS);
      if (v) setPrevio(JSON.parse(v));
    } catch {}
    cargar();
    const t = setInterval(cargar, 20000);
    return () => clearInterval(t);
  }, [cargar]);

  useEffect(() => {
    window.scrollTo({ top: paso === 'registro' ? 0 : document.getElementById('panel')?.offsetTop - 12 || 0, behavior: 'smooth' });
  }, [paso]);

  const ya = estado?.yaVotaron ?? [];
  const otras = area ? otrasAreas(area) : [];
  const completos = otras.every((a) => votos[a.id]);

  async function enviar() {
    setEnviando(true);
    setError('');
    try {
      const r = await fetch('/api/votar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votante: yo, votos }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      const registro = { votante: yo, votos };
      try { localStorage.setItem(LS, JSON.stringify(registro)); } catch {}
      setPrevio(registro);
      setPaso('listo');
      cargar();
    } catch (e) {
      setError(e.message || 'No se pudo enviar. Vuelve a intentar.');
    } finally {
      setEnviando(false);
      setConfirmar(false);
    }
  }

  let contenido;
  if (!estado && !errorCarga) {
    contenido = <p className="cargando">Encendiendo las velas…</p>;
  } else if (!estado && errorCarga) {
    contenido = (
      <div className="aviso">
        <p>{errorCarga}</p>
        <button className="btn" onClick={cargar}>Reintentar</button>
      </div>
    );
  } else if (estado.fase === 'antes') {
    contenido = (
      <div className="centro">
        <h2>La votación abre el {APERTURA_TEXTO}</h2>
        <Cuenta hasta={APERTURA_ISO} alTerminar={cargar} />
        <p className="nota">Ven disfrazado. Al abrir, eliges al mejor disfraz de las otras dos áreas.</p>
        <Reglas />
      </div>
    );
  } else if (estado.fase === 'cerrada') {
    contenido = (
      <div className="centro">
        <Calabaza className="cal-grande" />
        <h2>La votación cerró</h2>
        {estado.revelado ? (
          <>
            <p className="nota">Ya se conocen los tres ganadores.</p>
            <Link className="btn" href="/resultados">Ver ganadores</Link>
          </>
        ) : (
          <p className="nota">Gracias por votar. Los ganadores se revelan en vivo, en la pantalla grande.</p>
        )}
      </div>
    );
  } else if (previo || paso === 'listo') {
    const v = previo?.votos || votos;
    contenido = (
      <div className="centro">
        <Calabaza className="cal-grande cal-viva" />
        <h2>¡Voto enviado!</h2>
        <p className="nota">Tu voto ya está en el caldero. Los ganadores se revelan al cierre.</p>
        <ul className="resumen">
          {Object.entries(v).map(([a, id]) => (
            <li key={a}><span>{nombreArea(a)}</span><strong>{POR_ID[id]?.nombre}</strong></li>
          ))}
        </ul>
      </div>
    );
  } else if (paso === 'registro') {
    contenido = (
      <>
        <h2>¿Desde dónde votas?</h2>
        <p className="nota">Elige tu área y tu nombre. Solo se vota una vez.</p>
        <div className="areas" role="radiogroup" aria-label="Área desde la que votas">
          {AREAS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={area === a.id}
              className={`area${area === a.id ? ' activo' : ''}`}
              onClick={() => { setArea(a.id); setYo(null); setVotos({}); }}
            >
              {a.nombre}
            </button>
          ))}
        </div>
        {area && (
          <div className="bloque" key={area}>
            <h3>Tu nombre</h3>
            <Nombres
              personas={PERSONAS[area]}
              elegido={yo}
              onElegir={setYo}
              bloqueados={ya}
              etiquetaBloqueado="ya votó"
            />
          </div>
        )}
        <div className="barra">
          <button className="btn btn-full" disabled={!yo} onClick={() => setPaso('votar')}>
            Continuar a votar
          </button>
        </div>
      </>
    );
  } else {
    contenido = (
      <>
        <button className="volver" onClick={() => setPaso('registro')}>‹ Cambiar mis datos</button>
        <h2>Hola, {POR_ID[yo]?.nombre.split(' ')[0]}</h2>
        <p className="nota">Elige al mejor disfraz de cada área. No puedes votar por {nombreArea(area)}.</p>
        {otras.map((a, i) => (
          <section className="bloque" key={a.id} id={`sec-${i}`}>
            <h3>
              <span className="paso-n">{i + 1}</span>
              Mejor disfraz de {a.nombre}
            </h3>
            <Nombres
              personas={PERSONAS[a.id]}
              elegido={votos[a.id]}
              onElegir={(id) => {
                setVotos((v) => ({ ...v, [a.id]: id }));
                // al elegir el primero, baja sola a la segunda lista
                if (i === 0 && !votos[otras[1].id]) {
                  setTimeout(() => document.getElementById('sec-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
                }
              }}
            />
          </section>
        ))}
        {error && <p className="error">{error}</p>}
        <div className="barra barra-fija">
          <button className="btn btn-full" disabled={!completos} onClick={() => setConfirmar(true)}>
            {completos ? 'Enviar mis votos' : `Elige ${otras.filter((a) => !votos[a.id]).length === 2 ? 'tus dos votos' : 'tu otro voto'}`}
          </button>
        </div>
      </>
    );
  }

  return (
    <main>
      <Escena>
        <Marca />
        <h1 className="titulo">Concurso de disfraces</h1>
        <p className="subtitulo">Halloween 2026. Un ganador por área, elegido por las otras dos.</p>
      </Escena>

      <section id="panel" className="panel">
        <Telarana className="panel-tela" />
        <Arana className="panel-arana" />
        {contenido}
      </section>

      <footer className="pie">
        <Link href="/resultados">Ganadores</Link>
      </footer>

      {confirmar && (
        <div className="velo" onClick={() => !enviando && setConfirmar(false)}>
          <div className="hoja" role="dialog" aria-modal="true" aria-labelledby="conf-t" onClick={(e) => e.stopPropagation()}>
            <h2 id="conf-t">¿Envías estos votos?</h2>
            <ul className="resumen">
              {otras.map((a) => (
                <li key={a.id}><span>{a.nombre}</span><strong>{POR_ID[votos[a.id]]?.nombre}</strong></li>
              ))}
            </ul>
            <p className="nota">Después no se pueden cambiar.</p>
            <button className="btn btn-full" disabled={enviando} onClick={enviar}>
              {enviando ? 'Enviando…' : 'Sí, enviar mis votos'}
            </button>
            <button className="btn-texto" disabled={enviando} onClick={() => setConfirmar(false)}>Revisar otra vez</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Reglas() {
  return (
    <ul className="reglas">
      {AREAS.map((a) => (
        <li key={a.id}>
          <strong>{a.nombre}</strong>
          <span>vota por {otrasAreas(a.id).map((o) => o.nombre).join(' y ')}</span>
        </li>
      ))}
    </ul>
  );
}
