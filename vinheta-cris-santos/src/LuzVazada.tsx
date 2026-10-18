import {lightLeak} from '@remotion/effects/light-leak';
import {Solid, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from './roteiro';

// Vazamento de luz lilás na entrada do retrato. Use dentro de uma <Sequence>.
// hueShift 120 leva o tom padrão (âmbar) para o violeta da paleta
export const LuzVazada: React.FC<{seed?: number; intensidade?: number}> = ({seed = 4, intensidade = 0.45}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  return (
    <Solid
      width={width}
      height={height}
      style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: intensidade}}
      effects={[
        lightLeak({
          seed,
          hueShift: 120,
          progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp),
        }),
      ]}
    />
  );
};
