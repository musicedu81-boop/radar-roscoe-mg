import timing from "./data/timing.json";

export type Palavra = { w: string; t: number };
export type Fala = { id: string; cap: string; t: number; dur: number; words: Palavra[] };
export type Cena = { id: string; inicio: number; dur: number; frames: number; falas: Fala[] };

export const TIMING = timing as {
  fps: number;
  totalFrames: number;
  cenas: Cena[];
};

export const cenaPorId = (id: string): Cena => {
  const c = TIMING.cenas.find((x) => x.id === id);
  if (!c) throw new Error("cena não encontrada: " + id);
  return c;
};

/** Frame inicial (de cena) de cada cena, acumulado. */
export const inicioCenas = (() => {
  const out: Record<string, number> = {};
  let acc = 0;
  for (const c of TIMING.cenas) {
    out[c.id] = acc;
    acc += c.frames;
  }
  return out;
})();

/**
 * Batidas sincronizadas com a locução: at(i) = frame local onde começa a fala i.
 * at(i, w) = frame local da palavra w da fala i. end(i) = frame onde a fala i termina.
 */
export const batidas = (id: string, fps = TIMING.fps) => {
  const c = cenaPorId(id);
  const at = (i: number, w?: number) => {
    const f = c.falas[Math.min(i, c.falas.length - 1)];
    if (!f) return 0;
    if (w === undefined) return Math.round(f.t * fps);
    const p = f.words[Math.min(w, f.words.length - 1)];
    return Math.round(p.t * fps);
  };
  const end = (i: number) => {
    const f = c.falas[i];
    return f ? Math.round((f.t + f.dur) * fps) : c.frames;
  };
  /** frame da primeira palavra que contém o texto (busca na fala i) */
  const word = (i: number, txt: string) => {
    const f = c.falas[i];
    if (!f) return 0;
    const k = f.words.findIndex((p) => p.w.toLowerCase().includes(txt.toLowerCase()));
    return Math.round((k >= 0 ? f.words[k].t : f.t) * fps);
  };
  return { at, end, word, frames: c.frames, cena: c };
};

// ---------------------------------------------------------------- Short (9:16)
import timingShort from "./data/timing-short.json";

export const TIMING_SHORT = timingShort as typeof TIMING;

export const inicioCenasShort = (() => {
  const out: Record<string, number> = {};
  let acc = 0;
  for (const c of TIMING_SHORT.cenas) {
    out[c.id] = acc;
    acc += c.frames;
  }
  return out;
})();

export const batidasShort = (id: string, fps = TIMING_SHORT.fps) => {
  const c = TIMING_SHORT.cenas.find((x) => x.id === id);
  if (!c) throw new Error("cena não encontrada: " + id);
  const at = (i: number) => Math.round((c.falas[Math.min(i, c.falas.length - 1)]?.t ?? 0) * fps);
  const end = (i: number) => {
    const f = c.falas[i];
    return f ? Math.round((f.t + f.dur) * fps) : c.frames;
  };
  const word = (i: number, txt: string) => {
    const f = c.falas[i];
    if (!f) return 0;
    const k = f.words.findIndex((p) => p.w.toLowerCase().includes(txt.toLowerCase()));
    return Math.round((k >= 0 ? f.words[k].t : f.t) * fps);
  };
  return { at, end, word, frames: c.frames, cena: c };
};
