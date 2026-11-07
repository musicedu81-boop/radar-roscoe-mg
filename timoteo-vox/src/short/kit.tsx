/**
 * Kit visual do Short no estilo Vox "colagem editorial":
 * papel amassado, fotos rasgadas, setas a pincel, adesivo limão, máquina de escrever.
 */
import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, EASE_IN, EASE_IO, ip, sp } from "../fx";

export const SW = 1080;
export const SH = 1920;

export const K = {
  lima: "#D6E22B",
  limaEscuro: "#B7C21A",
  vermelho: "#E3261C",
  tinta: "#111111",
  papel: "#F2EFE8",
  papelSujo: "#E6E1D6",
  cinza: "#8D8A84",
};

export const FS = {
  serif: "'Playfair Display', Georgia, serif",
  maquina: "'Special Elite', 'Courier New', monospace",
  cond: "'Anton', 'Impact', sans-serif",
  mao: "'Caveat', cursive",
  sans: "'Archivo', Arial, sans-serif",
};

/** Movimento "stop-motion" (em 2 e 3 quadros), típico de colagem animada. */
export const useJitter = (seed: string, amp = 2.2, rotAmp = 0.35, every = 3) => {
  const f = useCurrentFrame();
  const q = Math.floor(f / every);
  return {
    x: (random(`${seed}x${q}`) - 0.5) * 2 * amp,
    y: (random(`${seed}y${q}`) - 0.5) * 2 * amp,
    r: (random(`${seed}r${q}`) - 0.5) * 2 * rotAmp,
  };
};

// ------------------------------------------------------------ fundos
export const Amassado: React.FC<{ escuro?: boolean }> = ({ escuro }) => (
  <AbsoluteFill style={{ backgroundColor: escuro ? "#1a1a1a" : "#c9c6c0" }}>
    <Img src={staticFile(escuro ? "tex/amassado-escuro.jpg" : "tex/amassado.jpg")} style={{ width: "100%", height: "100%" }} />
  </AbsoluteFill>
);

/** Manchetes de jornal ao fundo (como na referência escura). */
export const Jornal: React.FC<{ linhas: string[]; opacity?: number; cor?: string }> = ({ linhas, opacity = 0.07, cor = "#ffffff" }) => (
  <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: -200, top: -60, width: 1600, rotate: "-11deg", opacity }}>
      {linhas.map((l, i) => (
        <div
          key={i}
          style={{
            fontFamily: FS.serif,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 132,
            lineHeight: 1.08,
            color: cor,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            letterSpacing: 2,
            marginLeft: (i % 3) * -140,
          }}
        >
          {l}
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ------------------------------------------------------------ bordas rasgadas
const borda = (seed: string, n: number, amp: number, inset: number) => {
  // devolve listas de pontos (em %) para cada lado
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100;
    top.push(`${x.toFixed(2)}% ${(inset + random(`${seed}t${i}`) * amp).toFixed(2)}%`);
  }
  for (let i = n; i >= 0; i--) {
    const x = (i / n) * 100;
    bottom.push(`${x.toFixed(2)}% ${(100 - inset - random(`${seed}b${i}`) * amp).toFixed(2)}%`);
  }
  return { top, bottom };
};

export const rasgado = (seed: string, lados: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean } = { top: true, bottom: true }, amp = 3.2, inset = 0) => {
  const n = 36;
  const b = borda(seed, n, amp, inset);
  const top = lados.top ? b.top : ["0% 0%", "100% 0%"];
  const bottom = lados.bottom ? b.bottom : ["100% 100%", "0% 100%"];
  const right: string[] = [];
  const left: string[] = [];
  if (lados.right) for (let i = 1; i < 18; i++) right.push(`${(100 - random(`${seed}r${i}`) * amp * 0.6).toFixed(2)}% ${((i / 18) * 100).toFixed(2)}%`);
  if (lados.left) for (let i = 17; i > 0; i--) left.push(`${(random(`${seed}l${i}`) * amp * 0.6).toFixed(2)}% ${((i / 18) * 100).toFixed(2)}%`);
  return `polygon(${[...top, ...right, ...bottom, ...left].join(",")})`;
};

// ------------------------------------------------------------ cartão de foto
export const Foto: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  at: number;
  rot?: number;
  de?: "esq" | "dir" | "cima" | "baixo" | "pop";
  pb?: number; // 0..1 preto e branco
  contraste?: number;
  seed?: string;
  lados?: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean };
  pos?: string; // object-position
  zoom?: [number, number]; // ken burns
  dur?: number; // duração de referência para o ken burns
  out?: number;
  sombra?: boolean;
  borda?: boolean;
  children?: React.ReactNode;
}> = ({
  src,
  x,
  y,
  w,
  h,
  at,
  rot = 0,
  de = "baixo",
  pb = 0.85,
  contraste = 1.25,
  seed = "f",
  lados = { top: true, bottom: true },
  pos = "50% 50%",
  zoom = [1.04, 1.14],
  dur = 150,
  out,
  sombra = true,
  borda: comBorda = true,
  children,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, at, { damping: 16, stiffness: 120 });
  const j = useJitter(seed);
  const o = out !== undefined ? ip(f, [out, out + 8], [1, 0], EASE_IN) : 1;
  if (f < at - 1) return null;
  const off = 1 - s;
  const dx = de === "esq" ? -1300 * off : de === "dir" ? 1300 * off : 0;
  const dy = de === "cima" ? -1300 * off : de === "baixo" ? 1500 * off : 0;
  const sc = de === "pop" ? 0.6 + 0.4 * s : 1;
  const z = interpolate(f - at, [0, dur], zoom, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clipFora = rasgado(seed + "o", lados, 3.4, 0);
  const clipDentro = rasgado(seed + "i", lados, 3.0, 1.1);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        translate: `${dx + j.x}px ${dy + j.y}px`,
        rotate: `${rot + j.r}deg`,
        scale: String(sc),
        opacity: o,
        filter: sombra ? "drop-shadow(0 18px 22px rgba(0,0,0,0.45))" : undefined,
      }}
    >
      {comBorda ? <div style={{ position: "absolute", inset: 0, background: K.papel, clipPath: clipFora }} /> : null}
      <div style={{ position: "absolute", inset: 0, clipPath: comBorda ? clipDentro : clipFora, overflow: "hidden" }}>
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: pos,
            scale: String(z),
            filter: `grayscale(${pb}) contrast(${contraste}) brightness(1.02)`,
          }}
        />
        {/* retícula de impressão */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(0,0,0,0.22) 30%, transparent 32%)",
            backgroundSize: "5px 5px",
            mixBlendMode: "multiply",
            opacity: 0.35,
          }}
        />
        {children}
      </div>
    </div>
  );
};

/** Recorte (PNG com transparência) com sombra, entra com mola. */
export const Recorte: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  at: number;
  rot?: number;
  pb?: number;
  seed?: string;
  out?: number;
  de?: "baixo" | "dir" | "esq" | "pop";
}> = ({ src, x, y, w, at, rot = 0, pb = 0.2, seed = "r", out, de = "baixo" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, at, { damping: 13, stiffness: 140 });
  const j = useJitter(seed, 1.6, 0.3);
  const o = out !== undefined ? ip(f, [out, out + 8], [1, 0]) : 1;
  if (f < at - 1) return null;
  const off = 1 - s;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        translate: `${(de === "dir" ? 1200 : de === "esq" ? -1200 : 0) * off + j.x}px ${(de === "baixo" ? 900 : 0) * off + j.y}px`,
        rotate: `${rot + j.r}deg`,
        scale: String(de === "pop" ? 0.5 + 0.5 * s : 1),
        opacity: o,
        filter: "drop-shadow(0 22px 18px rgba(0,0,0,0.5)) drop-shadow(0 0 0 #fff)",
      }}
    >
      <Img src={staticFile(src)} style={{ width: "100%", filter: `grayscale(${pb}) contrast(1.15)` }} />
    </div>
  );
};

// ------------------------------------------------------------ seta a pincel
type Pt = [number, number];
const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
];

export const Seta: React.FC<{
  de: Pt;
  ate: Pt;
  curva?: number; // deslocamento lateral do ponto de controle
  at: number;
  dur?: number;
  cor?: string;
  largura?: number;
  seed?: string;
  out?: number;
}> = ({ de, ate, curva = 120, at, dur = 12, cor = K.vermelho, largura = 26, seed = "s", out }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], EASE_IO);
  const ph = ip(f, [at + dur - 2, at + dur + 5], [0, 1], EASE);
  const o = out !== undefined ? ip(f, [out, out + 8], [1, 0]) : 1;
  if (f < at) return null;
  const mx = (de[0] + ate[0]) / 2;
  const my = (de[1] + ate[1]) / 2;
  const dx = ate[0] - de[0];
  const dy = ate[1] - de[1];
  const L = Math.hypot(dx, dy) || 1;
  const c: Pt = [mx - (dy / L) * curva, my + (dx / L) * curva];
  const N = 40;
  const esq: string[] = [];
  const dir: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 0.97;
    const a = quad(de, c, ate, t);
    const b = quad(de, c, ate, Math.min(1, t + 0.01));
    const tx = b[0] - a[0];
    const ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl;
    const ny = tx / tl;
    const wv = largura * (0.35 + 0.65 * Math.sin(Math.min(1, t * 1.6) * Math.PI * 0.5)) * (0.85 + random(`${seed}${i}`) * 0.3) * 0.5;
    esq.push(`${(a[0] + nx * wv).toFixed(1)},${(a[1] + ny * wv).toFixed(1)}`);
    dir.unshift(`${(a[0] - nx * wv).toFixed(1)},${(a[1] - ny * wv).toFixed(1)}`);
  }
  const centro = new Array(N + 1)
    .fill(0)
    .map((_, i) => quad(de, c, ate, (i / N) * 0.97))
    .map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`)
    .join(" ");
  // ponta
  const e = quad(de, c, ate, 0.97);
  const ang = Math.atan2(ate[1] - e[1], ate[0] - e[0]);
  const hl = largura * 2.6;
  const ponta = (sgn: number) => {
    const a2 = ang + Math.PI + sgn * 0.62;
    const x2 = ate[0] + Math.cos(a2) * hl;
    const y2 = ate[1] + Math.sin(a2) * hl;
    const nx = -Math.sin(a2) * largura * 0.32;
    const ny = Math.cos(a2) * largura * 0.32;
    return `M${ate[0] + nx * 0.3},${ate[1] + ny * 0.3} L${x2 + nx},${y2 + ny} L${x2 - nx},${y2 - ny} L${ate[0] - nx * 0.3},${ate[1] - ny * 0.3} Z`;
  };
  const id = `seta-${seed}`;
  return (
    <svg width={SW} height={SH} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: o, pointerEvents: "none" }}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-500} y={-500} width={SW + 1000} height={SH + 1000}>
          <polyline points={centro} fill="none" stroke="#fff" strokeWidth={largura * 2.2} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        </mask>
      </defs>
      <polygon points={[...esq, ...dir].join(" ")} fill={cor} mask={`url(#${id})`} />
      <g opacity={ph} transform={`translate(${ate[0]} ${ate[1]}) scale(${0.6 + 0.4 * ph}) translate(${-ate[0]} ${-ate[1]})`}>
        <path d={ponta(1)} fill={cor} />
        <path d={ponta(-1)} fill={cor} />
      </g>
    </svg>
  );
};

// ------------------------------------------------------------ círculo a pincel
export const CirculoPincel: React.FC<{ x: number; y: number; w: number; h: number; at: number; cor?: string; largura?: number; seed?: string; dur?: number; out?: number }> = ({
  x,
  y,
  w,
  h,
  at,
  cor = K.lima,
  largura = 16,
  seed = "c",
  dur = 14,
  out,
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], EASE_IO);
  const o = out !== undefined ? ip(f, [out, out + 8], [1, 0]) : 1;
  if (f < at) return null;
  const pts: string[] = [];
  const N = 60;
  for (let i = 0; i <= N + 8; i++) {
    const a = (i / N) * Math.PI * 2 - 2.2;
    const r = 1 + (random(`${seed}${i}`) - 0.5) * 0.05 + i * 0.0016;
    pts.push(`${(x + Math.cos(a) * (w / 2) * r).toFixed(1)},${(y + Math.sin(a) * (h / 2) * r).toFixed(1)}`);
  }
  return (
    <svg width={SW} height={SH} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: o * 0.95, pointerEvents: "none" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={cor} strokeWidth={largura} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </svg>
  );
};

// ------------------------------------------------------------ marca-texto limão
export const Marca: React.FC<{ children: React.ReactNode; at: number; cor?: string; dur?: number }> = ({ children, at, cor = K.lima, dur = 9 }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], EASE_IO);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          left: "-0.08em",
          right: "-0.08em",
          top: "0.08em",
          bottom: "0.0em",
          background: cor,
          transformOrigin: "left center",
          scale: `${p} 1`,
          rotate: "-1.5deg",
          borderRadius: "0.1em 0.3em 0.15em 0.35em",
          clipPath: "polygon(0% 8%, 6% 0%, 30% 6%, 55% 1%, 80% 7%, 100% 2%, 99% 92%, 75% 100%, 50% 94%, 25% 100%, 2% 95%)",
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

// ------------------------------------------------------------ fita de máquina de escrever
export const Fita: React.FC<{
  texto: string;
  x: number;
  y: number;
  at: number;
  rot?: number;
  size?: number;
  cps?: number;
  fundo?: string;
  cor?: string;
  out?: number;
  centro?: boolean;
}> = ({ texto, x, y, at, rot = -2, size = 48, cps = 26, fundo = K.papel, cor = K.tinta, out, centro }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = ip(f, [at, at + 6], [0, 1]);
  const o = out !== undefined ? ip(f, [out, out + 8], [1, 0]) : 1;
  if (f < at) return null;
  const n = Math.max(0, Math.floor(((f - at) / fps) * cps));
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: centro ? "-50% 0" : undefined,
        rotate: `${rot}deg`,
        opacity: s * o,
        background: fundo,
        padding: "10px 26px 8px",
        clipPath: rasgado("fita" + texto, { left: true, right: true, top: false, bottom: false }, 3, 0),
        boxShadow: "0 8px 14px rgba(0,0,0,0.3)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontFamily: FS.maquina, fontSize: size, color: cor, letterSpacing: 1 }}>
        <span>{texto.slice(0, n)}</span>
        <span style={{ opacity: 0 }}>{texto.slice(n)}</span>
      </span>
    </div>
  );
};

// ------------------------------------------------------------ adesivo circular (selo)
export const Selo: React.FC<{ x: number; y: number; d: number; at: number; children: React.ReactNode; cor?: string; rot?: number }> = ({
  x,
  y,
  d,
  at,
  children,
  cor = K.lima,
  rot = -6,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, at, { damping: 11, stiffness: 160 });
  if (f < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - d / 2,
        top: y - d / 2,
        width: d,
        height: d,
        borderRadius: "50%",
        background: cor,
        scale: String(s),
        rotate: `${rot}deg`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 14px 20px rgba(0,0,0,0.35), inset 0 0 40px rgba(0,0,0,0.12)",
      }}
    >
      {children}
    </div>
  );
};

// ------------------------------------------------------------ carimbo vermelho
export const CarimboV: React.FC<{ at: number; texto: string; x: number; y: number; size?: number; rot?: number; cor?: string }> = ({
  at,
  texto,
  x,
  y,
  size = 150,
  rot = -12,
  cor = K.vermelho,
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + 6], [0, 1], EASE_IN);
  if (f < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        scale: String(interpolate(p, [0, 1], [2.4, 1])),
        opacity: interpolate(p, [0, 0.3, 1], [0, 1, 1]),
        rotate: `${rot}deg`,
        border: `12px solid ${cor}`,
        borderRadius: 18,
        padding: "4px 36px",
        fontFamily: FS.cond,
        fontSize: size,
        color: cor,
        letterSpacing: 6,
        maskImage: "radial-gradient(circle at 30% 40%, #000 55%, rgba(0,0,0,0.55) 100%)",
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </div>
  );
};

// ------------------------------------------------------------ transição: rasgo de papel vertical
export const Rasgo: React.FC<{ at: number; len?: number; escuro?: boolean }> = ({ at, len = 14, escuro }) => {
  const f = useCurrentFrame();
  const a = at - len / 2;
  const b = at + len / 2;
  if (f < a - 1 || f > b + 1) return null;
  const y = f < at ? interpolate(ip(f, [a, at], [0, 1], EASE_IN), [0, 1], [SH + 200, 0]) : interpolate(ip(f, [at, b], [0, 1], EASE), [0, 1], [0, -SH - 300]);
  const clip = rasgado("rasgo" + at, { top: true, bottom: true }, 4, 0);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: -40,
          top: y - 120,
          width: SW + 80,
          height: SH + 240,
          clipPath: clip,
          filter: "drop-shadow(0 -10px 20px rgba(0,0,0,0.35))",
        }}
      >
        <Img src={staticFile(escuro ? "tex/amassado-escuro.jpg" : "tex/amassado.jpg")} style={{ width: "100%", height: "100%" }} />
      </div>
    </AbsoluteFill>
  );
};

/** Texto grande serifado (como "Look at this" / "Vox"). */
export const Serif: React.FC<{ children: React.ReactNode; size?: number; cor?: string; italic?: boolean; style?: React.CSSProperties }> = ({
  children,
  size = 140,
  cor = K.tinta,
  italic,
  style,
}) => (
  <div style={{ fontFamily: FS.serif, fontWeight: 900, fontStyle: italic ? "italic" : "normal", fontSize: size, color: cor, lineHeight: 0.95, letterSpacing: -1, ...style }}>{children}</div>
);

export const Entra: React.FC<{ children: React.ReactNode; at: number; out?: number; y?: number; style?: React.CSSProperties; dur?: number }> = ({
  children,
  at,
  out,
  y = 40,
  style,
  dur = 9,
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1]);
  const o = out !== undefined ? ip(f, [out, out + 8], [1, 0], EASE_IN) : 1;
  if (f < at) return null;
  return <div style={{ position: "absolute", opacity: p * o, translate: `0 ${(1 - p) * y}px`, ...style }}>{children}</div>;
};
