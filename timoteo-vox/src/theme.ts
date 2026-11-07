import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import fontes from "./data/fonts.json";

// Fontes embutidas em public/fonts (baixadas por scripts/fontes.py) — render 100% offline.
for (const f of fontes as { family: string; weight: string; file: string; unicodeRange: string }[]) {
  loadFont({
    family: f.family,
    url: staticFile(f.file),
    weight: f.weight,
    format: "woff2",
    unicodeRange: f.unicodeRange,
  });
}

export const F = {
  head: "'Archivo', 'Helvetica Neue', Arial, sans-serif",
  serif: "'Source Serif 4', Georgia, serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
  hand: "'Caveat', 'Comic Sans MS', cursive",
};

export const C = {
  papel: "#EFE9DC",
  papelClaro: "#FBF8F1",
  papelEscuro: "#E2DACA",
  tinta: "#161616",
  tinta2: "#3B3A36",
  cinza: "#8A8578",
  cinzaClaro: "#C9C1B0",
  marca: "#FFD23F",
  aco: "#E4572E",
  acoEscuro: "#B23A1B",
  mata: "#2F7D4F",
  mataClara: "#9CC5A1",
  rio: "#2E86AB",
  rioClaro: "#A9D3E4",
  terra: "#C8A26A",
};

export const W = 1920;
export const H = 1080;
export const FPS = 30;
