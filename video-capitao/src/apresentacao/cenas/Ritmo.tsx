import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, COR, EASE, FONTE_TEXTO, MARGEM } from "../marca";
import { LinhaNeon, Titulo } from "../ui/Elementos";
import { Fundo } from "../ui/Fundo";
import { RitmoAnel } from "./RitmoAnel";
import { RitmoGrafico } from "./RitmoGrafico";
import { qRitmo, T } from "./RitmoTempos";

// Cena 03 · Diagnóstico. Título "O ritmo de hoje", gráfico de barras em CSS 3D de seguidores
// por dia (a barra de 81 dispara e recebe o selo "NÃO FECHA") e o anel de 76% do pico.

export const CenaRitmo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - qRitmo(0);
  const eixo = interpolate(f, [T.eixo, T.eixo + 12], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });

  return (
    <AbsoluteFill>
      <Fundo />

      {/* Título */}
      <Titulo
        linhas={["O ritmo de *hoje*"]}
        inicio={qRitmo(T.titulo)}
        tamanho={112}
        style={{ position: "absolute", left: MARGEM, top: 236 }}
      />
      <div
        style={{
          position: "absolute",
          left: MARGEM,
          top: 372,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <LinhaNeon inicio={qRitmo(T.eixo)} largura={90} />
        <div
          style={{
            fontFamily: FONTE_TEXTO,
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: "0.12em",
            color: COR.tintaClara,
            textTransform: "uppercase",
            opacity: eixo,
            translate: `${(1 - eixo) * -14}px 0px`,
          }}
        >
          Seguidores por dia
        </div>
      </div>

      <RitmoGrafico />
      <RitmoAnel />

      {/* Efeitos discretos (no máximo 3) */}
      <Audio
        name="SFX swoosh · anel"
        src={staticFile("apresentacao/sfx-swoosh.wav")}
        from={qRitmo(T.anel)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.2}
      />
      <Audio
        name="SFX subida · barra de 81"
        src={staticFile("apresentacao/sfx-subida.wav")}
        from={qRitmo(T.dispara)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.22}
      />
      <Audio
        name="SFX tick · selo não fecha"
        src={staticFile("apresentacao/sfx-tick.wav")}
        from={qRitmo(T.naoFecha)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.2}
      />
    </AbsoluteFill>
  );
};
