import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Fundo } from "../ui/Fundo";
import { JanelaComparativo } from "./JanelaComparativo";
import { JanelaDias } from "./JanelaDias";
import { JanelaLegenda } from "./JanelaLegenda";
import { JanelaRelogio } from "./JanelaRelogio";
import { GRADE, qJanela, T } from "./JanelaTempos";
import { JanelaTitulo } from "./JanelaTitulo";

// Cena 08 · Janela de publicação. Relógio de 24 h em CSS 3D com o cursor percorrendo o dia:
// o bloco das 10h às 12h acende em verde-neon na primeira frase (e os dias úteis em "segunda a
// sexta"), o das 18h em amarelo na segunda. Na terceira frase o relógio vira resumo ao lado da
// legenda, sábado e domingo acendem em coral e o cartão de dados compara sexta x sábado às 10h:
// a barra do sábado "cai" para a metade. Fonte: Metricool.

export const CenaJanela: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Fundo />

      <JanelaTitulo
        linhas={["Janela de *publicação*"]}
        inicio={qJanela(T.titulo)}
        tamanho={100}
        style={{ position: "absolute", left: GRADE.x, top: GRADE.titulo }}
      />

      <JanelaDias />
      <JanelaRelogio />
      <JanelaComparativo />
      {/* A legenda fica por cima do cartão: ela cruza a área dele ao subir na fase 2 */}
      <JanelaLegenda />

      {/* Efeitos discretos (no máximo 3), fora das palavras importantes */}
      <Audio
        name="SFX swoosh · relógio vira resumo"
        src={staticFile("apresentacao/sfx-swoosh.wav")}
        from={qJanela(T.fase2)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.22}
      />
      <Audio
        name="SFX subida · barra da sexta"
        src={staticFile("apresentacao/sfx-subida.wav")}
        from={qJanela(T.sexta)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.2}
      />
      <Audio
        name="SFX tick · sábado pousa na metade"
        src={staticFile("apresentacao/sfx-tick.wav")}
        from={qJanela(T.cai + 16)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.18}
      />
    </AbsoluteFill>
  );
};
