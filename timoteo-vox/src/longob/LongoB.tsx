import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TIMING, inicioCenas, batidas } from "../timing";
import { EASE, Grain, ip } from "../fx";
import { Sfx } from "../common";
import { FS, K, Rasgo } from "../short/kit";
import { ROTEIRO_PAINEIS } from "./Paineis";

const SOBRA = 10;

type Item = { key: string; inicio: number; fim: number; novaCena: boolean; C: (typeof ROTEIRO_PAINEIS)[number]["C"]; cena: string; off: number };

const ITENS: Item[] = (() => {
  const base = ROTEIRO_PAINEIS.map((p, i) => {
    const b = batidas(p.cena);
    const off = p.de === 0 ? 0 : b.at(p.de) - 8;
    return { key: `${p.cena}-${p.de}-${i}`, inicio: inicioCenas[p.cena] + off, off, cena: p.cena, C: p.C, novaCena: p.de === 0 };
  });
  return base.map((it, i) => ({
    ...it,
    fim: i < base.length - 1 ? base[i + 1].inicio + SOBRA : TIMING.totalFrames,
  }));
})();

/** Entrada de painel dentro da mesma cena: deslize lateral com desfoque. */
const Deslize: React.FC<{ children: React.ReactNode; ativo: boolean }> = ({ children, ativo }) => {
  const f = useCurrentFrame();
  if (!ativo) return <>{children}</>;
  const p = ip(f, [0, 9], [0, 1], EASE);
  return <AbsoluteFill style={{ translate: `${(1 - p) * 1080}px 0`, filter: p < 1 ? `blur(${(1 - p) * 24}px)` : undefined }}>{children}</AbsoluteFill>;
};

type Bloco = { ini: number; fim: number; words: { w: string; t: number }[] };
const BLOCOS: Bloco[] = (() => {
  const out: Bloco[] = [];
  for (const c of TIMING.cenas) {
    const base = inicioCenas[c.id] / TIMING.fps;
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
  const b = BLOCOS.find((x) => t >= x.ini - 0.03 && t < x.fim + 0.08);
  if (!b) return null;
  const p = ip(t, [b.ini - 0.03, b.ini + 0.08], [0, 1]);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1540, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ maxWidth: 940, textAlign: "center", background: "rgba(17,17,17,0.88)", borderRadius: 14, padding: "8px 26px 2px", scale: String(0.9 + 0.1 * p), opacity: p, boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }}>
        {b.words.map((w, i) => {
          const prox = b.words[i + 1]?.t ?? b.fim;
          const ativa = t >= w.t && t < prox;
          return (
            <span key={i} style={{ fontFamily: FS.cond, fontSize: 66, lineHeight: 1.15, textTransform: "uppercase", color: ativa ? K.lima : "#fff", marginRight: "0.22em", display: "inline-block", scale: ativa ? "1.06" : "1" }}>
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
  const ti = inicioCenas["titulo"];
  const cr = inicioCenas["creditos"];
  return (
    <Audio
      src={staticFile("musica/trilha.mp3")}
      volume={(f) => {
        const titulo = interpolate(f, [ti - 10, ti, ti + 110, ti + 130], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const fim = interpolate(f, [cr - 20, cr, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return 0.13 + 0.2 * Math.max(titulo, fim * 0.9);
      }}
    />
  );
};

const ESCURAS = new Set(["titulo", "porque", "plebiscito", "numeros", "creditos"]);

export const LongoB: React.FC<{ legendas: boolean }> = ({ legendas }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
      {ITENS.map((it) => {
        const C = it.C;
        const b = batidas(it.cena);
        return (
          <Sequence key={it.key} from={it.inicio} durationInFrames={it.fim - it.inicio} name={it.key} premountFor={20}>
            <Deslize ativo={!it.novaCena}>
              <C b={b} off={it.off} len={it.fim - it.inicio} />
            </Deslize>
          </Sequence>
        );
      })}
      {ITENS.filter((it) => it.novaCena && it.inicio > 0).map((it) => (
        <React.Fragment key={`r-${it.key}`}>
          <Rasgo at={it.inicio} escuro={ESCURAS.has(it.cena)} />
          <Sequence from={Math.max(0, it.inicio - 8)} durationInFrames={40} layout="none">
            <Sfx at={0} name="whoosh" vol={0.3} />
          </Sequence>
        </React.Fragment>
      ))}
      {ITENS.filter((it) => !it.novaCena).map((it) => (
        <Sequence key={`w-${it.key}`} from={Math.max(0, it.inicio - 2)} durationInFrames={30} layout="none">
          <Sfx at={0} name="whoosh-short" vol={0.22} />
        </Sequence>
      ))}
      {legendas ? <Legenda /> : null}
      <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)" }} />
      <Grain opacity={0.1} />
      <Audio src={staticFile("voz/narracao.mp3")} volume={1} />
      <Trilha />
    </AbsoluteFill>
  );
};
