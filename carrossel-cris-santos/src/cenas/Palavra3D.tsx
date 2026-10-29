import {C, FONTE} from '../tokens';

// Palavra extrudada em 3D: camadas empilhadas no eixo Z, da frente em degradê creme e lavanda
// até o fundo roxo profundo, com brilho atrás. giroY e giroX inclinam o bloco (órbita da câmera).
export const Palavra3D: React.FC<{
  texto: string;
  tamanho: number;
  giroY?: number;
  giroX?: number;
  camadas?: number;
  profundidade?: number;
  brilho?: number;
}> = ({texto, tamanho, giroY = 0, giroX = 0, camadas = 14, profundidade = 0.32, brilho = 1}) => {
  const passo = (tamanho * profundidade) / camadas;
  const base: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    fontFamily: FONTE,
    fontWeight: 900,
    fontSize: tamanho,
    lineHeight: 1,
    letterSpacing: '0.01em',
    whiteSpace: 'pre',
  };
  return (
    <div style={{perspective: tamanho * 9, display: 'inline-block'}}>
      <div style={{position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${giroX}deg) rotateY(${giroY}deg)`}}>
        {/* a camada da frente define o tamanho do bloco */}
        <div style={{...base, position: 'relative', visibility: 'hidden'}}>{texto}</div>
        {Array.from({length: camadas}, (_, k) => {
          const i = camadas - k; // do fundo para a frente
          const u = i / camadas;
          return (
            <div
              key={i}
              style={{
                ...base,
                transform: `translateZ(${-i * passo}px)`,
                color: u > 0.55 ? C.profundo : C.principal,
                opacity: 0.95,
                textShadow: i === camadas ? `0 0 ${tamanho * 0.5 * brilho}px ${C.claro}, 0 0 ${tamanho * 0.18 * brilho}px ${C.medio}` : undefined,
              }}
            >
              {texto}
            </div>
          );
        })}
        <div
          style={{
            ...base,
            transform: 'translateZ(0px)',
            backgroundImage: `linear-gradient(180deg, ${C.creme} 30%, ${C.lavanda} 95%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {texto}
        </div>
      </div>
    </div>
  );
};
