import { Easing, interpolate } from "remotion";
import { CALENDARIO, PLANO } from "../dados";
import { clamp, COR, EASE, MARGEM } from "../marca";
import { frasesDaCena, inicioLocal, momentoDaPalavra } from "../roteiro";

// Cena 09 · Calendário: índice no roteiro, momentos da cena em f (a partir do corte) ligados à
// fala, câmera do plano inclinado, cores por eixo e textos derivados de dados.ts.
export const INDICE_CALENDARIO = 8;

// f (a partir do corte) para o quadro local da sequência, que é o que os componentes de ui usam
export const qCal = (f: number) => f + inicioLocal(INDICE_CALENDARIO);

const p = (palavra: string, ocorrencia = 0) =>
  momentoDaPalavra(INDICE_CALENDARIO, palavra, ocorrencia);
const FRASES = frasesDaCena(INDICE_CALENDARIO);

const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const primeiraPalavra = (t: string) => t.split(" ")[0];

// Eixos na ordem em que aparecem no calendário, cada um com uma cor da marca
export const EIXOS = CALENDARIO.map((s) => s.eixo).filter(
  (e, i, todos) => todos.indexOf(e) === i,
);
type Estilo = { fundo: string; texto: string; borda: string; destaque: boolean };
const ESTILOS: Estilo[] = [
  { fundo: COR.neon, texto: COR.noite, borda: COR.neon, destaque: false },
  { fundo: COR.amarelo, texto: COR.noite, borda: COR.amarelo, destaque: false },
  { fundo: COR.vivo, texto: COR.branco, borda: "rgba(255,255,255,0.55)", destaque: false },
  { fundo: COR.branco, texto: COR.noite, borda: COR.branco, destaque: false },
  { fundo: COR.verde, texto: COR.branco, borda: COR.verde, destaque: false },
  // O último eixo (Balanço 2026) fecha o ano: azul-noite com borda e texto amarelos
  { fundo: COR.noite, texto: COR.amarelo, borda: COR.amarelo, destaque: true },
];
export const estiloDoEixo = (eixo: string): Estilo =>
  ESTILOS[Math.min(EIXOS.indexOf(eixo), ESTILOS.length - 1)];

// Cor de cada eixo para o nó da linha e a faixa da semana
export const corDoEixo = (eixo: string) => {
  const e = estiloDoEixo(eixo);
  return e.destaque ? COR.amarelo : e.fundo;
};

// Marcos citados na fala: as datas da terceira frase ("04/11 e 02/12") apontam as semanas de
// "Os Números"; o eixo citado na última frase ("Balanço 2026") aponta a semana que fecha o ano.
const datasFaladas = FRASES[2].legenda.match(/\d{2}\/\d{2}/g) ?? [];
export const MARCOS_NUMEROS = datasFaladas.map((data) => {
  const k = CALENDARIO.findIndex((s) => s.destaque.includes(`(${data})`));
  if (k < 0) {
    throw new Error(`Marco ${data} não está no CALENDARIO`);
  }
  const m = CALENDARIO[k].destaque.match(/^(.+?):\s*(.+?)\s*\(\d{2}\/\d{2}\)$/);
  return {
    k,
    data,
    titulo: m ? m[1] : CALENDARIO[k].destaque,
    texto: m ? maiuscula(m[2]) : "",
  };
});
const kFinal = CALENDARIO.findIndex((s) => FRASES[3].legenda.includes(s.eixo));
if (kFinal < 0) {
  throw new Error("O eixo da última frase não está no CALENDARIO");
}
export const MARCO_FINAL = {
  k: kFinal,
  eixo: CALENDARIO[kFinal].eixo,
  datas: CALENDARIO[kFinal].datas,
  texto: CALENDARIO[kFinal].destaque,
  semana: CALENDARIO[kFinal].semana,
};

// Início e fim do plano (pontas da linha do tempo) e a palavra-chave do título
// "Estreia do plano em 26/10" -> "Estreia" (a ponta do início fica curta para não passar por
// baixo da placa da semana 2)
const ESTREIA = primeiraPalavra(CALENDARIO[0].destaque);
export const PONTAS = {
  inicio: PLANO.periodo.inicio, // "26/10"
  estreia: ESTREIA, // "Estreia"
  fim: PLANO.periodo.fim, // "31/12/2026"
  fimCurto: PLANO.periodo.fim.slice(0, 5), // "31/12"
};

// Momentos (f). A entrada começa 4 a 8 quadros antes da palavra; o que a fala não cita entra
// no tempo musical (múltiplos de 15).
export const T = {
  titulo: 0,
  plano: -10, // o plano se inclina e se abre (em f = -6 já está a caminho)
  linhas: -8, // as semanas entram uma a uma, de 3 em 3 quadros (a 1ª já em f = -6)
  dez: p("10") - 6, // "10 SEMANAS" no subtítulo
  semanas: p("semanas") - 6,
  eixos: p("cada") - 6, // as etiquetas dos eixos entram neutras, de 4 em 4 quadros
  umEixo: p("eixo") - 6, // "· UM EIXO POR SEMANA"
  // Cada eixo acende (em todas as suas semanas) quando a locutora diz o nome dele
  acende: (eixo: string) => p(primeiraPalavra(eixo).toLowerCase()) - 6,
  mergulho: 230, // depois de "se revezam": a câmera desliza até novembro
  numeros: p("números") - 6, // as semanas de "Os Números" piscam em amarelo
  marcos: MARCOS_NUMEROS.map(({ data }) => p(data) - 8), // as placas se levantam nas datas
  desliza: 368, // depois de "02/12": a câmera desliza até a última semana
  balanco: p("balanço") - 6, // a placa do Balanço 2026 se levanta
  ano: p("2026") - 4, // "2026" com glitch
  fim: 546,
};

// Câmera do plano inclinado: c = posição no plano (px) que fica na linha de foco, th = inclinação
// (graus), z = aproximação (px) e foco = altura da linha de foco no palco (px)
const K = {
  f: [T.plano, 24, T.mergulho, T.mergulho + 34, T.desliza, T.desliza + 44, T.fim],
  c: [942, 942, 930, 600, 680, 942, 930],
  th: [74, 36, 33, 31, 31, 31, 30],
  z: [-170, 0, 10, 20, 20, 10, 16],
  foco: [856, 856, 856, 800, 800, 736, 736],
};
const CURVAS = [
  EASE.entrada,
  Easing.linear,
  EASE.suave,
  Easing.linear,
  EASE.suave,
  Easing.linear,
];
const trilha = (f: number, valores: number[]) =>
  interpolate(f, K.f, valores, { ...clamp, easing: CURVAS });
export const camera = (f: number) => ({
  c: trilha(f, K.c),
  th: trilha(f, K.th),
  z: trilha(f, K.z),
  foco: trilha(f, K.foco),
});

// Grade da tela vertical (px). Conteúdo entre y 230 e 1450; a faixa da legenda fica livre.
// Esmaecimento da base do palco (px): curto na visão geral e no fim (a última semana encosta
// na base), longo enquanto a câmera passeia pelo meio da lista (a semana que sai pela base some
// devagar em vez de ser cortada)
export const esmaecimentoDaBase = (f: number) =>
  interpolate(
    f,
    [T.mergulho, T.mergulho + 30, T.desliza, T.desliza + 40],
    [36, 130, 130, 36],
    { ...clamp, easing: EASE.suave },
  );

export const GRADE = {
  x: MARGEM,
  titulo: 236,
  tamanhoTitulo: 104,
  subtitulo: 474,
  palco: { top: 540, altura: 910 }, // 540 a 1450
  perspectiva: 1500,
  fuga: -200, // ponto de fuga acima do palco (y no palco)
};

// Plano (px, no próprio plano): espinha à esquerda, semanas empilhadas de cima para baixo
export const PLANO_3D = {
  largura: 900,
  passo: 100, // de uma semana para a outra
  alturaLinha: 84,
  espinha: 34,
  cartaoX: 70,
  inicioY: -62, // ponta do início (26/10)
  fimY: 10 * 100 + 26, // ponta do fim (31/12/2026)
};
export const yDaSemana = (k: number) => k * PLANO_3D.passo;
