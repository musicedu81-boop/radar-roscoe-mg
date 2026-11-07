import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { GEO, Label, MapLayer, Sfx, toScreen } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { Icon } from "../icons";
import { Counter, Fade, HatchDefs, Highlight, ip, Kicker, Leaves, Pop, Ripples, sp, Stamp, EASE_IO, EASE_IN } from "../fx";

const CAM = { x: 279.6, y: 116.4, z: 104 };

export const Parque: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = batidas("parque");
  const tHer = b.word(0, "herança.");
  const tDerr = b.word(1, "derrubava");
  const tCarv = b.word(1, "carvão.");
  const tProt = b.word(1, "proteger");
  const tParq = b.word(1, "Parque");
  const t1a = b.at(2);
  const tMapa = b.at(3);
  const t36 = b.word(3, "36");
  const t40 = b.word(3, "40");
  const tMaior = b.word(3, "maior");
  const tOnca = b.word(3, "onça-pintada");
  const tMuri = b.word(3, "muriqui.");
  const z = CAM.z;
  const split = sp(f, fps, tHer - 4, { damping: 16, stiffness: 90 });
  const fase0 = f < b.at(1) + 6;
  const fase1 = f >= b.at(1) - 6 && f < tMapa + 6;
  return (
    <AbsoluteFill>
      {/* 1944 se divide */}
      {fase0 ? (
        <AbsoluteFill style={{ opacity: ip(f, [b.at(1) - 6, b.at(1) + 4], [1, 0]) }}>
          {[-1, 1].map((side) => (
            <div
              key={side}
              style={{
                position: "absolute",
                left: 960,
                top: 300,
                translate: `calc(-50% + ${side * 430 * split}px) 0`,
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 250, color: side < 0 ? C.aco : C.mata, lineHeight: 1, letterSpacing: -6, opacity: side < 0 ? 1 : Math.min(1, split * 3) }}>1944</div>
              <div style={{ opacity: ip(f, [tHer, tHer + 10], [0, 1]), marginTop: 10 }}>
                <Icon name={side < 0 ? "fabrica" : "arvore"} size={200} />
                <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 52, color: side < 0 ? C.aco : C.mata }}>{side < 0 ? "a usina" : "a floresta"}</div>
              </div>
            </div>
          ))}
          <Fade at={tHer - 6} style={{ left: 0, right: 0, top: 120, textAlign: "center" }}>
            <Kicker color={C.tinta}>uma segunda herança</Kicker>
          </Fade>
        </AbsoluteFill>
      ) : null}
      {/* derrubada e proteção */}
      {fase1 ? (
        <AbsoluteFill style={{ opacity: ip(f, [b.at(1) - 6, b.at(1) + 6], [0, 1]) * ip(f, [tMapa - 6, tMapa + 4], [1, 0]) }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d="M0,850 C400,820 900,870 1920,830 L1920,1080 L0,1080 Z" fill="#B9A67F" stroke={C.tinta} strokeWidth={4} />
          </svg>
          {new Array(9).fill(0).map((_, i) => {
            const x = 140 + i * 190;
            const fall = i % 3 !== 1;
            const tf = tDerr + i * 4;
            const rot = fall ? ip(f, [tf, tf + 14], [0, 86], EASE_IN) : 0;
            const back = ip(f, [tProt, tProt + 14], [0, 1]);
            return (
              <div key={i} style={{ position: "absolute", left: x, top: 630 }}>
                <div style={{ transformOrigin: "50% 92%", rotate: `${rot * (1 - back)}deg`, opacity: fall ? 1 - ip(f, [tf + 20, tf + 30], [0, 1]) * (1 - back) : 1 }}>
                  <Icon name="arvore" size={230} />
                </div>
                {fall ? (
                  <div style={{ position: "absolute", left: 40, top: 150, opacity: ip(f, [tf + 18, tf + 28], [0, 1]) * (1 - back) }}>
                    <Icon name="carvao" size={140} />
                  </div>
                ) : null}
              </div>
            );
          })}
          <Fade at={tDerr - 4} out={tProt - 6} style={{ left: 120, top: 110 }}>
            <Kicker>Mata virando carvão</Kicker>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 80, color: C.tinta, marginTop: 8 }}>
              para alimentar os <Highlight at={tCarv - 8}>fornos</Highlight>
            </div>
          </Fade>
          <Pop at={tProt} style={{ left: 820, top: 70 }}>
            <Icon name="escudo" size={290} />
          </Pop>
          <Fade at={tParq - 4} style={{ left: 0, right: 0, top: 395, textAlign: "center" }}>
            <div style={{ display: "inline-block", fontFamily: F.head, fontWeight: 900, fontSize: 76, color: C.papelClaro, background: C.mata, border: `5px solid ${C.tinta}`, padding: "6px 34px", boxShadow: `8px 8px 0 ${C.tinta}` }}>
              Parque Estadual do Rio Doce
            </div>
            <div style={{ display: "inline-block", fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: C.tinta, marginTop: 16, background: C.papelClaro, padding: "2px 14px" }}>criado em 14/07/1944</div>
          </Fade>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <Stamp at={t1a + 6} color={C.mata} rot={6} style={{ fontSize: 46, top: 120, left: 1190, background: "rgba(251,248,241,0.9)", textAlign: "center", lineHeight: 1.05 }}>
              1ª unidade de conservação
              <br />
              de Minas Gerais
            </Stamp>
          </AbsoluteFill>
          <Leaves at={tProt} n={18} area={[0, -60, 1920, 1140]} />
        </AbsoluteFill>
      ) : null}
      {/* mapa do parque */}
      {f >= tMapa - 6 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tMapa - 6, tMapa + 8], [0, 1]) }}>
          <MapLayer cam={CAM}>
            <HatchDefs id="hatchP" color={C.mata} bg={C.mataClara} size={0.11} width={0.035} />
            {GEO.region.map((r) => (
              <path key={r.name} d={r.d} fill={C.papelClaro} stroke={C.cinza} strokeWidth={1.4 / z} />
            ))}
            <path d={GEO.timoteo} fill="none" stroke={C.tinta} strokeWidth={3 / z} />
            <path d={GEO.parque} fill="url(#hatchP)" stroke={C.mata} strokeWidth={4 / z} opacity={ip(f, [tMapa, tMapa + 16], [0, 1], EASE_IO)} />
            <path d={GEO.rioDoce} fill="none" stroke={C.rio} strokeWidth={6 / z} />
            <path d={GEO.rioPiracicaba} fill="none" stroke={C.rio} strokeWidth={5 / z} />
            {GEO.lagoas.map(([x, y, r], i) => {
              const tl = t40 - 10 + i;
              const p = ip(f, [tl, tl + 8], [0, 1]);
              return (
                <g key={i} opacity={p}>
                  <ellipse cx={x} cy={y} rx={r * 0.85} ry={r * 0.55} fill={C.rio} stroke={C.tinta} strokeWidth={1.2 / z} />
                  {i % 5 === 0 ? <Ripples x={x} y={y} at={tl + 6} r={r * 2.4} color={C.rioClaro} sw={1 / z} /> : null}
                </g>
              );
            })}
          </MapLayer>
          <Label x={toScreen(CAM, GEO.centroids["Timóteo"])[0] - 70} y={toScreen(CAM, GEO.centroids["Timóteo"])[1] - 30} size={30}>
            Timóteo
          </Label>
          <div style={{ position: "absolute", left: 1010, top: 100, fontFamily: F.mono, fontSize: 20, color: C.tinta2, opacity: 0.7 }}>mapa: área e lagoas em representação aproximada</div>
          <div style={{ position: "absolute", left: 1010, top: 150, width: 820 }}>
            <Kicker color={C.mata}>Parque Estadual do Rio Doce</Kicker>
            <Fade at={t36 - 6} style={{ position: "relative", marginTop: 20 }}>
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 108, color: C.mata, lineHeight: 1 }}>
                ≈ <Counter to={36} at={t36 - 6} dur={24} /> mil
              </div>
              <div style={{ fontFamily: F.serif, fontSize: 34, color: C.tinta2 }}>hectares protegidos</div>
            </Fade>
            <Fade at={t40 - 6} style={{ position: "relative", marginTop: 26 }}>
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 108, color: C.rio, lineHeight: 1 }}>
                ~<Counter to={40} at={t40 - 6} dur={24} />
              </div>
              <div style={{ fontFamily: F.serif, fontSize: 34, color: C.tinta2 }}>lagoas</div>
            </Fade>
            <Fade at={tMaior - 4} style={{ position: "relative", marginTop: 26 }}>
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 52, color: C.tinta, lineHeight: 1.08 }}>
                <Highlight at={tMaior + 6}>maior área contínua</Highlight> de Mata Atlântica de Minas
              </div>
            </Fade>
            <div style={{ display: "flex", gap: 50, marginTop: 30 }}>
              <Pop at={tOnca} style={{ position: "relative" }}>
                <div style={{ textAlign: "center" }}>
                  <Icon name="pata" size={130} />
                  <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 46 }}>onça-pintada</div>
                </div>
              </Pop>
              <Pop at={tMuri} style={{ position: "relative" }}>
                <div style={{ textAlign: "center" }}>
                  <Icon name="macaco" size={130} />
                  <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 46 }}>muriqui</div>
                </div>
              </Pop>
            </div>
          </div>
          <Leaves at={tMapa} n={14} area={[0, -60, 960, 1140]} />
        </AbsoluteFill>
      ) : null}
      <Sfx at={tHer - 4} name="whoosh" vol={0.35} />
      <Sfx at={tDerr} name="click-soft" vol={0.35} />
      <Sfx at={tDerr + 8} name="click-soft" vol={0.3} />
      <Sfx at={tProt} name="impact-bass-2" vol={0.45} />
      <Sfx at={t1a + 6} name="impact-bass-1" vol={0.5} />
      <Sfx at={tMapa} name="whoosh-short" vol={0.3} />
      <Sfx at={t40 - 6} name="sparkle" vol={0.3} />
      <Sfx at={tOnca} name="pop" vol={0.35} />
      <Sfx at={tMuri} name="pop" vol={0.35} />
    </AbsoluteFill>
  );
};
