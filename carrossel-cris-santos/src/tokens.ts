import {Easing} from 'remotion';

// Identidade Cris Santos & Lúpus: a mesma paleta, fonte e textos da vinheta
export const C = {
  profundo: '#2D0845',
  principal: '#5B1A8A',
  medio: '#7B2FBE',
  claro: '#A855D8',
  lavanda: '#D4A0FF',
  creme: '#FDF8FF',
  noite: '#0D0215',
};
export const FAMILIA = 'Montserrat';
export const FONTE = `${FAMILIA}, Helvetica, Arial, sans-serif`;
export const NOME = 'CRIS SANTOS & LÚPUS';
export const SLOGAN = 'A REALIDADE DE QUEM VIVE';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// Curvas por papel (regras de movimento do HyperFrames): chegada com cauda longa,
// movimento de câmera nos dois sentidos, saída acelerando
export const chegada = Easing.bezier(0.16, 1, 0.3, 1);
export const vaiVem = Easing.bezier(0.65, 0, 0.35, 1);
export const saida = Easing.bezier(0.55, 0, 1, 0.45);

// Texto da marca: Montserrat Black em degradê creme para lavanda, com brilho roxo
export const textoMarca = (fs: number): React.CSSProperties => ({
  fontFamily: FONTE,
  fontWeight: 900,
  fontSize: fs,
  letterSpacing: '0.02em',
  lineHeight: 1.3,
  whiteSpace: 'pre',
  backgroundImage: `linear-gradient(180deg, ${C.creme} 35%, ${C.lavanda} 90%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});
