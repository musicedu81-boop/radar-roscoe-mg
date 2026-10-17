import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { COMPONENTES } from "./cenas";
import { COMPASSO, COR } from "./marca";
import { CENAS, duracaoDaSequencia, inicioDaCena, TRANSICAO } from "./roteiro";
import { glitch } from "./ui/Glitch";
import { Moldura } from "./ui/Moldura";

// Cortes que caem na entrada de um trecho de energia alta da trilha ganham impacto grave
const CORTES_COM_IMPACTO = new Set(["numeros", "semana", "encerramento"]);

export const Apresentacao: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  const itens = CENAS.flatMap((cena, i) => {
    const Componente = COMPONENTES[cena.id];
    const sequencia = (
      <TransitionSeries.Sequence
        key={cena.id}
        name={`${String(i + 1).padStart(2, "0")} · ${cena.titulo}`}
        durationInFrames={duracaoDaSequencia(i)}
        premountFor={fps}
      >
        <Componente />
      </TransitionSeries.Sequence>
    );
    if (i === 0) {
      return [sequencia];
    }
    return [
      <TransitionSeries.Transition
        key={`glitch-${cena.id}`}
        presentation={glitch()}
        timing={linearTiming({ durationInFrames: TRANSICAO })}
      />,
      sequencia,
    ];
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COR.noiteProfunda }}>
      <TransitionSeries>{itens}</TransitionSeries>
      <Moldura />

      <Audio
        name="Trilha da apresentação"
        src={staticFile("apresentacao/trilha.wav")}
        volume={(f) => interpolate(f, [durationInFrames - 45, durationInFrames - 1], [0.9, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      />
      {CENAS.slice(1).map((cena, k) => {
        const corte = inicioDaCena(k + 1);
        return (
          <React.Fragment key={cena.id}>
            <Sequence name={`SFX glitch · ${cena.titulo}`} from={corte - TRANSICAO / 2 - 2} durationInFrames={COMPASSO} premountFor={fps}>
              <Audio src={staticFile("apresentacao/sfx-glitch.wav")} volume={0.42} />
            </Sequence>
            {CORTES_COM_IMPACTO.has(cena.id) ? (
              <Sequence name={`SFX impacto · ${cena.titulo}`} from={corte} durationInFrames={COMPASSO} premountFor={fps}>
                <Audio src={staticFile("apresentacao/sfx-impacto.wav")} volume={0.35} />
              </Sequence>
            ) : null}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
