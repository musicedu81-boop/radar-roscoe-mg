import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Fundo} from './Fundo';
import {IMPACTO_TRILHA, TRECHO_TRILHA} from './Abertura';
import {ASSINATURA, AssinaturaAnimada} from './Logo';

// Fim de vídeo com a logo. O som do pouso cai 1 frame depois da imagem (luz chega antes do som).
export const Assinatura: React.FC = () => {
  const {fps} = useVideoConfig();
  const inicioTrilha = ASSINATURA.pouso + 1 - Math.round((IMPACTO_TRILHA - TRECHO_TRILHA) * fps);
  return (
    <AbsoluteFill>
      <Fundo />
      <AssinaturaAnimada centroY={880} />
      <Audio src={staticFile('sfx/sparkle.mp3')} volume={0.35} />
      <Sequence from={inicioTrilha} layout="none">
        <Audio src={staticFile('trilha-vinheta.wav')} trimBefore={Math.round(TRECHO_TRILHA * fps)} volume={0.8} />
      </Sequence>
    </AbsoluteFill>
  );
};
