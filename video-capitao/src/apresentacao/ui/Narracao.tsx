import { Audio } from "@remotion/media";
import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, COR, EASE, FONTE_TEXTO, LARGURA, MARGEM, ZONA } from "../marca";
import narracao from "../narracao.json";
import { CENAS, inicioLocal } from "../roteiro";

// Legenda da narração no estilo TikTok: páginas curtas, palavra falada em amarelo,
// sobre uma faixa azul-noite translúcida para ler em cima de qualquer gráfico.
const Legenda: React.FC<{ legendas: Caption[] }> = ({ legendas }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const agoraMs = (frame / fps) * 1000;
  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        // Fim de frase (. ? : !) sempre fecha a página: a legenda nunca mistura duas frases
        captions: legendas.map((c) =>
          /[.?:!]$/.test(c.text.trim()) ? { ...c, pageBreakAfter: true } : c,
        ),
        combineTokensWithinMilliseconds: 1900,
      }),
    [legendas],
  );
  const indice = pages.findIndex((p, i) => {
    const prox = pages[i + 1];
    const fim = Math.min(
      p.startMs + p.durationMs + 250,
      prox ? prox.startMs : Infinity,
    );
    return agoraMs >= p.startMs && agoraMs < fim;
  });
  if (indice === -1) {
    return null;
  }
  const pagina = pages[indice];
  const f = frame - (pagina.startMs / 1000) * fps;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: MARGEM,
          width: LARGURA - 2 * MARGEM,
          top: ZONA.legendaCentro,
          translate: `0px calc(-50% + ${interpolate(f, [0, 8], [18, 0], { ...clamp, easing: EASE.entrada })}px)`,
          opacity: interpolate(f, [0, 4], [0, 1], clamp),
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "rgba(1,26,54,0.78)",
            borderLeft: `8px solid ${COR.neon}`,
            borderRadius: 14,
            padding: "18px 30px",
            textAlign: "center",
            fontFamily: FONTE_TEXTO,
            fontWeight: 800,
            fontSize: 50,
            lineHeight: 1.25,
            color: COR.branco,
            boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
          }}
        >
          {pagina.tokens.map((t, k) => {
            const ativa = agoraMs >= t.fromMs && agoraMs < t.toMs;
            const dita = agoraMs >= t.fromMs;
            return (
              <span
                key={`${pagina.startMs}-${k}`}
                style={{
                  color: ativa
                    ? COR.amarelo
                    : dita
                      ? COR.branco
                      : "rgba(255,255,255,0.55)",
                }}
              >
                {t.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Narração de uma cena (voz + legenda), dentro da mesma sequência da cena, como pede a
// skill de legendas do Remotion: mover ou cortar a cena leva junto a voz e a legenda.
export const Narracao: React.FC<{ indice: number }> = ({ indice }) => {
  const cena = narracao.cenas[indice];
  const desloca = inicioLocal(indice);
  return (
    <Sequence
      name={`Narração · ${CENAS[indice].titulo}`}
      from={desloca}
      layout="none"
    >
      <Audio
        name={`Voz · ${CENAS[indice].titulo}`}
        src={staticFile(`apresentacao/narracao/${cena.id}.wav`)}
        volume={1}
      />
      <Legenda legendas={cena.legendas as Caption[]} />
    </Sequence>
  );
};
