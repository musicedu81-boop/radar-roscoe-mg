import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx } from "../common";
import { C, F } from "../theme";
import { Chroma, Halftone, Highlight, ip, LightLeak, WordsReveal, Letterbox } from "../fx";

export const Titulo: React.FC = () => {
  const f = useCurrentFrame();
  const s = ip(f, [0, 22], [1.25, 1]);
  return (
    <AbsoluteFill style={{ background: C.tinta }}>
      <Halftone color={C.aco} opacity={0.22} size={18} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", scale: String(s) }}>
        <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: 10, color: C.marca, marginBottom: 18, opacity: ip(f, [6, 16], [0, 1]) }}>
          VALE DO AÇO · MINAS GERAIS
        </div>
        <Chroma at={3} len={14} amp={18} blend="screen" style={{ color: C.papelClaro }}>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 290, letterSpacing: -6, lineHeight: 1 }}>TIMÓTEO</div>
        </Chroma>
        <div style={{ marginTop: 26, fontFamily: F.serif, fontWeight: 600, fontSize: 70, color: C.papelClaro }}>
          <WordsReveal text="Uma cidade," at={14} stagger={4} />
          <Highlight at={34} dur={12} color={C.aco}>
            <WordsReveal text="dois nomes" at={22} stagger={4} />
          </Highlight>
        </div>
      </AbsoluteFill>
      <LightLeak at={0} dur={120} opacity={0.5} />
      <Letterbox at={0} out={100} size={70} />
      <Sfx at={0} name="whoosh-cinematic" vol={0.5} />
      <Sfx at={3} name="impact-bass-2" vol={0.6} />
    </AbsoluteFill>
  );
};
