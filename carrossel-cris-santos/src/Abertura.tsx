import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Fundo} from './Fundo';
import {ASSINATURA, MARCA, MarcaAbertura} from './Logo';

// Impacto quente com sinos da trilha da vinheta (6,87s): a marca sonora da Cris Santos & Lúpus
export const IMPACTO_TRILHA = 6.87;
export const TRECHO_TRILHA = 5.6; // começa na harpa acelerando

// Frame do pouso da borboleta no S, na linha do tempo da abertura
export const POUSO_ABERTURA = ASSINATURA.pouso - MARCA.atraso;

// Som da abertura: brilho no voo e o impacto da vinheta 1 frame depois do pouso (a luz chega antes do som)
export const SomAbertura: React.FC = () => {
  const {fps} = useVideoConfig();
  const inicio = POUSO_ABERTURA + 1 - Math.round((IMPACTO_TRILHA - TRECHO_TRILHA) * fps);
  return (
    <>
      <Audio src={staticFile('sfx/sparkle.mp3')} volume={0.35} />
      <Sequence from={inicio} layout="none">
        <Audio src={staticFile('trilha-vinheta.wav')} trimBefore={Math.round(TRECHO_TRILHA * fps)} volume={0.8} />
      </Sequence>
    </>
  );
};

// Prévia da abertura sozinha: a logo se escreve, segura e sobe para o selo do topo
export const Abertura: React.FC = () => (
  <AbsoluteFill>
    <Fundo />
    <MarcaAbertura />
    <SomAbertura />
  </AbsoluteFill>
);
