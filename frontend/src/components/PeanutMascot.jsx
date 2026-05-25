const getMood = (points) => {
  if (points >= 200) return "ecstatic";
  if (points >= 100) return "happy";
  if (points >= 50)  return "neutral";
  if (points >= 20)  return "sad";
  return "exhausted";
};

export const MOOD_META = {
  ecstatic: { label: "¡Increíble!",  color: "#F5B800" },
  happy:    { label: "¡Muy bien!",   color: "#2ECC71" },
  neutral:  { label: "Bien",         color: "#7ECEC4" },
  sad:      { label: "Mejorable",    color: "#F39C12" },
  exhausted:{ label: "¡A moverse!",  color: "#E24B4A" },
};

/* ── Brazos — se renderizan ANTES del cuerpo para que el cuerpo tape la unión ── */
const Arms = {
  /* ── palitos flacos colgando (0–19 pts) ── */
  exhausted: (
    <g>
      <path d="M18 76 Q12 85 9 95"  stroke="#B8882A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M62 76 Q68 85 71 95" stroke="#B8882A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </g>
  ),

  /* ── brazos flacos, levemente caídos (20–49 pts) ── */
  sad: (
    <g>
      <path d="M17 74 Q10 82 8 91"  stroke="#B8882A" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M63 74 Q70 82 72 91" stroke="#B8882A" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    </g>
  ),

  /* ── brazos medianos, horizontales (50–99 pts) ── */
  neutral: (
    <g>
      <path d="M17 72 Q10 72 3 73"  stroke="#C09040" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
      <path d="M63 72 Q70 72 77 73" stroke="#C09040" strokeWidth="5.5" fill="none" strokeLinecap="round"/>
    </g>
  ),

  /* ── brazos tonificados, levemente elevados con pequeño bícep (100–199 pts) ── */
  happy: (
    <g>
      {/* Izquierdo: upper arm */}
      <path d="M18 72 Q9 67 6 62"  stroke="#C09040" strokeWidth="7.5" fill="none" strokeLinecap="round"/>
      {/* Izquierdo: forearm */}
      <path d="M6 62 Q3 55 8 50"   stroke="#C09040" strokeWidth="6.5" fill="none" strokeLinecap="round"/>
      {/* Bícep pequeño izquierdo */}
      <ellipse cx="9.5" cy="64" rx="5.5" ry="3.8" fill="#B88030"
        transform="rotate(-28 9.5 64)"/>

      {/* Derecho: upper arm */}
      <path d="M62 72 Q71 67 74 62" stroke="#C09040" strokeWidth="7.5" fill="none" strokeLinecap="round"/>
      {/* Derecho: forearm */}
      <path d="M74 62 Q77 55 72 50" stroke="#C09040" strokeWidth="6.5" fill="none" strokeLinecap="round"/>
      {/* Bícep pequeño derecho */}
      <ellipse cx="70.5" cy="64" rx="5.5" ry="3.8" fill="#B88030"
        transform="rotate(28 70.5 64)"/>
    </g>
  ),

  /* ── BRAZOS MUSCULOSOS, pose de victoria (200+ pts) ── */
  ecstatic: (
    <g>
      {/* ── Izquierdo ── */}
      {/* Upper arm */}
      <path d="M19 71 Q11 62 9 56"  stroke="#C09040" strokeWidth="10.5" fill="none" strokeLinecap="round"/>
      {/* Forearm doblado hacia arriba */}
      <path d="M9 56 Q6 47 12 42"   stroke="#C09040" strokeWidth="9"    fill="none" strokeLinecap="round"/>
      {/* BÍCEP prominente izquierdo */}
      <ellipse cx="7.5" cy="55.5" rx="10" ry="6.8"
        fill="#C09040" stroke="#A07830" strokeWidth="1.3"
        transform="rotate(-38 7.5 55.5)"/>
      {/* Highlight bícep */}
      <ellipse cx="5.5" cy="52.5" rx="3.8" ry="2.2"
        fill="rgba(255,215,130,0.52)"
        transform="rotate(-38 5.5 52.5)"/>

      {/* ── Derecho ── */}
      {/* Upper arm */}
      <path d="M61 71 Q69 62 71 56"  stroke="#C09040" strokeWidth="10.5" fill="none" strokeLinecap="round"/>
      {/* Forearm */}
      <path d="M71 56 Q74 47 68 42"  stroke="#C09040" strokeWidth="9"    fill="none" strokeLinecap="round"/>
      {/* BÍCEP prominente derecho */}
      <ellipse cx="72.5" cy="55.5" rx="10" ry="6.8"
        fill="#C09040" stroke="#A07830" strokeWidth="1.3"
        transform="rotate(38 72.5 55.5)"/>
      {/* Highlight bícep */}
      <ellipse cx="74.5" cy="52.5" rx="3.8" ry="2.2"
        fill="rgba(255,215,130,0.52)"
        transform="rotate(38 74.5 52.5)"/>
    </g>
  ),
};

/* ── Expresiones faciales ─────────────────────────────────────────────────── */
const Faces = {
  ecstatic: (
    <g>
      <ellipse cx="21" cy="40" rx="7.5" ry="4.5" fill="rgba(255,90,90,0.42)" />
      <ellipse cx="59" cy="40" rx="7.5" ry="4.5" fill="rgba(255,90,90,0.42)" />
      <path d="M19 22 Q27 16 35 21" stroke="#7A4F1A" strokeWidth="2.3" fill="none" strokeLinecap="round"/>
      <path d="M45 21 Q53 16 61 22" stroke="#7A4F1A" strokeWidth="2.3" fill="none" strokeLinecap="round"/>
      <text x="28" y="35" textAnchor="middle" fontSize="15" fill="#F5B800">★</text>
      <text x="52" y="35" textAnchor="middle" fontSize="15" fill="#F5B800">★</text>
      <path d="M21 45 Q40 62 59 45" fill="#CC2222" stroke="#7A4F1A" strokeWidth="2.2"/>
      <path d="M21 45 Q40 50 59 45" fill="white"/>
      <line x1="33" y1="45" x2="32" y2="48" stroke="#DDD" strokeWidth="1"/>
      <line x1="40" y1="45" x2="40" y2="49" stroke="#DDD" strokeWidth="1"/>
      <line x1="47" y1="45" x2="48" y2="48" stroke="#DDD" strokeWidth="1"/>
    </g>
  ),

  happy: (
    <g>
      <ellipse cx="20" cy="39" rx="6.5" ry="4" fill="rgba(255,110,110,0.32)" />
      <ellipse cx="60" cy="39" rx="6.5" ry="4" fill="rgba(255,110,110,0.32)" />
      <path d="M21 32 A7 7 0 0 1 35 32" stroke="#3A2A10" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <path d="M45 32 A7 7 0 0 1 59 32" stroke="#3A2A10" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <path d="M25 44 Q40 57 55 44" stroke="#7A4F1A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>
  ),

  neutral: (
    <g>
      <circle cx="28" cy="31" r="6.5" fill="white" stroke="#A07830" strokeWidth="1.2"/>
      <circle cx="28" cy="31" r="4"   fill="#3A2A10"/>
      <circle cx="25.5" cy="28.5" r="1.4" fill="white"/>
      <circle cx="52" cy="31" r="6.5" fill="white" stroke="#A07830" strokeWidth="1.2"/>
      <circle cx="52" cy="31" r="4"   fill="#3A2A10"/>
      <circle cx="49.5" cy="28.5" r="1.4" fill="white"/>
      <path d="M28 45 Q40 52 52 45" stroke="#7A4F1A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>
  ),

  sad: (
    <g>
      <path d="M20 27 Q28 31 35 27" stroke="#7A4F1A" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M45 27 Q52 31 60 27" stroke="#7A4F1A" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="28" cy="34" rx="6.5" ry="5.5" fill="white" stroke="#A07830" strokeWidth="1"/>
      <ellipse cx="28" cy="35" rx="4"   ry="3.5"  fill="#3A2A10"/>
      <ellipse cx="52" cy="34" rx="6.5" ry="5.5" fill="white" stroke="#A07830" strokeWidth="1"/>
      <ellipse cx="52" cy="35" rx="4"   ry="3.5"  fill="#3A2A10"/>
      <path d="M27 48 Q40 40 53 48" stroke="#7A4F1A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M27 40 C26 44 25 46 27.5 48" stroke="#7ABFE0" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="27" cy="49" rx="2" ry="2.5" fill="#7ABFE0" opacity="0.7"/>
    </g>
  ),

  exhausted: (
    <g>
      <ellipse cx="28" cy="39" rx="8"   ry="3.5" fill="rgba(80,50,20,0.20)"/>
      <ellipse cx="52" cy="39" rx="8"   ry="3.5" fill="rgba(80,50,20,0.20)"/>
      <path d="M20 24 Q28 28 35 24" stroke="#7A4F1A" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M45 24 Q52 28 60 24" stroke="#7A4F1A" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <line x1="22" y1="26" x2="34" y2="37" stroke="#3A2A10" strokeWidth="2.8" strokeLinecap="round"/>
      <line x1="34" y1="26" x2="22" y2="37" stroke="#3A2A10" strokeWidth="2.8" strokeLinecap="round"/>
      <line x1="46" y1="26" x2="58" y2="37" stroke="#3A2A10" strokeWidth="2.8" strokeLinecap="round"/>
      <line x1="58" y1="26" x2="46" y2="37" stroke="#3A2A10" strokeWidth="2.8" strokeLinecap="round"/>
      <path d="M23 49 Q40 39 57 49" stroke="#7A4F1A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M65 14 Q70 21 66 26 Q62 21 65 14 Z" fill="#7ABFE0" opacity="0.85"/>
    </g>
  ),
};

/* ── Componente principal ─────────────────────────────────────────────────── */
const PeanutMascot = ({ points = 0, size = 88 }) => {
  const mood = getMood(points);

  return (
    <svg
      viewBox="0 0 80 108"
      width={size}
      height={size * 1.23}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Sombra */}
      <ellipse cx="40" cy="106" rx="20" ry="4" fill="rgba(0,0,0,0.13)" />

      {/* ── BRAZOS — van ANTES del cuerpo para que el cuerpo tape la unión ── */}
      {Arms[mood]}

      {/* Cuerpo del maní */}
      <path
        d="M40,8
           C62,8 66,22 66,35
           C66,45 60,51 52,55
           C60,59 66,66 66,76
           C66,91 55,100 40,100
           C25,100 14,91 14,76
           C14,66 20,59 28,55
           C20,51 14,45 14,35
           C14,22 18,8 40,8 Z"
        fill="#D4A860"
        stroke="#A07830"
        strokeWidth="2.5"
      />

      {/* Línea de la cintura */}
      <path
        d="M28 55 Q40 61 52 55"
        stroke="rgba(160,120,48,0.55)"
        strokeWidth="2"
        fill="none"
      />

      {/* Mancha de la panza */}
      <ellipse cx="40" cy="76" rx="12" ry="10" fill="rgba(160,120,48,0.22)" />

      {/* Brillo */}
      <ellipse
        cx="29" cy="21"
        rx="9"  ry="6"
        fill="rgba(255,255,255,0.30)"
        transform="rotate(-22 29 21)"
      />

      {/* Cara */}
      {Faces[mood]}
    </svg>
  );
};

export { getMood };
export default PeanutMascot;
