import dados from './slides.json';

// Linha do tempo calculada por scripts/preparar-slides.py (a mesma que compôs a trilha)
export type Slide = {arquivo: string; largura: number; altura: number; tempos: number};
export const SLIDES: Slide[] = dados.slides;
export const LINHA = dados.linha;

// O deslize da troca: o slide que sai acelera para a esquerda e o que entra chega com cauda longa
export const DESLIZE = 12;
