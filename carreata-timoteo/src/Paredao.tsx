import {C} from './cores';

// Paredão de som novo, em cima da carreta. pulso: 0 a 1 no kick.
export const Paredao: React.FC<{pulso: number; ondas: number[]}> = ({pulso, ondas}) => {
  const cone = 1 + 0.16 * pulso;
  const brilho = 0.45 + 0.55 * pulso;
  const woofer = (cx: number, cy: number, r: number) => (
    <g key={`${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={r + 4} fill="#050805" />
      <circle cx={cx} cy={cy} r={r + 1.5} fill="none" stroke={C.neon} strokeWidth={3.2} style={{filter: `drop-shadow(0 0 ${3 + 7 * pulso}px ${C.neon})`}} opacity={brilho} />
      <g transform={`translate(${cx} ${cy}) scale(${cone}) translate(${-cx} ${-cy})`}>
        <circle cx={cx} cy={cy} r={r} fill="url(#cone)" />
        <circle cx={cx} cy={cy} r={r * 0.62} fill="none" stroke="#2a2f2a" strokeWidth={1.4} />
        <circle cx={cx} cy={cy} r={r * 0.3} fill="url(#calota)" />
      </g>
    </g>
  );
  return (
    <svg width={140} height={180} viewBox="0 0 140 180" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id="cone" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#3b413b" />
          <stop offset="0.7" stopColor="#141714" />
          <stop offset="1" stopColor="#070907" />
        </radialGradient>
        <radialGradient id="calota" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#8a928a" />
          <stop offset="1" stopColor="#1b1f1b" />
        </radialGradient>
        <linearGradient id="caixa" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d221d" />
          <stop offset="1" stopColor="#0a0c0a" />
        </linearGradient>
      </defs>
      {/* ondas de choque saindo dos alto-falantes */}
      {ondas.map((t, i) => (
        <circle key={i} cx={70} cy={105} r={40 + t * 95} fill="none" stroke={C.neon} strokeWidth={3 * (1 - t)} opacity={0.7 * (1 - t)} />
      ))}
      <rect x={2} y={2} width={136} height={176} rx={8} fill="url(#caixa)" stroke={C.neon} strokeWidth={2.4} opacity={1} style={{filter: `drop-shadow(0 0 ${4 + 8 * pulso}px ${C.neon})`}} />
      {/* cornetas */}
      {[34, 106].map((cx) => (
        <g key={cx}>
          <rect x={cx - 27} y={12} width={54} height={26} rx={3} fill="#0b0d0b" stroke="#2c332c" strokeWidth={1.5} />
          <path d={`M${cx - 20} 17 L${cx + 20} 17 L${cx + 8} 33 L${cx - 8} 33 Z`} fill="#202520" />
        </g>
      ))}
      <rect x={10} y={44} width={120} height={4} rx={2} fill={C.neon} opacity={brilho} style={{filter: `drop-shadow(0 0 ${2 + 6 * pulso}px ${C.neon})`}} />
      {woofer(70, 88, 33)}
      {woofer(70, 145, 27)}
    </svg>
  );
};
