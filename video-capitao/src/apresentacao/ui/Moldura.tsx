import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  clamp,
  COR,
  EASE,
  FONTE_TEXTO,
  FONTE_TITULO,
  MARGEM,
  ZONA,
} from "../marca";
import { CENAS, inicioDaCena } from "../roteiro";
import { Logo } from "./Elementos";
import { GlitchTexto } from "./Glitch";

// HUD fixo da tela vertical, por cima das cenas de conteúdo: assinatura do plano e logo no
// topo; número e nome da seção e barra de progresso verde-neon na base.
// Some na abertura e no encerramento.
export const Moldura: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const entra = inicioDaCena(1);
  const sai = inicioDaCena(CENAS.length - 1);
  const visivel =
    interpolate(frame, [entra - 4, entra + 14], [0, 1], {
      ...clamp,
      easing: EASE.entrada,
    }) * interpolate(frame, [sai - 14, sai + 2], [1, 0], clamp);
  if (visivel <= 0) {
    return null;
  }
  const atual = CENAS.reduce(
    (acc, _, i) => (frame >= inicioDaCena(i) ? i : acc),
    0,
  );
  const progresso = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ opacity: visivel, pointerEvents: "none" }}>
      {/* Topo: assinatura do plano à esquerda, logo à direita */}
      <div
        style={{
          position: "absolute",
          left: MARGEM,
          top: 92,
          display: "flex",
          alignItems: "center",
          gap: 16,
          translate: `0px ${(1 - visivel) * -30}px`,
        }}
      >
        <div
          style={{
            width: 10,
            height: 60,
            background: COR.neon,
            boxShadow: `0 0 14px ${COR.neon}`,
          }}
        />
        <div>
          <div
            style={{
              fontFamily: FONTE_TITULO,
              fontSize: 34,
              letterSpacing: "0.06em",
              color: COR.branco,
              lineHeight: 1,
            }}
          >
            PLANEJAMENTO ESTRATÉGICO
          </div>
          <div
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "0.1em",
              color: COR.tintaSuave,
              marginTop: 8,
            }}
          >
            26/10 → 31/12/2026 · TIMÓTEO, MG
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: MARGEM - 24,
          top: 58,
          translate: `0px ${(1 - visivel) * -30}px`,
        }}
      >
        <Logo largura={210} />
      </div>

      {/* Base: seção atual e progresso */}
      <div
        style={{
          position: "absolute",
          left: MARGEM,
          right: MARGEM,
          top: ZONA.hudBase + 34,
          display: "flex",
          alignItems: "baseline",
          fontFamily: FONTE_TITULO,
          letterSpacing: "0.08em",
        }}
      >
        <GlitchTexto key={atual} inicio={inicioDaCena(atual)} duracao={10}>
          <span style={{ fontSize: 34, color: COR.neon }}>
            {String(atual + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 34, color: COR.tintaSuave }}>
            {" "}
            / {String(CENAS.length).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 34, color: COR.branco, marginLeft: 18 }}>
            {CENAS[atual].titulo.toUpperCase()}
          </span>
        </GlitchTexto>
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGEM,
          right: MARGEM,
          top: ZONA.hudBase + 100,
          height: 6,
          background: "rgba(255,255,255,0.14)",
        }}
      >
        <div
          style={{
            width: `${progresso * 100}%`,
            height: "100%",
            background: COR.neon,
            boxShadow: `0 0 12px ${COR.neon}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
