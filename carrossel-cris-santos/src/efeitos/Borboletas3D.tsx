import {useId} from 'react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {ASA_INFERIOR, ASA_SUPERIOR, CORPO, VEIAS} from '../borboleta-desenho';
import {C} from '../tokens';

// Meia asa (a direita); a esquerda é a mesma espelhada
const MeiaAsa: React.FC<{id: string}> = ({id}) => (
  <svg width={110} height={200} viewBox="0 -100 110 200" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <defs>
      <linearGradient id={id} x1="0" y1="-1" x2="0" y2="1">
        <stop offset="0" stopColor={C.creme} stopOpacity={0.9} />
        <stop offset="1" stopColor={C.lavanda} stopOpacity={0.7} />
      </linearGradient>
    </defs>
    <g fill={`url(#${id})`} stroke={C.medio} strokeWidth={2.2} strokeLinejoin="round">
      <path d={ASA_SUPERIOR} />
      <path d={ASA_INFERIOR} />
      <path d={VEIAS} fill="none" strokeWidth={1.4} />
    </g>
  </svg>
);

// Borboleta em 3D de verdade: cada asa gira no eixo do corpo com perspectiva (não é achatamento em 2D)
export const Borboleta3D: React.FC<{tamanho: number; batida: number}> = ({tamanho, batida}) => {
  const id = `a3d${useId().replace(/:/g, '')}`;
  const k = tamanho / 220;
  const asa = 18 + 62 * batida; // graus de abertura
  return (
    <div style={{position: 'relative', width: 220, height: 200, scale: `${k}`, perspective: 600, transformStyle: 'preserve-3d'}}>
      <div style={{position: 'absolute', left: 110, top: 0, width: 110, height: 200, transformOrigin: '0px 100px', transform: `rotateY(${-asa}deg)`, transformStyle: 'preserve-3d'}}>
        <MeiaAsa id={id} />
      </div>
      {/* asa esquerda: a mesma meia asa espelhada no eixo do corpo */}
      <div style={{position: 'absolute', left: 110, top: 0, width: 110, height: 200, transformOrigin: '0px 100px', transform: `scaleX(-1) rotateY(${-asa}deg)`, transformStyle: 'preserve-3d'}}>
        <MeiaAsa id={id} />
      </div>
      <div style={{position: 'absolute', left: 110 - CORPO.rx, top: 100 + CORPO.cy - CORPO.ry, width: CORPO.rx * 2, height: CORPO.ry * 2, borderRadius: '50%', background: C.principal}} />
    </div>
  );
};

// Revoada ao fundo com profundidade de campo: quanto mais longe do plano de foco, mais desfocada.
// foco: 0 = foco nos slides (fundo desfocado), 1 = foco no fundo (as borboletas ficam nítidas)
export const Revoada: React.FC<{quantidade?: number; foco: number}> = ({quantidade = 7, foco}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const itens = Array.from({length: quantidade}, (_, i) => {
    const prof = random(`bz${i}`); // 0 perto, 1 longe
    const vel = 0.6 + random(`bv${i}`) * 0.9;
    const t = f * vel * (1.2 - 0.6 * prof) + random(`bt${i}`) * 4000;
    const x = ((t * 0.9 + random(`bx${i}`) * width) % (width + 400)) - 200;
    const y = height * (0.12 + 0.76 * random(`by${i}`)) + Math.sin(t / 37 + i) * 60;
    const tamanho = 150 - 95 * prof;
    const plano = 0.7 * (1 - foco); // plano de foco: longe quando o foco está no fundo
    const borrao = 1 + 16 * Math.abs(prof - (1 - plano)) * (0.35 + 0.65 * (1 - foco));
    return {i, x, y, tamanho, borrao, prof, batida: Math.abs(Math.sin(f * (0.32 + 0.1 * random(`bf${i}`)) + i)), giro: Math.sin(t / 50 + i) * 20 - 15};
  });
  return (
    <div style={{position: 'absolute', inset: 0, perspective: 1200, overflow: 'hidden'}}>
      {itens
        .sort((a, b) => b.prof - a.prof)
        .map((b) => (
          <div
            key={b.i}
            style={{
              position: 'absolute',
              left: b.x - 110,
              top: b.y - 100,
              width: 220,
              height: 200,
              transform: `rotateX(52deg) rotateZ(${b.giro}deg)`,
              transformStyle: 'preserve-3d',
              filter: `blur(${b.borrao}px) drop-shadow(0 0 ${12 - 6 * b.prof}px ${C.lavanda})`,
              opacity: 0.85 - 0.45 * b.prof,
            }}
          >
            <Borboleta3D tamanho={b.tamanho} batida={b.batida} />
          </div>
        ))}
    </div>
  );
};
