import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx, SOURCE } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { Icon } from "../icons";
import { Fade, Highlight, ip, Kicker, Pop, Shake, Stamp, TornCard, VoteBar } from "../fx";

export const Plebiscito: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidas("plebiscito");
  const tPleb = b.word(0, "plebiscito");
  const tAces = b.word(0, "Acesita.");
  const tSim = b.word(1, "12.861");
  const tNao = b.word(1, "4.908");
  const tBarr = b.word(2, "barrou");
  const tTim = b.word(2, "Timóteo.");
  const total = 12861 + 4908;
  const ballotOut = b.at(1) - 6;
  return (
    <AbsoluteFill>
      <Shake at={[tBarr]} amp={12}>
        <Fade at={4} out={ballotOut} style={{ left: 120, top: 110 }}>
          <Kicker>A força de uma marca</Kicker>
        </Fade>
        <TornCard x={330} y={210} w={1260} h={600} at={tPleb - 6} out={ballotOut} rot={-1.5} seed="cedula">
          <div style={{ display: "flex", gap: 50, padding: "60px 70px", alignItems: "center" }}>
            <Icon name="urna" size={260} />
            <div>
              <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: C.tinta2, letterSpacing: 4 }}>PLEBISCITO · 1979–1981</div>
              <div style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 64, color: C.tinta, lineHeight: 1.12, marginTop: 20 }}>
                Trocar o nome da cidade de Timóteo para <Highlight at={tAces}>Acesita</Highlight>?
              </div>
              <div style={{ display: "flex", gap: 40, marginTop: 36, fontFamily: F.head, fontWeight: 800, fontSize: 40 }}>
                <span>☐ SIM</span>
                <span>☐ NÃO</span>
              </div>
            </div>
          </div>
        </TornCard>
        {f >= b.at(1) - 6 ? (
          <AbsoluteFill style={{ opacity: ip(f, [b.at(1) - 6, b.at(1) + 4], [0, 1]) }}>
            <div style={{ position: "absolute", left: 370, top: 140, fontFamily: F.head, fontWeight: 900, fontSize: 80, color: C.tinta }}>Resultado do plebiscito</div>
            <VoteBar label="A FAVOR da mudança" v={12861} total={total} at={tSim - 6} y={300} color={C.aco} />
            <VoteBar label="CONTRA" v={4908} total={total} at={tNao - 6} y={540} color={C.cinza} />
            <SOURCE>WIKIPÉDIA · HISTÓRIA DE TIMÓTEO</SOURCE>
          </AbsoluteFill>
        ) : null}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Stamp at={tBarr} color={C.aco} rot={-9} style={{ fontSize: 96, top: 300, background: "rgba(251,248,241,0.88)" }}>
            Barrado pela Assembleia
          </Stamp>
        </AbsoluteFill>
        <Pop at={tTim - 2} style={{ left: 0, right: 0, top: 820, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 84, color: C.tinta }}>
            O nome continua: <Highlight at={tTim + 4}>TIMÓTEO</Highlight>
          </div>
        </Pop>
      </Shake>
      <Sfx at={tPleb - 6} name="whoosh-short" vol={0.3} />
      <Sfx at={tSim - 6} name="riser" vol={0.22} dur={50} />
      <Sfx at={tNao - 6} name="click-soft" vol={0.35} />
      <Sfx at={tBarr} name="impact-bass-2" vol={0.6} />
      <Sfx at={tTim} name="pop" vol={0.4} />
    </AbsoluteFill>
  );
};
