import { Easing, interpolate } from "remotion";
import { JANELA, SEMANA } from "../dados";
import { clamp, EASE, formatarNumero, MARGEM } from "../marca";
import { inicioLocal, momentoDaPalavra } from "../roteiro";

// Cena 08 · Janela de publicação: índice no roteiro, momentos da cena em f (a partir do corte)
// ligados à fala, textos derivados de dados.ts e a grade da tela vertical.
export const INDICE_JANELA = 7;

// f (a partir do corte) para o quadro local da sequência, que é o que os componentes de ui usam
export const qJanela = (f: number) => f + inicioLocal(INDICE_JANELA);

const p = (palavra: string, ocorrencia = 0) =>
  momentoDaPalavra(INDICE_JANELA, palavra, ocorrencia);

// Momentos (f). A entrada começa 4 a 8 quadros antes da palavra; o que a fala não cita entra
// no tempo musical (múltiplos de 15).
export const T = {
  titulo: 0,
  relogio: -10, // o mostrador se monta (em f = -6, no meio da transição, já está a caminho)
  dias: 4, // as sete vagas dos dias entram neutras
  partida: 6, // o cursor sai da 0h e percorre a manhã
  dez: p("10h") - 2, // pousa nas 10h junto com a fala
  varre: p("10h") + 4, // varre de 10h a 12h acendendo o pico
  doze: p("pico") + 6,
  legenda1: p("10h") + 2, // item "10H ÀS 12H · Reels dos quadros"
  pico: p("pico") - 6, // "PICO DE AUDIÊNCIA"
  uteis: p("segunda") - 6, // SEG a SEX acendem em verde-neon, um a cada 4 quadros
  uteisRotulo: p("sexta") - 4,
  tarde: 120, // não falado: o cursor segue pela tarde no tempo musical
  segundo: p("segundo") - 6, // o segmento das 18h pisca em amarelo: é para lá que o cursor vai
  dezoito: p("18h") - 4, // pousa nas 18h e o bloco amarelo acende
  carrosseis: p("carrosséis") - 6,
  fase2: 255, // tempo musical depois de "extras": o relógio encolhe e abre espaço
  cartao: p("fim"), // cartão do comparativo entra em 3D
  fimDeSemana: p("fim") - 4, // SÁB e DOM acendem em coral
  fimRotulo: p("semana") - 4,
  sexta: p("alcance") - 6, // a barra da sexta cresce e conta
  cai: p("cai") - 6, // a barra do sábado cai para a metade
  metade: p("metade") - 6, // marcador da metade
  queda: p("metade") + 6, // selo da queda em %
  fim: 426,
};

// Hora do cursor (contínua, pode passar de 24: depois das 18h ele atravessa a meia-noite e
// pousa nas 10h do dia seguinte, o sábado). Entre os movimentos, uma deriva lenta.
export const horaDoCursor = (f: number) =>
  interpolate(
    f,
    [
      T.partida,
      T.dez,
      T.varre,
      T.doze,
      T.tarde,
      T.dezoito + 2,
      T.fase2,
      T.sexta + 6,
      T.fim,
    ],
    [0, 10, 10, 12, 12.4, 18, 18.6, 34, 34.9],
    {
      ...clamp,
      easing: [
        EASE.suave,
        Easing.linear,
        EASE.suave,
        Easing.linear,
        EASE.suave,
        Easing.linear,
        EASE.suave,
        Easing.linear,
      ],
    },
  );

// Textos derivados de dados.ts (nada redigitado)
const [REGRA_10, REGRA_18] = JANELA.regra.split(". ");
const oQueSai = (frase: string) =>
  frase.replace(/^Os\s+/, "").replace(/\s+saem.*$/, "");
const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export const TEXTO = {
  pico: JANELA.picoPrincipal, // "10h às 12h"
  segundo: JANELA.segundoPico, // "18h"
  saiAs10: maiuscula(oQueSai(REGRA_10)), // "Reels dos quadros"
  saiAs18: maiuscula(oQueSai(REGRA_18)), // "Carrosséis extras"
  uteis: JANELA.diasUteis, // "segunda a sexta"
  siglas: SEMANA.map((d) => d.sigla), // SEG ... DOM
};

// Horas que limitam os blocos acesos, lidas dos textos ("10h às 12h", "18h")
const horas = (t: string) => (t.match(/\d+/g) ?? []).map(Number);
const [H_PICO_INI, H_PICO_FIM] = horas(JANELA.picoPrincipal);
const [H_SEGUNDO] = horas(JANELA.segundoPico);
export const HORAS = {
  picoIni: H_PICO_INI,
  picoFim: H_PICO_FIM,
  segundo: H_SEGUNDO,
};

// Comparativo do fim de semana: "Sexta, 10h" x "Sábado, 10h"
const [SEXTA, SABADO] = JANELA.comparativo;
const partes = (rotulo: string) => rotulo.split(", ");
export const COMPARATIVO = {
  sexta: { dia: partes(SEXTA.rotulo)[0], valor: SEXTA.pontos },
  sabado: { dia: partes(SABADO.rotulo)[0], valor: SABADO.pontos },
  hora: partes(SEXTA.rotulo)[1], // "10h"
  fracao: SABADO.pontos / SEXTA.pontos,
  queda: `−${formatarNumero(Math.round((1 - SABADO.pontos / SEXTA.pontos) * 100))}%`,
};

// Grade vertical (px). Conteúdo entre y 230 e 1450; a faixa da legenda (1480+) fica livre.
export const LARGURA_UTIL = 920;
export const GRADE = {
  x: MARGEM,
  titulo: 236,
  dias: 372, // linha dos sete dias
  alturaDia: 70,
  larguraDia: 120,
  rotulosDias: 456,
  // Relógio: centro e escala na fase 1 (grande) e na fase 2 (resumo ao lado da legenda)
  relogio1: { x: 540, y: 905, escala: 1 },
  relogio2: { x: 292, y: 712, escala: 0.5 },
  // Legenda dos dois picos: lado a lado embaixo (fase 1) e empilhada à direita (fase 2)
  legenda1: [
    { x: MARGEM, y: 1302 },
    { x: 560, y: 1302 },
  ],
  legenda2: [
    { x: 528, y: 574 },
    { x: 528, y: 734 },
  ],
  cartao: { top: 930, altura: 510 },
};
