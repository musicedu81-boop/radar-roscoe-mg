import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GEO, MapLayer, P, Sfx, toScreen } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { Icon } from "../icons";
import { Fade, HatchDefs, Highlight, ip, Kicker, Pin, Pop, Sparks, Strike, Typewriter, BlurIn } from "../fx";
import { ACESITA_LL, CENTROSUL_LL } from "./Abertura";

const CAM = { x: 274.6, y: 113.98, z: 400 };

export const Nomes: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidas("nomes");
  const tPriv = b.word(0, "privatizada");
  const tArc = b.word(0, "ArcelorMittal");
  const tApe = b.word(0, "Aperam");
  const tMaior = b.at(1);
  const tConf = b.at(2);
  const tAce = b.word(2, "Acesita.");
  const tConfu = b.word(2, "confunde.");
  const z = CAM.z;
  const rows: { at: number; ano: string; nome: string; strike?: number; color: string }[] = [
    { at: 2, ano: "1944", nome: "ACESITA", strike: tArc, color: C.aco },
    { at: tArc - 4, ano: "2007", nome: "ARCELORMITTAL TIMÓTEO", strike: tApe, color: C.tinta2 },
    { at: tApe - 4, ano: "2011", nome: "APERAM SOUTH AMERICA", color: C.rio },
  ];
  const sA = toScreen(CAM, P(...ACESITA_LL));
  const sC = toScreen(CAM, P(...CENTROSUL_LL));
  return (
    <AbsoluteFill>
      {/* linha do tempo de nomes */}
      {f < tMaior + 4 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tMaior - 6, tMaior + 4], [1, 0]) }}>
          <Fade at={2} style={{ left: 140, top: 110 }}>
            <Kicker>A usina troca de nome</Kicker>
          </Fade>
          <div style={{ position: "absolute", left: 140, top: 230 }}>
            {rows.map((r, i) => (
              <Fade key={i} at={r.at} style={{ position: "relative", marginBottom: 46 }} y={30}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 40 }}>
                  <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 52, color: C.tinta2, width: 160 }}>{r.ano}</div>
                  <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 108, color: r.color, lineHeight: 1.0 }}>
                    {r.strike ? <Strike at={r.strike}>{r.nome}</Strike> : <Highlight at={r.at + 20}>{r.nome}</Highlight>}
                  </div>
                </div>
              </Fade>
            ))}
          </div>
          <Fade at={tPriv - 4} out={tArc - 8} style={{ left: 1260, top: 240 }}>
            <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 66, color: C.aco, rotate: "-4deg" }}>1992: privatizada</div>
          </Fade>
        </AbsoluteFill>
      ) : null}
      {/* maior produtora */}
      {f >= tMaior - 4 && f < tConf + 6 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tMaior - 4, tMaior + 6], [0, 1]) * ip(f, [tConf - 4, tConf + 6], [1, 0]), alignItems: "center", justifyContent: "center" }}>
          <Pop at={tMaior} style={{ left: 200, top: 300 }}>
            <Icon name="bobina" size={420} />
          </Pop>
          <Sparks x={420} y={560} at={tMaior + 6} n={34} spread={300} />
          <div style={{ position: "absolute", left: 760, top: 270, width: 1000 }}>
            <Kicker>Aperam South America · hoje</Kicker>
            <BlurIn at={tMaior + 4}>
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 92, color: C.tinta, lineHeight: 1.04, marginTop: 16 }}>
                maior produtora de <Highlight at={b.word(1, "inoxidável")}>aço inox</Highlight> e <Highlight at={b.word(1, "elétrico")} color={C.rioClaro}>elétrico</Highlight> da América do Sul
              </div>
            </BlurIn>
          </div>
        </AbsoluteFill>
      ) : null}
      {/* confusão: Acesita x Timóteo */}
      {f >= tConf - 4 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tConf - 4, tConf + 8], [0, 1]) }}>
          <MapLayer cam={CAM}>
            <HatchDefs id="hatchN" color={C.mataClara} size={0.03} width={0.008} />
            <path d={GEO.timoteo} fill={C.papelClaro} stroke={C.tinta} strokeWidth={5 / z} />
            <path d={GEO.parqueTimoteo} fill="url(#hatchN)" />
            <path d={GEO.rioPiracicaba} fill="none" stroke={C.rio} strokeWidth={9 / z} />
          </MapLayer>
          <Pin x={sA[0]} y={sA[1]} at={tConf + 2} color={C.aco} label="Centro-Norte" labelSide="right" size={58} />
          <Pin x={sC[0]} y={sC[1]} at={tConf + 8} color={C.marca} label="Centro-Sul" labelSide="left" size={58} />
          {f >= tAce - 2 ? (
            <div style={{ position: "absolute", left: sA[0] + 40, top: sA[1] + 10, rotate: "-5deg" }}>
              <Typewriter text="“aqui é Acesita”" at={tAce - 2} cps={18} caret={false} style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 70, color: C.aco }} />
            </div>
          ) : null}
          {[0, 1, 2].map((i) => (
            <Pop key={i} at={tConfu + i * 5} style={{ left: 1380 + i * 120, top: 700 - (i % 2) * 70 }}>
              <Icon name="pergunta" size={110 - i * 10} />
            </Pop>
          ))}
          <Pop at={tConfu - 4} style={{ left: 1250, top: 760 }}>
            <Icon name="pessoa" size={130} color={C.rio} />
          </Pop>
        </AbsoluteFill>
      ) : null}
      <Sfx at={tPriv} name="click-soft" vol={0.4} />
      <Sfx at={tArc - 4} name="whoosh-short" vol={0.3} />
      <Sfx at={tApe - 4} name="whoosh-short" vol={0.3} />
      <Sfx at={tMaior} name="impact-bass-1" vol={0.45} />
      <Sfx at={tMaior + 6} name="sparkle" vol={0.3} />
      <Sfx at={tConf + 2} name="pop" vol={0.35} />
      <Sfx at={tConf + 8} name="pop" vol={0.35} />
      <Sfx at={tConfu} name="pop" vol={0.35} />
    </AbsoluteFill>
  );
};
