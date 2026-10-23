import {AbsoluteFill, random} from 'remotion';
import {C} from './cores';

// Fantasmas de cor do glitch: só azul e verde (nada de vermelho)
const tinta = (r: number, g: number, b: number) =>
  `${r * 0.3} ${r * 0.59} ${r * 0.11} 0 0  ${g * 0.3} ${g * 0.59} ${g * 0.11} 0 0  ${b * 0.3} ${b * 0.59} ${b * 0.11} 0 0  0 0 0 1 0`;

export const FiltrosGlitch: React.FC = () => (
  <svg style={{position: 'absolute', width: 0, height: 0}}>
    <defs>
      <filter id="tintaAzul" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={tinta(0.14, 0.38, 0.94)} />
      </filter>
      <filter id="tintaVerde" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={tinta(0.1, 0.79, 0.31)} />
      </filter>
    </defs>
  </svg>
);

// Fatia a cena em faixas deslocadas e soma fantasmas coloridos deslocados
export const Glitch: React.FC<{f: number; g: number; altura: number; children: React.ReactNode}> = ({f, g, altura, children}) => {
  if (g <= 0.02) return <>{children}</>;
  const n = 7;
  const cortes = [0, ...Array.from({length: n - 1}, (_, i) => random(`corte${f}-${i}`) * altura).sort((a, b) => a - b), altura];
  return (
    <>
      {cortes.slice(0, -1).map((topo, i) => {
        const base = cortes[i + 1];
        const forte = random(`forte${f}-${i}`) < 0.5;
        const dx = (random(`dx${f}-${i}`) - 0.5) * 2 * (forte ? 70 : 18) * g;
        return (
          <AbsoluteFill key={i} style={{clipPath: `inset(${topo}px 0 ${altura - base}px 0)`, translate: `${dx}px 0px`}}>
            {children}
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.28 * g, translate: `${-16 * g}px 0px`, filter: 'url(#tintaAzul)'}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.2 * g, translate: `${14 * g}px ${4 * g}px`, filter: 'url(#tintaVerde)'}}>{children}</AbsoluteFill>
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
