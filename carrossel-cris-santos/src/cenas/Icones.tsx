import {interpolate} from 'remotion';
import {C, chegada, clamp} from '../tokens';

export type NomeIcone = 'bateria' | 'capsula' | 'raio' | 'lua' | 'nuvem' | 'cerebro';

// Ícones em traço (caixa 120x120), desenhados do zero com pathLength 1
const TRACOS: Record<NomeIcone, {d: string[]; giro?: number; preenche?: string}> = {
  bateria: {d: ['M30 40 H84 A8 8 0 0 1 92 48 V72 A8 8 0 0 1 84 80 H30 A8 8 0 0 1 22 72 V48 A8 8 0 0 1 30 40 Z', 'M98 52 V68'], preenche: 'M30 48 H42 V72 H30 Z'},
  capsula: {d: ['M40 44 H80 A16 16 0 0 1 80 76 H40 A16 16 0 0 1 40 44 Z', 'M60 44 V76'], giro: -35},
  raio: {d: ['M68 14 L36 64 H58 L50 106 L86 52 H64 Z']},
  lua: {d: ['M74 22 A40 40 0 1 0 98 82 A32 32 0 1 1 74 22 Z', 'M86 14 H98 L86 28 H98']},
  nuvem: {d: ['M36 76 A18 18 0 0 1 38 42 A24 24 0 0 1 82 38 A19 19 0 0 1 88 76 Z', 'M46 88 L42 100', 'M62 88 L58 100', 'M78 88 L74 100']},
  cerebro: {d: ['M60 26 C44 18 28 28 30 44 C18 50 20 70 34 74 C34 88 50 96 60 88 C70 96 86 88 86 74 C100 70 102 50 90 44 C92 28 76 18 60 26 Z', 'M60 26 V88', 'M44 46 C50 50 50 58 44 62', 'M76 46 C70 50 70 58 76 62']},
};

// Ícone que se desenha: t em frames desde o começo do traço
export const Icone: React.FC<{nome: NomeIcone; t: number; tamanho: number; cor?: string}> = ({nome, t, tamanho, cor = C.creme}) => {
  const ic = TRACOS[nome];
  const p = interpolate(t, [0, 22], [0, 1], {...clamp, easing: chegada});
  const enche = interpolate(t, [22, 30], [0, 1], clamp);
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 120 120" style={{overflow: 'visible'}}>
      <g transform={ic.giro ? `rotate(${ic.giro} 60 60)` : undefined} fill="none" stroke={cor} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        {ic.d.map((d, i) => (
          <path key={i} d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - interpolate(p, [i * 0.12, Math.min(1, 0.7 + i * 0.12)], [0, 1], clamp)} />
        ))}
        {ic.preenche ? <path d={ic.preenche} fill={C.lavanda} stroke="none" opacity={enche} /> : null}
      </g>
    </svg>
  );
};

// Medalhão de vidro em 3D com o ícone dentro; gira devagar no eixo vertical (órbita)
export const Medalhao: React.FC<{nome: NomeIcone; t: number; tamanho: number; giro?: number}> = ({nome, t, tamanho, giro = 0}) => {
  const e = interpolate(t, [0, 14], [0, 1], {...clamp, easing: chegada});
  return (
    <div style={{perspective: tamanho * 6, opacity: e, filter: e < 1 ? `blur(${10 * (1 - e)}px)` : undefined}}>
      <div
        style={{
          width: tamanho,
          height: tamanho,
          borderRadius: '50%',
          transform: `rotateY(${giro}deg) scale(${0.7 + 0.3 * e})`,
          background: `radial-gradient(circle at 38% 32%, ${C.creme}33 0%, ${C.lavanda}26 38%, ${C.principal}55 75%, ${C.profundo}88 100%)`,
          boxShadow: `0 0 0 3px ${C.lavanda}aa, 0 0 ${tamanho * 0.25}px ${C.claro}88, inset 0 0 ${tamanho * 0.2}px ${C.claro}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icone nome={nome} t={t - 8} tamanho={tamanho * 0.56} />
      </div>
    </div>
  );
};
