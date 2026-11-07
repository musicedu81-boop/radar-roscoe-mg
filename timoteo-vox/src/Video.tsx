import React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Audio } from "@remotion/media";
import { TIMING, inicioCenas } from "./timing";
import { Drift, Grain, PaperBG, Transition, TransType, Vignette } from "./fx";
import { Sfx } from "./common";
import { Legendas } from "./Legendas";
import { Abertura } from "./scenes/Abertura";
import { Titulo } from "./scenes/Titulo";
import { Mapa } from "./scenes/Mapa";
import { Origem } from "./scenes/Origem";
import { Porque } from "./scenes/Porque";
import { Vila } from "./scenes/Vila";
import { Emancipacao } from "./scenes/Emancipacao";
import { Plebiscito } from "./scenes/Plebiscito";
import { Nomes } from "./scenes/Nomes";
import { Parque } from "./scenes/Parque";
import { Espremida } from "./scenes/Espremida";
import { Numeros } from "./scenes/Numeros";
import { Final } from "./scenes/Final";
import { Creditos } from "./scenes/Creditos";

export type VideoProps = { legendas: boolean };

const CENAS: Record<string, { C: React.FC; drift?: boolean }> = {
  abertura: { C: Abertura },
  titulo: { C: Titulo },
  mapa: { C: Mapa },
  origem: { C: Origem, drift: true },
  porque: { C: Porque, drift: true },
  vila: { C: Vila, drift: true },
  emancipacao: { C: Emancipacao, drift: true },
  plebiscito: { C: Plebiscito, drift: true },
  nomes: { C: Nomes, drift: true },
  parque: { C: Parque, drift: true },
  espremida: { C: Espremida },
  numeros: { C: Numeros, drift: true },
  final: { C: Final },
  creditos: { C: Creditos },
};

// tipo de transição na entrada de cada cena (FX 23–26)
const ENTRADA: Record<string, TransType> = {
  titulo: "flash",
  mapa: "papel",
  origem: "faixas",
  porque: "iris",
  vila: "papel",
  emancipacao: "faixas",
  plebiscito: "flash",
  nomes: "papel",
  parque: "iris",
  espremida: "papel",
  numeros: "faixas",
  final: "flash",
  creditos: "iris",
};

const Trilha: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const ti = inicioCenas["titulo"];
  const cr = inicioCenas["creditos"];
  return (
    <Audio
      src={staticFile("musica/trilha.mp3")}
      volume={(f) => {
        // sobe no título e nos créditos, abaixa sob a locução
        const base = 0.13;
        const titulo = interpolate(f, [ti - 10, ti, ti + 110, ti + 130], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const fim = interpolate(f, [cr - 20, cr, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return base + 0.22 * Math.max(titulo, fim * 0.9);
      }}
    />
  );
};

const Relogio: React.FC = () => {
  // apenas para depuração no Studio
  const f = useCurrentFrame();
  return f < 0 ? <div /> : null;
};

export const Video: React.FC<VideoProps> = ({ legendas }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#EFE9DC" }}>
      <PaperBG />
      {TIMING.cenas.map((c) => {
        const def = CENAS[c.id];
        const Comp = def.C;
        return (
          <Sequence key={c.id} from={inicioCenas[c.id]} durationInFrames={c.frames} name={c.id} premountFor={30}>
            {def.drift ? (
              <Drift dur={c.frames} from={1} to={1.035}>
                <Comp />
              </Drift>
            ) : (
              <Comp />
            )}
          </Sequence>
        );
      })}
      {TIMING.cenas.map((c) =>
        ENTRADA[c.id] ? <Transition key={`t-${c.id}`} type={ENTRADA[c.id]} at={inicioCenas[c.id]} len={18} /> : null,
      )}
      {TIMING.cenas.map((c) =>
        ENTRADA[c.id] ? (
          <Sequence key={`ts-${c.id}`} from={Math.max(0, inicioCenas[c.id] - 12)} durationInFrames={60} layout="none">
            <Sfx at={0} name={ENTRADA[c.id] === "flash" ? "whoosh-short" : "whoosh"} vol={0.28} />
          </Sequence>
        ) : null,
      )}
      {legendas ? <Legendas /> : null}
      <Vignette />
      <Grain />
      <Audio src={staticFile("voz/narracao.mp3")} volume={1} />
      <Trilha />
      <Relogio />
    </AbsoluteFill>
  );
};
