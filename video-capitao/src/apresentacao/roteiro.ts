import { COMPASSO } from "./marca";

// Roteiro da apresentação. Cada cena dura um número inteiro de compassos (2 s a 120 BPM),
// e cada corte cai exatamente na cabeça de um compasso, junto com o acento da trilha.
export const TRANSICAO = 12; // quadros de transição glitch, centrados no corte

export type Cena = {
  id: string;
  titulo: string; // rótulo curto que aparece no HUD
  compassos: number;
};

export const CENAS: Cena[] = [
  { id: "abertura", titulo: "Abertura", compassos: 5 },
  { id: "numeros", titulo: "Ponto de partida", compassos: 4 },
  { id: "ritmo", titulo: "Diagnóstico", compassos: 5 },
  { id: "reels", titulo: "O que funcionou", compassos: 6 },
  { id: "pilares", titulo: "Três pilares", compassos: 4 },
  { id: "estrategia", titulo: "Estratégia central", compassos: 3 },
  { id: "semana", titulo: "Grade semanal", compassos: 8 },
  { id: "janela", titulo: "Janela de publicação", compassos: 4 },
  { id: "calendario", titulo: "Calendário", compassos: 6 },
  { id: "metas", titulo: "Metas e KPIs", compassos: 6 },
  { id: "crise", titulo: "Contingência", compassos: 4 },
  { id: "encerramento", titulo: "Encerramento", compassos: 4 },
];

// Duração de cada <TransitionSeries.Sequence>: a cena começa TRANSICAO/2 quadros antes do
// seu compasso (exceto a primeira) e termina TRANSICAO/2 depois (exceto a última).
export const duracaoDaSequencia = (i: number) => {
  const meio = TRANSICAO / 2;
  const antes = i === 0 ? 0 : meio;
  const depois = i === CENAS.length - 1 ? 0 : meio;
  return CENAS[i].compassos * COMPASSO + antes + depois;
};

// Quadro, no tempo global, em que o compasso de cada cena começa (o corte)
export const inicioDaCena = (i: number) =>
  CENAS.slice(0, i).reduce((s, c) => s + c.compassos * COMPASSO, 0);

// Dentro de uma cena: quadro local em que o primeiro compasso da cena começa.
// Use em toda animação: const f = frame - inicioLocal(i).
export const inicioLocal = (i: number) => (i === 0 ? 0 : TRANSICAO / 2);

export const DURACAO_TOTAL = CENAS.reduce((s, c) => s + c.compassos * COMPASSO, 0);
