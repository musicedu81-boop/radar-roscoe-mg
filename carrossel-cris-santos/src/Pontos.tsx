import {C} from './tokens';

// Indicador do carrossel, como no Instagram: a pílula lavanda anda até o slide da vez
export const Pontos: React.FC<{n: number; posicao: number; opacidade: number; y: number}> = ({n, posicao, opacidade, y}) => {
  if (n < 2) return null;
  const passo = 30;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: passo - 12, opacity: opacidade}}>
      {Array.from({length: n}, (_, i) => {
        const perto = Math.max(0, 1 - Math.abs(i - posicao));
        return (
          <div
            key={i}
            style={{
              width: 12 + 26 * perto,
              height: 12,
              borderRadius: 6,
              background: perto > 0.5 ? C.lavanda : C.creme,
              opacity: 0.35 + 0.65 * perto,
              boxShadow: perto > 0.5 ? `0 0 14px ${C.claro}` : 'none',
            }}
          />
        );
      })}
    </div>
  );
};
