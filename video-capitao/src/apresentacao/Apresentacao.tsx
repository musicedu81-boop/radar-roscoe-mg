import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { COMPONENTES } from "./cenas";
import { COMPASSO, COR } from "./marca";
import {
  CENAS,
  duracaoDaSequencia,
  frasesDaCena,
  inicioDaCena,
  TRANSICAO,
} from "./roteiro";
import { glitch } from "./ui/Glitch";
import { Moldura } from "./ui/Moldura";
import { Narracao } from "./ui/Narracao";

// Cortes que caem na entrada de um trecho de energia alta da trilha ganham impacto grave
const CORTES_COM_IMPACTO = new Set(["numeros", "semana", "encerramento"]);

// Volume da trilha com ducking: abaixa enquanto a narração fala e sobe nos respiros
const useVolumeDaTrilha = (duracao: number) =>
  useMemo(() => {
    const fala = new Uint8Array(duracao);
    CENAS.forEach((_, i) => {
      for (const fr of frasesDaCena(i)) {
        const a = Math.max(0, inicioDaCena(i) + fr.inicio - 6);
        const b = Math.min(duracao, inicioDaCena(i) + fr.fim + 10);
        fala.fill(1, a, b);
      }
    });
    const vol = new Float32Array(duracao);
    let atual = 0.5;
    for (let q = 0; q < duracao; q++) {
      const alvo = fala[q] ? 0.16 : 0.5;
      atual += (alvo - atual) * (alvo < atual ? 0.25 : 0.06);
      vol[q] = atual;
    }
    return vol;
  }, [duracao]);

export const Apresentacao: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const volumeTrilha = useVolumeDaTrilha(durationInFrames);

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
        <Narracao indice={i} />
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
        volume={(f) =>
          (volumeTrilha[Math.min(f, durationInFrames - 1)] ?? 0.5) *
          interpolate(
            f,
            [durationInFrames - 45, durationInFrames - 1],
            [1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )
        }
      />
      {CENAS.slice(1).map((cena, k) => {
        const corte = inicioDaCena(k + 1);
        return (
          <React.Fragment key={cena.id}>
            <Sequence
              name={`SFX glitch · ${cena.titulo}`}
              from={corte - TRANSICAO / 2 - 2}
              durationInFrames={COMPASSO}
              premountFor={fps}
            >
              <Audio
                src={staticFile("apresentacao/sfx-glitch.wav")}
                volume={0.42}
              />
            </Sequence>
            {CORTES_COM_IMPACTO.has(cena.id) ? (
              <Sequence
                name={`SFX impacto · ${cena.titulo}`}
                from={corte}
                durationInFrames={COMPASSO}
                premountFor={fps}
              >
                <Audio
                  src={staticFile("apresentacao/sfx-impacto.wav")}
                  volume={0.35}
                />
              </Sequence>
            ) : null}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
