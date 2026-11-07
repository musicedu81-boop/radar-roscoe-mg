/**
 * Biblioteca de 45 efeitos no estilo explainer (Vox).
 * Cada efeito é numerado (FX 01..45) e usado ao longo das cenas.
 * Tudo é dirigido por frame (useCurrentFrame/interpolate/spring): nada de CSS transition.
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, F } from "../theme";

// ---------------------------------------------------------------- utilitários
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1);

export const ip = (
  f: number,
  inp: number[],
  out: number[],
  easing: (t: number) => number = EASE,
) =>
  interpolate(f, inp, out, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const sp = (
  f: number,
  fps: number,
  delay = 0,
  config: Partial<{ damping: number; stiffness: number; mass: number }> = {},
) =>
  spring({
    frame: f - delay,
    fps,
    config: { damping: 13, stiffness: 120, mass: 0.8, ...config },
  });

export const fmt = (n: number, dec = 0) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });

// ---------------------------------------------------------------- FX 01 Papel
export const PaperBG: React.FC<{ tint?: string }> = ({ tint }) => (
  <AbsoluteFill style={{ backgroundColor: C.papel }}>
    <Img src={staticFile("tex/papel.png")} style={{ width: "100%", height: "100%", mixBlendMode: "multiply" }} />
    {tint ? <AbsoluteFill style={{ backgroundColor: tint, mixBlendMode: "multiply" }} /> : null}
  </AbsoluteFill>
);

// ---------------------------------------------------------------- FX 02 Granulação
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.075 }) => {
  const f = useCurrentFrame();
  const i = Math.floor(f / 2) % 8;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <Img src={staticFile(`tex/grao${i}.png`)} style={{ width: "100%", height: "100%", imageRendering: "pixelated" }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- FX 03 Vinheta
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.2 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(40,28,10,${strength}) 100%)`,
    }}
  />
);

// ---------------------------------------------------------------- FX 04 Câmera em deriva (Ken Burns)
export const Drift: React.FC<{
  children: React.ReactNode;
  dur: number;
  from?: number;
  to?: number;
  dx?: number;
  dy?: number;
}> = ({ children, dur, from = 1, to = 1.045, dx = 0, dy = 0 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        scale: String(interpolate(f, [0, dur], [from, to], { extrapolateRight: "clamp" })),
        translate: `${interpolate(f, [0, dur], [0, dx], { extrapolateRight: "clamp" })}px ${interpolate(f, [0, dur], [0, dy], { extrapolateRight: "clamp" })}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- FX 05 Tremor de impacto
export const Shake: React.FC<{ children: React.ReactNode; at: number[]; amp?: number; len?: number }> = ({
  children,
  at,
  amp = 14,
  len = 14,
}) => {
  const f = useCurrentFrame();
  let x = 0;
  let y = 0;
  for (const a of at) {
    const d = f - a;
    if (d >= 0 && d < len) {
      const k = (1 - d / len) ** 2 * amp;
      x += (random(`sx${a}-${d}`) - 0.5) * 2 * k;
      y += (random(`sy${a}-${d}`) - 0.5) * 2 * k;
    }
  }
  return <AbsoluteFill style={{ translate: `${x}px ${y}px` }}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------- FX 06 Marca-texto
export const Highlight: React.FC<{
  children: React.ReactNode;
  at: number;
  dur?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, at, dur = 12, color = C.marca, style }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], EASE_IO);
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span
        style={{
          position: "absolute",
          left: "-0.12em",
          right: "-0.12em",
          top: "0.12em",
          bottom: "0.02em",
          background: color,
          opacity: 0.92,
          transformOrigin: "left center",
          scale: `${p} 1`,
          rotate: "-1deg",
          borderRadius: "0.08em 0.25em 0.12em 0.3em",
          mixBlendMode: "multiply",
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

// ---------------------------------------------------------------- FX 07 Círculo à mão
export const HandCircle: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  at: number;
  dur?: number;
  color?: string;
  stroke?: number;
  seed?: string;
}> = ({ x, y, w, h, at, dur = 16, color = C.aco, stroke = 6, seed = "c" }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], EASE_IO);
  const pts: string[] = [];
  const N = 48;
  for (let i = 0; i <= N + 6; i++) {
    const a = (i / N) * Math.PI * 2 - 0.6;
    const r = 1 + (random(`${seed}${i}`) - 0.5) * 0.06 + i * 0.0018;
    pts.push(`${(x + Math.cos(a) * (w / 2) * r).toFixed(1)},${(y + Math.sin(a) * (h / 2) * r).toFixed(1)}`);
  }
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - p}
      />
    </svg>
  );
};

// ---------------------------------------------------------------- FX 08 Sublinhado rabiscado
export const Scribble: React.FC<{
  x: number;
  y: number;
  w: number;
  at: number;
  dur?: number;
  color?: string;
  stroke?: number;
}> = ({ x, y, w, at, dur = 12, color = C.aco, stroke = 6 }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], EASE_IO);
  const d = `M${x},${y} C${x + w * 0.3},${y - 10} ${x + w * 0.6},${y + 12} ${x + w},${y - 4} M${x + w * 0.08},${y + 14} C${x + w * 0.4},${y + 6} ${x + w * 0.7},${y + 18} ${x + w * 0.94},${y + 10}`;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </svg>
  );
};

// ---------------------------------------------------------------- FX 09 Riscado
export const Strike: React.FC<{ children: React.ReactNode; at: number; color?: string; dur?: number }> = ({
  children,
  at,
  color = C.aco,
  dur = 10,
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], EASE_IO);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ opacity: interpolate(p, [0, 1], [1, 0.45]) }}>{children}</span>
      <span
        style={{
          position: "absolute",
          left: "-4%",
          width: "108%",
          top: "52%",
          height: "0.11em",
          background: color,
          borderRadius: 99,
          transformOrigin: "left center",
          scale: `${p} 1`,
          rotate: "-3deg",
        }}
      />
    </span>
  );
};

// ---------------------------------------------------------------- FX 10 Máquina de escrever
export const Typewriter: React.FC<{ text: string; at: number; cps?: number; style?: React.CSSProperties; caret?: boolean }> = ({
  text,
  at,
  cps = 22,
  style,
  caret = true,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(0, Math.floor(((f - at) / fps) * cps));
  const shown = text.slice(0, n);
  const done = n >= text.length;
  const blink = Math.floor(f / 8) % 2 === 0;
  return (
    <span style={style}>
      {shown}
      {caret && f >= at && (!done || blink) ? <span style={{ opacity: 0.8 }}>▌</span> : null}
    </span>
  );
};

// ---------------------------------------------------------------- FX 11 Palavras em cascata
export const WordsReveal: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  style?: React.CSSProperties;
  wordStyle?: (w: string, i: number) => React.CSSProperties | undefined;
}> = ({ text, at, stagger = 3, style, wordStyle }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  return (
    <span style={style}>
      {words.map((w, i) => {
        const p = ip(f, [at + i * stagger, at + i * stagger + 12], [0, 1]);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              translate: `0px ${(1 - p) * 26}px`,
              marginRight: "0.26em",
              ...(wordStyle ? wordStyle(w, i) : {}),
            }}
          >
            {w}
          </span>
        );
      })}
    </span>
  );
};

// ---------------------------------------------------------------- FX 12 Pop com mola
export const Pop: React.FC<{
  children: React.ReactNode;
  at: number;
  style?: React.CSSProperties;
  from?: number;
  out?: number;
  outDur?: number;
}> = ({ children, at, style, from = 0, out, outDur = 10 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, at);
  const o = out !== undefined ? ip(f, [out, out + outDur], [1, 0], EASE_IN) : 1;
  return (
    <div
      style={{
        position: "absolute",
        scale: String(interpolate(s, [0, 1], [from, 1]) * (0.85 + 0.15 * o)),
        opacity: Math.min(1, s * 3) * o,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------- FX 13 Contador
export const Counter: React.FC<{
  to: number;
  at: number;
  dur?: number;
  dec?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
  from?: number;
}> = ({ to, at, dur = 36, dec = 0, prefix = "", suffix = "", style, from = 0 }) => {
  const f = useCurrentFrame();
  const v = ip(f, [at, at + dur], [from, to], Easing.bezier(0.2, 0.7, 0.2, 1));
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {fmt(v, dec)}
      {suffix}
    </span>
  );
};

// ---------------------------------------------------------------- FX 14 Câmera de mapa (zoom log)
export type Cam = { x: number; y: number; z: number };
export const camAt = (f: number, keys: { f: number; c: Cam }[]): Cam => {
  if (f <= keys[0].f) return keys[0].c;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f <= b.f) {
      const t = EASE_IO((f - a.f) / Math.max(1, b.f - a.f));
      const lz = Math.log(a.c.z) + (Math.log(b.c.z) - Math.log(a.c.z)) * t;
      const z = Math.exp(lz);
      // interpolação de centro ponderada pelo zoom (evita 'escorregar')
      const wa = 1 / a.c.z;
      const wb = 1 / b.c.z;
      const wz = 1 / z;
      const u = wa === wb ? t : (wa - wz) / (wa - wb);
      return { x: a.c.x + (b.c.x - a.c.x) * u, y: a.c.y + (b.c.y - a.c.y) * u, z };
    }
  }
  return keys[keys.length - 1].c;
};
export const camTransform = (c: Cam) => `translate(960 540) scale(${c.z}) translate(${-c.x} ${-c.y})`;

// ---------------------------------------------------------------- FX 15 Preenchimento de região
export const regionFill = (f: number, at: number, dur = 14) => ip(f, [at, at + dur], [0, 1], EASE_IO);

// ---------------------------------------------------------------- FX 16 Traço que se desenha
export const DrawPath: React.FC<{
  d: string;
  at: number;
  dur?: number;
  color?: string;
  width?: number;
  dash?: string;
  fill?: string;
  opacity?: number;
  linecap?: "round" | "butt";
}> = ({ d, at, dur = 24, color = C.tinta, width = 4, dash, fill = "none", opacity = 1, linecap = "round" }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], EASE_IO);
  if (dash) {
    // tracejado: revela com máscara
    const id = `m${Math.abs(hash(d + at))}`;
    return (
      <g opacity={opacity}>
        <defs>
          <mask id={id} maskUnits="userSpaceOnUse" x={-10000} y={-10000} width={20000} height={20000}>
            <path d={d} fill="none" stroke="#fff" strokeWidth={width * 3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
          </mask>
        </defs>
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap={linecap} mask={`url(#${id})`} />
      </g>
    );
  }
  return (
    <path
      d={d}
      fill={fill}
      stroke={color}
      strokeWidth={width}
      strokeLinecap={linecap}
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - p}
      opacity={opacity}
    />
  );
};
export const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
};

// ---------------------------------------------------------------- FX 17 Pino que cai
export const Pin: React.FC<{
  x: number;
  y: number;
  at: number;
  color?: string;
  size?: number;
  label?: string;
  labelColor?: string;
  labelSide?: "right" | "left" | "top";
  out?: number;
}> = ({ x, y, at, color = C.aco, size = 54, label, labelColor = C.tinta, labelSide = "right", out }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, at, { damping: 9, stiffness: 160 });
  const drop = interpolate(s, [0, 1], [-260, 0]);
  const o = (f >= at ? 1 : 0) * (out !== undefined ? ip(f, [out, out + 8], [1, 0]) : 1);
  const lp = ip(f, [at + 8, at + 20], [0, 1]);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o }}>
      <div
        style={{
          position: "absolute",
          left: -size * 0.32,
          top: -size * 0.08,
          width: size * 0.64,
          height: size * 0.18,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.25)",
          scale: String(0.4 + 0.6 * s),
        }}
      />
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 40 52"
        style={{ position: "absolute", left: -size / 2, top: -size * 1.3 + drop, overflow: "visible" }}
      >
        <path d="M20 51 C20 51 3 31 3 19 A17 17 0 1 1 37 19 C37 31 20 51 20 51 Z" fill={color} stroke={C.tinta} strokeWidth={2.5} />
        <circle cx={20} cy={19} r={6.5} fill={C.papelClaro} stroke={C.tinta} strokeWidth={2} />
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            whiteSpace: "nowrap",
            ...(labelSide === "right"
              ? { left: size * 0.6, top: -size * 1.05 }
              : labelSide === "left"
                ? { right: size * 0.6, top: -size * 1.05 }
                : { left: 0, top: -size * 2.1, translate: "-50% 0" }),
            opacity: lp,
            translate: labelSide === "top" ? `-50% ${(1 - lp) * 10}px` : `${(1 - lp) * (labelSide === "left" ? 16 : -16)}px 0`,
            fontFamily: F.head,
            fontWeight: 800,
            fontSize: size * 0.62,
            color: labelColor,
            letterSpacing: 1,
            background: C.papelClaro,
            padding: "4px 14px",
            border: `3px solid ${C.tinta}`,
            boxShadow: `5px 5px 0 ${C.tinta}`,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- FX 18 Anéis de pulso (radar)
export const Pulse: React.FC<{ x: number; y: number; at: number; color?: string; r?: number; every?: number; rings?: number }> = ({
  x,
  y,
  at,
  color = C.aco,
  r = 90,
  every = 24,
  rings = 3,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {new Array(rings).fill(0).map((_, i) => {
        const t = ((f - at + i * (every / rings)) % every) / every;
        return <circle key={i} cx={x} cy={y} r={r * t} fill="none" stroke={color} strokeWidth={4 * (1 - t)} opacity={1 - t} />;
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- FX 19 Balão com linha guia
export const Callout: React.FC<{
  x: number;
  y: number;
  tx: number;
  ty: number;
  at: number;
  children: React.ReactNode;
  color?: string;
  width?: number;
  out?: number;
}> = ({ x, y, tx, ty, at, children, color = C.tinta, width, out }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + 14], [0, 1], EASE_IO);
  const q = ip(f, [at + 8, at + 22], [0, 1]);
  const o = out !== undefined ? ip(f, [out, out + 8], [1, 0]) : 1;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <circle cx={x} cy={y} r={9 * p} fill={color} />
        <line x1={x} y1={y} x2={x + (tx - x) * p} y2={y + (ty - y) * p} stroke={color} strokeWidth={3.5} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: tx,
          top: ty,
          translate: `${tx < x ? "-100%" : "0"} -50%`,
          opacity: q,
          scale: String(0.9 + 0.1 * q),
          background: C.papelClaro,
          border: `3px solid ${C.tinta}`,
          boxShadow: `6px 6px 0 ${C.tinta}`,
          padding: "12px 20px",
          fontFamily: F.head,
          fontSize: 34,
          fontWeight: 700,
          color: C.tinta,
          width,
          lineHeight: 1.15,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- FX 20 Retícula (halftone)
export const Halftone: React.FC<{ color?: string; opacity?: number; size?: number; style?: React.CSSProperties }> = ({
  color = C.tinta,
  opacity = 0.12,
  size = 14,
  style,
}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `radial-gradient(${color} 22%, transparent 24%)`,
      backgroundSize: `${size}px ${size}px`,
      opacity,
      pointerEvents: "none",
      ...style,
    }}
  />
);

// ---------------------------------------------------------------- FX 21 Glitch cromático
export const Chroma: React.FC<{ children: React.ReactNode; at: number; len?: number; amp?: number; style?: React.CSSProperties; blend?: "multiply" | "screen" }> = ({
  children,
  at,
  len = 16,
  amp = 14,
  style,
  blend = "multiply",
}) => {
  const f = useCurrentFrame();
  const d = f - at;
  const on = d >= 0 && d < len;
  const k = on ? (1 - d / len) * amp * (random(`g${d}`) > 0.3 ? 1 : 0.2) : 0;
  const base: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...style };
  return (
    <div style={{ position: "relative", ...style }}>
      {on ? (
        <>
          <div style={{ ...base, color: "#ff2a55", translate: `${-k}px ${k * 0.2}px`, mixBlendMode: blend, opacity: 0.85 }}>{children}</div>
          <div style={{ ...base, color: "#00b7ff", translate: `${k}px ${-k * 0.2}px`, mixBlendMode: blend, opacity: 0.85 }}>{children}</div>
        </>
      ) : null}
      <div style={{ position: "relative", clipPath: on && random(`h${d}`) > 0.6 ? `inset(${random(`i${d}`) * 60}% 0 ${random(`j${d}`) * 30}% 0)` : undefined }}>
        {children}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- FX 22 Vazamento de luz
export const LightLeak: React.FC<{ at?: number; dur?: number; color?: string; opacity?: number }> = ({
  at = 0,
  dur = 90,
  color = "255,170,60",
  opacity = 0.45,
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur * 0.4, at + dur], [0, 1, 0], EASE_IO);
  const x = interpolate(f, [at, at + dur], [-20, 120]);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: p * opacity,
        background: `radial-gradient(ellipse 45% 70% at ${x}% 30%, rgba(${color},0.9), rgba(${color},0) 70%), radial-gradient(ellipse 30% 50% at ${100 - x * 0.6}% 80%, rgba(255,90,60,0.6), rgba(255,90,60,0) 70%)`,
      }}
    />
  );
};

// ---------------------------------------------------------------- FX 23..26 Transições (sobreposições)
export type TransType = "papel" | "faixas" | "iris" | "flash";
/** Sobreposição centrada em `at` (o corte acontece exatamente em `at`). */
export const Transition: React.FC<{ type: TransType; at: number; len?: number; color?: string }> = ({ type, at, len = 18, color = C.tinta }) => {
  const f = useCurrentFrame();
  const a = at - len / 2;
  const b = at + len / 2;
  if (f < a - 1 || f > b + 1) return null;
  const tin = ip(f, [a, at], [0, 1], EASE_IN);
  const tout = ip(f, [at, b], [0, 1], EASE);
  if (type === "papel") {
    // FX 23 — folha de papel com borda rasgada atravessando
    const x = f < at ? interpolate(tin, [0, 1], [2100, 0]) : interpolate(tout, [0, 1], [0, -2300]);
    const torn = tornPath(1920 + 240, 1080, "t" + at);
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={2200} height={1080} style={{ position: "absolute", left: x - 120, top: 0, overflow: "visible", filter: "drop-shadow(-12px 0 18px rgba(0,0,0,.25))" }}>
          <path d={torn} fill={C.papelEscuro} />
        </svg>
      </AbsoluteFill>
    );
  }
  if (type === "faixas") {
    // FX 24 — faixas coloridas varrendo
    const cols = [C.aco, C.marca, C.tinta, C.mata];
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {cols.map((c, i) => {
          const d = i * 2;
          const pin = ip(f, [a + d, at + d * 0.5], [0, 1], EASE_IN);
          const pout = ip(f, [at + d * 0.3, b + d], [0, 1], EASE);
          const x = f < at ? interpolate(pin, [0, 1], [-100, 0]) : interpolate(pout, [0, 1], [0, 100]);
          return <AbsoluteFill key={i} style={{ background: c, translate: `${x}% 0`, top: `${i * 25}%`, height: "25%" }} />;
        })}
      </AbsoluteFill>
    );
  }
  if (type === "iris") {
    // FX 25 — íris circular
    const r = f < at ? interpolate(tin, [0, 1], [0, 1250]) : interpolate(tout, [0, 1], [1250, 0]);
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={1920} height={1080}>
          <circle cx={960} cy={540} r={r} fill={color} />
        </svg>
      </AbsoluteFill>
    );
  }
  // FX 26 — flash branco
  const o = f < at ? tin : 1 - tout;
  return <AbsoluteFill style={{ background: "#fffdf6", opacity: o * 0.95, pointerEvents: "none" }} />;
};

export const tornPath = (w: number, h: number, seed: string) => {
  // retângulo com borda esquerda e direita rasgadas
  const pts: string[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * h;
    pts.push(`${(random(`${seed}L${i}`) * 36).toFixed(1)},${y.toFixed(1)}`);
  }
  for (let i = steps; i >= 0; i--) {
    const y = (i / steps) * h;
    pts.push(`${(w - random(`${seed}R${i}`) * 36).toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${pts.join(" L")}Z`;
};

// ---------------------------------------------------------------- FX 27 Paralaxe
export const Parallax: React.FC<{ children: React.ReactNode; depth: number; dur: number; dx?: number }> = ({ children, depth, dur, dx = -60 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ translate: `${interpolate(f, [0, dur], [0, dx * depth])}px 0px` }}>{children}</AbsoluteFill>
  );
};

// ---------------------------------------------------------------- FX 28 Tela dividida
export const SplitReveal: React.FC<{ at: number; atRight?: number; left: React.ReactNode; right: React.ReactNode; leftBg: string; rightBg: string }> = ({
  at,
  atRight,
  left,
  right,
  leftBg,
  rightBg,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, at, { damping: 18, stiffness: 90 });
  const s2 = sp(f, fps, atRight ?? at + 6, { damping: 18, stiffness: 90 });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, background: leftBg, translate: `${(1 - s) * -960}px 0`, overflow: "hidden" }}>
        {left}
      </div>
      <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, background: rightBg, translate: `${(1 - s2) * 960}px 0`, overflow: "hidden" }}>
        {right}
      </div>
      <div style={{ position: "absolute", left: 954, top: 0, width: 12, height: 1080 * Math.max(s, s2), background: C.tinta }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- FX 29 Cartão de papel rasgado
export const TornCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  at: number;
  children: React.ReactNode;
  rot?: number;
  bg?: string;
  seed?: string;
  out?: number;
}> = ({ x, y, w, h, at, children, rot = -2, bg = C.papelClaro, seed = "card", out }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, at, { damping: 15, stiffness: 110 });
  const o = out !== undefined ? ip(f, [out, out + 10], [1, 0], EASE_IN) : 1;
  const pts: string[] = [];
  const st = 26;
  for (let i = 0; i <= st; i++) pts.push(`${(i / st) * w},${random(`${seed}t${i}`) * 10}`);
  for (let i = 0; i <= st; i++) pts.push(`${w - random(`${seed}r${i}`) * 8},${(i / st) * h}`);
  for (let i = st; i >= 0; i--) pts.push(`${(i / st) * w},${h - random(`${seed}b${i}`) * 10}`);
  for (let i = st; i >= 0; i--) pts.push(`${random(`${seed}l${i}`) * 8},${(i / st) * h}`);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        rotate: `${rot + (1 - s) * 8}deg`,
        translate: `0px ${(1 - s) * 140}px`,
        opacity: Math.min(1, s * 2.5) * o,
        filter: "drop-shadow(8px 10px 0 rgba(22,22,22,0.85))",
      }}
    >
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <polygon points={pts.join(" ")} fill={bg} />
      </svg>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
};

// ---------------------------------------------------------------- FX 30 Carimbo
export const Stamp: React.FC<{ at: number; children: React.ReactNode; color?: string; rot?: number; style?: React.CSSProperties }> = ({
  at,
  children,
  color = C.aco,
  rot = -8,
  style,
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + 7], [0, 1], EASE_IN);
  if (f < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        scale: String(interpolate(p, [0, 1], [2.6, 1])),
        opacity: interpolate(p, [0, 0.4, 1], [0, 1, 1]),
        rotate: `${rot}deg`,
        border: `8px solid ${color}`,
        color,
        borderRadius: 12,
        padding: "10px 34px",
        fontFamily: F.head,
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: 4,
        mixBlendMode: "multiply",
        maskImage: "radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,0.55) 100%)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------- FX 31 Barras que crescem
export const Bars: React.FC<{
  data: { label: string; v: number; color?: string }[];
  at: number;
  x: number;
  y: number;
  w: number;
  h: number;
  max: number;
  stagger?: number;
  highlightLast?: boolean;
}> = ({ data, at, x, y, w, h, max, stagger = 5 }) => {
  const f = useCurrentFrame();
  const bw = w / data.length;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      {data.map((d, i) => {
        const p = ip(f, [at + i * stagger, at + i * stagger + 20], [0, 1]);
        const bh = (d.v / max) * h * p;
        return (
          <div key={i} style={{ position: "absolute", left: i * bw + bw * 0.15, width: bw * 0.7, bottom: 0, height: bh, background: d.color ?? C.tinta2, border: `3px solid ${C.tinta}` }}>
            <div style={{ position: "absolute", top: -46, width: "100%", textAlign: "center", fontFamily: F.mono, fontWeight: 700, fontSize: 24, opacity: p }}>{fmt(d.v * p)}</div>
            <div style={{ position: "absolute", bottom: -44, width: "100%", textAlign: "center", fontFamily: F.mono, fontSize: 24, color: C.tinta2 }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- FX 32 Grade de pictogramas
export const DotGrid: React.FC<{
  n: number;
  cols: number;
  at: number;
  dur?: number;
  x: number;
  y: number;
  gap: number;
  r: number;
  color?: string;
  shape?: "dot" | "house";
}> = ({ n, cols, at, dur = 30, x, y, gap, r, color = C.tinta, shape = "dot" }) => {
  const f = useCurrentFrame();
  const shown = Math.floor(ip(f, [at, at + dur], [0, n], Easing.bezier(0.3, 0.1, 0.3, 1)));
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {new Array(n).fill(0).map((_, i) => {
        if (i >= shown) return null;
        const cx = x + (i % cols) * gap;
        const cy = y + Math.floor(i / cols) * gap;
        const age = Math.min(1, (shown - i) / 6);
        if (shape === "house") {
          const s = r * (0.6 + 0.4 * age);
          return (
            <path
              key={i}
              d={`M${cx - s},${cy + s} L${cx - s},${cy - s * 0.1} L${cx},${cy - s} L${cx + s},${cy - s * 0.1} L${cx + s},${cy + s} Z`}
              fill={color}
            />
          );
        }
        return <circle key={i} cx={cx} cy={cy} r={r * (0.5 + 0.5 * age)} fill={color} />;
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- FX 33 Corrida de votos
export const VoteBar: React.FC<{ label: string; v: number; total: number; at: number; y: number; color: string; dur?: number }> = ({
  label,
  v,
  total,
  at,
  y,
  color,
  dur = 40,
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], Easing.bezier(0.2, 0.7, 0.2, 1));
  const W = 1180;
  return (
    <div style={{ position: "absolute", left: 370, top: y, width: W + 400 }}>
      <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 54, color: C.tinta, marginBottom: 10 }}>{label}</div>
      <div style={{ position: "relative", width: W, height: 86, border: `4px solid ${C.tinta}`, background: C.papelClaro }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(v / total) * 100 * p}%`, background: color }} />
        <div
          style={{
            position: "absolute",
            left: `calc(${(v / total) * 100 * p}% + 20px)`,
            top: 6,
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 52,
            color: C.tinta,
            whiteSpace: "nowrap",
          }}
        >
          {fmt(v * p)} <span style={{ fontSize: 32, color: C.tinta2 }}>({fmt((v / total) * 100 * p, 1)}%)</span>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- FX 34 Odômetro de anos
export const YearTicker: React.FC<{ from: number; to: number; at: number; dur?: number; style?: React.CSSProperties }> = ({
  from,
  to,
  at,
  dur = 30,
  style,
}) => {
  const f = useCurrentFrame();
  const v = ip(f, [at, at + dur], [from, to], EASE_IO);
  const digits = String(Math.round(v)).split("");
  const frac = v - Math.floor(v);
  return (
    <span style={{ display: "inline-flex", fontVariantNumeric: "tabular-nums", ...style }}>
      {digits.map((d, i) => {
        const last = i === digits.length - 1;
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", height: "1.05em", lineHeight: "1.05em" }}>
            <span style={{ display: "block", translate: last && v < to ? `0 ${-frac * 100}%` : "0 0" }}>
              {d}
              {last ? <span style={{ display: "block" }}>{(Number(d) + 1) % 10}</span> : null}
            </span>
          </span>
        );
      })}
    </span>
  );
};

// ---------------------------------------------------------------- FX 35 Cartão que vira (flip 3D)
export const Flip: React.FC<{ at: number; front: React.ReactNode; back: React.ReactNode; style?: React.CSSProperties; dur?: number }> = ({
  at,
  front,
  back,
  style,
  dur = 16,
}) => {
  const f = useCurrentFrame();
  const a = ip(f, [at, at + dur], [0, 180], EASE_IO);
  const showBack = a > 90;
  return (
    <div style={{ position: "absolute", perspective: 1400, ...style }}>
      <div style={{ transform: `rotateX(${showBack ? a - 180 : a}deg)`, transformOrigin: "50% 50%" }}>{showBack ? back : front}</div>
    </div>
  );
};

// ---------------------------------------------------------------- FX 36 Fumaça
export const Smoke: React.FC<{ x: number; y: number; at?: number; n?: number; color?: string; scale?: number; seed?: string }> = ({
  x,
  y,
  at = 0,
  n = 14,
  color = "#9b958a",
  scale = 1,
  seed = "s",
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const life = 90;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const off = (i / n) * life;
        const t = ((f - at + off) % life) / life;
        const wob = Math.sin((f + i * 20) / 14) * 12 * t;
        const r = (14 + t * 56) * scale * (0.8 + random(`${seed}${i}`) * 0.4);
        return (
          <circle
            key={i}
            cx={x + wob + t * 60 * scale}
            cy={y - t * 260 * scale}
            r={r}
            fill={color}
            opacity={(1 - t) * 0.55 * Math.min(1, (f - at) / 15)}
          />
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- FX 37 Faíscas
export const Sparks: React.FC<{ x: number; y: number; at: number; n?: number; spread?: number; len?: number }> = ({ x, y, at, n = 26, spread = 260, len = 34 }) => {
  const f = useCurrentFrame();
  const d = f - at;
  if (d < 0) return null;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const cycle = (d + Math.floor(random(`sp${i}`) * len)) % len;
        const t = cycle / len;
        const ang = -Math.PI / 2 + (random(`a${i}`) - 0.5) * 2.4;
        const v = spread * (0.5 + random(`v${i}`) * 0.6);
        const px = x + Math.cos(ang) * v * t;
        const py = y + Math.sin(ang) * v * t + 180 * t * t;
        const tail = 14;
        return (
          <line
            key={i}
            x1={px}
            y1={py}
            x2={px - Math.cos(ang) * tail}
            y2={py - Math.sin(ang) * tail + 6 * t}
            stroke={i % 3 === 0 ? "#fff3a0" : "#ffb02e"}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={1 - t}
          />
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- FX 38 Folhas à deriva
export const Leaves: React.FC<{ at?: number; n?: number; area?: [number, number, number, number]; color?: string }> = ({
  at = 0,
  n = 22,
  area = [0, 0, 1920, 1080],
  color = C.mata,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const [ax, ay, aw, ah] = area;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const life = 160 + random(`l${i}`) * 80;
        const t = ((f - at + random(`o${i}`) * life) % life) / life;
        const x = ax + random(`x${i}`) * aw + Math.sin(t * 6 + i) * 40;
        const y = ay + t * ah;
        const rot = t * 360 * (random(`r${i}`) > 0.5 ? 1 : -1);
        return (
          <path
            key={i}
            d="M0,-14 C10,-6 10,6 0,14 C-10,6 -10,-6 0,-14 Z"
            transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.9 + random(`s${i}`)})`}
            fill={i % 4 === 0 ? C.mataClara : color}
            opacity={Math.min(1, (f - at) / 20) * (1 - Math.abs(t - 0.5) * 1.4)}
          />
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- FX 39 Ondulações na água
export const Ripples: React.FC<{ x: number; y: number; at: number; r?: number; color?: string; every?: number; sw?: number }> = ({
  x,
  y,
  at,
  r = 40,
  color = C.rio,
  every = 40,
  sw = 1,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const t = ((f - at + (i * every) / 3) % every) / every;
        return <ellipse key={i} cx={x} cy={y} rx={r * t} ry={r * t * 0.45} fill="none" stroke={color} strokeWidth={(2.5 * (1 - t) + 0.5) * sw} opacity={1 - t} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- FX 40 Foco que entra (blur-in)
export const BlurIn: React.FC<{ children: React.ReactNode; at: number; dur?: number; style?: React.CSSProperties }> = ({ children, at, dur = 18, style }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1]);
  return <div style={{ filter: `blur(${(1 - p) * 22}px)`, opacity: p, scale: String(1.08 - 0.08 * p), ...style }}>{children}</div>;
};

// ---------------------------------------------------------------- FX 41 Revelação por máscara
export const MaskReveal: React.FC<{
  children: React.ReactNode;
  at: number;
  dur?: number;
  dir?: "left" | "up" | "down";
  style?: React.CSSProperties;
}> = ({ children, at, dur = 16, dir = "left", style }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], EASE_IO);
  const clip =
    dir === "left" ? `inset(0 ${100 - p * 100}% 0 0)` : dir === "up" ? `inset(${100 - p * 100}% 0 0 0)` : `inset(0 0 ${100 - p * 100}% 0)`;
  return <div style={{ clipPath: clip, ...style }}>{children}</div>;
};

// ---------------------------------------------------------------- FX 42 Setas de compressão
export const SqueezeArrows: React.FC<{ cx: number; cy: number; at: number; r?: number; color?: string; dirs?: number[] }> = ({
  cx,
  cy,
  at,
  r = 330,
  color = C.aco,
  dirs = [0, 90, 180, 270],
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + 18], [0, 1]);
  const pulse = Math.sin((f - at) / 6) * 10 * p;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {dirs.map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const dist = r + 120 * (1 - p) - pulse;
        const x = cx + Math.cos(a) * dist;
        const y = cy + Math.sin(a) * dist;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${deg + 180})`} opacity={p}>
            <path d="M-70,-16 L10,-16 L10,-36 L56,0 L10,36 L10,16 L-70,16 Z" fill={color} stroke={C.tinta} strokeWidth={4} />
          </g>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- FX 43 Hachura
export const HatchDefs: React.FC<{ id: string; color?: string; bg?: string; size?: number; width?: number }> = ({
  id,
  color = C.mata,
  bg = "transparent",
  size = 14,
  width = 4,
}) => (
  <defs>
    <pattern id={id} patternUnits="userSpaceOnUse" width={size} height={size} patternTransform="rotate(45)">
      <rect width={size} height={size} fill={bg} />
      <line x1={0} y1={0} x2={0} y2={size} stroke={color} strokeWidth={width} />
    </pattern>
  </defs>
);

// ---------------------------------------------------------------- FX 45 Letterbox cinematográfico
export const Letterbox: React.FC<{ at: number; out?: number; size?: number }> = ({ at, out, size = 110 }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + 20], [0, 1], EASE_IO) * (out !== undefined ? ip(f, [out, out + 20], [1, 0], EASE_IO) : 1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: size * p, background: C.tinta }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: size * p, background: C.tinta }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- tipografia utilitária
export const Kicker: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.aco, style }) => (
  <div
    style={{
      fontFamily: F.mono,
      fontWeight: 700,
      fontSize: 30,
      letterSpacing: 6,
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Fade: React.FC<{ children: React.ReactNode; at: number; out?: number; dur?: number; style?: React.CSSProperties; y?: number }> = ({
  children,
  at,
  out,
  dur = 12,
  style,
  y = 18,
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1]) * (out !== undefined ? ip(f, [out, out + dur], [1, 0], EASE_IN) : 1);
  return <div style={{ position: "absolute", opacity: p, translate: `0px ${(1 - Math.min(1, ip(f, [at, at + dur], [0, 1]))) * y}px`, ...style }}>{children}</div>;
};
