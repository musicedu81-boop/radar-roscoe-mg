import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SEMANA } from "../dados";
import {
  clamp,
  COR,
  EASE,
  FONTE_TITULO,
  MARGEM,
  PILAR,
  TEMPO,
} from "../marca";
import { frasesDaCena, inicioLocal, momentoDaPalavra } from "../roteiro";
import { LinhaNeon, Titulo } from "../ui/Elementos";
import { Fundo } from "../ui/Fundo";
import {
  CARTAO,
  SemanaCartao,
  SemanaVerso,
  TINTA,
  type TemposDoCartao,
} from "./SemanaCartao";

// Cena 07 · Grade semanal. Os sete cartões de SEMANA formam um tambor 3D em CSS (um cilindro
// de eixo horizontal, pensado para a tela vertical): a cada frase da narração ele gira e traz
// para a frente o dia que a locutora está falando, com o cartão da frente em destaque e os
// vizinhos recuados. No alto, a faixa SEG...DOM (que chega da cena anterior) marca o dia.
// Na palavra "semana", o cilindro se desenrola e vira a grade com os sete dias.
const INDICE = 6;

const q = (f: number) => f + inicioLocal(INDICE);
const FRASES = frasesDaCena(INDICE);

// Normaliza uma palavra como roteiro.ts (sem pontuação final, minúscula)
const limpa = (t: string) =>
  t
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/u, "");

// Quadro (f) em que a locutora diz `palavra` dentro da frase `k` (cada frase é um dia)
const naFrase = (k: number, palavra: string) => {
  const antes = FRASES.slice(0, k)
    .flatMap((fr) => fr.legenda.split(" "))
    .filter((w) => limpa(w) === limpa(palavra)).length;
  return momentoDaPalavra(INDICE, palavra, antes);
};

// Palavra da fala que marca a função de cada dia (a locutora parafraseia o texto de dados.ts).
// Domingo não tem função falada: ela entra logo depois do nome do quadro.
const FALA_FUNCAO: (string | null)[] = [
  "todas",
  "paciente",
  "alternando",
  "TBT",
  "comentários",
  "pessoa",
  null,
];
const proximoTempo = (f: number) => Math.ceil(f / TEMPO) * TEMPO;

// Momentos de cada dia, em f, ligados à fala
const DIAS = SEMANA.map((d, k) => {
  const dia = naFrase(k, d.dia);
  const quadro = naFrase(k, d.quadro.split(" ")[0]) - 6;
  const chave = FALA_FUNCAO[k];
  const funcao = chave ? naFrase(k, chave) - 6 : quadro + 8;
  const tempos: TemposDoCartao = {
    quadro,
    funcao,
    formato: chave ? proximoTempo(funcao + 14) : funcao + 8,
  };
  // O tambor começa a girar 10 quadros antes do nome do dia; o cartão pousa na palavra
  return { dia, gira: dia - 10, chega: dia - 2, tempos };
});

const DESENROLA = naFrase(SEMANA.length - 1, "semana") - 8; // na palavra "semana"
const M = {
  titulo: 0,
  linha: 8,
  desenrola: DESENROLA, // o tambor volta até quinta
  abre: DESENROLA + 10, // os cartões saem do cilindro para a grade
};

// Geometria (px). Conteúdo entre y 230 e 1450; a faixa da legenda (1480+) fica livre.
const PASSO = (2 * Math.PI) / SEMANA.length; // ângulo entre dois cartões no tambor
const TAMBOR = { cy: 962, raio: 480, perspectiva: 1800 };
const GRADE = { cy: 918, passo: CARTAO.linha + 12 };
const FAIXA = { y: 398, altura: 56, largura: 116, passo: 134 };

// Posição do tambor (índice do dia na frente, contínuo): chega girando no corte e depois
// avança um dia por frase, com mola (um leve passo além e volta, como um tambor que trava)
const posicaoDoTambor = (f: number, fps: number) => {
  let pos =
    -1.6 *
    (1 -
      spring({
        frame: f + 3,
        fps,
        config: { damping: 18, stiffness: 110, mass: 0.9 },
      }));
  for (let k = 1; k < SEMANA.length; k++) {
    pos += spring({
      frame: f - DIAS[k].gira,
      fps,
      config: { damping: 14, stiffness: 150, mass: 0.8 },
    });
  }
  return pos;
};

// Ângulo levado ao intervalo (-π, π]
const embrulha = (a: number) => {
  const v = (((a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return v - Math.PI;
};

// Faixa SEG...DOM no alto: chega da câmera (continua o avanço da cena anterior), marca o dia
// da frente e some quando a grade abre
const Faixa: React.FC<{ f: number; pos: number }> = ({ f, pos }) => {
  const chega = interpolate(f, [-6, 22], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const some = interpolate(f, [M.desenrola, M.desenrola + 12], [0, 1], {
    ...clamp,
    easing: EASE.saida,
  });
  if (some >= 1) {
    return null;
  }
  // Pulso no bumbo (um por tempo)
  const batida = Math.exp(-(((f % TEMPO) + TEMPO) % TEMPO) / 4);
  const centro = { x: MARGEM + 460, y: FAIXA.y + FAIXA.altura / 2 };
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 1 - some,
        translate: `0px ${-24 * some}px`,
        scale: interpolate(chega, [0, 1], [3.4, 1]),
        transformOrigin: `${centro.x}px ${centro.y}px`,
      }}
    >
      {SEMANA.map((d, k) => {
        const ativo = Math.max(0, 1 - Math.abs(pos - k));
        const cor = PILAR[d.pilar];
        return (
          <div
            key={d.sigla}
            style={{
              position: "absolute",
              left: MARGEM + k * FAIXA.passo,
              top: FAIXA.y,
              width: FAIXA.largura,
              height: FAIXA.altura,
              boxSizing: "border-box",
              borderRadius: 10,
              border: `2px solid ${ativo > 0.5 ? COR.branco : "rgba(255,255,255,0.22)"}`,
              background: cor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: 1 + 0.1 * ativo,
              boxShadow:
                ativo > 0.05
                  ? `0 0 ${(18 + 14 * batida) * ativo}px ${cor}`
                  : undefined,
              overflow: "hidden",
            }}
          >
            {/* Véu dos dias que não estão na frente */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: COR.noiteProfunda,
                opacity: 0.62 * (1 - ativo),
              }}
            />
            <span
              style={{
                position: "relative",
                fontFamily: FONTE_TITULO,
                fontSize: 36,
                lineHeight: 1,
                letterSpacing: "0.03em",
                color: ativo > 0.5 ? TINTA[d.pilar] : "rgba(255,255,255,0.8)",
              }}
            >
              {d.sigla}
            </span>
          </div>
        );
      })}
      {/* Marcador do dia da frente, que desliza com o tambor */}
      <div
        style={{
          position: "absolute",
          left: MARGEM + Math.max(0, pos) * FAIXA.passo,
          top: FAIXA.y + FAIXA.altura + 10,
          width: FAIXA.largura,
          height: 6,
          borderRadius: 3,
          background: COR.neon,
          boxShadow: `0 0 ${10 + 10 * batida}px ${COR.neon}`,
        }}
      />
    </div>
  );
};

export const CenaSemana: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - inicioLocal(INDICE);

  const pos = posicaoDoTambor(f, fps);

  // Abertura da grade: o tambor volta até quinta (centro da semana) e então cada cartão sai do
  // cilindro para a sua linha da grade, do centro para as pontas
  const volta = interpolate(f, [M.desenrola, M.desenrola + 14], [0, 1], {
    ...clamp,
    easing: EASE.suave,
  });
  const meio = (SEMANA.length - 1) / 2;
  const centro = interpolate(volta, [0, 1], [pos, meio]);
  const abre = (k: number) => {
    const ini = M.abre + 2 * Math.abs(k - meio);
    return interpolate(f, [ini, ini + 18], [0, 1], {
      ...clamp,
      easing: EASE.suave,
    });
  };
  const aberta = abre(meio); // progresso da linha central (quinta)

  // Chegada do tambor no corte (vem da câmera) e deriva lenta para nunca ficar parado
  const chegada = interpolate(f, [-6, 20], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const deriva = 3 * Math.sin(f / 75) * (1 - aberta);
  // Respiro da grade final
  const respiro = interpolate(f, [M.abre + 24, M.abre + 120], [1, 1.012], clamp);

  return (
    <AbsoluteFill>
      <Fundo />

      <Titulo
        linhas={["Grade *semanal*"]}
        inicio={q(M.titulo)}
        tamanho={116}
        style={{ position: "absolute", left: MARGEM, top: 236 }}
      />
      <div style={{ position: "absolute", left: MARGEM, top: 372 }}>
        <LinhaNeon inicio={q(M.linha)} largura={200} />
      </div>

      <Faixa f={f} pos={pos} />

      {/* Tambor 3D (eixo horizontal), centrado em TAMBOR.cy */}
      <AbsoluteFill
        style={{
          perspective: TAMBOR.perspectiva,
          perspectiveOrigin: `540px ${TAMBOR.cy}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: MARGEM,
            top: TAMBOR.cy,
            width: CARTAO.largura,
            height: 0,
            transformStyle: "preserve-3d",
            transform: `rotateY(${deriva}deg) scale(${interpolate(chegada, [0, 1], [1.35, 1]) * respiro})`,
          }}
        >
          {SEMANA.map((d, k) => {
            // No cilindro
            const thetaT = embrulha((k - centro) * PASSO);
            const yT = TAMBOR.raio * Math.sin(thetaT);
            const zT = TAMBOR.raio * (Math.cos(thetaT) - 1);
            // Na grade
            const yG = GRADE.cy - TAMBOR.cy + (k - meio) * GRADE.passo;
            const b = abre(k);
            const theta = thetaT * (1 - b);
            const y = interpolate(b, [0, 1], [yT, yG]);
            const z = zT * (1 - b);
            const altura = interpolate(b, [0, 1], [CARTAO.altura, CARTAO.linha]);
            const angulo = Math.abs(thetaT);
            const foco = Math.max(1 - Math.min(1, angulo / PASSO), b);
            // Reflexo quando o cartão chega à frente, e em cascata (duas vezes) na grade final
            const passa = (inicio: number) =>
              interpolate(f, [inicio, inicio + 22], [0, 1], clamp);
            const segunda = passa(M.abre + 80 + 4 * k);
            const brilho =
              f < M.desenrola
                ? passa(DIAS[k].chega)
                : segunda > 0
                  ? segunda
                  : passa(M.abre + 30 + 4 * k);
            const destaque =
              Math.max(0, 1 - angulo / (PASSO * 0.5)) * (1 - volta);
            const cor = PILAR[d.pilar];
            return (
              <div
                key={d.sigla}
                style={{
                  position: "absolute",
                  left: 0,
                  top: -altura / 2,
                  width: CARTAO.largura,
                  height: altura,
                  transformStyle: "preserve-3d",
                  transform: `translate3d(0px, ${y}px, ${z}px) rotateX(${-theta}rad)`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 18,
                    backfaceVisibility: "hidden",
                    boxShadow:
                      destaque > 0.02
                        ? `0 0 0 ${4 * destaque}px ${cor}, 0 0 ${70 * destaque}px ${cor}, 0 30px 60px rgba(1,10,25,0.5)`
                        : "0 24px 50px rgba(1,10,25,0.45)",
                  }}
                />
                <SemanaCartao
                  k={k}
                  f={f}
                  tempos={DIAS[k].tempos}
                  foco={foco}
                  compacto={b}
                  brilho={brilho}
                />
                <SemanaVerso k={k} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Efeitos discretos: o cilindro que vira grade e o encaixe final */}
      <Audio
        name="SFX swoosh · grade abre"
        src={staticFile("apresentacao/sfx-swoosh.wav")}
        from={q(M.desenrola - 2)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.16}
      />
      <Audio
        name="SFX tick · grade encaixa"
        src={staticFile("apresentacao/sfx-tick.wav")}
        from={q(M.abre + 24)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.2}
      />
    </AbsoluteFill>
  );
};
