import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GEO, Label, MapLayer, P, Sfx, stateD, toScreen } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { Icon } from "../icons";
import {
  Chroma,
  DrawPath,
  Halftone,
  Highlight,
  ip,
  Kicker,
  Pin,
  Pop,
  Shake,
  Sparks,
  Stamp,
  TornCard,
  WordsReveal,
  Fade,
} from "../fx";

const line = (pts: [number, number][]) => "M" + pts.map((p) => P(p[0], p[1]).map((v) => v.toFixed(2)).join(",")).join(" L");

const FERROVIA = line([
  [-40.34, -20.32], [-40.42, -19.95], [-40.63, -19.54], [-41.01, -19.52], [-41.25, -19.32], [-41.47, -19.17],
  [-41.95, -18.85], [-42.23, -19.22], [-42.54, -19.47], [-42.63, -19.53], [-42.87, -19.65], [-43.03, -19.76], [-43.23, -19.62],
]);
const PIRACICABA = line([[-43.45, -20.02], [-43.17, -19.81], [-43.03, -19.77], [-42.87, -19.66], [-42.7, -19.55], [-42.62, -19.52], [-42.53, -19.48]]);
const DOCE = line([[-42.53, -19.48], [-42.3, -19.25], [-41.95, -18.88], [-41.6, -19.1], [-41.25, -19.32], [-40.65, -19.53], [-40.2, -19.6], [-39.7, -19.65]]);

const CAM = { x: 294, y: 116, z: 17.5 };

export const Porque: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidas("porque");
  const tMapa = b.at(1);
  const tIta = b.at(2);
  const tX = b.word(2, "acidentado");
  const tFerro = b.word(3, "ferrovia");
  const tAgua = b.word(3, "água");
  const tMata = b.word(3, "mata");
  const tData = b.at(4);
  const tAcos = b.word(4, "Aços");
  const tEsp = b.word(4, "Especiais");
  const tItab = b.word(4, "Itabira.");
  const z = CAM.z;
  const sIta = toScreen(CAM, GEO.points["Itabira"]);
  const sTim = toScreen(CAM, GEO.points["Timóteo"]);
  const sVit = toScreen(CAM, GEO.points["Vitória"]);
  const virada = f < tMapa;
  const items: { t: number; icon: "trem" | "rio" | "arvore"; txt: string; sub: string }[] = [
    { t: tFerro, icon: "trem", txt: "Ferrovia", sub: "Vitória a Minas" },
    { t: tAgua, icon: "rio", txt: "Água", sub: "rio Piracicaba" },
    { t: tMata, icon: "arvore", txt: "Mata", sub: "madeira → carvão" },
  ];
  return (
    <AbsoluteFill>
      <Shake at={[tData + 6]} amp={12}>
        {/* mapa */}
        <AbsoluteFill style={{ opacity: ip(f, [tMapa - 4, tMapa + 8], [0, 1]) * ip(f, [tData - 6, tData + 4], [1, 0]) }}>
          <MapLayer cam={CAM}>
            {GEO.states.map((s) => (
              <path key={s.name} d={s.d} fill={s.name === "Minas Gerais" ? "#F6EBC4" : C.papelClaro} stroke={C.cinza} strokeWidth={2 / z} />
            ))}
            <path d={stateD("Espírito Santo")} fill={C.papelEscuro} stroke={C.cinza} strokeWidth={2 / z} />
            <path d={GEO.mgOutline} fill="none" stroke={C.tinta} strokeWidth={3.5 / z} />
            <path d={DOCE} fill="none" stroke={C.rio} strokeWidth={5 / z} opacity={0.45} strokeLinecap="round" />
            <DrawPath d={PIRACICABA} at={tAgua} dur={26} color={C.rio} width={9 / z} />
            <DrawPath d={FERROVIA} at={tFerro} dur={34} color={C.tinta} width={6 / z} dash={`${10 / z} ${7 / z}`} />
            {f >= tMata
              ? new Array(26).fill(0).map((_, i) => {
                  const a = (i / 26) * Math.PI * 2;
                  const r = 1.2 + ((i * 37) % 10) / 6;
                  const p = ip(f, [tMata + i, tMata + i + 8], [0, 1]);
                  const [x, y] = GEO.points["Timóteo"];
                  return <circle key={i} cx={x + Math.cos(a) * r * 1.4} cy={y + Math.sin(a) * r} r={0.5 * p} fill={C.mata} stroke={C.tinta} strokeWidth={1.5 / z} />;
                })
              : null}
          </MapLayer>
          <Label x={toScreen(CAM, [300, 92])[0]} y={toScreen(CAM, [300, 92])[1]} size={40} color={C.tinta2} style={{ letterSpacing: 6 }}>
            MINAS GERAIS
          </Label>
          <Label x={sVit[0] + 40} y={sVit[1] - 150} size={34} color={C.tinta2} style={{ letterSpacing: 4 }}>
            ESPÍRITO SANTO
          </Label>
          <Pin x={sTim[0]} y={sTim[1]} at={tMapa + 10} color={C.aco} label="Timóteo" labelSide="top" size={48} />
          <Pin x={sVit[0]} y={sVit[1]} at={tFerro + 2} color={C.rio} label="Vitória (porto)" labelSide="left" size={40} />
          <Pin x={sIta[0]} y={sIta[1]} at={tIta} color={C.tinta2} label="Itabira · minério" labelSide="left" size={46} />
          {/* relevo acidentado */}
          {[0, 1, 2, 3].map((i) => (
            <Pop key={i} at={tIta + 10 + i * 3} style={{ left: sIta[0] - 140 + i * 58, top: sIta[1] + 30 + (i % 2) * 22 }}>
              <Icon name="montanha" size={92} color={C.cinzaClaro} />
            </Pop>
          ))}
          <Pop at={tX} style={{ left: sIta[0] - 36, top: sIta[1] + 120 }} from={2}>
            <Icon name="x" size={110} />
          </Pop>
          <Fade at={tX + 4} out={tFerro - 6} style={{ left: sIta[0] - 210, top: sIta[1] + 250 }}>
            <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 56, color: C.aco, rotate: "-3deg" }}>relevo acidentado demais</div>
          </Fade>
          {/* checklist (embaixo) */}
          <div style={{ position: "absolute", left: 120, top: 790, display: "flex", gap: 34 }}>
            {items.map((it, i) => {
              const p = ip(f, [it.t, it.t + 12], [0, 1]);
              return (
                <div
                  key={i}
                  style={{
                    width: 520,
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    background: C.papelClaro,
                    border: `4px solid ${C.tinta}`,
                    boxShadow: `7px 7px 0 ${C.tinta}`,
                    padding: "0 22px",
                    opacity: p,
                    translate: `0 ${(1 - p) * 40}px`,
                  }}
                >
                  <Icon name="check" size={70} />
                  <Icon name={it.icon} size={84} />
                  <div>
                    <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 44, color: C.tinta }}>{it.txt}</div>
                    <div style={{ fontFamily: F.serif, fontSize: 28, color: C.tinta2 }}>{it.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <TornCard x={1230} y={120} w={600} h={230} at={b.word(1, "Entre") - 4} out={tIta - 6} rot={2} seed="farquhar">
            <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "30px 36px" }}>
              <Icon name="pessoa" size={120} color={C.tinta} />
              <div>
                <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 42, color: C.tinta, lineHeight: 1.05 }}>Percival Farquhar</div>
                <div style={{ fontFamily: F.serif, fontSize: 28, color: C.tinta2, marginTop: 6 }}>empresário norte-americano, sócio-fundador</div>
              </div>
            </div>
          </TornCard>
          <Fade at={tMapa + 4} out={b.word(1, "Entre") - 8} style={{ left: 120, top: 120 }}>
            <Kicker color={C.tinta}>Anos 1940</Kicker>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 64, color: C.tinta, marginTop: 8, maxWidth: 620, lineHeight: 1.05 }}>
              Onde construir uma <Highlight at={b.word(1, "siderúrgica")}>siderúrgica</Highlight>?
            </div>
          </Fade>
          <div style={{ position: "absolute", left: 120, top: 1000 - 290, fontFamily: F.mono, fontSize: 18, color: C.tinta2, opacity: ip(f, [tFerro + 20, tFerro + 30], [0, 0.7]) }}>
            traçados esquemáticos
          </div>
        </AbsoluteFill>
        {/* A virada */}
        {virada ? (
          <AbsoluteFill style={{ background: C.tinta, alignItems: "center", justifyContent: "center", opacity: ip(f, [tMapa - 6, tMapa + 2], [1, 0]) }}>
            <Halftone color={C.marca} opacity={0.15} />
            <Chroma at={b.at(0)} len={12} amp={22} blend="screen" style={{ color: C.marca }}>
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 210, rotate: `${ip(f, [b.at(0), b.at(0) + 14], [-10, -3])}deg`, scale: String(ip(f, [b.at(0), b.at(0) + 14], [1.5, 1])) }}>
                A VIRADA
              </div>
            </Chroma>
          </AbsoluteFill>
        ) : null}
        {/* 31 de outubro de 1944 · ACESITA */}
        {f >= tData - 4 ? (
          <AbsoluteFill style={{ opacity: ip(f, [tData - 4, tData + 4], [0, 1]) }}>
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
              <Stamp at={tData + 4} color={C.tinta} rot={-4} style={{ position: "relative", fontSize: 100, padding: "8px 40px" }}>
                31 · out · 1944
              </Stamp>
            </AbsoluteFill>
            <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: F.head, fontWeight: 900, fontSize: 104, lineHeight: 1.12, color: C.tinta }}>
              <div style={{ opacity: ip(f, [tAcos - 4, tAcos + 6], [0, 1]) }}>
                <Highlight at={tAcos} color={C.marca}>AÇ</Highlight>OS
              </div>
              <div style={{ opacity: ip(f, [tEsp - 4, tEsp + 6], [0, 1]) }}>
                <Highlight at={tEsp} color={C.marca}>ES</Highlight>PECIAIS
              </div>
              <div style={{ opacity: ip(f, [tItab - 4, tItab + 6], [0, 1]) }}>
                <Highlight at={tItab} color={C.marca}>ITA</Highlight>BIRA
              </div>
            </div>
            <Pop at={tItab + 14} style={{ left: 0, right: 0, top: 760, display: "flex", justifyContent: "center" }}>
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 150, color: C.papelClaro, background: C.aco, padding: "0 50px", border: `6px solid ${C.tinta}`, boxShadow: `10px 10px 0 ${C.tinta}`, letterSpacing: 6 }}>
                <WordsReveal text="ACESITA" at={tItab + 14} />
              </div>
            </Pop>
            <Sparks x={560} y={900} at={tItab + 16} n={30} />
            <Sparks x={1360} y={900} at={tItab + 18} n={30} />
          </AbsoluteFill>
        ) : null}
      </Shake>
      <Sfx at={b.at(0)} name="impact-bass-1" vol={0.55} />
      <Sfx at={tMapa} name="whoosh" vol={0.35} />
      <Sfx at={tMapa + 10} name="pop" vol={0.35} />
      <Sfx at={tIta} name="pop" vol={0.35} />
      <Sfx at={tX} name="click-soft" vol={0.5} />
      <Sfx at={tFerro} name="ping" vol={0.35} />
      <Sfx at={tAgua} name="ping" vol={0.35} />
      <Sfx at={tMata} name="ping" vol={0.35} />
      <Sfx at={tData + 4} name="impact-bass-2" vol={0.6} />
      <Sfx at={tItab + 14} name="sparkle" vol={0.45} />
    </AbsoluteFill>
  );
};
