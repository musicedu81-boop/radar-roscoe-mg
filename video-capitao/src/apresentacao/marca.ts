import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

// Identidade visual do Capitão Vítor, tirada do Planejamento Estratégico (aba Identidade)
export const COR = {
  noite: "#023564", // azul-noite: fundos e títulos na inversão
  fundo: "#054B87", // azul de fundo: degradês
  vivo: "#005CDB", // azul-vivo: etiquetas, destaques
  neon: "#01ED43", // verde-neon: linhas de assinatura, etiquetas de lugar
  verde: "#16A442", // verde: pills, cabeçalho dos cards de números
  amarelo: "#FFCD0E", // amarelo: palavra-chave do título, bordas
  branco: "#FFFFFF",
  coral: "#E05A3A", // alerta (o que não funciona, crise)
  // Apoio
  noiteProfunda: "#011A36",
  tintaClara: "rgba(255,255,255,0.78)",
  tintaSuave: "rgba(255,255,255,0.55)",
};

// Cores dos três pilares de conteúdo
export const PILAR = {
  Utilidade: COR.vivo,
  Orgulho: COR.amarelo,
  Cuidado: COR.neon,
} as const;
export type Pilar = keyof typeof PILAR;

// Títulos: Anton (condensada ultrabold). Textos: Montserrat.
export const FONTE_TITULO = "Anton";
export const FONTE_TEXTO = "Montserrat";

const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";

loadFont({ family: FONTE_TITULO, url: staticFile("fonts/anton-latin.woff2"), weight: "400", unicodeRange: LATIN });
loadFont({ family: FONTE_TITULO, url: staticFile("fonts/anton-latin-ext.woff2"), weight: "400", unicodeRange: LATIN_EXT });
loadFont({ family: FONTE_TEXTO, url: staticFile("fonts/montserrat-latin.woff2"), weight: "100 900", unicodeRange: LATIN });
loadFont({ family: FONTE_TEXTO, url: staticFile("fonts/montserrat-latin-ext.woff2"), weight: "100 900", unicodeRange: LATIN_EXT });

export const LOGO = {
  // Texto branco: para fundos azuis
  branco: staticFile("brand/logo-branco.png"),
  // Texto azul: para fundo branco (inversão)
  azul: staticFile("brand/logo-azul.png"),
  // Proporção do PNG (560x324)
  proporcao: 560 / 324,
};

// Tela 16:9 e margem de segurança
export const LARGURA = 1920;
export const ALTURA = 1080;
export const MARGEM = 120;

// Ritmo da trilha: 120 BPM. Um tempo = 15 quadros, um compasso = 60 quadros (2 s)
export const FPS = 30;
export const TEMPO = 15;
export const COMPASSO = 60;

// Curvas de movimento padrão
export const EASE = {
  entrada: Easing.bezier(0.16, 1, 0.3, 1), // desacelera forte (expo out)
  saida: Easing.bezier(0.7, 0, 0.84, 0), // acelera (expo in)
  suave: Easing.bezier(0.65, 0, 0.35, 1), // in-out
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Números no padrão brasileiro: 25.850 e 3,6
export const formatarNumero = (n: number, casas = 0) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
