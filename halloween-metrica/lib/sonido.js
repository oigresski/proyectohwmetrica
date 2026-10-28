// Sonido de la ceremonia, generado en el navegador (Web Audio). No usa archivos de audio.
// - musica(): ambiente de misterio, suave (dron grave, viento y una cajita musical en re menor).
// - redoble(): redoble de tambor que va creciendo.
// - platillo(): golpe de platillo + bombo + acorde de "¡ta-dá!".

export const DURACION_REDOBLE = 3.4; // segundos

const nota = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function crearSonido() {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();

  const salida = ctx.createDynamicsCompressor();
  salida.threshold.value = -14;
  salida.ratio.value = 4;
  salida.connect(ctx.destination);

  // reverberación de "salón embrujado"
  const reverb = ctx.createConvolver();
  reverb.buffer = impulso(ctx, 3.8, 2.6);
  const reverbVol = ctx.createGain();
  reverbVol.gain.value = 0.5;
  reverb.connect(reverbVol).connect(salida);

  const busMusica = ctx.createGain();
  busMusica.gain.value = 0;
  busMusica.connect(salida);
  const envioMusica = ctx.createGain();
  envioMusica.gain.value = 0.7;
  busMusica.connect(envioMusica).connect(reverb);

  const busFx = ctx.createGain();
  busFx.gain.value = 0.9;
  busFx.connect(salida);
  const envioFx = ctx.createGain();
  envioFx.gain.value = 0.3;
  busFx.connect(envioFx).connect(reverb);

  const ruido = crearRuido(ctx);
  const VOL_MUSICA = 0.5;

  let fuentes = [];
  let reloj = null;
  let sonando = false;

  // ---------- música de misterio
  const MELODIA = [
    // [semitono MIDI o null, duración en corcheas]
    [62, 1], [65, 1], [69, 1], [74, 2], [73, 1], [69, 2],
    [null, 2], [70, 1], [69, 1], [65, 1], [64, 2], [61, 2],
    [62, 1], [65, 1], [69, 1], [72, 1], [70, 2], [69, 1], [67, 1],
    [65, 2], [64, 1], [62, 3], [null, 4],
  ];
  const CORCHEA = 0.36;

  function cajita(t, f, vol = 0.05) {
    for (const [mult, v, dec] of [[1, 1, 1.6], [2, 0.25, 0.7], [3.01, 0.12, 0.4]]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * mult;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol * v, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      o.connect(g).connect(busMusica);
      o.start(t);
      o.stop(t + dec + 0.05);
    }
  }

  function campana(t) {
    const base = nota(50);
    for (const [mult, v] of [[1, 1], [2.76, 0.45], [5.4, 0.2]]) {
      const o = ctx.createOscillator();
      o.frequency.value = base * mult;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06 * v, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 5);
      o.connect(g).connect(busMusica);
      o.start(t);
      o.stop(t + 5.1);
    }
  }

  function musica() {
    ctx.resume();
    if (sonando) return;
    sonando = true;
    const t0 = ctx.currentTime + 0.05;

    // dron grave que respira
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 360;
    filtro.Q.value = 3;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoAmp = ctx.createGain();
    lfoAmp.gain.value = 160;
    lfo.connect(lfoAmp).connect(filtro.frequency);
    const dronVol = ctx.createGain();
    dronVol.gain.value = 0.09;
    filtro.connect(dronVol).connect(busMusica);
    const dron = [[nota(38), 'sawtooth'], [nota(38) * 1.005, 'sawtooth'], [nota(45), 'triangle']].map(([f, tipo]) => {
      const o = ctx.createOscillator();
      o.type = tipo;
      o.frequency.value = f;
      o.connect(filtro);
      o.start(t0);
      return o;
    });
    lfo.start(t0);

    // viento
    const viento = ctx.createBufferSource();
    viento.buffer = ruido;
    viento.loop = true;
    const vf = ctx.createBiquadFilter();
    vf.type = 'bandpass';
    vf.frequency.value = 700;
    vf.Q.value = 0.9;
    const vlfo = ctx.createOscillator();
    vlfo.frequency.value = 0.09;
    const vlfoAmp = ctx.createGain();
    vlfoAmp.gain.value = 380;
    vlfo.connect(vlfoAmp).connect(vf.frequency);
    const vv = ctx.createGain();
    vv.gain.value = 0.035;
    viento.connect(vf).connect(vv).connect(busMusica);
    viento.start(t0);
    vlfo.start(t0);

    fuentes = [...dron, lfo, viento, vlfo];

    // cajita musical + campana, programadas por adelantado
    let siguiente = t0 + 1.2;
    let i = 0;
    let vuelta = 0;
    reloj = setInterval(() => {
      while (siguiente < ctx.currentTime + 0.6) {
        if (i === 0 && vuelta % 2 === 0) campana(siguiente);
        const [m, dur] = MELODIA[i];
        if (m !== null) cajita(siguiente, nota(m + 12));
        siguiente += dur * CORCHEA;
        i = (i + 1) % MELODIA.length;
        if (i === 0) vuelta++;
      }
    }, 120);

    busMusica.gain.cancelScheduledValues(t0);
    busMusica.gain.setValueAtTime(busMusica.gain.value, t0);
    busMusica.gain.linearRampToValueAtTime(VOL_MUSICA, t0 + 3);
  }

  function pararMusica() {
    if (!sonando) return;
    sonando = false;
    clearInterval(reloj);
    const t = ctx.currentTime;
    busMusica.gain.cancelScheduledValues(t);
    busMusica.gain.setValueAtTime(busMusica.gain.value, t);
    busMusica.gain.linearRampToValueAtTime(0, t + 1.2);
    const viejas = fuentes;
    fuentes = [];
    setTimeout(() => viejas.forEach((f) => { try { f.stop(); } catch {} }), 1400);
  }

  // baja la música mientras suena el redoble y la sube después
  function agachar(dur) {
    if (!sonando) return;
    const t = ctx.currentTime;
    busMusica.gain.cancelScheduledValues(t);
    busMusica.gain.setValueAtTime(busMusica.gain.value, t);
    busMusica.gain.linearRampToValueAtTime(VOL_MUSICA * 0.2, t + 0.3);
    busMusica.gain.setValueAtTime(VOL_MUSICA * 0.2, t + dur + 1.5);
    busMusica.gain.linearRampToValueAtTime(VOL_MUSICA, t + dur + 5);
  }

  // ---------- redoble
  function golpeCaja(t, vol) {
    const src = ctx.createBufferSource();
    src.buffer = ruido;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    src.connect(hp).connect(g).connect(busFx);
    src.start(t, Math.random() * 1.5, 0.12);

    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(150, t + 0.05);
    const go = ctx.createGain();
    go.gain.setValueAtTime(vol * 0.5, t);
    go.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(go).connect(busFx);
    o.start(t);
    o.stop(t + 0.08);
  }

  function redoble() {
    ctx.resume();
    const t0 = ctx.currentTime + 0.05;
    const D = DURACION_REDOBLE;
    agachar(D);

    // tambor: golpes cada vez más rápidos y más fuertes
    let t = t0;
    while (t < t0 + D) {
      const p = (t - t0) / D;
      golpeCaja(t, 0.12 + 0.5 * p * p);
      t += 0.085 - 0.05 * p + (Math.random() - 0.5) * 0.006;
    }

    // timbal grave que tiembla por debajo
    const tim = ctx.createOscillator();
    tim.frequency.value = nota(38);
    const trem = ctx.createOscillator();
    trem.frequency.value = 17;
    const tremAmp = ctx.createGain();
    tremAmp.gain.value = 0.5;
    const timVol = ctx.createGain();
    timVol.gain.setValueAtTime(0.0001, t0);
    timVol.gain.exponentialRampToValueAtTime(0.35, t0 + D);
    timVol.gain.linearRampToValueAtTime(0, t0 + D + 0.08);
    const timAm = ctx.createGain();
    timAm.gain.value = 0.5;
    trem.connect(tremAmp).connect(timAm.gain);
    tim.connect(timAm).connect(timVol).connect(busFx);
    tim.start(t0);
    trem.start(t0);
    tim.stop(t0 + D + 0.1);
    trem.stop(t0 + D + 0.1);

    // un "theremin" que sube de tono: el toque de misterio
    const th = ctx.createOscillator();
    th.type = 'sine';
    th.frequency.setValueAtTime(nota(57), t0);
    th.frequency.exponentialRampToValueAtTime(nota(69), t0 + D);
    const vib = ctx.createOscillator();
    vib.frequency.value = 5.5;
    const vibAmp = ctx.createGain();
    vibAmp.gain.value = 7;
    vib.connect(vibAmp).connect(th.frequency);
    const thVol = ctx.createGain();
    thVol.gain.setValueAtTime(0.0001, t0);
    thVol.gain.exponentialRampToValueAtTime(0.05, t0 + D * 0.8);
    thVol.gain.linearRampToValueAtTime(0, t0 + D + 0.05);
    th.connect(thVol).connect(busFx);
    th.start(t0);
    vib.start(t0);
    th.stop(t0 + D + 0.1);
    vib.stop(t0 + D + 0.1);
  }

  // ---------- platillo + bombo + "¡ta-dá!"
  function platillo() {
    ctx.resume();
    const t = ctx.currentTime + 0.01;

    for (const [tipo, f, vol, dec] of [['highpass', 5500, 0.55, 3.2], ['bandpass', 3200, 0.35, 1.4]]) {
      const src = ctx.createBufferSource();
      src.buffer = ruido;
      src.loop = true;
      const fl = ctx.createBiquadFilter();
      fl.type = tipo;
      fl.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      src.connect(fl).connect(g).connect(busFx);
      src.start(t);
      src.stop(t + dec + 0.1);
    }

    // bombo
    const b = ctx.createOscillator();
    b.frequency.setValueAtTime(130, t);
    b.frequency.exponentialRampToValueAtTime(42, t + 0.45);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.9, t);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    b.connect(bg).connect(busFx);
    b.start(t);
    b.stop(t + 0.75);

    // acorde de órgano en re mayor
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2600, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + 2.6);
    lp.connect(busFx);
    for (const m of [50, 57, 62, 66, 69]) {
      for (const det of [-4, 4]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = nota(m);
        o.detune.value = det;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.035, t + 0.03);
        g.gain.setValueAtTime(0.035, t + 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
        o.connect(g).connect(lp);
        o.start(t);
        o.stop(t + 2.9);
      }
    }

    // destellos de cajita hacia arriba
    [74, 78, 81, 86].forEach((m, i) => {
      const o = ctx.createOscillator();
      o.frequency.value = nota(m);
      const g = ctx.createGain();
      const ti = t + 0.12 + i * 0.07;
      g.gain.setValueAtTime(0, ti);
      g.gain.linearRampToValueAtTime(0.06, ti + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, ti + 1.2);
      o.connect(g).connect(busFx);
      o.start(ti);
      o.stop(ti + 1.3);
    });
  }

  return { musica, pararMusica, redoble, platillo, get sonando() { return sonando; } };
}

function crearRuido(ctx) {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function impulso(ctx, segundos, caida) {
  const len = Math.floor(ctx.sampleRate * segundos);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, caida);
  }
  return buf;
}
