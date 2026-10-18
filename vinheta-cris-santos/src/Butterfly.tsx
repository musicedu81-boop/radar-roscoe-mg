import {C} from './tokens';

// Borboleta em linha, no traço da tatuagem. flap: 0 (fechada) a 1 (aberta).
export const Butterfly: React.FC<{size: number; flap: number; glow?: number}> = ({size, flap, glow = 1}) => {
  const s = 0.18 + 0.82 * flap;
  const wing = (
    <g>
      <path d="M0 0 C 12 -40, 55 -78, 88 -70 C 106 -64, 100 -30, 80 -14 C 62 0, 30 4, 0 0 Z" />
      <path d="M0 2 C 28 6, 66 12, 70 38 C 74 62, 46 70, 30 56 C 16 44, 6 22, 0 2 Z" />
      <path d="M6 -6 C 30 -30, 60 -52, 84 -58 M10 -2 C 40 -16, 66 -24, 86 -28 M6 6 C 30 16, 50 30, 58 46" fill="none" strokeWidth={1.4} />
      <circle cx={84} cy={-48} r={3.5} fill="none" strokeWidth={1.4} />
      <circle cx={76} cy={-58} r={2.5} fill="none" strokeWidth={1.4} />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="-110 -100 220 200" style={{overflow: 'visible', filter: `drop-shadow(0 0 ${14 * glow}px ${C.lavanda}) drop-shadow(0 0 ${36 * glow}px ${C.claro})`}}>
      <defs>
        <linearGradient id="wg" x1="0" y1="-1" x2="0" y2="1">
          <stop offset="0" stopColor={C.creme} stopOpacity={0.95} />
          <stop offset="1" stopColor={C.lavanda} stopOpacity={0.75} />
        </linearGradient>
      </defs>
      <g fill="url(#wg)" stroke={C.medio} strokeWidth={2.2} strokeLinejoin="round">
        <g transform={`scale(${s},1)`}>{wing}</g>
        <g transform={`scale(${-s},1)`}>{wing}</g>
      </g>
      <ellipse cx={0} cy={6} rx={4} ry={30} fill={C.principal} />
      <path d="M0 -22 C -6 -40, -14 -50, -22 -56 M0 -22 C 6 -40, 14 -50, 22 -56" stroke={C.principal} strokeWidth={2} fill="none" />
    </svg>
  );
};
