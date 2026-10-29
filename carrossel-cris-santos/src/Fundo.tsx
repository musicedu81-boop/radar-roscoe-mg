import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from './tokens';

// Poeira de luz lavanda subindo devagar: o mundo atrás se mexe, os textos ficam parados
const Poeira: React.FC<{quantidade: number}> = ({quantidade}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <>
      {Array.from({length: quantidade}, (_, i) => {
        const r = 1.2 + random(`pr${i}`) * 2.6;
        const vel = 0.25 + random(`pv${i}`) * 0.6;
        const y = (((random(`py${i}`) * (height + 80) - f * vel) % (height + 80)) + height + 80) % (height + 80) - 40;
        const x = random(`px${i}`) * width + Math.sin(f / 40 + i) * 14;
        const op = (0.25 + random(`po${i}`) * 0.5) * (0.6 + 0.4 * Math.sin(f / 18 + i * 1.7));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: C.creme, opacity: op, boxShadow: `0 0 ${r * 5}px ${C.lavanda}`}} />;
      })}
    </>
  );
};

// Fundo da marca, igual ao da vinheta: foco roxo no alto, bordas na cor da noite
export const Fundo: React.FC<{poeira?: number}> = ({poeira = 40}) => (
  <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 35%, ${C.principal} 0%, ${C.profundo} 45%, ${C.noite} 100%)`, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.lavanda}22 0%, transparent 40%)`}} />
    <Poeira quantidade={poeira} />
  </AbsoluteFill>
);
