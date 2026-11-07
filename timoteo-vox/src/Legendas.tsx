import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { inicioCenas, TIMING } from "./timing";
import { C, F } from "./theme";
import { ip } from "./fx";

/** FX 44 — Legenda karaokê: blocos curtos, palavra atual destacada no marca-texto. */
type Bloco = { ini: number; fim: number; words: { w: string; t: number }[] };

const MAX_PALAVRAS = 8;

const BLOCOS: Bloco[] = (() => {
  const out: Bloco[] = [];
  const fps = TIMING.fps;
  for (const c of TIMING.cenas) {
    const base = inicioCenas[c.id] / fps;
    for (const fala of c.falas) {
      const ws = fala.words.map((p) => ({ w: p.w, t: base + p.t }));
      const fimFala = base + fala.t + fala.dur;
      // quebra em blocos por pontuação ou tamanho
      let cur: { w: string; t: number }[] = [];
      const flush = (fim: number) => {
        if (cur.length) out.push({ ini: cur[0].t, fim, words: cur });
        cur = [];
      };
      ws.forEach((p, i) => {
        cur.push(p);
        const fimPont = /[.?!:;]$/.test(p.w) || (/,$/.test(p.w) && cur.length >= 4);
        if (cur.length >= MAX_PALAVRAS || fimPont) {
          const prox = ws[i + 1];
          flush(prox ? prox.t : fimFala);
        }
      });
      flush(fimFala);
    }
  }
  return out;
})();

export const Legendas: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const b = BLOCOS.find((x) => t >= x.ini - 0.05 && t < x.fim + 0.15);
  if (!b) return null;
  const pin = ip(t, [b.ini - 0.05, b.ini + 0.12], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 54,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        opacity: pin,
        translate: `0px ${(1 - pin) * 10}px`,
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          textAlign: "center",
          background: "rgba(22,22,22,0.86)",
          color: C.papelClaro,
          fontFamily: F.head,
          fontWeight: 700,
          fontSize: 42,
          lineHeight: 1.25,
          padding: "10px 26px 12px",
          borderRadius: 6,
        }}
      >
        {b.words.map((p, i) => {
          const next = b.words[i + 1]?.t ?? b.fim;
          const ativa = t >= p.t && t < next;
          const dita = t >= p.t;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.25em",
                padding: "0 0.08em",
                borderRadius: 4,
                background: ativa ? C.marca : "transparent",
                color: ativa ? C.tinta : dita ? C.papelClaro : "rgba(251,248,241,0.62)",
              }}
            >
              {p.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
