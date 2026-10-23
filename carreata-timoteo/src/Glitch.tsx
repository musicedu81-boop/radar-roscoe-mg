import {AbsoluteFill, random} from 'remotion';
import {C} from './cores';

// Fantasma de cor do glitch: só azul e verde (nada de vermelho). No modo screen, escalar a cor por a equivale a opacidade a.
const tinta = (r: number, g: number, b: number, a: number) =>
  `${a * r * 0.3} ${a * r * 0.59} ${a * r * 0.11} 0 0  ${a * g * 0.3} ${a * g * 0.59} ${a * g * 0.11} 0 0  ${a * b * 0.3} ${a * b * 0.59} ${a * b * 0.11} 0 0  0 0 0 1 0`;

// Glitch em um único passe de filtro SVG: faixas horizontais deslocadas e fantasmas azul e verde por cima.
// Antes eram 9 cópias da cena inteira por frame; o filtro trabalha sobre a imagem já pronta.
export const Glitch: React.FC<{f: number; g: number; largura: number; altura: number; children: React.ReactNode}> = ({f, g, largura, altura, children}) => {
  if (g <= 0.02) return <>{children}</>;
  const n = 7;
  const cortes = [0, ...Array.from({length: n - 1}, (_, i) => random(`corte${f}-${i}`) * altura).sort((a, b) => a - b), altura];
  const id = `glitch-${f}`;
  return (
    <>
      <svg style={{position: 'absolute', width: 0, height: 0}}>
        <filter id={id} x={0} y={0} width={largura} height={altura} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          {cortes.slice(0, -1).map((topo, i) => {
            const forte = random(`forte${f}-${i}`) < 0.5;
            const dx = (random(`dx${f}-${i}`) - 0.5) * 2 * (forte ? 70 : 18) * g;
            return <feOffset key={i} in="SourceGraphic" dx={dx} dy={0} x={0} y={topo} width={largura} height={cortes[i + 1] - topo} result={`faixa${i}`} />;
          })}
          <feMerge result="fatias">
            {cortes.slice(0, -1).map((_, i) => (
              <feMergeNode key={i} in={`faixa${i}`} />
            ))}
          </feMerge>
          <feColorMatrix in="fatias" type="matrix" values={tinta(0.14, 0.38, 0.94, 0.28 * g)} />
          <feOffset dx={-16 * g} dy={0} result="azul" />
          <feColorMatrix in="fatias" type="matrix" values={tinta(0.1, 0.79, 0.31, 0.2 * g)} />
          <feOffset dx={14 * g} dy={4 * g} result="verde" />
          <feBlend in="azul" in2="fatias" mode="screen" result="comAzul" />
          <feBlend in="verde" in2="comAzul" mode="screen" />
        </filter>
      </svg>
      <AbsoluteFill style={{filter: `url(#${id})`}}>{children}</AbsoluteFill>
    </>
  );
};

// Blocos digitais e linhas de varredura por cima
export const RuidoDigital: React.FC<{f: number; g: number; largura: number; altura: number}> = ({f, g, largura, altura}) => {
  if (g <= 0.02) return null;
  const cores = [C.verdeVivo, C.amarelo, C.azulVivo, C.branco];
  const blocos = Array.from({length: Math.round(4 + 10 * g)}, (_, i) => ({
    x: random(`bx${f}-${i}`) * largura,
    y: random(`by${f}-${i}`) * altura,
    w: 30 + random(`bw${f}-${i}`) * 260,
    h: 6 + random(`bh${f}-${i}`) * 34,
    cor: cores[Math.floor(random(`bc${f}-${i}`) * cores.length)],
  }));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {blocos.map((b, i) => (
        <div key={i} style={{position: 'absolute', left: b.x - b.w / 2, top: b.y, width: b.w, height: b.h, background: b.cor, opacity: 0.8 * g, mixBlendMode: i % 2 ? 'screen' : 'normal'}} />
      ))}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,20,8,0.28) 0px, rgba(0,20,8,0.28) 2px, transparent 2px, transparent 6px)', opacity: Math.min(1, g * 1.2)}} />
    </AbsoluteFill>
  );
};
