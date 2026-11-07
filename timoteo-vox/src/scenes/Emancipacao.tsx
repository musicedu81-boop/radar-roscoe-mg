import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { GEO, Label, MapLayer, P, regionD, Sfx, toScreen } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { Icon, IconName } from "../icons";
import { Fade, ip, Kicker, LightLeak, Shake, Stamp, EASE_IO } from "../fx";
import { ACESITA_LL } from "./Abertura";

const CAM = { x: 275.3, y: 112.9, z: 130 };

export const Emancipacao: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidas("emancipacao");
  const tPert = b.word(0, "pertencer");
  const tArr = b.word(0, "arrecadação");
  const tCards = b.at(1);
  const tAprov = b.word(1, "aprovada");
  const tVeto = b.word(1, "Vetada");
  const tAlian = b.word(1, "aliança");
  const t64 = b.at(2);
  const tMun = b.word(2, "1964,");
  const z = CAM.z;
  const merged = ip(f, [tPert, tPert + 16], [0, 1], EASE_IO) * ip(f, [tMun - 4, tMun + 6], [1, 0]);
  const split = ip(f, [tMun - 4, tMun + 10], [0, 1], EASE_IO);
  const mapDim = ip(f, [tCards - 4, tCards + 8], [1, 0.25]) * 1 + ip(f, [t64 - 6, t64 + 6], [0, 0.75]);
  const usina = toScreen(CAM, P(...ACESITA_LL));
  const fab = toScreen(CAM, GEO.centroids["Coronel Fabriciano"]);
  const cards: { t: number; icon: IconName; ano: string; txt: string }[] = [
    { t: tAprov, icon: "check", ano: "1962", txt: "Assembleia aprova a emancipação" },
    { t: tVeto, icon: "x", ano: "em seguida", txt: "Governador veta" },
    { t: tAlian, icon: "corrente", ano: "depois", txt: "Aliança política se desfaz" },
  ];
  return (
    <AbsoluteFill>
      <Shake at={[tMun]} amp={14}>
        <AbsoluteFill style={{ opacity: mapDim }}>
          <MapLayer cam={CAM}>
            {GEO.region.map((r) => (
              <path key={r.name} d={r.d} fill={C.papelClaro} stroke={C.cinza} strokeWidth={1.5 / z} />
            ))}
            <path d={regionD("Coronel Fabriciano")} fill={C.terra} stroke={C.tinta} strokeWidth={3 / z} />
            <path d={regionD("Ipatinga")} fill={C.terra} fillOpacity={merged} stroke={C.tinta} strokeWidth={3 / z} />
            <g transform={`translate(0 ${split * 0.12})`}>
              <path
                d={GEO.timoteo}
                fill={interpolate(split, [0, 1], [0, 1]) > 0.5 ? C.aco : C.terra}
                fillOpacity={Math.max(merged, split)}
                stroke={C.tinta}
                strokeWidth={(3 + split * 4) / z}
              />
            </g>
            <path d={GEO.rioPiracicaba} fill="none" stroke={C.rio} strokeWidth={6 / z} />
          </MapLayer>
          <Label x={fab[0]} y={fab[1]} size={40} opacity={ip(f, [8, 18], [0, 1])}>
            Coronel Fabriciano
          </Label>
          <Label x={toScreen(CAM, GEO.centroids["Ipatinga"])[0]} y={toScreen(CAM, GEO.centroids["Ipatinga"])[1]} size={32} opacity={ip(f, [tPert, tPert + 12], [0, 1])}>
            distrito de Ipatinga
          </Label>
          <Label x={toScreen(CAM, GEO.centroids["Timóteo"])[0] - 60} y={toScreen(CAM, GEO.centroids["Timóteo"])[1] + 40} size={40} opacity={ip(f, [6, 16], [0, 1])} color={split > 0.5 ? C.papelClaro : C.tinta} bg={split > 0.5 ? C.tinta : undefined}>
            {split > 0.5 ? "MUNICÍPIO DE TIMÓTEO" : "distrito de Timóteo"}
          </Label>
          {/* moedas: arrecadação da usina indo para Fabriciano */}
          {f >= tArr - 4 && f < tCards + 10
            ? new Array(6).fill(0).map((_, i) => {
                const t = ((f - tArr + i * 9) % 54) / 54;
                const x = interpolate(t, [0, 1], [usina[0], fab[0]]);
                const y = interpolate(t, [0, 1], [usina[1], fab[1]]) - Math.sin(t * Math.PI) * 140;
                return (
                  <div key={i} style={{ position: "absolute", left: x - 32, top: y - 32, opacity: Math.sin(t * Math.PI) * ip(f, [tArr - 4, tArr + 6], [0, 1]) }}>
                    <Icon name="moeda" size={64} />
                  </div>
                );
              })
            : null}
          {f >= tArr - 4 ? (
            <div style={{ position: "absolute", left: usina[0] - 40, top: usina[1] - 40, opacity: ip(f, [tArr - 4, tArr + 6], [0, 1]) }}>
              <Icon name="fabrica" size={90} />
            </div>
          ) : null}
        </AbsoluteFill>
        <Fade at={4} out={tCards - 6} style={{ left: 90, top: 90, background: C.papelClaro, border: `4px solid ${C.tinta}`, boxShadow: `7px 7px 0 ${C.tinta}`, padding: "18px 28px" }}>
          <Kicker>1948</Kicker>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 64, color: C.tinta, marginTop: 8, maxWidth: 640, lineHeight: 1.05 }}>Timóteo vira distrito de Fabriciano</div>
        </Fade>
        <Fade at={tArr + 6} out={tCards - 6} style={{ right: 120, top: 760 }}>
          <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 64, color: C.aco, rotate: "-3deg" }}>a arrecadação da usina →</div>
        </Fade>
        {/* cartões da disputa */}
        {f >= tCards - 4 && f < t64 + 6 ? (
          <AbsoluteFill style={{ opacity: ip(f, [t64 - 6, t64 + 4], [1, 0]) }}>
            <Fade at={tCards} style={{ left: 120, top: 120 }}>
              <Kicker>A longa emancipação</Kicker>
            </Fade>
            <div style={{ position: "absolute", left: 120, top: 260, display: "flex", gap: 40 }}>
              {cards.map((c, i) => {
                const p = ip(f, [c.t - 4, c.t + 10], [0, 1]);
                return (
                  <div
                    key={i}
                    style={{
                      width: 530,
                      height: 430,
                      background: C.papelClaro,
                      border: `5px solid ${C.tinta}`,
                      boxShadow: `9px 9px 0 ${C.tinta}`,
                      padding: 36,
                      opacity: p,
                      rotate: `${(i - 1) * 2}deg`,
                      translate: `0 ${(1 - p) * 80}px`,
                    }}
                  >
                    <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 34, color: C.tinta2 }}>{c.ano}</div>
                    <div style={{ marginTop: 22 }}>
                      <Icon name={c.icon} size={130} color={c.icon === "corrente" ? C.aco : undefined} />
                    </div>
                    <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 52, color: C.tinta, marginTop: 24, lineHeight: 1.05 }}>{c.txt}</div>
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
        ) : null}
        {/* 29 de abril de 1964 */}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Stamp at={tMun} color={C.aco} rot={-6} style={{ fontSize: 110, top: 160, background: "rgba(251,248,241,0.85)" }}>
            Município · 29/04/1964
          </Stamp>
        </AbsoluteFill>
        <LightLeak at={tMun} dur={80} opacity={0.4} />
      </Shake>
      <Sfx at={tPert} name="whoosh-short" vol={0.3} />
      <Sfx at={tArr} name="sparkle" vol={0.25} />
      <Sfx at={tAprov} name="ping" vol={0.4} />
      <Sfx at={tVeto} name="click-soft" vol={0.55} />
      <Sfx at={tAlian} name="click-soft" vol={0.45} />
      <Sfx at={tMun} name="impact-bass-1" vol={0.65} />
    </AbsoluteFill>
  );
};
