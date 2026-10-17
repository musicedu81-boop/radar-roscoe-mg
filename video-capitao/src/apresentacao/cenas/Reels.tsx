import { Audio } from "@remotion/media";
import { Share2 } from "lucide-react";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KPIS, TOP_REELS } from "../dados";
import {
  clamp,
  COR,
  EASE,
  FONTE_TEXTO,
  FONTE_TITULO,
  formatarNumero,
  MARGEM,
  PILAR,
  type Pilar,
} from "../marca";
import { frasesDaCena, inicioLocal, momentoDaPalavra } from "../roteiro";
import { Contador, LinhaNeon, Texto, Titulo } from "../ui/Elementos";
import { Fundo } from "../ui/Fundo";
import {
  ALTURA_MAX,
  alturaDaBarra,
  cameraDoQuadro,
  criarProjetor,
  LARG_BARRA,
  PISO,
  PROF_BARRA,
  ReelsGrafico3D,
  xDaBarra,
} from "./ReelsGrafico";

// Cena 04 · O que funcionou. Gráfico de barras 3D real (three.js) com os 5 Reels de maior
// alcance, cor por pilar. A câmera faz uma órbita curta e assenta para leitura; os rótulos
// HTML seguem a projeção do topo de cada barra. A barra do temporal cresce na frase
// "chegou a 105 mil views" e a legenda dos pilares entra na última frase.
const INDICE = 3;

// f (a partir do corte) para o quadro local da sequência, que é o que os componentes de ui usam
const q = (f: number) => f + inicioLocal(INDICE);
const p = (palavra: string, ocorrencia = 0) =>
  momentoDaPalavra(INDICE, palavra, ocorrencia);
const FRASES = frasesDaCena(INDICE);

// Momentos da cena, em f, ligados à fala (a entrada começa 4 a 8 quadros antes da palavra)
const M = {
  titulo: 0,
  linha: 8,
  subtitulo: 14,
  barras: 30, // as 4 barras menores sobem na pergunta, no tempo musical
  passoBarras: 6,
  duracaoBarra: 30,
  heroi: p("temporal") - 6, // o Reel do temporal é apresentado
  cresce: p("chegou") - 4, // a barra de 105 mil dispara...
  pousa: p("mil") + 4, // ...e pousa logo depois de "105 mil"
  pilares: [p("utilidade") - 5, p("orgulho") - 5, p("gente") - 5],
  todos: FRASES[2].fim - 8, // fim da última frase: tudo aceso para o quadro final
};

const ORDEM_PILARES: Pilar[] = ["Utilidade", "Orgulho", "Cuidado"];

// Textos derivados de dados.ts (nada redigitado)
const TITULO_CURTO = TOP_REELS.map((r) => r.titulo.split(", ")[0]);
const FONTE = `Fonte: ${KPIS[0].fonte}`;
const SUBTITULO = `${TOP_REELS.length} Reels de maior alcance no último mês`;

// Crescimento de cada barra: as 4 menores sobem em cascata, a do temporal na frase dela
const inicioDaBarra = (i: number) =>
  i === 0 ? M.cresce : M.barras + (i - 1) * M.passoBarras;
const duracaoDaBarra = (i: number) =>
  i === 0 ? M.pousa - M.cresce : M.duracaoBarra;
// Progresso (0..1), com a mesma curva do Contador: barra e número andam juntos
const progressoDaBarra = (i: number, f: number) =>
  interpolate(f, [inicioDaBarra(i), inicioDaBarra(i) + duracaoDaBarra(i)], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });

// Destaque por pilar na última frase: cada pilar citado acende, os outros apagam.
// Os pesos dos trechos somam 1 (transições de 8 quadros).
const TRECHOS: { ini: number; pilar: Pilar | null }[] = [
  { ini: -Infinity, pilar: null },
  { ini: M.pilares[0], pilar: "Utilidade" },
  { ini: M.pilares[1], pilar: "Orgulho" },
  { ini: M.pilares[2], pilar: "Cuidado" },
  { ini: M.todos, pilar: null },
];
const pesoDoTrecho = (k: number, f: number) => {
  const entra =
    k === 0
      ? 1
      : interpolate(f, [TRECHOS[k].ini, TRECHOS[k].ini + 8], [0, 1], {
          ...clamp,
          easing: EASE.suave,
        });
  const prox = TRECHOS[k + 1];
  const sai = prox
    ? interpolate(f, [prox.ini, prox.ini + 8], [0, 1], {
        ...clamp,
        easing: EASE.suave,
      })
    : 0;
  return entra - sai;
};
const destaqueDoPilar = (pilar: Pilar, f: number) =>
  TRECHOS.reduce(
    (s, t, k) =>
      s + (t.pilar === null || t.pilar === pilar ? pesoDoTrecho(k, f) : 0),
    0,
  );

// Etiqueta pequena do pilar, na cor do pilar (texto escuro no amarelo e no verde)
const ChipPilar: React.FC<{ pilar: Pilar; tamanho?: number }> = ({
  pilar,
  tamanho = 26,
}) => (
  <div
    style={{
      display: "inline-block",
      background: PILAR[pilar],
      color: pilar === "Utilidade" ? COR.branco : COR.noite,
      fontFamily: FONTE_TITULO,
      fontSize: tamanho,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      lineHeight: 1.15,
      padding: `${tamanho * 0.1}px ${tamanho * 0.42}px`,
      transform: "skewX(-8deg)",
      boxShadow: `0 0 18px ${PILAR[pilar]}66`,
    }}
  >
    <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>
      {pilar}
    </span>
  </div>
);

export const CenaReels: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - inicioLocal(INDICE);

  const camera = cameraDoQuadro(f);
  const projetar = criarProjetor(camera);
  const alturas = TOP_REELS.map((_, i) => alturaDaBarra(i) * progressoDaBarra(i, f));
  const destaques = TOP_REELS.map((r) => destaqueDoPilar(r.pilar, f));
  // Pulso de luz: na base do Reel do temporal quando ele é citado, e em cada barra ao pousar
  const brilhos = TOP_REELS.map((_, i) => {
    const pouso = inicioDaBarra(i) + duracaoDaBarra(i);
    const pulso = interpolate(f, [pouso - 6, pouso, pouso + 26], [0, 1, 0], clamp);
    const chamada =
      i === 0
        ? interpolate(f, [M.heroi, M.heroi + 8, M.cresce], [0, 1, 0.6], clamp)
        : 0;
    return Math.max(pulso * (i === 0 ? 1 : 0.6), chamada);
  });
  const piso = interpolate(f, [-6, 18], [0, 1], { ...clamp, easing: EASE.entrada });

  // Ponto de ancoragem do destaque do Reel do temporal: topo final da barra, lado direito
  const topoFinal = projetar([xDaBarra(0) + LARG_BARRA / 2, ALTURA_MAX, 0]);
  const topoAtual = projetar([xDaBarra(0) + LARG_BARRA / 2, alturas[0], 0]);
  const esquerdaDestaque = topoFinal.x + 46;
  const linha = interpolate(f, [M.pousa - 6, M.pousa + 8], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const heroi = TOP_REELS[0];

  return (
    <AbsoluteFill>
      <Fundo variante="noite" grade={false} />

      <ReelsGrafico3D
        camera={camera}
        alturas={alturas}
        destaques={destaques}
        brilhos={brilhos}
        piso={piso}
      />

      {/* Título e subtítulo no alto da área de conteúdo */}
      <div style={{ position: "absolute", left: MARGEM, top: 236, width: 920 }}>
        <Titulo linhas={["O que *funcionou*"]} inicio={q(M.titulo)} tamanho={112} />
        <div style={{ marginTop: 6 }}>
          <LinhaNeon inicio={q(M.linha)} largura={200} />
        </div>
        <Texto inicio={q(M.subtitulo)} tamanho={34} style={{ marginTop: 18 }}>
          {SUBTITULO}
        </Texto>
      </div>

      {/* Rótulos das 4 barras menores, presos ao topo de cada barra pela projeção */}
      {TOP_REELS.map((r, i) => {
        if (i === 0) {
          return null;
        }
        const topo = projetar([xDaBarra(i), alturas[i], -PROF_BARRA / 2]);
        const ini = inicioDaBarra(i);
        const aparece = interpolate(f, [ini, ini + 8], [0, 1], clamp);
        return (
          <div
            key={r.titulo}
            style={{
              position: "absolute",
              left: topo.x,
              top: topo.y - 16,
              width: 172,
              translate: `-50% calc(-100% + ${(1 - aparece) * 20}px)`,
              opacity: aparece * (0.38 + 0.62 * destaques[i]),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 6,
            }}
          >
            <ChipPilar pilar={r.pilar} tamanho={24} />
            <Contador
              valor={r.views}
              inicio={q(ini)}
              duracao={duracaoDaBarra(i)}
              style={{
                fontFamily: FONTE_TITULO,
                fontSize: 50,
                lineHeight: 1,
                color: COR.branco,
                marginTop: 2,
              }}
            />
            <div
              style={{
                fontFamily: FONTE_TEXTO,
                fontWeight: 600,
                fontSize: 26,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                color: COR.tintaClara,
              }}
            >
              {TITULO_CURTO[i]}
            </div>
          </div>
        );
      })}

      {/* Datas no eixo, sob a borda da frente do piso */}
      {TOP_REELS.map((r, i) => {
        const base = projetar([xDaBarra(i), 0, PISO.profundidade / 2]);
        const ini = i === 0 ? M.heroi : inicioDaBarra(i);
        return (
          <div
            key={r.titulo}
            style={{
              position: "absolute",
              left: base.x,
              top: base.y + 20,
              translate: "-50% 0px",
              fontFamily: FONTE_TEXTO,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "0.04em",
              color: COR.tintaClara,
              opacity:
                interpolate(f, [ini, ini + 10], [0, 1], clamp) *
                (0.38 + 0.62 * destaques[i]),
            }}
          >
            {r.data}
          </div>
        );
      })}

      {/* Destaque do Reel do temporal: entra quando a locutora diz "temporal"; o número
          conta junto com a barra em "chegou a 105 mil views" */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, opacity: 0.38 + 0.62 * destaques[0] }}
      >
        <line
          x1={topoAtual.x + 10}
          y1={topoFinal.y}
          x2={topoAtual.x + 10 + (esquerdaDestaque - 22 - topoAtual.x) * linha}
          y2={topoFinal.y}
          stroke={COR.neon}
          strokeWidth={4}
          style={{ filter: `drop-shadow(0 0 6px ${COR.neon})` }}
        />
        <circle
          cx={topoAtual.x + 10}
          cy={topoFinal.y}
          r={9 * linha}
          fill={COR.neon}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: esquerdaDestaque,
          top: topoFinal.y - 30,
          width: 1000 - esquerdaDestaque,
          opacity:
            interpolate(f, [M.heroi, M.heroi + 8], [0, 1], clamp) *
            (0.38 + 0.62 * destaques[0]),
          translate: `${interpolate(f, [M.heroi, M.heroi + 16], [40, 0], { ...clamp, easing: EASE.entrada })}px 0px`,
        }}
      >
        <ChipPilar pilar={heroi.pilar} tamanho={30} />
        <div
          style={{
            marginTop: 14,
            fontFamily: FONTE_TEXTO,
            fontWeight: 800,
            fontSize: 38,
            lineHeight: 1.18,
            color: COR.branco,
          }}
        >
          {heroi.titulo}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            marginTop: 8,
            opacity: interpolate(f, [M.cresce, M.cresce + 4], [0, 1], clamp),
          }}
        >
          <Contador
            valor={heroi.views}
            inicio={q(M.cresce)}
            duracao={M.pousa - M.cresce}
            style={{
              fontFamily: FONTE_TITULO,
              fontSize: 132,
              lineHeight: 1,
              color: COR.amarelo,
              textShadow: `0 0 30px rgba(255,205,14,0.35)`,
            }}
          />
          <span
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: "0.08em",
              color: COR.branco,
            }}
          >
            VIEWS
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 6,
            fontFamily: FONTE_TEXTO,
            fontWeight: 600,
            fontSize: 30,
            color: COR.tintaClara,
            opacity: interpolate(f, [M.pousa, M.pousa + 10], [0, 1], clamp),
          }}
        >
          <Share2 size={30} strokeWidth={2.4} color={COR.neon} />
          {formatarNumero(heroi.compartilhamentos)} compartilhamentos
        </div>
      </div>

      {/* Legenda dos pilares (última frase) e fonte */}
      <div
        style={{
          position: "absolute",
          left: MARGEM,
          right: MARGEM,
          top: 1396,
          display: "flex",
          alignItems: "center",
          gap: 30,
        }}
      >
        {ORDEM_PILARES.map((pilar, k) => {
          const ini = M.pilares[k];
          const aparece = interpolate(f, [ini, ini + 12], [0, 1], {
            ...clamp,
            easing: EASE.entrada,
          });
          return (
            <div
              key={pilar}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: aparece * (0.4 + 0.6 * destaqueDoPilar(pilar, f)),
                translate: `0px ${(1 - aparece) * 18}px`,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: PILAR[pilar],
                  boxShadow: `0 0 16px ${PILAR[pilar]}`,
                }}
              />
              <span
                style={{
                  fontFamily: FONTE_TITULO,
                  fontSize: 38,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: COR.branco,
                }}
              >
                {pilar}
              </span>
            </div>
          );
        })}
        <div
          style={{
            marginLeft: "auto",
            fontFamily: FONTE_TEXTO,
            fontWeight: 600,
            fontSize: 26,
            color: COR.tintaSuave,
            opacity: interpolate(f, [M.barras, M.barras + 12], [0, 1], clamp),
          }}
        >
          {FONTE}
        </div>
      </div>

      {/* Subida sob a barra do temporal: termina quando a locutora diz "105" */}
      <Sequence from={q(M.cresce - 6)} durationInFrames={60} premountFor={fps}>
        <Audio src={staticFile("apresentacao/sfx-subida.wav")} volume={0.2} />
      </Sequence>
    </AbsoluteFill>
  );
};
