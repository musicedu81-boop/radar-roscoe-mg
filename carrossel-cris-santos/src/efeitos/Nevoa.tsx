import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from '../tokens';

const hex = (a: number) => Math.round(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, '0');

// Névoa lúpica em forma de imagem: bancos de névoa lavanda passando devagar atrás dos slides.
// densidade: 0 a 1 (engrossa nas trocas de foco).
export const Nevoa: React.FC<{densidade: number}> = ({densidade}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const bancos = Array.from({length: 7}, (_, i) => {
    const vel = (0.35 + random(`nv${i}`) * 0.5) * (i % 2 ? 1 : -1);
    const largura = width * (0.9 + random(`nl${i}`) * 0.8);
    const alto = height * (0.18 + random(`na${i}`) * 0.16);
    const x = ((((random(`nx${i}`) * (width + largura) + f * vel) % (width + largura)) + width + largura) % (width + largura)) - largura / 2;
    const y = height * (0.08 + 0.84 * random(`ny${i}`)) + Math.sin(f / 70 + i) * 30;
    const cor = i % 3 === 0 ? C.lavanda : C.creme;
    const alfa = (0.07 + 0.07 * random(`no${i}`)) * (0.6 + 0.9 * densidade);
    return {i, x, y, largura, alto, cor, alfa};
  });
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {bancos.map((b) => (
        <div
          key={b.i}
          style={{
            position: 'absolute',
            left: b.x - b.largura / 2,
            top: b.y - b.alto / 2,
            width: b.largura,
            height: b.alto,
            background: `radial-gradient(closest-side, ${b.cor}${hex(b.alfa)} 0%, ${b.cor}${hex(b.alfa * 0.45)} 55%, transparent 100%)`,
          }}
        />
      ))}
    </div>
  );
};

// Véu de névoa por cima do slide na troca de foco: o slide se perde na névoa e o próximo sai dela
export const Veu: React.FC<{intensidade: number}> = ({intensidade}) =>
  intensidade > 0.01 ? (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `radial-gradient(70% 45% at 50% 42%, ${C.creme}${hex(0.55 * intensidade)} 0%, ${C.lavanda}${hex(0.35 * intensidade)} 45%, transparent 85%)`,
      }}
    />
  ) : null;
