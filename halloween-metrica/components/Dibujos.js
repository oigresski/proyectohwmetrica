// Ilustraciones en SVG: todo es dibujo propio, sin imágenes externas.

export function Gorro({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 100" aria-hidden="true">
      <defs>
        <linearGradient id="g-gorro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a2fa0" />
          <stop offset="1" stopColor="#1d0b3a" />
        </linearGradient>
      </defs>
      <path d="M30 84 C38 62 46 42 52 28 C57 16 68 6 88 2 C79 12 74 22 75 34 C78 52 84 70 91 84 Z" fill="url(#g-gorro)" />
      <path d="M88 2 C79 12 74 22 75 34" fill="none" stroke="#cdbdf2" strokeOpacity=".35" strokeWidth="1.5" />
      <ellipse cx="60" cy="86" rx="57" ry="11" fill="#22104a" />
      <ellipse cx="60" cy="84" rx="57" ry="9" fill="#2f1762" />
      <path d="M31 77 C50 71 72 71 90 77 L91 85 C72 79 50 79 30 85 Z" fill="#f07a2a" />
      <rect x="53" y="74" width="12" height="10" rx="2" fill="none" stroke="#ffe8c2" strokeWidth="2.4" />
    </svg>
  );
}

export function Murcielago({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 30" aria-hidden="true">
      <path d="M32 10 L29.5 4 L30 9 C24 6 14 6 2 14 C8 14 12 18 13 22 C16 18 20 18 23 21 C25 17 28 16 32 18 C36 16 39 17 41 21 C44 18 48 18 51 22 C52 18 56 14 62 14 C50 6 40 6 34 9 L34.5 4 Z" />
    </svg>
  );
}

export function Calabaza({ className, encendida = true }) {
  return (
    <svg className={className} viewBox="0 0 120 112" aria-hidden="true">
      <defs>
        <radialGradient id="g-cal" cx=".45" cy=".4" r=".7">
          <stop offset="0" stopColor="#ffa24d" />
          <stop offset=".7" stopColor="#f07a2a" />
          <stop offset="1" stopColor="#b9501a" />
        </radialGradient>
        <radialGradient id="g-luz" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="1" stopColor="#ffc24a" />
        </radialGradient>
      </defs>
      <path d="M56 22 C55 12 58 6 66 2 L70 6 C64 9 62 14 63 22 Z" fill="#4c7a35" />
      <ellipse cx="38" cy="64" rx="30" ry="40" fill="url(#g-cal)" />
      <ellipse cx="82" cy="64" rx="30" ry="40" fill="url(#g-cal)" />
      <ellipse cx="60" cy="64" rx="28" ry="42" fill="url(#g-cal)" />
      <path d="M60 24 C52 40 52 88 60 104 M60 24 C68 40 68 88 60 104" fill="none" stroke="#b9501a" strokeOpacity=".55" strokeWidth="2" />
      <g fill={encendida ? 'url(#g-luz)' : '#3a1606'}>
        <path d="M30 54 L44 40 L48 58 Z" />
        <path d="M90 54 L76 40 L72 58 Z" />
        <path d="M56 62 L60 54 L64 62 Z" />
        <path d="M24 72 C40 92 80 92 96 72 L88 76 L84 70 L78 78 L70 72 L64 80 L56 72 L50 80 L42 72 L36 78 L32 70 Z" />
      </g>
    </svg>
  );
}

export function Arana({ className }) {
  return (
    <svg className={className} viewBox="0 0 40 120" aria-hidden="true">
      <line x1="20" y1="0" x2="20" y2="92" stroke="#cdbdf2" strokeOpacity=".5" strokeWidth="1" />
      <g fill="none" stroke="#120624" strokeWidth="2" strokeLinecap="round">
        <path d="M14 96 C6 92 4 88 2 84 M14 100 C6 100 3 98 1 96 M14 104 C7 108 4 110 3 114 M15 107 C10 113 9 116 9 119" />
        <path d="M26 96 C34 92 36 88 38 84 M26 100 C34 100 37 98 39 96 M26 104 C33 108 36 110 37 114 M25 107 C30 113 31 116 31 119" />
      </g>
      <ellipse cx="20" cy="102" rx="8" ry="10" fill="#120624" />
      <circle cx="20" cy="92" r="5" fill="#120624" />
      <circle cx="18" cy="91" r="1.2" fill="#f07a2a" />
      <circle cx="22" cy="91" r="1.2" fill="#f07a2a" />
    </svg>
  );
}

export function Telarana({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0 0 L100 100 M0 0 L100 40 M0 0 L40 100 M0 0 L100 0 M0 0 L0 100" />
      <path d="M22 0 Q24 10 0 22 M44 0 Q46 20 0 44 M66 0 Q70 34 0 66 M88 0 Q94 50 0 88" />
    </svg>
  );
}

// Casa embrujada, árbol, lápidas y reja: la silueta del fondo.
export function Silueta({ className }) {
  return (
    <svg className={className} viewBox="0 0 400 170" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <g fill="#0e0419">
        <path d="M0 140 Q90 112 190 128 T400 118 V170 H0 Z" />
        {/* árbol */}
        <path d="M56 136 C60 116 56 98 62 80 C66 66 58 54 48 44 L52 42 C62 50 70 62 68 76 C74 66 84 60 96 58 L96 62 C84 66 74 74 70 86 C76 84 86 76 92 64 L95 66 C90 80 78 92 68 98 C66 112 66 124 68 136 Z" />
        <path d="M60 104 C50 98 40 92 32 80 L35 78 C42 88 52 94 61 98 Z" />
        <path d="M54 58 C48 52 44 44 44 34 L47 34 C48 44 52 50 58 54 Z" />
        {/* lápidas */}
        <path d="M148 134 v-14 a8 8 0 0 1 16 0 v14 z" />
        <path d="M172 134 v-10 a6 6 0 0 1 12 0 v10 z" />
        <path d="M130 136 v-16 h-5 v-4 h5 v-5 h4 v5 h5 v4 h-5 v16 z" />
        {/* casa */}
        <rect x="228" y="78" width="92" height="56" />
        <polygon points="220,82 274,40 328,82" />
        <rect x="244" y="46" width="10" height="24" />
        <rect x="300" y="48" width="30" height="86" />
        <polygon points="295,52 315,4 335,52" />
        <polygon points="232,84 232,80 210,96 214,98" />
        {/* reja */}
        <path d="M196 136 V124 l2-3 l2 3 V136 M206 136 V124 l2-3 l2 3 V136 M346 132 V120 l2-3 l2 3 V132 M356 132 V120 l2-3 l2 3 V132 M366 131 V119 l2-3 l2 3 V131 M376 130 V118 l2-3 l2 3 V130" stroke="#0e0419" strokeWidth="2" />
      </g>
      <g className="ventanas">
        <rect x="242" y="92" width="14" height="18" rx="1" />
        <rect x="292" y="92" width="14" height="18" rx="1" />
        <rect x="309" y="64" width="12" height="16" rx="6" />
        <path d="M265 134 v-18 a9 9 0 0 1 18 0 v18 z" opacity=".55" />
      </g>
      <g stroke="#0e0419" strokeWidth="1.6">
        <path d="M249 92 v18 M242 101 h14 M299 92 v18 M292 101 h14" />
      </g>
    </svg>
  );
}
