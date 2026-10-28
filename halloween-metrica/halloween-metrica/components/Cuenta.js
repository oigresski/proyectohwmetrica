'use client';
import { useEffect, useState } from 'react';

const dos = (n) => String(n).padStart(2, '0');

export default function Cuenta({ hasta, alTerminar }) {
  const [ahora, setAhora] = useState(null);
  useEffect(() => {
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const falta = ahora === null ? null : Math.max(0, Date.parse(hasta) - ahora);
  useEffect(() => {
    if (falta === 0) alTerminar?.();
  }, [falta === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const s = falta === null ? 0 : Math.floor(falta / 1000);
  const partes = [
    [Math.floor(s / 3600), 'horas'],
    [Math.floor((s % 3600) / 60), 'min'],
    [s % 60, 'seg'],
  ];
  return (
    <div className="cuenta" role="timer" aria-live="off">
      {partes.map(([n, l]) => (
        <div key={l} className="cuenta-celda">
          <span className="cuenta-num">{falta === null ? '--' : dos(n)}</span>
          <span className="cuenta-lbl">{l}</span>
        </div>
      ))}
    </div>
  );
}
