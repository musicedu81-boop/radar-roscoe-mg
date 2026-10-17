import { COMPASSO } from "./marca";
import narracao from "./narracao.json";

// Roteiro da apresentação. Cada cena dura um número inteiro de compassos (2 s a 120 BPM),
// e cada corte cai exatamente na cabeça de um compasso, junto com o acento da trilha.
// O número de compassos vem da narração (scripts/gerar-narracao.py): a cena dura o tempo
// da fala mais um respiro, arredondado para cima.
export const TRANSICAO = 12; // quadros de transição glitch, centrados no corte

export type Cena = {
  id: string;
  titulo: string; // rótulo curto que aparece no HUD
  compassos: number;
};

const TITULOS: Record<string, string> = {
  abertura: "Abertura",
  numeros: "Ponto de partida",
  ritmo: "Diagnóstico",
  reels: "O que funcionou",
  pilares: "Três pilares",
  estrategia: "Estratégia central",
  semana: "Grade semanal",
  janela: "Janela de publicação",
  calendario: "Calendário",
  metas: "Metas e KPIs",
  crise: "Contingência",
  encerramento: "Encerramento",
};

export const CENAS: Cena[] = narracao.cenas.map((c) => ({
  id: c.id,
  titulo: TITULOS[c.id],
  compassos: c.compassos,
}));

// Narração de cada cena: frases com início e fim em quadros a partir de f = 0 (o corte)
export type Frase = { legenda: string; inicio: number; fim: number };
export const frasesDaCena = (i: number): Frase[] => narracao.cenas[i].frases;

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

export const DURACAO_TOTAL = CENAS.reduce(
  (s, c) => s + c.compassos * COMPASSO,
  0,
);

// Quadro (f, a partir do corte) em que a narração começa a dizer uma palavra da legenda.
// Ex.: momentoDaPalavra(1, "25.850"). `ocorrencia` escolhe a repetição (0 = primeira).
// Compara sem pontuação final e sem diferenciar maiúsculas.
export const momentoDaPalavra = (
  i: number,
  palavra: string,
  ocorrencia = 0,
): number => {
  const limpa = (t: string) =>
    t
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]+$/u, "");
  const achadas = narracao.cenas[i].legendas.filter(
    (c) => limpa(c.text) === limpa(palavra),
  );
  const alvo = achadas[ocorrencia];
  if (!alvo) {
    throw new Error(
      `Palavra "${palavra}" não está na narração da cena ${CENAS[i].id}`,
    );
  }
  return Math.round((alvo.startMs / 1000) * 30);
};
