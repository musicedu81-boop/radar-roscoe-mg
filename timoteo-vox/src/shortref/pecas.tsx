/**
 * Peças da Versão A (fiel às referências):
 * layout em 3 faixas, polaroide com fita crepe, letra de pincel atômico,
 * trilha pontilhada, linha do tempo amarela, mapa com recortes em pé.
 */
import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, EASE_IO, ip, sp } from "../fx";
import { GEO } from "../common";
import terreno from "../data/terreno.json";
import { K, FS, rasgado, Seta, useJitter } from "../short/kit";

export const JAN = { top: 520, h: 810, w: 1080 };
export const MOSTARDA = "#D9AE2C";
export const FM = "'Permanent Marker', 'Caveat', cursive";
export const FC = "'Courier Prime', 'Courier New', monospace";

// ------------------------------------------------------------ faixa do topo: selo
export const FaixaTopo: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, 2, { damping: 12, stiffness: 120 });
  const j = useJitter("topo", 1.2, 0.5, 4);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: JAN.top + 40,
        clipPath: rasgado("topo", { bottom: true }, 2.2, 0),
        filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.55))",
      }}
    >
      <Img src={staticFile("tex/amassado.jpg")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover" }} />
      <div
        style={{
          position: "absolute",
          left: 540 - 235,
          top: 38,
          width: 470,
          height: 470,
          borderRadius: "50%",
          background: K.lima,
          scale: String(s),
          rotate: `${-4 + j.r}deg`,
          translate: `${j.x}px ${j.y}px`,
          boxShadow: "0 16px 24px rgba(0,0,0,0.35)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img src={staticFile("tex/folha.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "multiply", opacity: 0.85 }} />
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{ fontFamily: FS.serif, fontWeight: 900, fontSize: 128, color: K.tinta, letterSpacing: -3, lineHeight: 0.9 }}>Timóteo</div>
          <div style={{ fontFamily: FC, fontWeight: 700, fontSize: 30, color: K.tinta, letterSpacing: 6, marginTop: 10 }}>VALE DO AÇO</div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------ pincelada limão (seca)
export const Pincelada: React.FC<{ x: number; y: number; w: number; h: number; at: number; cor?: string; seed?: string }> = ({
  x,
  y,
  w,
  h,
  at,
  cor = K.lima,
  seed = "pin",
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + 10], [0, 1], EASE_IO);
  const pts: string[] = [];
  const n = 30;
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * w},${random(`${seed}a${i}`) * h * 0.18}`);
  pts.push(`${w + random(`${seed}r`) * 30},${h * 0.5}`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * w},${h - random(`${seed}b${i}`) * h * 0.2}`);
  pts.push(`${-random(`${seed}l`) * 30},${h * 0.45}`);
  const riscos = new Array(7).fill(0).map((_, i) => {
    const yy = h * (0.2 + random(`${seed}y${i}`) * 0.6);
    const x0 = random(`${seed}x${i}`) * w * 0.7;
    return <line key={i} x1={x0} y1={yy} x2={x0 + w * (0.1 + random(`${seed}w${i}`) * 0.3)} y2={yy + 2} stroke="rgba(242,239,232,0.45)" strokeWidth={2 + random(`${seed}s${i}`) * 3} />;
  });
  return (
    <svg width={w + 40} height={h} style={{ position: "absolute", left: x - 20, top: y, overflow: "visible", clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
      <g transform="translate(20 0)">
        <polygon points={pts.join(" ")} fill={cor} />
        {riscos}
      </g>
    </svg>
  );
};

// ------------------------------------------------------------ faixa de baixo: título fixo + setas
export const FaixaBase: React.FC = () => {
  const top = JAN.top + JAN.h - 40;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: 1080,
        height: 1920 - top,
        clipPath: rasgado("base", { top: true }, 2.2, 0),
        filter: "drop-shadow(0 -12px 14px rgba(0,0,0,0.55))",
      }}
    >
      <Img src={staticFile("tex/amassado.jpg")} style={{ position: "absolute", left: 0, top: -top, width: 1080, height: 1920 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: FC, fontSize: 74, color: K.tinta, letterSpacing: 2 }}>acesita ou</div>
      <Pincelada x={150} y={155} w={780} h={130} at={6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 158, textAlign: "center", fontFamily: FC, fontWeight: 700, fontSize: 118, color: K.tinta, letterSpacing: 4 }}>
        TIMÓTEO?
      </div>
      <svg width={1080} height={600} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} />
      <div style={{ position: "absolute", left: 0, top: -top, width: 1080, height: 1920 }}>
        <Seta de={[300, top + 300]} ate={[250, top + 450]} curva={40} at={12} cor={K.tinta} largura={22} seed="b1" />
        <Seta de={[540, top + 305]} ate={[540, top + 470]} curva={-20} at={16} cor={K.tinta} largura={22} seed="b2" />
        <Seta de={[780, top + 300]} ate={[830, top + 450]} curva={-40} at={20} cor={K.tinta} largura={22} seed="b3" />
      </div>
    </div>
  );
};

// ------------------------------------------------------------ fita crepe
export const Crepe: React.FC<{ x: number; y: number; w?: number; rot?: number; seed?: string }> = ({ x, y, w = 150, rot = -30, seed = "cr" }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - 22,
      width: w,
      height: 44,
      rotate: `${rot}deg`,
      background: "rgba(232,226,208,0.86)",
      clipPath: rasgado(seed, { left: true, right: true }, 9, 0),
      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
    }}
  />
);

// ------------------------------------------------------------ polaroide
export const Polaroide: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  at: number;
  rot?: number;
  texto?: string;
  textoAt?: number;
  pb?: number;
  pos?: string;
  seed?: string;
  de?: "cima" | "dir" | "esq" | "baixo";
  out?: number;
  fitas?: boolean;
  textoSize?: number;
}> = ({ src, x, y, w, h, at, rot = 4, texto, textoAt, pb = 0.9, pos = "50% 50%", seed = "po", de = "cima", out, fitas = true, textoSize = 54 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, at, { damping: 14, stiffness: 130 });
  const j = useJitter(seed, 1.8, 0.4);
  const o = out !== undefined ? ip(f, [out, out + 7], [1, 0]) : 1;
  if (f < at - 1) return null;
  const off = 1 - s;
  const dx = de === "dir" ? 1100 * off : de === "esq" ? -1100 * off : 0;
  const dy = de === "cima" ? -1000 * off : de === "baixo" ? 1000 * off : 0;
  const pad = w * 0.055;
  const base = h * 0.32;
  const ta = textoAt ?? at + 10;
  const nChars = texto ? Math.floor(ip(f, [ta, ta + texto.length * 2.2], [0, texto.length], (t) => t)) : 0;
  const z = interpolate(f - at, [0, 150], [1.05, 1.15], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w + pad * 2,
        height: h + pad + base,
        translate: `${dx + j.x}px ${dy + j.y}px`,
        rotate: `${rot + j.r + off * 18}deg`,
        opacity: o,
        filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.5))",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "#F4F2EC", borderRadius: 4 }} />
      <div style={{ position: "absolute", left: pad, top: pad, width: w, height: h, overflow: "hidden", background: "#222" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, scale: String(z), filter: `grayscale(${pb}) contrast(1.15)` }} />
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 30px rgba(0,0,0,0.45)" }} />
      </div>
      {texto ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: pad + h + base * 0.12, textAlign: "center", fontFamily: FM, fontSize: textoSize, color: "#1d1d1d", rotate: "-2deg" }}>
          {texto.slice(0, nChars)}
        </div>
      ) : null}
      {fitas ? (
        <>
          <Crepe x={pad * 0.4} y={pad * 0.6} rot={-38} seed={seed + "f1"} />
          <Crepe x={w + pad * 1.6} y={h + base * 0.9} rot={-36} seed={seed + "f2"} />
        </>
      ) : null}
    </div>
  );
};

// ------------------------------------------------------------ texto a pincel atômico (escrito)
export const Marcador: React.FC<{ texto: string; x: number; y: number; at: number; size?: number; cor?: string; rot?: number; cps?: number; style?: React.CSSProperties; out?: number }> = ({
  texto,
  x,
  y,
  at,
  size = 60,
  cor = "#151515",
  rot = -4,
  cps = 16,
  style,
  out,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const n = Math.floor(((f - at) / fps) * cps);
  const o = out !== undefined ? ip(f, [out, out + 7], [1, 0]) : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, fontFamily: FM, fontSize: size, color: cor, whiteSpace: "nowrap", opacity: o, ...style }}>
      {texto.slice(0, n)}
    </div>
  );
};

// ------------------------------------------------------------ trilha pontilhada
export const Pontilhado: React.FC<{ d: string; at: number; dur?: number; cor?: string; largura?: number; w?: number; h?: number; out?: number }> = ({
  d,
  at,
  dur = 18,
  cor = "#1a1a1a",
  largura = 6,
  w = 1080,
  h = 810,
  out,
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], EASE_IO);
  const o = out !== undefined ? ip(f, [out, out + 7], [1, 0]) : 1;
  if (f < at) return null;
  const id = `pt${Math.abs(d.length * 31 + at)}`;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: o, pointerEvents: "none" }}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-200} y={-200} width={w + 400} height={h + 400}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={largura * 4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        </mask>
      </defs>
      <path d={d} fill="none" stroke={cor} strokeWidth={largura} strokeLinecap="round" strokeDasharray={`0.1 ${largura * 2.6}`} mask={`url(#${id})`} />
    </svg>
  );
};

// ------------------------------------------------------------ rótulo serifado (estilo "Section 2")
export const RotuloSerif: React.FC<{ texto: string; sub?: string; x: number; y: number; at: number; cor?: string; size?: number; alinhar?: "left" | "center" }> = ({
  texto,
  sub,
  x,
  y,
  at,
  cor = "#F2EFE8",
  size = 54,
  alinhar = "left",
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + 8], [0, 1]);
  const u = ip(f, [at + 4, at + 14], [0, 1], EASE_IO);
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: p, translate: `${alinhar === "center" ? "-50%" : "0"} ${(1 - p) * 14}px`, textAlign: alinhar }}>
      <div style={{ fontFamily: FS.serif, fontWeight: 700, fontSize: size, color: cor, lineHeight: 1.05, textShadow: "0 3px 10px rgba(0,0,0,0.6)" }}>{texto}</div>
      <div style={{ height: 3, background: cor, width: `${u * 100}%`, marginTop: 6, opacity: 0.9 }} />
      {sub ? <div style={{ fontFamily: FC, fontSize: size * 0.48, color: cor, marginTop: 8, opacity: 0.85 }}>{sub}</div> : null}
    </div>
  );
};

// ------------------------------------------------------------ elipse vermelha fina feita à mão
export const ElipseMao: React.FC<{ x: number; y: number; w: number; h: number; at: number; cor?: string; largura?: number; seed?: string; dur?: number }> = ({
  x,
  y,
  w,
  h,
  at,
  cor = "#D8231B",
  largura = 6,
  seed = "el",
  dur = 14,
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + dur], [0, 1], EASE_IO);
  if (f < at) return null;
  const pts: string[] = [];
  const N = 64;
  for (let i = 0; i <= N + 10; i++) {
    const a = (i / N) * Math.PI * 2 - 2.6;
    const r = 1 + (random(`${seed}${i}`) - 0.5) * 0.03 + i * 0.0022;
    pts.push(`${(x + Math.cos(a) * (w / 2) * r).toFixed(1)},${(y + Math.sin(a) * (h / 2) * r * (1 + 0.04 * Math.sin(a * 3))).toFixed(1)}`);
  }
  return (
    <svg width={1080} height={810} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={cor} strokeWidth={largura} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
    </svg>
  );
};

// ------------------------------------------------------------ foto "integrada" ao fundo escuro (estilo ref. 1)
export const FotoFundo: React.FC<{ src: string; at?: number; pos?: string; zoom?: [number, number]; dur?: number; fade?: string; pb?: number; brilho?: number }> = ({
  src,
  at = 0,
  pos = "50% 50%",
  zoom = [1.05, 1.15],
  dur = 200,
  fade = "linear-gradient(180deg, #000 55%, transparent 100%)",
  pb = 0,
  brilho = 0.92,
}) => {
  const f = useCurrentFrame();
  const z = interpolate(f - at, [0, dur], zoom, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = ip(f, [at, at + 8], [0, 1]);
  return (
    <AbsoluteFill style={{ opacity: o, maskImage: fade, WebkitMaskImage: fade }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, scale: String(z), filter: `grayscale(${pb}) contrast(1.15) brightness(${brilho})` }} />
    </AbsoluteFill>
  );
};

/** Entrada do conteúdo da janela: chicote lateral com desfoque. */
export const Chicote: React.FC<{ children: React.ReactNode; dir?: 1 | -1 }> = ({ children, dir = 1 }) => {
  const f = useCurrentFrame();
  const p = ip(f, [0, 8], [0, 1], EASE);
  return (
    <AbsoluteFill style={{ translate: `${(1 - p) * 1080 * dir}px 0`, filter: p < 1 ? `blur(${(1 - p) * 26}px)` : undefined }}>{children}</AbsoluteFill>
  );
};

// ------------------------------------------------------------ mapa estilo satélite com recortes em pé
export const MapaSat: React.FC<{
  cx: number;
  cy: number;
  escala: number;
  tilt: number;
  zoom?: [number, number];
  dur: number;
  w?: number;
  h?: number;
  parqueAt?: number;
  contornoCor?: string;
  rioAt?: number;
  children?: (k: number, toPx: (x: number, y: number) => [number, number]) => React.ReactNode;
}> = ({ cx, cy, escala, tilt, zoom = [1, 1.1], dur, w = 1080, h = 810, parqueAt, contornoCor = K.lima, rioAt, children }) => {
  const f = useCurrentFrame();
  const S = 200;
  const W = terreno.w * escala;
  const H = terreno.h * escala;
  const k = S * escala;
  const toPx = (x: number, y: number): [number, number] => [(x - terreno.x0) * k, (y - terreno.y0) * k];
  const [px, py] = toPx(cx, cy);
  const z = interpolate(f, [0, dur], zoom, { extrapolateRight: "clamp" });
  const rio = rioAt !== undefined ? ip(f, [rioAt, rioAt + 20], [0, 1], EASE_IO) : 0;
  return (
    <AbsoluteFill style={{ perspective: 1300, overflow: "hidden", background: "#3a4a33" }}>
      <div
        style={{
          position: "absolute",
          left: w / 2 - px,
          top: h * 0.55 - py,
          width: W,
          height: H,
          transformOrigin: `${px}px ${py}px`,
          transform: `rotateX(${tilt}deg) scale(${z})`,
          transformStyle: "preserve-3d",
        }}
      >
        <Img src={staticFile("tex/terreno.jpg")} style={{ position: "absolute", inset: 0, width: W, height: H, filter: "saturate(0.75) contrast(1.05)" }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <pattern id="hachMostarda" patternUnits="userSpaceOnUse" width={0.06} height={0.06} patternTransform="rotate(45)">
              <line x1={0} y1={0} x2={0} y2={0.06} stroke={MOSTARDA} strokeWidth={0.022} />
            </pattern>
          </defs>
          <g transform={`scale(${k}) translate(${-terreno.x0} ${-terreno.y0})`}>
            {parqueAt !== undefined ? (
              <path d={GEO.parqueTimoteo} fill="url(#hachMostarda)" opacity={ip(f, [parqueAt, parqueAt + 12], [0, 1])} stroke={MOSTARDA} strokeWidth={5 / k} />
            ) : null}
            {rioAt !== undefined ? (
              <path d={GEO.rioPiracicaba} fill="none" stroke="#7FD3F7" strokeWidth={14 / k} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - rio} />
            ) : null}
            <path d={GEO.timoteo} fill="none" stroke={contornoCor} strokeWidth={8 / k} strokeLinejoin="round" />
          </g>
        </svg>
        {children ? children(k, toPx) : null}
        <Img src={staticFile("tex/nuvens.png")} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: 0.75, translate: `${f * 0.8}px ${f * 0.25}px`, transform: "translateZ(40px)" }} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,20,20,0.85) 0%, rgba(20,20,20,0) 22%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Recorte em pé sobre o mapa inclinado (billboard): a base fica em (x, y). */
export const EmPe: React.FC<{ src: string; x: number; y: number; w: number; tilt: number; at: number; de?: "baixo" | "dir" }> = ({ src, x, y, w, tilt, at, de = "baixo" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(f, fps, at, { damping: 12, stiffness: 130 });
  if (f < at - 1) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2 + (de === "dir" ? (1 - s) * 900 : 0), top: y, width: w, height: 0, transformStyle: "preserve-3d" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: w,
          transformOrigin: "50% 100%",
          transform: `rotateX(${-tilt}deg) scale(${de === "baixo" ? s : 1})`,
        }}
      >
        <Img src={staticFile(src)} style={{ width: "100%", display: "block", filter: "drop-shadow(0 10px 8px rgba(0,0,0,0.6)) contrast(1.1)" }} />
      </div>
    </div>
  );
};
