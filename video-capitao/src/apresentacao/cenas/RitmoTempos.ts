import { NUMEROS, RITMO } from "../dados";
import { frasesDaCena, inicioLocal, momentoDaPalavra } from "../roteiro";

// Cena 03 · Diagnóstico (ritmo): índice no roteiro e momentos da cena, em f (a partir do corte),
// ligados à fala. A entrada de cada elemento começa 4 a 8 quadros antes da palavra.
export const INDICE_RITMO = 2;

// f (a partir do corte) para o quadro local da sequência, que é o que os componentes de ui usam
export const qRitmo = (f: number) => f + inicioLocal(INDICE_RITMO);

const p = (palavra: string, ocorrencia = 0) =>
  momentoDaPalavra(INDICE_RITMO, palavra, ocorrencia);

export const T = {
  titulo: 0,
  eixo: 8,
  hoje: p("6") - 6, // "ganha cerca de 6 seguidores por dia"
  media: 90, // não é falada: entra no tempo musical, logo depois do "por dia"
  anel: p("76%") - 6,
  anelTexto: p("ganho") - 6,
  pico: p("14/09") - 6,
  picoTotal: 285, // não é falado: tempo musical depois da frase
  slot32: p("32") - 6, // "Para chegar a 32 mil"
  dispara: p("seriam") - 6, // "seriam 81 por dia": a barra dispara
  naoFecha: p("não") - 6, // "Essa meta não fecha"
  realista: p("realista") - 6,
  quinze: p("15") - 8, // "pede 15 por dia"
  desafio: 525, // não é falado: tempo musical depois da última frase
};

// Datas do pico: vêm da própria fala (narracao.json), para a tela dizer exatamente o que a
// locutora diz. Pedido feito para entrarem em dados.ts (RITMO.pico).
const datasDoPico = frasesDaCena(INDICE_RITMO)[1].legenda.match(/\d{2}\/\d{2}/g);
if (!datasDoPico || datasDoPico.length < 2) {
  throw new Error("Datas do pico não encontradas na narração da cena ritmo");
}
export const PICO = { inicio: datasDoPico[0], fim: datasDoPico[1] };

// "desde 06/10" vem da nota da mediana de views (mesmo marco do ritmo atual)
const desde = NUMEROS.viewsPorReel.nota.match(/desde \d{2}\/\d{2}/);
export const DESDE = desde ? desde[0] : "";

// As cinco barras de seguidores por dia, em ordem crescente
const [META, DESAFIO, NAO_FECHA] = RITMO.necessario;
export const DADOS_BARRAS = {
  hoje: RITMO.ritmoAtualPorDia,
  media: RITMO.mediaPorDia,
  meta: META,
  desafio: DESAFIO,
  naoFecha: NAO_FECHA,
};
