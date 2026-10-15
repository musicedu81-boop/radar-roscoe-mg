import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Montserrat variável embutida em public/fonts: o render não depende de rede
export const FONT = "Montserrat";

loadFont({
  family: FONT,
  url: staticFile("fonts/montserrat-latin.woff2"),
  weight: "100 900",
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
});
loadFont({
  family: FONT,
  url: staticFile("fonts/montserrat-latin-ext.woff2"),
  weight: "100 900",
  unicodeRange:
    "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
});

export const COLORS = {
  navy: "#0A2A66",
  blue: "#1E5BD8",
  gold: "#FFC93C",
  goldDeep: "#F2A900",
  white: "#FFFFFF",
  ink: "#0B1020",
  chalk: "#F5F1E6",
};

export const WIDTH = 1080;
export const HEIGHT = 1920;
