import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CALENDARIO } from "../dados";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO } from "../marca";
import { LinhaNeon } from "../ui/Elementos";
import { Fundo } from "../ui/Fundo";
import { GlitchTexto } from "../ui/Glitch";
import { CalendarioPlano } from "./CalendarioPlano";
import { GRADE, PONTAS, qCal, T } from "./CalendarioTempos";
import { CalendarioTitulo } from "./CalendarioTitulo";

// Cena 09 · Calendário. Linha do tempo vertical num plano inclinado em CSS 3D com as dez
// semanas de CALENDARIO. Na primeira frase o plano se inclina e as semanas entram ("10
// SEMANAS"); na segunda cada eixo acende com a sua cor quando a locutora diz o nome; na terceira
// a câmera desliza até novembro e as placas de "Os Números" se levantam em 04/11 e 02/12; na
// última ela desliza até o fim do ano e a placa do Balanço 2026 se levanta.

export const CenaCalendario: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - qCal(0);
  const semanas = interpolate(f, [T.semanas, T.semanas + 12], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const umEixo = interpolate(f, [T.umEixo, T.umEixo + 12], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });

  return (
    <AbsoluteFill>
      <Fundo grade={false} />

      <CalendarioPlano />

      <CalendarioTitulo
        linhas={["Calendário", `*${PONTAS.inicio} → ${PONTAS.fimCurto}*`]}
        inicio={qCal(T.titulo)}
        tamanho={GRADE.tamanhoTitulo}
        style={{ position: "absolute", left: GRADE.x, top: GRADE.titulo }}
      />

      {/* Subtítulo: "10 SEMANAS · UM EIXO POR SEMANA", na fala */}
      <div
        style={{
          position: "absolute",
          left: GRADE.x,
          top: GRADE.subtitulo,
          height: 54,
          display: "flex",
          alignItems: "center",
          gap: 18,
          whiteSpace: "nowrap",
        }}
      >
        <LinhaNeon inicio={qCal(T.dez - 4)} largura={56} />
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            fontFamily: FONTE_TITULO,
            fontSize: 50,
            lineHeight: 1,
            letterSpacing: "0.03em",
          }}
        >
          <GlitchTexto inicio={qCal(T.dez)} duracao={12} style={{ color: COR.neon }}>
            {CALENDARIO.length}
          </GlitchTexto>
          <span
            style={{
              color: COR.branco,
              opacity: semanas,
              clipPath: `inset(-20% ${(1 - semanas) * 100}% -20% 0)`,
            }}
          >
            SEMANAS
          </span>
        </div>
        <div
          style={{
            fontFamily: FONTE_TEXTO,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: COR.tintaClara,
            opacity: umEixo,
            translate: `${(1 - umEixo) * -16}px 0px`,
          }}
        >
          · Um eixo por semana
        </div>
      </div>

      {/* Efeitos discretos (no máximo 3), nas pausas entre as frases */}
      <Audio
        name="SFX swoosh · câmera desliza até novembro"
        src={staticFile("apresentacao/sfx-swoosh.wav")}
        from={qCal(T.mergulho)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.22}
      />
      <Audio
        name="SFX swoosh · câmera desliza até o fim do ano"
        src={staticFile("apresentacao/sfx-swoosh.wav")}
        from={qCal(T.desliza)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.2}
      />
      <Audio
        name="SFX subida · placa do Balanço"
        src={staticFile("apresentacao/sfx-subida.wav")}
        from={qCal(T.balanco - 4)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.2}
      />
    </AbsoluteFill>
  );
};
