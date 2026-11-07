import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GEO, MapLayer, Sfx } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { Icon } from "../icons";
import { DrawPath, Fade, ip, Leaves, Letterbox, LightLeak, Pop, Smoke, SplitReveal, WordsReveal, YearTicker, Highlight, EASE_IO } from "../fx";

const CAM = { x: 275.15, y: 113.83, z: 300 };

export const Final: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidas("final");
  const tSplit = b.at(1);
  const tFloresta = b.word(1, "floresta");
  const tAno = b.word(1, "mesmo");
  const tChao = b.word(1, "chão.");
  const tPerg = b.at(2);
  const tDuas = b.word(3, "duas.");
  const tAco = b.word(3, "Aço");
  const t62 = b.word(3, "62");
  const merge = ip(f, [tDuas - 4, tDuas + 14], [0, 1], EASE_IO);
  return (
    <AbsoluteFill>
      {/* abertura da conclusão */}
      <Fade at={b.at(0)} out={tSplit - 6} style={{ left: 0, right: 0, top: 440, textAlign: "center" }}>
        <div style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 96, color: C.tinta }}>
          <WordsReveal text="No fim, Timóteo é isso." at={b.at(0)} stagger={4} />
        </div>
      </Fade>
      {/* aço | floresta */}
      {f >= tSplit - 2 ? (
        <AbsoluteFill style={{ opacity: 1 - merge }}>
          <SplitReveal
            at={tSplit}
            atRight={tFloresta}
            leftBg={C.aco}
            rightBg={C.mata}
            left={
              <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
                <Smoke x={370} y={330} at={tSplit} n={12} color="#f3c3b3" seed="fa" />
                <Smoke x={440} y={360} at={tSplit + 10} n={10} color="#f3c3b3" seed="fb" />
                <Icon name="fabrica" size={300} color={C.papelClaro} color2={C.acoEscuro} />
                <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 70, color: C.papelClaro, marginTop: 10 }}>um alto-forno</div>
                <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 64, color: C.marca, marginTop: 10, opacity: ip(f, [tAno, tAno + 8], [0, 1]) }}>1944</div>
              </AbsoluteFill>
            }
            right={
              <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <Icon name="arvore" size={200} color={C.mataClara} />
                  <Icon name="arvore" size={260} color={C.mataClara} />
                  <Icon name="arvore" size={200} color={C.mataClara} />
                </div>
                <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 70, color: C.papelClaro, marginTop: 10 }}>uma floresta protegida</div>
                <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 64, color: C.marca, marginTop: 10, opacity: ip(f, [tAno + 4, tAno + 12], [0, 1]) }}>1944</div>
              </AbsoluteFill>
            }
          />
          <Leaves at={tFloresta} n={14} area={[960, -60, 960, 1140]} color={C.mataClara} />
          {/* o mesmo chão: contorno de Timóteo sobre as duas metades */}
          {f >= tChao - 4 ? (
            <AbsoluteFill style={{ opacity: ip(f, [tPerg + 10, tPerg + 24], [1, 0.35]) }}>
              <MapLayer cam={CAM}>
                <DrawPath d={GEO.timoteo} at={tChao - 4} dur={26} color={C.papelClaro} width={9 / CAM.z} />
              </MapLayer>
            </AbsoluteFill>
          ) : null}
          {/* Acesita ou Timóteo? */}
          <Pop at={tPerg} style={{ left: 0, width: 960, top: 120, textAlign: "center" }}>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 130, color: C.papelClaro, textShadow: `6px 6px 0 ${C.tinta}` }}>ACESITA?</div>
          </Pop>
          <Pop at={tPerg + 10} style={{ left: 960, width: 960, top: 120, textAlign: "center" }}>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 130, color: C.papelClaro, textShadow: `6px 6px 0 ${C.tinta}` }}>TIMÓTEO?</div>
          </Pop>
        </AbsoluteFill>
      ) : null}
      {/* as duas */}
      {f >= tDuas - 4 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: merge }}>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 250, color: C.tinta, letterSpacing: -6, lineHeight: 1, scale: String(ip(f, [tDuas - 4, tDuas + 16], [1.3, 1])) }}>TIMÓTEO</div>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 70, marginTop: 20, opacity: ip(f, [tAco - 4, tAco + 8], [0, 1]) }}>
            <span style={{ color: C.aco }}>Aço</span> + <span style={{ color: C.mata }}>Mata Atlântica</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 26, marginTop: 34, opacity: ip(f, [t62 - 6, t62 + 4], [0, 1]) }}>
            <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 64, color: C.tinta2 }}>
              1964 → <YearTicker from={1964} to={2026} at={t62 - 4} dur={36} />
            </div>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 70 }}>
              <Highlight at={t62 + 30}>62 anos, uma cidade só</Highlight>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      <LightLeak at={tDuas} dur={110} opacity={0.4} />
      <Letterbox at={t62 + 20} size={90} />
      <Sfx at={tSplit} name="whoosh" vol={0.35} />
      <Sfx at={tFloresta} name="whoosh" vol={0.35} />
      <Sfx at={tChao - 4} name="sparkle" vol={0.3} />
      <Sfx at={tPerg} name="pop" vol={0.4} />
      <Sfx at={tPerg + 10} name="pop" vol={0.4} />
      <Sfx at={tDuas - 4} name="impact-bass-1" vol={0.55} />
      <Sfx at={t62 + 30} name="chime" vol={0.45} />
    </AbsoluteFill>
  );
};
