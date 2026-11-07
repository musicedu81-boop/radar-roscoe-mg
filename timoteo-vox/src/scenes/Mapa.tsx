import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GEO, Label, MapLayer, regionD, Sfx, SOURCE, toScreen } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { camAt, Counter, DrawPath, ip, Kicker, Pin, Pulse, regionFill, TornCard, EASE_IO } from "../fx";

const RMVA = ["Ipatinga", "Coronel Fabriciano", "Santana do Paraíso"] as const;

export const Mapa: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidas("mapa");
  const tMG = b.word(0, "Minas");
  const tBH = b.word(0, "Belo");
  const tReg = b.at(1);
  const tRM = b.at(2);
  const cam = camAt(f, [
    { f: 0, c: { x: 0, y: -10, z: 0.82 } },
    { f: 10, c: { x: 0, y: -10, z: 0.9 } },
    { f: tMG + 14, c: { x: 222, y: 92, z: 4.4 } },
    { f: tBH + 30, c: { x: 252, y: 108, z: 6.2 } },
    { f: tReg + 22, c: { x: 276.9, y: 113.7, z: 112 } },
    { f: tRM - 4, c: { x: 276.6, y: 113.4, z: 118 } },
    { f: tRM + 26, c: { x: 276.6, y: 111.6, z: 74 } },
  ]);
  const z = cam.z;
  const munO = ip(z, [2.5, 4.5], [0, 1]);
  const mgZoomOut = ip(z, [12, 40], [1, 0]);
  const regO = ip(z, [20, 50], [0, 1]);
  const mgFill = ip(f, [tMG - 6, tMG + 10], [0, 1]);
  const timFill = regionFill(f, tReg + 6);
  const tim = GEO.points["Timóteo"];
  const bh = GEO.points["Belo Horizonte"];
  const sT = toScreen(cam, tim);
  const sB = toScreen(cam, bh);
  const inBH = f >= tBH && f < tReg + 6;
  const rmTimes = [b.word(2, "Ipatinga"), b.word(2, "Coronel"), b.word(2, "Santana")];
  return (
    <AbsoluteFill>
      <MapLayer cam={cam}>
        {GEO.states.map((s) => (
          <path
            key={s.name}
            d={s.d}
            fill={s.name === "Minas Gerais" ? C.marca : C.papelClaro}
            fillOpacity={s.name === "Minas Gerais" ? (0.25 + 0.6 * mgFill) * mgZoomOut : 1}
            stroke={C.cinza}
            strokeWidth={2 / z}
          />
        ))}
        <g opacity={munO}>
          {GEO.mgMun.map((m) => (
            <path key={m.name} d={m.d} fill="none" stroke={C.tinta2} strokeOpacity={0.28} strokeWidth={1 / z} />
          ))}
        </g>
        <path d={GEO.mgOutline} fill="none" stroke={C.tinta} strokeWidth={4 / z} />
        <g opacity={regO}>
          {GEO.region.map((r) => (
            <path key={r.name} d={r.d} fill={C.papelClaro} stroke={C.cinza} strokeWidth={1.6 / z} />
          ))}
          {RMVA.map((n, i) => (
            <path key={n} d={regionD(n)} fill={C.marca} fillOpacity={regionFill(f, rmTimes[i], 12)} stroke={C.tinta} strokeWidth={2.5 / z} />
          ))}
          <path d={GEO.rioPiracicaba} fill="none" stroke={C.rio} strokeWidth={5 / z} opacity={0.9} />
          <path d={GEO.rioDoce} fill="none" stroke={C.rio} strokeWidth={6 / z} opacity={0.9} />
        </g>
        <path d={GEO.timoteo} fill={C.aco} fillOpacity={timFill} stroke={C.tinta} strokeWidth={4 / z} opacity={regO} />
        {inBH ? <DrawPath d={`M${bh[0]},${bh[1]} L${tim[0]},${tim[1]}`} at={tBH + 6} dur={20} color={C.tinta} width={4 / z} dash={`${12 / z} ${10 / z}`} /> : null}
      </MapLayer>
      {/* rótulos */}
      <div style={{ opacity: ip(f, [6, 16], [0, 1]) * ip(f, [tMG, tMG + 10], [1, 0]) }}>
        <Label x={960 + (GEO.points["Brasília"][0] - cam.x) * z} y={540 + (GEO.points["Brasília"][1] - cam.y) * z - 30} size={30} color={C.tinta2}>
          BRASIL
        </Label>
      </div>
      <div style={{ opacity: ip(f, [tMG + 8, tMG + 18], [0, 1]) * ip(f, [tReg, tReg + 10], [1, 0]) }}>
        <Label x={toScreen(cam, [200, 70])[0]} y={toScreen(cam, [200, 70])[1]} size={64} style={{ fontWeight: 900, letterSpacing: 4 }}>
          MINAS GERAIS
        </Label>
      </div>
      {inBH ? (
        <>
          <Pin x={sB[0]} y={sB[1]} at={tBH} color={C.tinta2} label="Belo Horizonte" labelSide="left" size={44} out={tReg} />
          <Pin x={sT[0]} y={sT[1]} at={tBH + 8} color={C.aco} label="Timóteo" labelSide="right" size={50} out={tReg} />
          <div
            style={{
              position: "absolute",
              left: (sB[0] + sT[0]) / 2,
              top: (sB[1] + sT[1]) / 2 - 70,
              translate: "-50% 0",
              fontFamily: F.head,
              fontWeight: 900,
              fontSize: 54,
              background: C.marca,
              border: `4px solid ${C.tinta}`,
              padding: "2px 18px",
              rotate: "-6deg",
              opacity: ip(f, [tBH + 20, tBH + 30], [0, 1]) * ip(f, [tReg, tReg + 8], [1, 0]),
            }}
          >
            ≈ 200 km
          </div>
        </>
      ) : null}
      {/* RMVA */}
      {f > tRM ? (
        <>
          {(["Timóteo", ...RMVA] as const).map((n, i) => {
            const c = GEO.centroids[n];
            const s = toScreen(cam, c);
            const at = i === 0 ? tRM : rmTimes[i - 1];
            return (
              <Label key={n} x={s[0] + (n === "Coronel Fabriciano" ? -70 : n === "Ipatinga" ? 40 : 0)} y={s[1] + (n === "Ipatinga" ? 18 : 0)} size={i === 0 ? 40 : 32} opacity={ip(f, [at + 4, at + 14], [0, 1])} color={i === 0 ? C.papelClaro : C.tinta} bg={i === 0 ? C.tinta : undefined}>
                {n}
              </Label>
            );
          })}
          <Kicker style={{ position: "absolute", left: 90, top: 90, opacity: ip(f, [tRM + 4, tRM + 16], [0, 1]) }} color={C.tinta}>
            Região Metropolitana do Vale do Aço · núcleo
          </Kicker>
        </>
      ) : null}
      {/* ficha */}
      <TornCard x={1240} y={250} w={560} h={520} at={tReg + 18} out={tRM - 2} rot={2} seed="ficha">
        <div style={{ padding: "46px 50px" }}>
          <Kicker color={C.aco}>Ficha</Kicker>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 118, color: C.tinta, lineHeight: 1, marginTop: 18 }}>
            <Counter to={144} at={b.word(1, "cento")} dur={30} />
            <span style={{ fontSize: 60 }}> km²</span>
          </div>
          <div style={{ fontFamily: F.serif, fontSize: 30, color: C.tinta2, marginTop: 6 }}>de área total</div>
          <div style={{ height: 4, background: C.tinta, margin: "26px 0", width: ip(f, [b.word(1, "oitenta") - 6, b.word(1, "oitenta") + 6], [0, 460], EASE_IO) }} />
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 104, color: C.aco, lineHeight: 1 }}>
            <Counter to={81579} at={b.word(1, "oitenta")} dur={50} />
          </div>
          <div style={{ fontFamily: F.serif, fontSize: 30, color: C.tinta2, marginTop: 6 }}>habitantes · Censo 2022</div>
        </div>
      </TornCard>
      {f >= tReg + 6 && f < tRM ? <Pulse x={toScreen(cam, GEO.centroids["Timóteo"])[0]} y={toScreen(cam, GEO.centroids["Timóteo"])[1]} at={tReg + 6} color={C.aco} r={160} every={30} /> : null}
      <SOURCE opacity={ip(f, [tReg + 20, tReg + 30], [0, 1])}>IBGE · CENSO 2022</SOURCE>
      <Sfx at={4} name="whoosh" vol={0.4} />
      <Sfx at={tMG} name="whoosh-short" vol={0.35} />
      <Sfx at={tBH} name="pop" vol={0.4} />
      <Sfx at={tBH + 8} name="pop" vol={0.4} />
      <Sfx at={tReg} name="whoosh-cinematic" vol={0.35} />
      <Sfx at={tReg + 18} name="click-soft" vol={0.4} />
      {rmTimes.map((t, i) => (
        <Sfx key={i} at={t} name="pop" vol={0.35} />
      ))}
    </AbsoluteFill>
  );
};
