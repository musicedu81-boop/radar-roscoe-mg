import dados from './slides.json';

// Linha do tempo calculada por scripts/preparar-slides.py (a mesma que compôs a trilha)
export type Slide = {arquivo: string; largura: number; altura: number; tempos: number};
export type Linha = {fps: number; tempo: number; pousos: number[]; trocas: string[]; saidaUltimo: number; pousoAssinatura: number; duracao: number};
export const SLIDES: Slide[] = dados.slides;
export const LINHA: Linha = dados.linha;
