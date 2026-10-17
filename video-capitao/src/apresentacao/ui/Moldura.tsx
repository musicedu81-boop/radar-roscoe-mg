import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO, MARGEM } from "../marca";
import { CENAS, inicioDaCena } from "../roteiro";
import { GlitchTexto } from "./Glitch";
import { Logo } from "./Elementos";

// HUD fixo por cima das cenas de conteúdo: marca no topo, número e nome da seção,
// e uma barra de progresso verde-neon. Some na abertura e no encerramento.
export const Moldura: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const entra = inicioDaCena(1);
  const sai = inicioDaCena(CENAS.length - 1);
  const visivel =
    interpolate(frame, [entra - 4, entra + 14], [0, 1], { ...clamp, easing: EASE.entrada }) *
    interpolate(frame, [sai - 14, sai + 2], [1, 0], clamp);
  if (visivel <= 0) {
    return null;
  }
  const atual = CENAS.reduce((acc, _, i) => (frame >= inicioDaCena(i) ? i : acc), 0);
  const progresso = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ opacity: visivel, pointerEvents: "none" }}>
      {/* Topo: assinatura do plano */}
      <div
        style={{
          position: "absolute",
          left: MARGEM,
          top: 54,
          display: "flex",
          alignItems: "center",
          gap: 18,
          translate: `0px ${(1 - visivel) * -30}px`,
        }}
      >
        <div style={{ width: 10, height: 34, background: COR.neon, boxShadow: `0 0 14px ${COR.neon}` }} />
        <div>
          <div style={{ fontFamily: FONTE_TITULO, fontSize: 24, letterSpacing: "0.08em", color: COR.branco, lineHeight: 1 }}>
            PLANEJAMENTO ESTRATÉGICO
          </div>
          <div
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.12em",
              color: COR.tintaSuave,
              marginTop: 5,
            }}
          >
            26/10 → 31/12/2026 · TIMÓTEO, MG
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", right: MARGEM - 20, top: 30, translate: `0px ${(1 - visivel) * -30}px` }}>
        <Logo largura={150} />
      </div>

      {/* Base: seção atual e progresso */}
      <div
        style={{
          position: "absolute",
          left: MARGEM,
          bottom: 46,
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          fontFamily: FONTE_TITULO,
          letterSpacing: "0.08em",
        }}
      >
        <GlitchTexto key={atual} inicio={inicioDaCena(atual)} duracao={10}>
          <span style={{ fontSize: 26, color: COR.neon }}>{String(atual + 1).padStart(2, "0")}</span>
          <span style={{ fontSize: 26, color: COR.tintaSuave }}> / {String(CENAS.length).padStart(2, "0")}</span>
          <span style={{ fontSize: 26, color: COR.branco, marginLeft: 16 }}>{CENAS[atual].titulo.toUpperCase()}</span>
        </GlitchTexto>
      </div>
      <div
        style={{
          position: "absolute",
          left: MARGEM,
          right: MARGEM,
          bottom: 30,
          height: 4,
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
