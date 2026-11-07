import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TIMING_SHORT, inicioCenasShort } from "../timing";
import { Grain, ip } from "../fx";
import { Sfx } from "../common";
import { FaixaBase, FaixaTopo, JAN } from "./pecas";
import { RAno, RFim, RFinal, RGancho, RMotivos, RNomes, RParque, RPlebiscito, RVila } from "./CenasRef";

const CENAS: Record<string, React.FC> = {
  gancho: RGancho,
  ano: RAno,
  motivos: RMotivos,
  vila: RVila,
  nomes: RNomes,
  plebiscito: RPlebiscito,
  parque: RParque,
  final: RFinal,
  fim: RFim,
};

/** Legenda no estilo das referências: caixa escura, branco, caixa alta, sem destaque de cor. */
type Bloco = { ini: number; fim: number; txt: string };
const BLOCOS: Bloco[] = (() => {
  const out: Bloco[] = [];
  for (const c of TIMING_SHORT.cenas) {
    const base = inicioCenasShort[c.id] / TIMING_SHORT.fps;
    for (const fala of c.falas) {
      const ws = fala.words.map((p) => ({ w: p.w, t: base + p.t }));
      const fimFala = base + fala.t + fala.dur;
      let cur: { w: string; t: number }[] = [];
      const flush = (fim: number) => {
        if (cur.length) out.push({ ini: cur[0].t, fim, txt: cur.map((x) => x.w).join(" ") });
        cur = [];
      };
      ws.forEach((p, i) => {
        cur.push(p);
        if (/[.?!:]$/.test(p.w) || (/,$/.test(p.w) && cur.length >= 2) || cur.length >= 4) flush(ws[i + 1] ? ws[i + 1].t : fimFala);
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
  const b = BLOCOS.find((x) => t >= x.ini - 0.03 && t < x.fim + 0.06);
  if (!b) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: JAN.top + JAN.h - 175, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: "rgba(22,22,22,0.9)",
          padding: "6px 22px 4px",
          fontFamily: "'Anton', Impact, sans-serif",
          fontSize: 54,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: 1,
          maxWidth: 940,
          textAlign: "center",
          lineHeight: 1.15,
        }}
      >
        {b.txt}
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
      volume={(f) => interpolate(f, [0, 12, durationInFrames - 70, durationInFrames - 1], [0, 0.15, 0.15, 0.28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
    />
  );
};

export const ShortRef: React.FC<{ legendas: boolean }> = ({ legendas }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#202020" }}>
      {/* janela central */}
      <div style={{ position: "absolute", left: 0, top: JAN.top, width: JAN.w, height: JAN.h, overflow: "hidden", background: "#232323" }}>
        {TIMING_SHORT.cenas.map((c) => {
          const C = CENAS[c.id];
          return (
            <Sequence key={c.id} from={inicioCenasShort[c.id]} durationInFrames={c.frames + 8} name={c.id} premountFor={20}>
              <C />
            </Sequence>
          );
        })}
      </div>
      {TIMING_SHORT.cenas.slice(1).map((c) => (
        <Sequence key={`s-${c.id}`} from={Math.max(0, inicioCenasShort[c.id] - 4)} durationInFrames={30} layout="none">
          <Sfx at={0} name="whoosh-short" vol={0.28} />
        </Sequence>
      ))}
      <FaixaTopo />
      <FaixaBase />
      {legendas ? <Legenda /> : null}
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.3) 100%)" }} />
      <Grain opacity={0.1} />
      <Audio src={staticFile("voz/narracao-short.mp3")} volume={1} />
      <Trilha />
      <div style={{ display: "none" }}>{ip(f, [0, 1], [0, 1])}</div>
    </AbsoluteFill>
  );
};
