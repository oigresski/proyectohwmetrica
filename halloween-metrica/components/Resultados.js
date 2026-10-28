'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Marca } from './Escena';
import { Calabaza, Gorro, Murcielago, Silueta } from './Dibujos';
import { crearSonido, DURACION_REDOBLE } from '@/lib/sonido';

// Pantalla para proyectar desde una laptop. Cada cartel de "SE BUSCA" se revela con un clic.
const ESTRELLAS = [
  [4, 10, 2], [11, 26, 1], [18, 6, 1], [26, 18, 2], [33, 4, 1], [41, 30, 1], [49, 12, 2], [56, 22, 1],
  [7, 42, 1], [23, 48, 1], [38, 44, 2], [62, 36, 1], [69, 8, 1], [77, 26, 2], [85, 14, 1], [92, 40, 1],
  [15, 58, 1], [47, 56, 1], [2, 30, 1], [66, 52, 1], [31, 36, 1], [97, 22, 2], [88, 54, 1], [53, 4, 1],
];
const COLORES = ['#f07a2a', '#ffb347', '#cdbdf2', '#9be37a', '#ffe8c2', '#8f5bd6'];
const GIROS = ['-2.2deg', '1.4deg', '-1deg'];

export default function Resultados() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [estados, setEstados] = useState({}); // área → 'redoble' | 'visto'
  const [musica, setMusica] = useState(false);
  const [completa, setCompleta] = useState(false);
  const [destello, setDestello] = useState(0);
  const sonido = useRef(null);
  const ocupado = useRef(false);

  const cargar = useCallback(async () => {
    try {
      const r = await fetch('/api/resultados', { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setDatos(j);
      setError('');
      if (!j.revelado) setEstados({});
    } catch (e) {
      setError(e.message || 'No se pudo conectar.');
    }
  }, []);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 5000);
    return () => clearInterval(t);
  }, [cargar]);

  useEffect(() => {
    const f = () => setCompleta(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);

  const audio = () => {
    try { return (sonido.current ??= crearSonido()); } catch { return null; }
  };

  function alternarMusica() {
    const s = audio();
    if (!s) return;
    if (s.sonando) { s.pararMusica(); setMusica(false); } else { s.musica(); setMusica(true); }
  }

  function pantallaCompleta() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  const revelar = useCallback((area) => {
    if (ocupado.current) return;
    ocupado.current = true;
    const s = audio();
    s?.redoble();
    setEstados((e) => ({ ...e, [area]: 'redoble' }));
    setTimeout(() => {
      s?.platillo();
      setEstados((e) => ({ ...e, [area]: 'visto' }));
      setDestello((n) => n + 1);
      ocupado.current = false;
    }, DURACION_REDOBLE * 1000);
  }, []);

  const revelado = datos?.revelado;
  const areas = revelado ? datos.areas : [];
  const todos = revelado && areas.every((a) => estados[a.area] === 'visto');

  // barra espaciadora / Enter / → revela el siguiente cartel
  useEffect(() => {
    const k = (e) => {
      if (!revelado || ![' ', 'Enter', 'ArrowRight'].includes(e.key)) return;
      if (e.target.closest?.('.pastilla')) return;
      e.preventDefault();
      const sig = areas.find((a) => !estados[a.area]);
      if (sig) revelar(sig.area);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [revelado, areas, estados, revelar]);

  return (
    <div className="show">
      <div className="cielo" aria-hidden="true">
        {ESTRELLAS.map(([x, y, s], i) => (
          <i key={i} className="estrella" style={{ left: `${x}%`, top: `${y}%`, width: s * 2, height: s * 2, animationDelay: `${(i % 7) * 0.6}s` }} />
        ))}
        <div className="luna" />
        <div className="nube nube-1" />
        <div className="nube nube-2" />
        <div className="vuelo vuelo-1"><Murcielago className="murcielago" /></div>
        <div className="vuelo vuelo-2"><Murcielago className="murcielago" /></div>
        <div className="vuelo vuelo-3"><Murcielago className="murcielago" /></div>
        <Silueta className="silueta" />
        <div className="niebla" />
      </div>
      {destello > 0 && <div key={destello} className="destello" aria-hidden="true" />}

      <header className="show-cab">
        <Marca />
        <h1 className="titulo show-titulo">{todos ? '¡Felicidades a los ganadores!' : 'Se buscan ganadores'}</h1>
        <p className="show-sub">Concurso de disfraces · Halloween 2026</p>
      </header>

      {!datos && !error && <p className="show-espera-txt">Revolviendo el caldero…</p>}
      {error && !datos && <p className="error show-espera-txt">{error}</p>}

      {datos && !revelado && (
        <section className="show-espera">
          <Calabaza className="show-cal" />
          <h2>Los ganadores se revelan en unos minutos</h2>
          <p>Esta pantalla se activa sola cuando la organización lo indique.</p>
          {!musica && <button className="btn" onClick={alternarMusica}>Encender música de misterio</button>}
        </section>
      )}

      {revelado && (
        <section className="carteles">
          {areas.map((a, i) => (
            <Cartel key={a.area} a={a} giro={GIROS[i % 3]} estado={estados[a.area]} onRevelar={() => revelar(a.area)} />
          ))}
        </section>
      )}

      <div className="show-controles">
        {revelado && !todos && <span className="show-ayuda">Clic en un cartel o barra espaciadora para revelar</span>}
        <button className="pastilla" onClick={alternarMusica} aria-pressed={musica}>
          <Icono tipo={musica ? 'son' : 'mudo'} /> {musica ? 'Música encendida' : 'Música apagada'}
        </button>
        <button className="pastilla" onClick={pantallaCompleta}>
          <Icono tipo="completa" /> {completa ? 'Salir de pantalla completa' : 'Pantalla completa'}
        </button>
      </div>
    </div>
  );
}

function Cartel({ a, giro, estado, onRevelar }) {
  const visto = estado === 'visto';
  const redoble = estado === 'redoble';
  return (
    <button
      type="button"
      className={`cartel${redoble ? ' en-redoble' : ''}${visto ? ' visto' : ''}`}
      style={{ '--giro': giro, '--dur': `${DURACION_REDOBLE}s` }}
      onClick={() => !estado && onRevelar()}
      aria-label={visto ? `${a.nombre}: ${a.ganador?.nombre ?? 'sin votos'}` : `Revelar ganador de ${a.nombre}`}
    >
      <i className="cartel-clavo" aria-hidden="true" />
      <span className="cartel-se">SE BUSCA</span>
      <span className="cartel-cat">al mejor disfraz de</span>
      <span className="cartel-area">{a.nombre}</span>

      <span className="cartel-foto">
        {!visto ? (
          <span className="cartel-misterio" aria-hidden="true">
            <Gorro className="cartel-gorro" />
            <span className="cartel-q">?</span>
          </span>
        ) : (
          <span className="cartel-ganador">
            <Gorro className="cartel-gorro-g" />
            <span className="cartel-nombre">{a.ganador?.nombre ?? 'Sin votos'}</span>
          </span>
        )}
      </span>

      <span className="cartel-pie">
        {visto && a.ganador ? (
          <>
            <strong>{a.ganador.votos} {a.ganador.votos === 1 ? 'voto' : 'votos'}</strong>
            {a.porDesempate && <em>Desempate del jurado</em>}
          </>
        ) : redoble ? (
          <strong className="cartel-tension">Buscando…</strong>
        ) : (
          <strong>Clic para revelar</strong>
        )}
      </span>

      {visto && a.ganador && <span className="sello" aria-hidden="true">¡Atrapado!</span>}
      {visto && <Chispas />}
    </button>
  );
}

function Chispas() {
  const [piezas] = useState(() =>
    Array.from({ length: 46 }, (_, i) => {
      const ang = Math.random() * Math.PI * 2;
      const dist = 140 + Math.random() * 260;
      return {
        x: `${Math.cos(ang) * dist}px`,
        y: `${Math.sin(ang) * dist - 80}px`,
        r: `${Math.random() * 720 - 360}deg`,
        c: COLORES[i % COLORES.length],
        d: `${0.9 + Math.random() * 0.9}s`,
        w: `${6 + Math.random() * 8}px`,
      };
    }),
  );
  return (
    <span className="chispas" aria-hidden="true">
      {piezas.map((p, i) => (
        <i key={i} style={{ '--x': p.x, '--y': p.y, '--r': p.r, '--c': p.c, '--d': p.d, '--w': p.w }} />
      ))}
    </span>
  );
}

function Icono({ tipo }) {
  const p = {
    son: 'M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z',
    mudo: 'M4 9v6h4l5 4V5L8 9H4zm12.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z',
    completa: 'M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm14 0h2v6h-6v-2h4v-4z',
  }[tipo];
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d={p} fill="currentColor" /></svg>;
}
