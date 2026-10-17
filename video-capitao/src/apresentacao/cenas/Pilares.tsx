import { Audio } from "@remotion/media";
import {
  HeartHandshake,
  Landmark,
  LifeBuoy,
  type LucideIcon,
  Quote,
} from "lucide-react";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ARQUETIPO, PILARES } from "../dados";
import {
  clamp,
  COR,
  EASE,
  FONTE_TEXTO,
  FONTE_TITULO,
  MARGEM,
  PILAR,
  type Pilar,
} from "../marca";
import { frasesDaCena, inicioLocal, momentoDaPalavra } from "../roteiro";
import { Cartao3D, LinhaNeon, Titulo } from "../ui/Elementos";
import { Fundo } from "../ui/Fundo";
import { ALTURA_CARTAO, PilaresCartao } from "./PilaresCartao";

// Cena 05 · Três pilares. Três cartões empilhados (Utilidade, Orgulho, Cuidado) que entram em
// 3D quando a locutora diz o nome de cada pilar, sobre "vagas" tracejadas que se desenham em
// "três pilares". Na última frase, a regra do arquétipo entra como citação, com as palavras
// "gesto" e "morador" marcadas no instante em que são ditas.
const INDICE = 4;

const q = (f: number) => f + inicioLocal(INDICE);
const p = (palavra: string, ocorrencia = 0) =>
  momentoDaPalavra(INDICE, palavra, ocorrencia);
const FRASES = frasesDaCena(INDICE);

const ICONES: Record<Pilar, LucideIcon> = {
  Utilidade: LifeBuoy,
  Orgulho: Landmark,
  Cuidado: HeartHandshake,
};

// Momentos da cena, em f, ligados à fala
const M = {
  titulo: 0,
  linha: 10,
  vagas: p("três") - 6, // as três vagas se desenham em "os três pilares"
  passoVagas: 5,
  cartoes: PILARES.map((pl) => p(pl.nome) - 6), // cada cartão entra no nome do pilar
  todos: FRASES[1].fim, // fim da segunda frase: os três cartões voltam ao pleno
  citacao: FRASES[2].inicio - 8,
  marcas: [p("gesto") - 3, p("morador") - 3],
};

// Grade vertical (px). Conteúdo entre y 230 e 1450; a faixa da legenda (1480+) fica livre.
const LARGURA_UTIL = 920;
const ESPACO = 22;
const Y = {
  titulo: 236,
  cartoes: 410,
  citacao: 1232,
};
const yDoCartao = (k: number) => Y.cartoes + k * (ALTURA_CARTAO + ESPACO);

// Foco: o cartão narrado fica pleno; quando a fala passa para o próximo, ele recua um pouco.
// No fim da segunda frase, os três voltam ao pleno.
const focoDoCartao = (k: number, f: number) => {
  const proximo = M.cartoes[k + 1];
  if (proximo === undefined) {
    return 1;
  }
  return interpolate(
    f,
    [proximo, proximo + 12, M.todos, M.todos + 12],
    [1, 0, 0, 1],
    { ...clamp, easing: EASE.suave },
  );
};

// Vaga tracejada onde o cartão vai pousar (aparece em "três pilares")
const Vaga: React.FC<{ k: number; f: number }> = ({ k, f }) => {
  const ini = M.vagas + k * M.passoVagas;
  const desenha = interpolate(f, [ini, ini + 14], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  // Some quando o cartão já cobriu a vaga
  const some = interpolate(f, [M.cartoes[k] + 14, M.cartoes[k] + 24], [1, 0], clamp);
  const cor = PILAR[PILARES[k].nome];
  return (
    <div
      style={{
        position: "absolute",
        left: MARGEM,
        top: yDoCartao(k),
        width: LARGURA_UTIL,
        height: ALTURA_CARTAO,
        boxSizing: "border-box",
        border: "3px dashed rgba(255,255,255,0.4)",
        borderRadius: 16,
        background: "rgba(1,26,54,0.28)",
        opacity: desenha * some,
        clipPath: `inset(0 ${(1 - desenha) * 100}% 0 0 round 16px)`,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 10,
          alignSelf: "stretch",
          background: cor,
          boxShadow: `0 0 18px ${cor}`,
        }}
      />
      <div
        style={{
          marginLeft: 50,
          fontFamily: FONTE_TITULO,
          fontSize: 120,
          lineHeight: 1,
          color: "rgba(255,255,255,0.16)",
        }}
      >
        {String(k + 1).padStart(2, "0")}
      </div>
    </div>
  );
};

// Palavra da citação marcada em amarelo no instante em que a locutora a diz
const Marca: React.FC<{ inicio: number; f: number; children: React.ReactNode }> = ({
  inicio,
  f,
  children,
}) => {
  const t = interpolate(f, [inicio, inicio + 10], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  return (
    <span
      style={{
        color: t > 0.5 ? COR.amarelo : undefined,
        backgroundImage: `linear-gradient(${COR.amarelo}, ${COR.amarelo})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 100%",
        backgroundSize: `${t * 100}% 5px`,
        paddingBottom: 2,
      }}
    >
      {children}
    </span>
  );
};

// A citação do arquétipo, com "gesto" e "morador" marcados na fala
const PALAVRAS_MARCADAS = ["gesto", "morador"];
const Citacao: React.FC<{ f: number }> = ({ f }) => {
  const aparece = interpolate(f, [M.citacao, M.citacao + 14], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const barra = interpolate(f, [M.citacao, M.citacao + 18], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const palavras = ARQUETIPO.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: MARGEM,
        top: Y.citacao,
        width: LARGURA_UTIL,
        display: "flex",
        gap: 26,
      }}
    >
      <div
        style={{
          width: 8,
          flexShrink: 0,
          background: COR.neon,
          boxShadow: `0 0 16px ${COR.neon}`,
          scale: `1 ${barra}`,
          transformOrigin: "50% 0%",
        }}
      />
      <div
        style={{
          opacity: aparece,
          translate: `0px ${(1 - aparece) * 24}px`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Quote size={40} strokeWidth={2.6} color={COR.amarelo} fill={COR.amarelo} />
          <span
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: "0.16em",
              color: COR.neon,
            }}
          >
            ARQUÉTIPO
          </span>
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: FONTE_TEXTO,
            fontWeight: 600,
            fontStyle: "italic",
            fontSize: 36,
            lineHeight: 1.32,
            color: COR.branco,
          }}
        >
          {palavras.map((w, i) => {
            const k = PALAVRAS_MARCADAS.indexOf(w.toLowerCase());
            return (
              <React.Fragment key={i}>
                {k >= 0 ? (
                  <Marca inicio={M.marcas[k]} f={f}>
                    {w}
                  </Marca>
                ) : (
                  w
                )}
                {i < palavras.length - 1 ? " " : ""}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const CenaPilares: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - inicioLocal(INDICE);

  return (
    <AbsoluteFill>
      <Fundo />

      <div style={{ position: "absolute", left: MARGEM, top: Y.titulo, width: LARGURA_UTIL }}>
        <Titulo linhas={["Três *pilares*"]} inicio={q(M.titulo)} tamanho={120} />
        <div style={{ marginTop: 8 }}>
          <LinhaNeon inicio={q(M.linha)} largura={200} />
        </div>
      </div>

      {PILARES.map((_, k) => (
        <Vaga key={k} k={k} f={f} />
      ))}

      {PILARES.map((pl, k) => (
        <Cartao3D
          key={pl.nome}
          inicio={q(M.cartoes[k])}
          de={k % 2 === 0 ? "esquerda" : "direita"}
          style={{
            position: "absolute",
            left: MARGEM,
            top: yDoCartao(k),
            width: LARGURA_UTIL,
            height: ALTURA_CARTAO,
            borderRadius: 16,
          }}
        >
          <PilaresCartao
            numero={k + 1}
            pilar={pl.nome}
            titulo={pl.titulo}
            prova={pl.prova}
            views={pl.views}
            Icone={ICONES[pl.nome]}
            inicioConta={q(M.cartoes[k] + 6)}
            foco={focoDoCartao(k, f)}
          />
        </Cartao3D>
      ))}

      <Citacao f={f} />

      {/* Swoosh baixo na entrada de cada cartão: o pico vem antes do nome do pilar */}
      {M.cartoes.map((ini) => (
        <Sequence key={ini} from={q(ini - 8)} durationInFrames={30} premountFor={fps}>
          <Audio src={staticFile("apresentacao/sfx-swoosh.wav")} volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
