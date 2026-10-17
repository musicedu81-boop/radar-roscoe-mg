import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MARGEM } from "../marca";
import { CENAS, inicioLocal } from "../roteiro";
import { Titulo } from "../ui/Elementos";
import { Fundo } from "../ui/Fundo";

// Cena 03 · {CENAS[2].titulo} (provisória)
const INDICE = 2;

export const CenaRitmo: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - inicioLocal(INDICE);
  return (
    <AbsoluteFill>
      <Fundo />
      <AbsoluteFill style={{ padding: MARGEM, justifyContent: "center" }}>
        <Titulo linhas={[`*${CENAS[INDICE].titulo}*`]} inicio={f < 0 ? 999 : frame - f} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
