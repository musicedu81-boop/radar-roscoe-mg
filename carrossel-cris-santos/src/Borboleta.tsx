import {useId} from 'react';
import {ANTENAS, ASA_INFERIOR, ASA_SUPERIOR, CORPO, MANCHAS, VEIAS} from './borboleta-desenho';
import {C} from './tokens';

// Borboleta em linha, no traço da vinheta. abertura: 0 (asas fechadas) a 1 (abertas).
export const Borboleta: React.FC<{tamanho: number; abertura: number; brilho?: number}> = ({tamanho, abertura, brilho = 1}) => {
  const id = `asa${useId().replace(/:/g, '')}`;
  const s = 0.18 + 0.82 * abertura;
  const asa = (
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
    <svg width={tamanho} height={tamanho} viewBox="-110 -100 220 200" style={{overflow: 'visible', filter: `drop-shadow(0 0 ${14 * brilho}px ${C.lavanda}) drop-shadow(0 0 ${36 * brilho}px ${C.claro})`}}>
      <defs>
        <linearGradient id={id} x1="0" y1="-1" x2="0" y2="1">
          <stop offset="0" stopColor={C.creme} stopOpacity={0.95} />
          <stop offset="1" stopColor={C.lavanda} stopOpacity={0.75} />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`} stroke={C.medio} strokeWidth={2.2} strokeLinejoin="round">
        <g transform={`scale(${s},1)`}>{asa}</g>
        <g transform={`scale(${-s},1)`}>{asa}</g>
      </g>
      <ellipse cx={CORPO.cx} cy={CORPO.cy} rx={CORPO.rx} ry={CORPO.ry} fill={C.principal} />
      <path d={ANTENAS} stroke={C.principal} strokeWidth={2} fill="none" />
    </svg>
  );
};

// Batida de asas: rápida em voo, lenta e curta quando pousada
export const bater = (f: number, pousada = 0) => {
  const voo = Math.abs(Math.cos(f * 0.6));
  const pouso = 0.72 + 0.28 * Math.cos(f * 0.16);
  return voo * (1 - pousada) + pouso * pousada;
};
