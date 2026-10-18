import {ANTENAS, ASA_INFERIOR, ASA_SUPERIOR, CORPO, MANCHAS, VEIAS} from './borboleta-desenho';
import {C} from './tokens';

// Borboleta em linha, no traço da tatuagem. flap: 0 (fechada) a 1 (aberta).
export const Butterfly: React.FC<{size: number; flap: number; glow?: number}> = ({size, flap, glow = 1}) => {
  const s = 0.18 + 0.82 * flap;
  const wing = (
    <g>
      <path d={ASA_SUPERIOR} />
      <path d={ASA_INFERIOR} />
      <path d={VEIAS} fill="none" strokeWidth={1.4} />
      {MANCHAS.map((m) => (
        <circle key={m.cx} cx={m.cx} cy={m.cy} r={m.r} fill="none" strokeWidth={1.4} />
      ))}
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
      <ellipse cx={CORPO.cx} cy={CORPO.cy} rx={CORPO.rx} ry={CORPO.ry} fill={C.principal} />
      <path d={ANTENAS} stroke={C.principal} strokeWidth={2} fill="none" />
    </svg>
  );
};
