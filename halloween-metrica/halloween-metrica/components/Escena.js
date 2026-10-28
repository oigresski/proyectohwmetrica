import { Gorro, Murcielago, Silueta } from './Dibujos';

// Posiciones fijas para que el servidor y el navegador dibujen lo mismo.
const ESTRELLAS = [
  [6, 12, 2], [14, 30, 1], [22, 8, 1], [31, 22, 2], [40, 6, 1], [48, 34, 1], [57, 14, 2],
  [9, 46, 1], [27, 52, 1], [44, 48, 2], [63, 40, 1], [72, 9, 1], [80, 30, 2], [88, 18, 1],
  [94, 44, 1], [18, 62, 1], [52, 60, 1], [3, 28, 1], [68, 56, 1], [36, 38, 1],
];

export function Marca({ chica = false }) {
  return (
    <div className={`marca${chica ? ' marca-chica' : ''}`} aria-label="Métrica">
      <Gorro className="marca-gorro" />
      <img className="marca-logo" src="/logo-metrica.png" alt="Métrica" width="697" height="214" />
    </div>
  );
}

export default function Escena({ children, chica = false }) {
  return (
    <header className={`escena${chica ? ' escena-chica' : ''}`}>
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
      <div className="escena-contenido">{children}</div>
    </header>
  );
}
