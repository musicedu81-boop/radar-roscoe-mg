import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { Icon } from "../icons";
import { Counter, Fade, ip, Kicker, TornCard, EASE_IO, Highlight } from "../fx";

export const Numeros: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidas("numeros");
  const tPib = b.word(1, "PIB");
  const tIdh = b.word(1, "Índice");
  const tAlto = b.word(1, "alto.");
  const g = ip(f, [tIdh, tIdh + 30], [0, 0.77], EASE_IO);
  const R = 170;
  const cx = 1340;
  const cy = 640;
  const arc = (p: number) => {
    const a0 = Math.PI;
    const a1 = Math.PI + Math.PI * p;
    const x0 = cx + Math.cos(a0) * R;
    const y0 = cy + Math.sin(a0) * R;
    const x1 = cx + Math.cos(a1) * R;
    const y1 = cy + Math.sin(a1) * R;
    return `M${x0},${y0} A${R},${R} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
  };
  return (
    <AbsoluteFill>
      <Fade at={6} style={{ left: 120, top: 100 }}>
        <Kicker>E mesmo assim</Kicker>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 88, color: C.tinta, marginTop: 6 }}>os números impressionam</div>
      </Fade>
      <TornCard x={120} y={330} w={760} h={520} at={tPib - 8} rot={-1.5} seed="pib">
        <div style={{ padding: "50px 56px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Icon name="moeda" size={90} />
            <Kicker color={C.tinta2}>PIB por habitante</Kicker>
          </div>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 112, color: C.aco, marginTop: 40, lineHeight: 1, whiteSpace: "nowrap" }}>
            <Counter to={56987} at={tPib} dur={40} prefix="R$ " />
          </div>
          <div style={{ fontFamily: F.serif, fontSize: 34, color: C.tinta2, marginTop: 20 }}>IBGE · 2023</div>
        </div>
      </TornCard>
      <TornCard x={1000} y={330} w={760} h={520} at={tIdh - 8} rot={1.5} seed="idh">
        <div style={{ padding: "50px 56px" }}>
          <Kicker color={C.tinta2}>IDH municipal</Kicker>
        </div>
      </TornCard>
      {f >= tIdh - 4 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tIdh - 4, tIdh + 6], [0, 1]) }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d={arc(1)} fill="none" stroke={C.papelEscuro} strokeWidth={46} />
            <path d={arc(Math.max(0.001, g))} fill="none" stroke={C.mata} strokeWidth={46} />
            <path d={arc(1)} fill="none" stroke={C.tinta} strokeWidth={3} strokeDasharray="2 30" />
          </svg>
          <div style={{ position: "absolute", left: cx - 150, top: cy - 78, width: 300, textAlign: "center", fontFamily: F.head, fontWeight: 900, fontSize: 80, color: C.tinta }}>
            <Counter to={0.77} at={tIdh} dur={30} dec={3} />
          </div>
          <div style={{ position: "absolute", left: cx - 200, top: cy + 30, width: 400, textAlign: "center", fontFamily: F.head, fontWeight: 900, fontSize: 52 }}>
            <Highlight at={tAlto}>ALTO</Highlight>
          </div>
          <div style={{ position: "absolute", left: cx - 200, top: cy + 120, width: 400, textAlign: "center", fontFamily: F.serif, fontSize: 30, color: C.tinta2 }}>PNUD · 2010</div>
        </AbsoluteFill>
      ) : null}
      <Sfx at={tPib - 8} name="whoosh-short" vol={0.3} />
      <Sfx at={tIdh - 8} name="whoosh-short" vol={0.3} />
      <Sfx at={tAlto} name="ping" vol={0.4} />
    </AbsoluteFill>
  );
};
