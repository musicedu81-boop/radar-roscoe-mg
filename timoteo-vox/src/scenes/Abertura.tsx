import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GEO, MapLayer, P, Sfx, toScreen } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { Icon } from "../icons";
import {
  camAt,
  DrawPath,
  HandCircle,
  HatchDefs,
  ip,
  Pin,
  Pop,
  Pulse,
  Shake,
  Strike,
  Typewriter,
  EASE_IO,
  LightLeak,
  BlurIn,
} from "../fx";

export const ACESITA_LL: [number, number] = [-42.615, -19.545];
export const CENTROSUL_LL: [number, number] = [-42.642, -19.575];

export const Abertura: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidas("abertura");
  const ace = P(...ACESITA_LL);
  const cs = P(...CENTROSUL_LL);
  const cam = camAt(f, [
    { f: 0, c: { x: 274.75, y: 113.95, z: 520 } },
    { f: b.at(1), c: { x: 274.7, y: 113.95, z: 470 } },
    { f: b.at(4), c: { x: 274.6, y: 113.98, z: 430 } },
    { f: b.at(5), c: { x: 274.6, y: 113.98, z: 360 } },
  ]);
  const z = cam.z;
  const sA = toScreen(cam, ace);
  const sC = toScreen(cam, cs);
  const yearAt = b.word(5, "1944");
  const mapOut = ip(f, [b.at(5) - 4, b.at(5) + 10], [1, 0.07], EASE_IO);
  return (
    <AbsoluteFill>
      <Shake at={[yearAt]} amp={16}>
        <AbsoluteFill style={{ opacity: mapOut }}>
          <MapLayer cam={cam}>
            <HatchDefs id="hatchA" color={C.mataClara} size={0.03} width={0.008} />
            <path d={GEO.region.find((r) => r.name === "Coronel Fabriciano")!.d} fill={C.papelEscuro} stroke={C.cinza} strokeWidth={2 / z} />
            <path d={GEO.region.find((r) => r.name === "Ipatinga")!.d} fill={C.papelEscuro} stroke={C.cinza} strokeWidth={2 / z} />
            <path d={GEO.timoteo} fill={C.papelClaro} stroke={C.tinta} strokeWidth={5 / z} />
            <path d={GEO.parqueTimoteo} fill="url(#hatchA)" opacity={0.9} />
            <DrawPath d={GEO.rioPiracicaba} at={6} dur={40} color={C.rio} width={9 / z} />
          </MapLayer>
          <div style={{ position: "absolute", left: 120, top: 120, fontFamily: F.mono, fontSize: 24, letterSpacing: 4, color: C.tinta2, opacity: ip(f, [8, 20], [0, 0.8]) }}>
            VALE DO AÇO · MG
          </div>
          {/* Pergunta 1 */}
          <Pop at={b.at(0)} style={{ left: 120, top: 190 }} out={b.at(2) - 6}>
            <div style={{ background: C.papelClaro, border: `4px solid ${C.tinta}`, boxShadow: `8px 8px 0 ${C.tinta}`, padding: "18px 34px", rotate: "-2deg" }}>
              <Typewriter text="Onde fica a Acesita?" at={b.at(0) + 4} cps={20} style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 76, color: C.tinta }} />
            </div>
          </Pop>
          <Pin x={sA[0]} y={sA[1]} at={b.at(1) + 4} color={C.aco} label="ACESITA" labelSide="right" size={64} />
          <Pulse x={sA[0]} y={sA[1]} at={b.at(1) + 10} color={C.aco} r={120} />
          {/* Pergunta 2 */}
          <Pop at={b.at(2)} style={{ left: 120, top: 190 }} out={b.at(4) - 6}>
            <div style={{ background: C.papelClaro, border: `4px solid ${C.tinta}`, boxShadow: `8px 8px 0 ${C.tinta}`, padding: "18px 34px", rotate: "1.5deg" }}>
              <Typewriter text="E onde fica Timóteo?" at={b.at(2) + 4} cps={20} style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 76, color: C.tinta }} />
            </div>
          </Pop>
          <Pin x={sC[0]} y={sC[1]} at={b.at(3) + 4} color={C.marca} label="TIMÓTEO" labelSide="left" size={64} />
          <Pulse x={sC[0]} y={sC[1]} at={b.at(3) + 10} color={C.tinta2} r={120} />
          {/* ligação tracejada */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <DrawPath d={`M${sA[0]},${sA[1] - 30} Q${(sA[0] + sC[0]) / 2 + 160},${(sA[1] + sC[1]) / 2 - 80} ${sC[0]},${sC[1] - 30}`} at={b.at(4)} dur={18} color={C.tinta} width={5} dash="14 12" />
          </svg>
          {/* "2 cidades?" -> "1" */}
          <Pop at={b.at(4)} style={{ right: 130, top: 640 }}>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 120, color: C.tinta, background: C.marca, padding: "6px 30px", border: `5px solid ${C.tinta}`, rotate: "-3deg" }}>
              <Strike at={b.word(4, "Mas")} color={C.aco}>2</Strike> cidades?
            </div>
          </Pop>
          <Pop at={b.word(4, "só") - 2} style={{ left: 1095, top: 425 }} from={2}>
            <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 170, color: C.aco, rotate: "-8deg" }}>1</div>
          </Pop>
          <HandCircle x={1150} y={545} w={200} h={220} at={b.word(4, "só")} color={C.aco} seed="dois" />
        </AbsoluteFill>
        {/* aço · floresta · 1944 */}
        <AbsoluteFill style={{ opacity: ip(f, [b.at(5) - 2, b.at(5) + 8], [0, 1]) }}>
          <Pop at={b.word(5, "aço")} style={{ left: 260, top: 330 }}>
            <div style={{ textAlign: "center" }}>
              <Icon name="fabrica" size={260} />
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 64, color: C.aco }}>AÇO</div>
            </div>
          </Pop>
          <Pop at={b.word(5, "floresta")} style={{ right: 260, top: 330 }}>
            <div style={{ textAlign: "center" }}>
              <Icon name="arvore" size={260} />
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 64, color: C.mata }}>FLORESTA</div>
            </div>
          </Pop>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            {f >= yearAt - 2 ? (
              <BlurIn at={yearAt - 2} dur={8}>
                <div
                  style={{
                    fontFamily: F.head,
                    fontWeight: 900,
                    fontSize: 300,
                    color: C.tinta,
                    letterSpacing: -8,
                    scale: String(ip(f, [yearAt - 2, yearAt + 6], [1.6, 1])),
                    textShadow: `10px 10px 0 ${C.marca}`,
                  }}
                >
                  1944
                </div>
              </BlurIn>
            ) : null}
          </AbsoluteFill>
        </AbsoluteFill>
        <LightLeak at={yearAt} dur={70} opacity={0.35} />
      </Shake>
      <Sfx at={b.at(0) + 2} name="pop" vol={0.35} />
      <Sfx at={b.at(0) + 4} name="typing" vol={0.25} dur={40} />
      <Sfx at={b.at(1) + 6} name="pop" vol={0.5} />
      <Sfx at={b.at(2) + 2} name="pop" vol={0.35} />
      <Sfx at={b.at(2) + 4} name="typing" vol={0.25} dur={40} />
      <Sfx at={b.at(3) + 6} name="pop" vol={0.5} />
      <Sfx at={b.at(4)} name="whoosh-short" vol={0.35} />
      <Sfx at={b.word(4, "só")} name="click-soft" vol={0.5} />
      <Sfx at={b.word(5, "aço")} name="pop" vol={0.4} />
      <Sfx at={b.word(5, "floresta")} name="pop" vol={0.4} />
      <Sfx at={yearAt - 1} name="impact-bass-1" vol={0.7} />
    </AbsoluteFill>
  );
};
