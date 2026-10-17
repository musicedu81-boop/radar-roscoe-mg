import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO } from "../marca";
import { GlitchTexto } from "../ui/Glitch";
import { GRADE, qJanela, T, TEXTO } from "./JanelaTempos";

// Legenda dos dois picos: "10H ÀS 12H · Reels dos quadros" (verde-neon) e
// "18H · Carrosséis extras" (amarelo). Na fase 1 fica lado a lado embaixo do relógio; na fase 2
// sobe e se empilha à direita do relógio pequeno, como resumo da janela.

const Item: React.FC<{
  k: number;
  titulo: string;
  sub: string;
  cor: string;
  entra: number;
  entraSub: number;
  f: number;
}> = ({ k, titulo, sub, cor, entra, entraSub, f }) => {
  // Fase 2: sai de baixo (desce e some) e reaparece empilhada à direita do relógio pequeno.
  // Um voo direto cruzaria o relógio que encolhe e a área do cartão que entra.
  const sai = interpolate(f, [T.fase2 - 2, T.fase2 + 6], [0, 1], {
    ...clamp,
    easing: EASE.saida,
  });
  const volta = interpolate(
    f,
    [T.fase2 + 10 + k * 3, T.fase2 + 24 + k * 3],
    [0, 1],
    { ...clamp, easing: EASE.entrada },
  );
  const naFase2 = f >= T.fase2 + 8;
  const pos = naFase2 ? GRADE.legenda2[k] : GRADE.legenda1[k];
  const barra = interpolate(f, [entra, entra + 12], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const titulo1 = interpolate(f, [entra + 2, entra + 16], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const sub1 = interpolate(f, [entraSub, entraSub + 12], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: 440,
        height: 128,
        display: "flex",
        gap: 22,
        opacity: f < entra ? 0 : naFase2 ? volta : 1 - sai,
        translate: naFase2 ? `${(1 - volta) * 40}px 0px` : `0px ${sai * 24}px`,
      }}
    >
      <div
        style={{
          width: 10,
          height: 128,
          borderRadius: 5,
          background: cor,
          boxShadow: `0 0 18px ${cor}`,
          scale: `1 ${barra}`,
          transformOrigin: "50% 0%",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            fontFamily: FONTE_TITULO,
            fontSize: 60,
            lineHeight: 1.1,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            color: cor,
            whiteSpace: "nowrap",
            clipPath: `inset(-20% ${(1 - titulo1) * 100}% -20% 0)`,
            translate: `${(1 - titulo1) * -24}px 0px`,
          }}
        >
          <GlitchTexto inicio={qJanela(entra + 2)} duracao={10}>
            {titulo}
          </GlitchTexto>
        </div>
        <div
          style={{
            fontFamily: FONTE_TEXTO,
            fontWeight: 700,
            fontSize: 34,
            lineHeight: 1.2,
            color: COR.tintaClara,
            whiteSpace: "nowrap",
            opacity: sub1,
            translate: `0px ${(1 - sub1) * 14}px`,
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
};

export const JanelaLegenda: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - qJanela(0);
  return (
    <>
      <Item
        k={0}
        titulo={TEXTO.pico}
        sub={TEXTO.saiAs10}
        cor={COR.neon}
        entra={T.legenda1}
        entraSub={T.legenda1 + 8}
        f={f}
      />
      <Item
        k={1}
        titulo={TEXTO.segundo}
        sub={TEXTO.saiAs18}
        cor={COR.amarelo}
        entra={T.dezoito}
        entraSub={T.carrosseis}
        f={f}
      />
    </>
  );
};
