import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, F } from "../theme";
import { Halftone, ip } from "../fx";

const FONTES = [
  "Wikipédia (pt): “Timóteo” e “Parque Estadual do Rio Doce”",
  "IBGE: Censos 1970–2022 · PIB municipal 2023 · malhas municipais",
  "PNUD: IDH-M 2010",
  "Aperam South America / Diário do Aço: história da Acesita",
  "Instituto Semeia · EKOS Brasil: dados do PERD",
];

export const Creditos: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.tinta, padding: "120px 160px" }}>
      <Halftone color={C.papelClaro} opacity={0.05} />
      <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 76, color: C.papelClaro, opacity: ip(f, [0, 12], [0, 1]) }}>
        TIMÓTEO <span style={{ color: C.marca }}>· uma cidade, dois nomes</span>
      </div>
      <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 28, letterSpacing: 6, color: C.aco, marginTop: 56, opacity: ip(f, [8, 20], [0, 1]) }}>FONTES</div>
      {FONTES.map((t, i) => (
        <div
          key={i}
          style={{
            fontFamily: F.serif,
            fontSize: 38,
            color: C.papelClaro,
            marginTop: 18,
            opacity: ip(f, [12 + i * 5, 24 + i * 5], [0, 1]),
            translate: `${(1 - ip(f, [12 + i * 5, 24 + i * 5], [0, 1])) * 30}px 0`,
          }}
        >
          {t}
        </div>
      ))}
      <div style={{ position: "absolute", left: 160, bottom: 110, fontFamily: F.mono, fontSize: 20, color: C.cinzaClaro, opacity: ip(f, [40, 55], [0, 0.9]), lineHeight: 1.6 }}>
        Animação: Remotion · Locução: HyperFrames TTS (Kokoro, voz pt-BR) · Efeitos sonoros: biblioteca HyperFrames (Pixabay)
        <br />
        Mapas: malha municipal IBGE (geodata-br) · Parque e lagoas em representação aproximada · Trilha original gerada por código
      </div>
    </AbsoluteFill>
  );
};
