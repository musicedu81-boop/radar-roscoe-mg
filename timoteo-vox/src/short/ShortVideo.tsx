import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TIMING_SHORT, inicioCenasShort } from "../timing";
import { Grain, ip } from "../fx";
import { Sfx } from "../common";
import { FS, K, Rasgo } from "./kit";
import { Ano, Final, Fim, Gancho, Motivos, Nomes, Parque, Plebiscito, Vila } from "./Cenas";

const CENAS: Record<string, React.FC> = {
  gancho: Gancho,
  ano: Ano,
  motivos: Motivos,
  vila: Vila,
  nomes: Nomes,
  plebiscito: Plebiscito,
  parque: Parque,
  final: Final,
  fim: Fim,
};
const ESCURA = new Set(["ano", "plebiscito", "fim"]);

/** Legenda em blocos curtos (estilo Shorts): caixa escura, palavra atual em limão. */
type Bloco = { ini: number; fim: number; words: { w: string; t: number }[] };
const BLOCOS: Bloco[] = (() => {
  const out: Bloco[] = [];
  for (const c of TIMING_SHORT.cenas) {
    const base = inicioCenasShort[c.id] / TIMING_SHORT.fps;
    for (const fala of c.falas) {
      const ws = fala.words.map((p) => ({ w: p.w, t: base + p.t }));
      const fimFala = base + fala.t + fala.dur;
      let cur: { w: string; t: number }[] = [];
      const flush = (fim: number) => {
        if (cur.length) out.push({ ini: cur[0].t, fim, words: cur });
        cur = [];
      };
      ws.forEach((p, i) => {
        cur.push(p);
        const corte = /[.?!:]$/.test(p.w) || (/,$/.test(p.w) && cur.length >= 2) || cur.length >= 4;
        if (corte) flush(ws[i + 1] ? ws[i + 1].t : fimFala);
      });
      flush(fimFala);
    }
  }
  return out;
})();

const Legenda: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const b = BLOCOS.find((x) => t >= x.ini - 0.03 && t < x.fim + 0.08);
  if (!b) return null;
  const p = ip(t, [b.ini - 0.03, b.ini + 0.08], [0, 1]);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1540, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 940,
          textAlign: "center",
          background: "rgba(17,17,17,0.88)",
          borderRadius: 14,
          padding: "8px 26px 2px",
          scale: String(0.9 + 0.1 * p),
          opacity: p,
          boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
        }}
      >
        {b.words.map((w, i) => {
          const prox = b.words[i + 1]?.t ?? b.fim;
          const ativa = t >= w.t && t < prox;
          return (
            <span
              key={i}
              style={{
                fontFamily: FS.cond,
                fontSize: 68,
                lineHeight: 1.15,
                textTransform: "uppercase",
                color: ativa ? K.lima : "#fff",
                marginRight: "0.22em",
                display: "inline-block",
                scale: ativa ? "1.06" : "1",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Trilha: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <Audio
      src={staticFile("musica/trilha.mp3")}
      trimBefore={96 * 30}
      volume={(f) =>
        interpolate(f, [0, 12, durationInFrames - 70, durationInFrames - 1], [0.0, 0.16, 0.16, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      }
    />
  );
};

export const ShortVideo: React.FC<{ legendas: boolean }> = ({ legendas }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
      {TIMING_SHORT.cenas.map((c) => {
        const C = CENAS[c.id];
        return (
          <Sequence key={c.id} from={inicioCenasShort[c.id]} durationInFrames={c.frames} name={c.id} premountFor={20}>
            <C />
          </Sequence>
        );
      })}
      {TIMING_SHORT.cenas.slice(1).map((c) => (
        <React.Fragment key={`t-${c.id}`}>
          <Rasgo at={inicioCenasShort[c.id]} escuro={ESCURA.has(c.id)} />
          <Sequence from={Math.max(0, inicioCenasShort[c.id] - 8)} durationInFrames={40} layout="none">
            <Sfx at={0} name="whoosh" vol={0.3} />
          </Sequence>
        </React.Fragment>
      ))}
      {legendas ? <Legenda /> : null}
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)" }} />
      <Grain opacity={0.1} />
      <Audio src={staticFile("voz/narracao-short.mp3")} volume={1} />
      <Trilha />
    </AbsoluteFill>
  );
};
