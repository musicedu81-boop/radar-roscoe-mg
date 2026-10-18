import {useMemo} from 'react';
import {Easing, interpolate, useVideoConfig} from 'remotion';

export const NOME = 'CRIS SANTOS & LÚPUS';
export const MEIO = NOME.slice(1, -1); // tudo entre o C e o S final
export const SLOGAN = 'A REALIDADE DE QUEM VIVE';

// Momentos da vinheta, em segundos
const MOMENTOS = {
  escritaInicio: 0.55,
  escritaFim: 4.25,
  slogan: 4.4,
  mergulho: 5.0,
  subida: 5.6,
  fusao: 7.05,
};

export type Tempos = {
  writeStart: number;
  writeEnd: number;
  tagline: number;
  dive: number;
  rise: number;
  merge: number;
  end: number;
};

export const useTempos = (): Tempos => {
  const {fps, durationInFrames} = useVideoConfig();
  return useMemo(
    () => ({
      writeStart: Math.round(MOMENTOS.escritaInicio * fps),
      writeEnd: Math.round(MOMENTOS.escritaFim * fps),
      tagline: Math.round(MOMENTOS.slogan * fps),
      dive: Math.round(MOMENTOS.mergulho * fps),
      rise: Math.round(MOMENTOS.subida * fps),
      merge: Math.round(MOMENTOS.fusao * fps),
      end: durationInFrames,
    }),
    [fps, durationInFrames],
  );
};

// Enquadramento final, em px do quadro 1080x1920 (vale para 2D e 3D)
export const QUADRO = {
  larguraNome: 940,
  descidaNome: 470,
  alvoBorboleta: {x: 790, y: 860}, // metade borboleta do retrato
  retrato: {largura: 1000, esquerda: 40, topo: -230, proporcao: 1.75},
};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const suave = Easing.bezier(0.65, 0, 0.35, 1);
export const saida = Easing.bezier(0.16, 1, 0.3, 1);

export const progressoEscrita = (f: number, T: Tempos) => interpolate(f, [T.writeStart, T.writeEnd], [0, 1], {...clamp, easing: suave});
export const progressoDescida = (f: number, T: Tempos) => interpolate(f, [T.rise, T.merge], [0, 1], {...clamp, easing: suave});
export const progressoRosto = (f: number, T: Tempos) => interpolate(f, [T.rise, T.merge + 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
// Abertura das asas: 1 aberta, 0 fechada
export const abertura = (f: number) => Math.abs(Math.cos(f * 0.6));
