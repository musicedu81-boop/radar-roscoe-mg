import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GEO, Label, MapLayer, P, Sfx, SOURCE, toScreen } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { Icon } from "../icons";
import {
  camAt,
  Callout,
  Counter,
  DrawPath,
  Fade,
  HatchDefs,
  Highlight,
  ip,
  Kicker,
  Pop,
  SqueezeArrows,
  Strike,
  EASE_IO,
  fmt,
} from "../fx";

const POP = [
  { a: 1970, v: 32760 },
  { a: 1980, v: 50601 },
  { a: 1991, v: 58298 },
  { a: 2000, v: 71478 },
  { a: 2010, v: 81243 },
  { a: 2022, v: 81579 },
];

export const Espremida: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidas("espremida");
  const tRio = b.word(1, "rio.");
  const tSerra = b.word(1, "serras,");
  const tPico = b.word(1, "Pico");
  const tRes = b.at(2);
  const tChart = b.word(2, "Entre");
  const tMeio = b.word(2, "menos");
  const tEsp = b.word(3, "espalha.");
  const tAd = b.word(3, "adensa.");
  const cam = camAt(f, [
    { f: 0, c: { x: 275.4, y: 113.9, z: 285 } },
    { f: tChart - 10, c: { x: 275.4, y: 113.9, z: 285 } },
    { f: tChart + 14, c: { x: 276.95, y: 113.95, z: 215 } },
    { f: b.at(3) - 4, c: { x: 276.95, y: 113.95, z: 215 } },
    { f: b.at(3) + 20, c: { x: 274.75, y: 113.8, z: 420 } },
  ]);
  const z = cam.z;
  const urbCenter = toScreen(cam, P(-42.633, -19.558));
  const pico = toScreen(cam, GEO.points["Pico do Ana Moura"]);
  // gráfico
  const CH = { x: 1200, y: 300, w: 600, h: 380 };
  const minA = 1970;
  const maxA = 2022;
  const px = (a: number) => CH.x + ((a - minA) / (maxA - minA)) * CH.w;
  const py = (v: number) => CH.y + CH.h - (v / 90000) * CH.h;
  const lineD = "M" + POP.slice(0, 5).map((p) => `${px(p.a)},${py(p.v)}`).join(" L");
  const lastD = `M${px(2010)},${py(81243)} L${px(2022)},${py(81579)}`;
  const chartO = ip(f, [tChart - 4, tChart + 8], [0, 1]) * ip(f, [b.at(3) - 6, b.at(3) + 4], [1, 0]);
  return (
    <AbsoluteFill>
      <MapLayer cam={cam}>
        <HatchDefs id="hatchE" color={C.mata} bg={C.mataClara} size={0.05} width={0.016} />
        <path d={GEO.region.find((r) => r.name === "Coronel Fabriciano")!.d} fill={C.papelEscuro} stroke={C.cinza} strokeWidth={1.5 / z} />
        <path d={GEO.region.find((r) => r.name === "Ipatinga")!.d} fill={C.papelEscuro} stroke={C.cinza} strokeWidth={1.5 / z} />
        <path d={GEO.timoteo} fill={C.papelClaro} stroke={C.tinta} strokeWidth={5 / z} />
        <path d={GEO.parqueTimoteo} fill="url(#hatchE)" opacity={ip(f, [6, 22], [0, 1], EASE_IO)} stroke={C.mata} strokeWidth={3 / z} />
        <path d={GEO.timoteoUrbano} fill={C.marca} fillOpacity={0.35 * ip(f, [tRes, tRes + 14], [0, 1])} />
        <DrawPath d={GEO.rioPiracicaba} at={tRio - 6} dur={24} color={C.rio} width={14 / z} />
        {/* prédios: a cidade se adensa */}
        {GEO.predios.map(([x, y], i) => {
          const t0 = tAd - 6 + (i % 23);
          const h = ip(f, [t0, t0 + 14], [0, 1], EASE_IO) * (0.12 + ((i * 53) % 10) / 45);
          if (h <= 0) return null;
          const w = 0.07;
          return <rect key={i} x={x - w / 2} y={y - h} width={w} height={h} fill={i % 4 === 0 ? C.aco : C.tinta2} stroke={C.tinta} strokeWidth={1.2 / z} />;
        })}
      </MapLayer>
      {/* rótulos */}
      <Fade at={10} out={tChart - 8} style={{ left: 1150, top: 640 }}>
        <div style={{ background: C.mata, color: C.papelClaro, fontFamily: F.head, fontWeight: 900, fontSize: 92, padding: "0 26px", border: `5px solid ${C.tinta}`, boxShadow: `8px 8px 0 ${C.tinta}` }}>
          <Counter to={37} at={14} dur={30} suffix="%" />
        </div>
        <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 40, color: C.tinta, marginTop: 14, maxWidth: 560, background: C.papelClaro, border: `3px solid ${C.tinta}`, padding: "8px 16px" }}>do território dentro do Parque Estadual do Rio Doce</div>
      </Fade>
      <Fade at={tRio - 2} out={tChart - 8} style={{ left: toScreen(cam, P(-42.62, -19.522))[0] - 120, top: toScreen(cam, P(-42.62, -19.522))[1] - 110 }}>
        <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 60, color: C.rio, rotate: "-4deg" }}>rio Piracicaba ↓</div>
      </Fade>
      {[0, 1, 2].map((i) => (
        <Pop key={i} at={tSerra + i * 3} style={{ left: 70 + i * 70, top: 470 + (i % 2) * 60 }} out={tChart - 6}>
          <Icon name="montanha" size={120} />
        </Pop>
      ))}
      {f >= tPico ? (
        <Callout x={pico[0]} y={pico[1]} tx={pico[0] + 90} ty={pico[1] + 300} at={tPico} out={tChart - 8} width={400}>
          Pico do Ana Moura
          <div style={{ fontFamily: F.mono, fontSize: 30, color: C.aco }}>864 m</div>
        </Callout>
      ) : null}
      {f >= tRes && f < tChart + 6 ? (
        <div style={{ opacity: ip(f, [tChart - 6, tChart + 4], [1, 0]) }}>
          <SqueezeArrows cx={urbCenter[0]} cy={urbCenter[1]} at={tRes + 4} r={300} dirs={[270, 0, 180, 90]} />
          <Fade at={tRes + 8} style={{ left: 120, top: 100 }}>
            <Kicker color={C.tinta}>pouco espaço para crescer</Kicker>
          </Fade>
        </div>
      ) : null}
      {/* gráfico de população */}
      {f >= tChart - 4 ? (
        <div style={{ position: "absolute", inset: 0, opacity: chartO }}>
          <div style={{ position: "absolute", left: CH.x - 40, top: CH.y - 150, width: CH.w + 120, height: CH.h + 260, background: C.papelClaro, border: `4px solid ${C.tinta}`, boxShadow: `8px 8px 0 ${C.tinta}` }} />
          <div style={{ position: "absolute", left: CH.x, top: CH.y - 120 }}>
            <Kicker color={C.tinta2} style={{ fontSize: 24 }}>População de Timóteo · Censos</Kicker>
          </div>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <line x1={CH.x} y1={CH.y + CH.h} x2={CH.x + CH.w} y2={CH.y + CH.h} stroke={C.tinta} strokeWidth={3} />
            <DrawPath d={lineD} at={tChart} dur={24} color={C.tinta2} width={6} />
            <DrawPath d={lastD} at={tChart + 24} dur={12} color={C.aco} width={10} />
            {POP.map((p, i) => {
              const o = ip(f, [tChart + i * 5, tChart + i * 5 + 6], [0, 1]);
              return (
                <g key={p.a} opacity={o}>
                  <circle cx={px(p.a)} cy={py(p.v)} r={9} fill={i === 5 ? C.aco : C.tinta2} stroke={C.tinta} strokeWidth={2} />
                  <text x={px(p.a)} y={CH.y + CH.h + 36} fontFamily={F.mono} fontSize={22} textAnchor="middle" fill={C.tinta2}>
                    {p.a}
                  </text>
                  {i === 0 || i >= 4 ? (
                    <text x={px(p.a) + (i === 0 ? 14 : 0)} y={py(p.v) - 22} fontFamily={F.mono} fontWeight={700} fontSize={22} textAnchor={i === 0 ? "start" : "middle"} fill={C.tinta}>
                      {fmt(p.v)}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
          <Pop at={tMeio} style={{ left: CH.x + CH.w - 210, top: CH.y + 90 }}>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 64, color: C.papelClaro, background: C.aco, padding: "0 18px", border: `4px solid ${C.tinta}`, rotate: "-4deg" }}>+0,4%</div>
          </Pop>
          <div style={{ position: "absolute", left: CH.x, top: CH.y + CH.h + 60, fontFamily: F.serif, fontSize: 28, color: C.tinta2 }}>2010 → 2022: praticamente estável</div>
          <SOURCE>IBGE · CENSOS 1970–2022</SOURCE>
        </div>
      ) : null}
      {/* não se espalha / se adensa */}
      {f >= b.at(3) - 4 ? (
        <Fade at={b.at(3) - 4} style={{ left: 110, top: 90 }}>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 78, color: C.tinta, lineHeight: 1.15, background: "rgba(251,248,241,0.88)", padding: "6px 22px" }}>
            <Strike at={tEsp}>se espalha</Strike>
            <br />
            <Highlight at={tAd}>se adensa</Highlight>
          </div>
        </Fade>
      ) : null}
      <Label x={toScreen(cam, P(-42.55, -19.555))[0]} y={toScreen(cam, P(-42.55, -19.555))[1]} size={34} color={C.mata} opacity={ip(f, [18, 30], [0, 1]) * ip(f, [tChart - 10, tChart], [1, 0])}>
        PARQUE
      </Label>
      <Sfx at={14} name="ping" vol={0.3} />
      <Sfx at={tRio - 6} name="whoosh-short" vol={0.3} />
      <Sfx at={tSerra} name="pop" vol={0.3} />
      <Sfx at={tPico} name="click-soft" vol={0.35} />
      <Sfx at={tRes + 4} name="impact-bass-2" vol={0.35} />
      <Sfx at={tChart} name="whoosh" vol={0.3} />
      <Sfx at={tMeio} name="pop" vol={0.4} />
      <Sfx at={tEsp} name="click-soft" vol={0.4} />
      <Sfx at={tAd - 4} name="riser" vol={0.22} dur={50} />
    </AbsoluteFill>
  );
};
