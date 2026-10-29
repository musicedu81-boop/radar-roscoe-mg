import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Fundo} from './Fundo';
import {ASSINATURA, AssinaturaAnimada} from './Logo';

// Impacto quente com sinos da trilha da vinheta (6,87s): a marca sonora da Cris Santos & Lúpus
const IMPACTO_TRILHA = 6.87;
const TRECHO_TRILHA = 5.6; // começa na harpa acelerando

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
