import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO } from "../marca";
import { GRADE, LARGURA_UTIL, qJanela, T, TEXTO } from "./JanelaTempos";

// Linha dos sete dias (SEG ... DOM, de dados.ts). Na fala "de segunda a sexta" os cinco dias
// úteis acendem em verde-neon, um a cada 4 quadros; em "no fim de semana" sábado e domingo
// acendem em coral. Colchetes com rótulo marcam os dois grupos.
const GAP = (LARGURA_UTIL - 7 * GRADE.larguraDia) / 6;
const xDoDia = (i: number) => GRADE.x + i * (GRADE.larguraDia + GAP);

const Dia: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const { fps } = useVideoConfig();
  const util = i < 5;
  const acende = util ? T.uteis + i * 4 : T.fimDeSemana + (i - 5) * 6;
  const s = spring({
    frame: f - acende,
    fps,
    config: { damping: 14, stiffness: 200, mass: 0.6 },
  });
  const aceso = f >= acende ? s : 0;
  const entra = interpolate(f, [T.dias + i * 2, T.dias + i * 2 + 10], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const cor = util ? COR.neon : COR.coral;
  return (
    <div
      style={{
        position: "absolute",
        left: xDoDia(i),
        top: GRADE.dias,
        width: GRADE.larguraDia,
        height: GRADE.alturaDia,
        boxSizing: "border-box",
        borderRadius: 12,
        border: `2px solid ${aceso > 0.02 ? cor : "rgba(255,255,255,0.32)"}`,
        background: aceso > 0.02 ? cor : "rgba(1,26,54,0.4)",
        boxShadow:
          aceso > 0.02
            ? `0 0 26px ${util ? "rgba(1,237,67,0.42)" : "rgba(224,90,58,0.45)"}`
            : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONTE_TITULO,
        fontSize: 40,
        letterSpacing: "0.04em",
        color: aceso > 0.02 ? (util ? COR.noite : COR.branco) : "rgba(255,255,255,0.62)",
        opacity: entra,
        translate: `0px ${(1 - entra) * 18}px`,
        scale: aceso > 0.02 ? interpolate(aceso, [0, 1], [1.18, 1]) : 1,
      }}
    >
      {TEXTO.siglas[i]}
    </div>
  );
};

// Colchete sob um grupo de dias, com o rótulo que se revela junto
const Colchete: React.FC<{
  de: number;
  ate: number;
  inicio: number;
  cor: string;
  texto: string;
  alinhamento: "center" | "right";
  f: number;
}> = ({ de, ate, inicio, cor, texto, alinhamento, f }) => {
  const esq = xDoDia(de);
  const dir = xDoDia(ate) + GRADE.larguraDia;
  const desenha = interpolate(f, [inicio, inicio + 12], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const top = GRADE.dias + GRADE.alturaDia + 12;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: esq,
          top,
          width: (dir - esq) * desenha,
          height: 12,
          boxSizing: "border-box",
          borderLeft: `3px solid ${cor}`,
          borderRight: desenha > 0.98 ? `3px solid ${cor}` : undefined,
          borderBottom: `3px solid ${cor}`,
          opacity: desenha > 0 ? 1 : 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: alinhamento === "center" ? esq : dir - 420,
          width: alinhamento === "center" ? dir - esq : 420,
          top: top + 18,
          textAlign: alinhamento,
          fontFamily: FONTE_TEXTO,
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: cor,
          opacity: interpolate(f, [inicio + 4, inicio + 12], [0, 1], clamp),
          translate: `0px ${interpolate(f, [inicio + 4, inicio + 16], [-10, 0], { ...clamp, easing: EASE.entrada })}px`,
        }}
      >
        {texto}
      </div>
    </>
  );
};

export const JanelaDias: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - qJanela(0);
  return (
    <>
      {TEXTO.siglas.map((_, i) => (
        <Dia key={i} i={i} f={f} />
      ))}
      <Colchete
        de={0}
        ate={4}
        inicio={T.uteisRotulo}
        cor={COR.neon}
        texto={TEXTO.uteis}
        alinhamento="center"
        f={f}
      />
      <Colchete
        de={5}
        ate={6}
        inicio={T.fimRotulo}
        cor={COR.coral}
        texto="Fim de semana"
        alinhamento="right"
        f={f}
      />
    </>
  );
};
