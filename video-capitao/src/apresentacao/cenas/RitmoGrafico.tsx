import React from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO } from "../marca";
import { Contador } from "../ui/Elementos";
import { GlitchTexto } from "../ui/Glitch";
import { DADOS_BARRAS, DESDE, qRitmo, T } from "./RitmoTempos";

// Gráfico de barras em CSS 3D (frente, topo e lateral) de seguidores por dia.
// O eixo começa "aproximado" (para 6 e 14 terem leitura) e, quando a barra de 81 dispara,
// ele se reescala: as barras pequenas encolhem e a de 81 passa do ponto, treme e assenta.

// Caixa do gráfico na tela (px)
export const GRAFICO = { left: 80, top: 445, largura: 920, altura: 700 };
const BASE = 570; // linha do chão, em y dentro da caixa (abs. 1015)
const SLOT = GRAFICO.largura / 5;
const L = 112; // largura da barra
const P = 72; // profundidade da barra
const ESCALA_ANTES = 470 / 30; // px por seguidor/dia antes da reescala
const ESCALA_DEPOIS = 470 / DADOS_BARRAS.naoFecha.porDia; // a de 81 ocupa 470 px

const tom = (cor: string, luz: number) =>
  luz >= 0
    ? `linear-gradient(rgba(255,255,255,${luz}), rgba(255,255,255,${luz})), ${cor}`
    : `linear-gradient(rgba(1,10,25,${-luz}), rgba(1,10,25,${-luz})), ${cor}`;

// Uma barra extrudada: frente, lateral direita e topo, com brilho opcional
const Barra3D: React.FC<{
  slot: number;
  altura: number;
  cor: string;
  brilho?: number;
  hachura?: number;
}> = ({ slot, altura, cor, brilho = 0, hachura = 0 }) => {
  if (altura <= 0.5) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: slot * SLOT + (SLOT - L) / 2,
        top: BASE - altura,
        width: L,
        height: altura,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Lateral direita */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: L - P / 2,
          width: P,
          height: altura,
          transform: "rotateY(90deg)",
          background: tom(cor, -0.42),
        }}
      />
      {/* Topo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: -P / 2,
          width: L,
          height: P,
          transform: "rotateX(90deg)",
          background: tom(cor, 0.4),
        }}
      />
      {/* Frente */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateZ(${P / 2}px)`,
          background: `linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 22%, rgba(1,10,25,0.18) 100%), ${cor}`,
          borderTop: "3px solid rgba(255,255,255,0.75)",
          boxSizing: "border-box",
          boxShadow: brilho > 0 ? `0 0 ${60 * brilho}px ${cor}` : undefined,
        }}
      >
        {hachura > 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: hachura,
              backgroundImage:
                "repeating-linear-gradient(-45deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 10px, transparent 10px, transparent 22px)",
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

// Valor em cima da barra ("81 /dia"), no plano da frente
const Valor: React.FC<{
  slot: number;
  altura: number;
  valor: number;
  inicio: number;
  cor?: string;
  visivel: number;
}> = ({ slot, altura, valor, inicio, cor = COR.branco, visivel }) => (
  <div
    style={{
      position: "absolute",
      left: slot * SLOT,
      width: SLOT,
      top: BASE - altura - 92,
      height: 70,
      display: "flex",
      justifyContent: "center",
      alignItems: "baseline",
      gap: 4,
      transform: `translateZ(${P / 2}px)`,
      opacity: visivel,
      color: cor,
      textShadow: "0 4px 18px rgba(1,10,25,0.6)",
    }}
  >
    <Contador
      valor={valor}
      inicio={inicio}
      duracao={24}
      style={{ fontFamily: FONTE_TITULO, fontSize: 64, lineHeight: 1 }}
    />
    <span
      style={{
        fontFamily: FONTE_TEXTO,
        fontWeight: 800,
        fontSize: 26,
        letterSpacing: "0.04em",
      }}
    >
      /DIA
    </span>
  </div>
);

// Rótulo embaixo da barra: nome em Anton e complemento em Montserrat
const Rotulo: React.FC<{
  slot: number;
  titulo: string;
  sub: string;
  corSub?: string;
  visivel: number;
  subVisivel?: number;
}> = ({ slot, titulo, sub, corSub = COR.tintaClara, visivel, subVisivel = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: slot * SLOT - 6,
      width: SLOT + 12,
      top: BASE + 30,
      textAlign: "center",
      transform: `translateZ(${P / 2 + 34}px)`,
      opacity: visivel,
      translate: `0px ${(1 - visivel) * 16}px`,
    }}
  >
    <div
      style={{
        fontFamily: FONTE_TITULO,
        fontSize: 38,
        lineHeight: 1.05,
        letterSpacing: "0.03em",
        color: COR.branco,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {titulo}
    </div>
    <div
      style={{
        fontFamily: FONTE_TEXTO,
        fontWeight: 700,
        fontSize: 26,
        lineHeight: 1.3,
        color: corSub,
        whiteSpace: "nowrap",
        opacity: subVisivel,
      }}
    >
      {sub}
    </div>
  </div>
);

export const RitmoGrafico: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - qRitmo(0);

  const surge = (inicio: number, dur = 12) =>
    interpolate(f, [inicio, inicio + dur], [0, 1], {
      ...clamp,
      easing: EASE.entrada,
    });
  const cresce = (inicio: number) =>
    interpolate(f, [inicio, inicio + 26], [0, 1], {
      ...clamp,
      easing: EASE.entrada,
    });

  // Reescala do eixo quando a barra de 81 dispara
  const escala = interpolate(
    f,
    [T.dispara + 10, T.dispara + 38],
    [ESCALA_ANTES, ESCALA_DEPOIS],
    { ...clamp, easing: EASE.suave },
  );
  const alturaDe = (valor: number, inicio: number) =>
    valor * escala * cresce(inicio);

  // A de 81 rompe o teto e assenta quando o eixo termina de se ajustar
  const altura81 = interpolate(
    f,
    [T.dispara, T.dispara + 16, T.dispara + 40],
    [0, 500, DADOS_BARRAS.naoFecha.porDia * ESCALA_DEPOIS],
    { ...clamp, easing: [EASE.entrada, EASE.suave] },
  );

  // Câmera: deriva lenta e tranco curto no impacto da barra de 81
  // A rotação em X vem antes (no ponto) e a origem da perspectiva fica na linha do chão:
  // o chão e os rótulos ficam nivelados e o que sobe ganha perspectiva de verdade.
  const rotY = interpolate(f, [-6, 600], [-15, -8], {
    ...clamp,
    easing: EASE.suave,
  });
  const rotX = interpolate(f, [-6, 600], [-19, -16], clamp);
  const tranco = interpolate(
    f,
    [T.dispara + 14, T.dispara + 30],
    [1, 0],
    clamp,
  );
  const tremX = (random(`ritmo-tx-${frame}`) - 0.5) * 16 * tranco;
  const tremY = (random(`ritmo-ty-${frame}`) - 0.5) * 10 * tranco;

  // Selo "NÃO FECHA"
  const seloT = f - T.naoFecha;
  const seloS = spring({
    frame: seloT,
    fps,
    config: { damping: 12, stiffness: 190, mass: 0.7 },
  });

  // Destaque da meta realista: a barra de 15 pulsa com brilho verde-neon
  const brilho15 =
    surge(T.quinze + 10, 10) *
    (0.75 + 0.25 * Math.cos(((f - T.quinze) / 30) * Math.PI * 2));
  const { hoje, media, meta, desafio, naoFecha } = DADOS_BARRAS;

  return (
    <div
      style={{
        position: "absolute",
        left: GRAFICO.left,
        top: GRAFICO.top,
        width: GRAFICO.largura,
        height: GRAFICO.altura,
        perspective: 1800,
        perspectiveOrigin: `78% ${BASE}px`,
        translate: `${tremX}px ${tremY}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transformOrigin: `50% ${BASE}px`,
          transform: `translateX(-10px) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
        }}
      >
        {/* Chão com grade verde-neon */}
        <div
          style={{
            position: "absolute",
            left: -40,
            width: GRAFICO.largura + 80,
            top: BASE - 170,
            height: 340,
            transform: "translateZ(-110px) rotateX(90deg)",
            opacity: surge(T.eixo, 20) * 0.9,
            backgroundImage: `linear-gradient(rgba(1,237,67,0.35) 2px, transparent 2px), linear-gradient(90deg, rgba(1,237,67,0.35) 2px, transparent 2px)`,
            backgroundSize: `${SLOT / 2}px ${SLOT / 2}px`,
            backgroundPosition: "0px 0px",
            maskImage:
              "linear-gradient(0deg, black 0%, black 35%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(0deg, black 0%, black 35%, transparent 100%)",
          }}
        />

        {/* Linhas de grade no fundo: se comprimem na reescala */}
        {Array.from({ length: 9 }, (_, k) => {
          const y = BASE - (k + 1) * 10 * escala;
          const op = interpolate(y, [-20, 80], [0, 1], clamp);
          if (op <= 0) {
            return null;
          }
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: 0,
                width: GRAFICO.largura,
                top: y,
                height: 2,
                transform: `translateZ(${-P / 2 - 4}px)`,
                background: "rgba(255,255,255,0.2)",
                opacity: op * surge(T.eixo + 6, 20),
              }}
            />
          );
        })}

        {/* Base de cada vaga (onde a barra vai nascer) */}
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * SLOT + (SLOT - L) / 2,
              top: BASE - P / 2,
              width: L,
              height: P,
              boxSizing: "border-box",
              transform: "rotateX(90deg)",
              border: "2px dashed rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.06)",
              opacity: surge(T.eixo + i * 3, 12),
            }}
          />
        ))}

        {/* Linha do chão (frente) */}
        <div
          style={{
            position: "absolute",
            left: -20,
            top: BASE - 2,
            height: 4,
            width: interpolate(f, [T.eixo, T.eixo + 22], [0, GRAFICO.largura + 40], {
              ...clamp,
              easing: EASE.entrada,
            }),
            transform: `translateZ(${P / 2 + 4}px)`,
            background: COR.neon,
            boxShadow: `0 0 14px ${COR.neon}`,
          }}
        />

        {/* Barras (ordem crescente) */}
        <Barra3D slot={0} altura={alturaDe(hoje, T.hoje)} cor={COR.branco} />
        <Barra3D slot={1} altura={alturaDe(media, T.media)} cor={COR.vivo} />
        <Barra3D
          slot={2}
          altura={alturaDe(meta.porDia, T.quinze)}
          cor={COR.neon}
          brilho={brilho15}
        />
        <Barra3D
          slot={3}
          altura={alturaDe(desafio.porDia, T.desafio)}
          cor={COR.amarelo}
        />
        <Barra3D
          slot={4}
          altura={altura81}
          cor={COR.coral}
          brilho={interpolate(f, [T.dispara + 10, T.dispara + 20, T.dispara + 50], [0, 1, 0.45], clamp)}
          hachura={surge(T.naoFecha, 10)}
        />

        {/* Valores em cima */}
        <Valor
          slot={0}
          altura={alturaDe(hoje, T.hoje)}
          valor={hoje}
          inicio={qRitmo(T.hoje)}
          visivel={surge(T.hoje, 8)}
        />
        <Valor
          slot={1}
          altura={alturaDe(media, T.media)}
          valor={media}
          inicio={qRitmo(T.media)}
          visivel={surge(T.media, 8)}
        />
        <Valor
          slot={2}
          altura={alturaDe(meta.porDia, T.quinze)}
          valor={meta.porDia}
          inicio={qRitmo(T.quinze)}
          cor={COR.neon}
          visivel={surge(T.quinze, 8)}
        />
        <Valor
          slot={3}
          altura={alturaDe(desafio.porDia, T.desafio)}
          valor={desafio.porDia}
          inicio={qRitmo(T.desafio)}
          cor={COR.amarelo}
          visivel={surge(T.desafio, 8)}
        />
        <Valor
          slot={4}
          altura={altura81}
          valor={naoFecha.porDia}
          inicio={qRitmo(T.dispara + 2)}
          cor={COR.branco}
          visivel={surge(T.dispara, 6)}
        />

        {/* Rótulos embaixo: entram com a barra (o de 32 mil entra na fala "chegar a 32 mil") */}
        <Rotulo slot={0} titulo="Hoje" sub={DESDE} visivel={surge(T.hoje)} />
        <Rotulo
          slot={1}
          titulo="Média"
          sub="11 semanas"
          visivel={surge(T.media)}
        />
        <Rotulo
          slot={2}
          titulo={meta.meta}
          sub={meta.leitura.replace(/^meta /, "")}
          corSub={COR.neon}
          visivel={surge(T.realista)}
        />
        <Rotulo
          slot={3}
          titulo={desafio.meta}
          sub={desafio.leitura}
          corSub={COR.amarelo}
          visivel={surge(T.desafio)}
        />
        <Rotulo
          slot={4}
          titulo={naoFecha.meta}
          sub={naoFecha.leitura}
          corSub={COR.coral}
          visivel={surge(T.slot32)}
          subVisivel={surge(T.naoFecha, 8)}
        />

        {/* Selo coral "NÃO FECHA", carimbado na fala */}
        {seloT >= 0 ? (
          <div
            style={{
              position: "absolute",
              left: 4 * SLOT - 300,
              top: BASE - naoFecha.porDia * ESCALA_DEPOIS + 30,
              width: 290,
              display: "flex",
              justifyContent: "flex-end",
              transform: `translateZ(${P / 2 + 40}px)`,
            }}
          >
            <div
              style={{
                background: COR.coral,
                color: COR.branco,
                fontFamily: FONTE_TITULO,
                fontSize: 54,
                lineHeight: 1,
                letterSpacing: "0.05em",
                padding: "12px 22px 10px",
                border: `4px solid ${COR.branco}`,
                boxShadow: `0 0 0 4px ${COR.coral}, 0 18px 40px rgba(1,10,25,0.55)`,
                rotate: `${interpolate(seloS, [0, 1], [-16, -6])}deg`,
                scale: interpolate(seloS, [0, 1], [1.7, 1]),
                opacity: interpolate(seloT, [0, 4], [0, 1], clamp),
                whiteSpace: "nowrap",
              }}
            >
              <GlitchTexto inicio={qRitmo(T.naoFecha)} duracao={14}>
                NÃO FECHA
              </GlitchTexto>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
