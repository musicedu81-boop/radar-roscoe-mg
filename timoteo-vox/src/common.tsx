import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import geoJson from "./data/geo.json";
import { Cam, camTransform } from "./fx";
import { C, F } from "./theme";

type Geo = {
  K: number;
  COS: number;
  LAT0: number;
  states: { name: string; d: string }[];
  mgMun: { name: string; d: string }[];
  mgOutline: string;
  region: { name: string; d: string }[];
  centroids: Record<string, [number, number]>;
  rioPiracicaba: string;
  rioDoce: string;
  timoteo: string;
  parque: string;
  parqueTimoteo: string;
  timoteoUrbano: string;
  timoteoBox: [number, number, number, number];
  mgBox: [number, number, number, number];
  points: Record<string, [number, number]>;
  lagoas: [number, number, number][];
  predios: [number, number][];
  parqueCentro: [number, number];
  parqueBox: [number, number, number, number];
};
export const GEO = geoJson as unknown as Geo;

/** Mesma projeção do scripts/geo.py */
export const P = (lon: number, lat: number): [number, number] => [
  (lon + 54) * GEO.K * GEO.COS,
  -(lat - GEO.LAT0) * GEO.K,
];

export const toScreen = (cam: Cam, p: [number, number]): [number, number] => [
  960 + (p[0] - cam.x) * cam.z,
  540 + (p[1] - cam.y) * cam.z,
];

export const regionD = (name: string) => GEO.region.find((r) => r.name === name)?.d ?? "";
export const stateD = (name: string) => GEO.states.find((r) => r.name === name)?.d ?? "";

export const MapLayer: React.FC<{ cam: Cam; children: React.ReactNode; style?: React.CSSProperties }> = ({ cam, children, style }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
    <g transform={camTransform(cam)}>{children}</g>
  </svg>
);

export type SfxName =
  | "whoosh"
  | "whoosh-short"
  | "whoosh-cinematic"
  | "pop"
  | "click-soft"
  | "impact-bass-1"
  | "impact-bass-2"
  | "riser"
  | "typing"
  | "ping"
  | "sparkle"
  | "chime";

/** Efeito sonoro posicionado num frame local da cena (biblioteca do HyperFrames media-use). */
export const Sfx: React.FC<{ at: number; name: SfxName; vol?: number; dur?: number }> = ({ at, name, vol = 0.5, dur = 90 }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={dur} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.mp3`)} volume={vol} />
  </Sequence>
);

export const Title: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 96,
  color = C.tinta,
  style,
}) => (
  <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: size, color, lineHeight: 1.0, letterSpacing: -1, ...style }}>{children}</div>
);

export const Label: React.FC<{ children: React.ReactNode; x: number; y: number; size?: number; color?: string; bg?: string; opacity?: number; style?: React.CSSProperties }> = ({
  children,
  x,
  y,
  size = 30,
  color = C.tinta,
  bg,
  opacity = 1,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      translate: "-50% -50%",
      fontFamily: F.head,
      fontWeight: 800,
      fontSize: size,
      color,
      background: bg,
      padding: bg ? "2px 12px" : 0,
      whiteSpace: "nowrap",
      opacity,
      letterSpacing: 0.5,
      textShadow: bg ? undefined : `0 0 6px ${C.papel}, 0 0 12px ${C.papel}`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Fill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={style}>{children}</AbsoluteFill>
);

export const SOURCE: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      right: 56,
      top: 40,
      fontFamily: F.mono,
      fontSize: 20,
      color: C.tinta2,
      opacity: 0.75 * opacity,
      letterSpacing: 1,
    }}
  >
    FONTE: {children}
  </div>
);
