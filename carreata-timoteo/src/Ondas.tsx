import {createSmoothSvgPath} from '@remotion/media-utils';
import {C} from './cores';

// Espectro radial do áudio real, atrás das cabeças
export const EspectroRadial: React.FC<{espectro: number[]; cx: number; cy: number; raio: number}> = ({espectro, cx, cy, raio}) => {
  const n = 32;
  const barras = [];
  for (let i = 0; i < n; i++) {
    const v = Math.min(1, espectro[i] * (1 + i * 0.15));
    const comp = 12 + 190 * Math.pow(v, 0.55);
    for (const lado of [-1, 1]) {
      const ang = -Math.PI / 2 + lado * (Math.PI * (i + 0.5)) / n; // graves no alto (entre as cabeças e o título), agudos descendo pelos lados
      const x0 = cx + raio * Math.cos(ang);
      const y0 = cy + raio * Math.sin(ang);
      const x1 = cx + (raio + comp) * Math.cos(ang);
      const y1 = cy + (raio + comp) * Math.sin(ang);
      const cor = i % 3 === 0 ? C.azulVivo : i % 3 === 1 ? C.verdeVivo : C.amarelo;
      barras.push(<line key={`${i}${lado}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke={cor} strokeWidth={10} strokeLinecap="round" />);
      barras.push(<line key={`${i}${lado}b`} x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.branco} strokeWidth={3} strokeLinecap="round" opacity={0.7} />);
    }
  }
  return (
    <svg width={894} height={1600} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: `drop-shadow(0 0 6px ${C.neon})`}}>
      <g opacity={0.9}>{barras}</g>
    </svg>
  );
};

// Linha de osciloscópio com a forma de onda real
export const Osciloscopio: React.FC<{onda: number[]; y: number; amplitude: number; cor: string; largura?: number}> = ({onda, y, amplitude, cor, largura = 894}) => {
  const d = createSmoothSvgPath({points: onda.map((v, i) => ({x: (i / (onda.length - 1)) * largura, y: y + v * amplitude}))});
  return (
    <svg width={largura} height={1600} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: `drop-shadow(0 0 5px ${cor})`}}>
      <path d={d} fill="none" stroke={cor} strokeWidth={3.5} strokeLinejoin="round" />
    </svg>
  );
};

// Anéis de som saindo de um ponto a cada kick (t de 0 a 1 em cada anel)
export const Aneis: React.FC<{cx: number; cy: number; aneis: number[]; rx: number; ry: number; cor: string}> = ({cx, cy, aneis, rx, ry, cor}) => (
  <svg width={894} height={1600} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {aneis.map((t, i) => (
      <ellipse key={i} cx={cx} cy={cy} rx={rx * (0.35 + t)} ry={ry * (0.35 + t)} fill="none" stroke={cor} strokeWidth={5 * (1 - t) + 1} opacity={0.75 * (1 - t)} style={{filter: `drop-shadow(0 0 6px ${cor})`}} />
    ))}
  </svg>
);

// Arcos ((( ))) de som dos dois lados do paredão
export const ArcosSom: React.FC<{cx: number; cy: number; t: number; cor: string}> = ({cx, cy, t, cor}) => {
  if (t < 0 || t > 1) return null;
  const arcos = [];
  for (let k = 0; k < 3; k++) {
    const r = 75 + k * 22 + t * 60;
    const op = (1 - t) * (1 - k * 0.25);
    for (const lado of [-1, 1]) {
      const a0 = lado === 1 ? -0.55 : Math.PI - 0.55;
      const a1 = lado === 1 ? 0.55 : Math.PI + 0.55;
      const p0 = `${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)}`;
      const p1 = `${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`;
      arcos.push(<path key={`${k}${lado}`} d={`M ${p0} A ${r} ${r} 0 0 1 ${p1}`} fill="none" stroke={cor} strokeWidth={6 - k} strokeLinecap="round" opacity={op} />);
    }
  }
  return (
    <svg width={894} height={1600} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: `drop-shadow(0 0 6px ${cor})`}}>
      {arcos}
    </svg>
  );
};
