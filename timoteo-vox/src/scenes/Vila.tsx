import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { Icon, IconName } from "../icons";
import { Counter, DotGrid, Fade, Highlight, ip, Kicker, Pop, Smoke, SplitReveal, Callout, EASE_IO } from "../fx";

const CX = 960;
const CY = 520;

export const Vila: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidas("vila");
  const t200 = b.word(0, "200");
  const tVila = b.word(0, "vila");
  const t2mil = b.word(0, "mil.") - 8;
  const tFab = b.at(1);
  const tCasas = b.word(1, "Casas");
  const tEsc = b.word(1, "escolas");
  const tClu = b.word(1, "clubes");
  const tHos = b.word(1, "hospital");
  const tHier = b.at(2);
  const tFunc = b.word(2, "Funcionários");
  const tOper = b.word(2, "operários");
  const t58 = b.at(3);
  const tNum = b.word(3, "2.734");
  const tSplit = b.word(4, "lado");
  const tOutro = b.word(4, "outro");
  const fase1 = f < tFab;
  const fase2 = f >= tFab - 6 && f < t58;
  const fase3 = f >= t58 - 6 && f < tSplit;
  const amen = ip(f, [tHier - 2, tHier + 10], [1, 0]);
  const amenities: { t: number; icon: IconName; x: number; y: number; s: number; label: string }[] = [
    { t: tCasas, icon: "casa", x: CX - 560, y: CY - 250, s: 180, label: "casas" },
    { t: tCasas + 3, icon: "casa", x: CX - 700, y: CY - 10, s: 150, label: "" },
    { t: tCasas + 6, icon: "casa", x: CX - 520, y: CY + 170, s: 165, label: "" },
    { t: tEsc, icon: "escola", x: CX + 330, y: CY - 300, s: 200, label: "escolas" },
    { t: tClu, icon: "clube", x: CX + 520, y: CY - 30, s: 175, label: "clubes" },
    { t: tHos, icon: "hospital", x: CX + 330, y: CY + 190, s: 185, label: "hospital" },
  ];
  return (
    <AbsoluteFill>
      {/* Fase 1: 200 x 2.000 */}
      {fase1 || f < tFab + 10 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tFab - 8, tFab + 4], [1, 0]) }}>
          <Fade at={4} style={{ left: 150, top: 150 }}>
            <Kicker color={C.tinta2}>Povoado em 1944</Kicker>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 120, color: C.tinta, lineHeight: 1 }}>
              ~<Counter to={200} at={t200 - 6} dur={20} />
            </div>
            <div style={{ fontFamily: F.serif, fontSize: 34, color: C.tinta2 }}>moradores</div>
          </Fade>
          <DotGrid n={200} cols={20} at={t200 - 6} dur={24} x={170} y={470} gap={26} r={9} color={C.tinta2} />
          <Fade at={tVila - 4} style={{ left: 1000, top: 150 }}>
            <Kicker color={C.aco}>Vila operária prevista</Kicker>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 120, color: C.aco, lineHeight: 1 }}>
              <Counter to={2000} at={t2mil} dur={30} />
            </div>
            <div style={{ fontFamily: F.serif, fontSize: 34, color: C.tinta2 }}>habitantes</div>
          </Fade>
          <DotGrid n={2000} cols={64} at={t2mil} dur={40} x={1010} y={470} gap={13} r={4.6} color={C.aco} />
          <div style={{ position: "absolute", left: 870, top: 560, fontFamily: F.head, fontWeight: 900, fontSize: 90, color: C.tinta, opacity: ip(f, [t2mil + 30, t2mil + 40], [0, 1]) }}>
            ×10
          </div>
        </AbsoluteFill>
      ) : null}
      {/* Fase 2: a cidade da empresa */}
      {fase2 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tFab - 6, tFab + 6], [0, 1]) * ip(f, [t58 - 8, t58 + 2], [1, 0]) }}>
          {/* anéis da hierarquia */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <circle cx={CX} cy={CY + 40} r={250 * ip(f, [tFunc - 4, tFunc + 12], [0, 1], EASE_IO)} fill={C.marca} fillOpacity={0.35} stroke={C.tinta} strokeWidth={4} strokeDasharray="14 10" />
            <circle cx={CX} cy={CY + 40} r={430 * ip(f, [tOper - 4, tOper + 14], [0, 1], EASE_IO)} fill="none" stroke={C.tinta2} strokeWidth={4} strokeDasharray="6 10" />
          </svg>
          {/* casas por anel */}
          {new Array(7).fill(0).map((_, i) => {
            const a = (i / 7) * Math.PI * 2 + 0.3;
            return (
              <Pop key={`f${i}`} at={tFunc + 4 + i * 2} style={{ left: CX + Math.cos(a) * 185 - 40, top: CY + 40 + Math.sin(a) * 185 - 40 }}>
                <Icon name="casa" size={80} color={C.papelClaro} color2={C.marca} />
              </Pop>
            );
          })}
          {new Array(16).fill(0).map((_, i) => {
            const a = (i / 16) * Math.PI * 2 + 0.1;
            return (
              <Pop key={`o${i}`} at={tOper + 4 + i} style={{ left: CX + Math.cos(a) * 400 - 26, top: CY + 40 + Math.sin(a) * 360 - 26 }}>
                <Icon name="casa" size={52} color={C.papelEscuro} color2={C.tinta2} />
              </Pop>
            );
          })}
          {/* fábrica central */}
          <Smoke x={CX - 110} y={CY - 150} at={tFab} n={12} scale={0.9} seed="v1" />
          <Smoke x={CX - 40} y={CY - 110} at={tFab + 10} n={10} scale={0.8} seed="v2" />
          <Pop at={tFab} style={{ left: CX - 170, top: CY - 200 }}>
            <Icon name="fabrica" size={340} />
          </Pop>
          <div style={{ position: "absolute", left: CX - 110, top: CY + 150, fontFamily: F.head, fontWeight: 900, fontSize: 44, color: C.tinta, background: C.papelClaro, padding: "0 12px", opacity: ip(f, [tFab + 10, tFab + 20], [0, 1]) }}>
            USINA
          </div>
          <div style={{ opacity: amen }}>
            {amenities.map((a, i) => (
              <Pop key={i} at={a.t} style={{ left: a.x, top: a.y }}>
                <div style={{ textAlign: "center" }}>
                  <Icon name={a.icon} size={a.s} />
                  {a.label ? <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 52, color: C.tinta, marginTop: -6 }}>{a.label}</div> : null}
                </div>
              </Pop>
            ))}
          </div>
          {f >= tFunc ? (
            <Callout x={CX + 170} y={CY - 110} tx={CX + 330} ty={CY - 330} at={tFunc + 6} width={470}>
              <span style={{ color: C.aco }}>Funcionários</span>
              <div style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 28 }}>médicos, engenheiros e chefes, perto da usina</div>
            </Callout>
          ) : null}
          {f >= tOper ? (
            <Callout x={CX - 360} y={CY + 290} tx={CX - 600} ty={CY + 380} at={tOper + 6} width={420}>
              operários
              <div style={{ fontFamily: F.serif, fontWeight: 400, fontSize: 28 }}>mais longe da fábrica</div>
            </Callout>
          ) : null}
          <Fade at={tFab + 6} out={tHier - 6} style={{ left: 120, top: 110 }}>
            <Kicker>A cidade da empresa</Kicker>
          </Fade>
          <Fade at={tHier + 4} style={{ left: 120, top: 110 }}>
            <Kicker>A hierarquia virou mapa</Kicker>
          </Fade>
        </AbsoluteFill>
      ) : null}
      {/* Fase 3: 2.734 casas */}
      {fase3 ? (
        <AbsoluteFill style={{ opacity: ip(f, [t58 - 6, t58 + 6], [0, 1]) * ip(f, [tSplit - 8, tSplit], [1, 0]) }}>
          <div style={{ position: "absolute", left: 140, top: 110, display: "flex", alignItems: "baseline", gap: 30 }}>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 140, color: C.tinta, lineHeight: 1 }}>1958</div>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 140, color: C.aco, lineHeight: 1 }}>
              <Counter to={2734} at={tNum - 10} dur={50} />
            </div>
            <div style={{ fontFamily: F.serif, fontSize: 44, color: C.tinta2 }}>
              <Highlight at={tNum + 30}>casas da empresa</Highlight>
            </div>
          </div>
          <DotGrid n={2734} cols={110} at={tNum - 10} dur={50} x={170} y={350} gap={14.6} r={5.4} color={C.aco} shape="house" />
          <div style={{ position: "absolute", right: 120, top: 1000 - 70, fontFamily: F.mono, fontSize: 22, color: C.tinta2, opacity: ip(f, [tNum + 40, tNum + 50], [0, 0.8]) }}>
            cada ícone = 1 casa
          </div>
        </AbsoluteFill>
      ) : null}
      {/* Fase 4: dois núcleos */}
      {f >= tSplit - 2 ? (
        <SplitReveal
          at={tSplit}
          atRight={tOutro}
          leftBg={C.aco}
          rightBg={C.marca}
          left={
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <Icon name="fabrica" size={240} color={C.papelClaro} color2={C.acoEscuro} />
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 130, color: C.papelClaro, marginTop: 16 }}>ACESITA</div>
              <div style={{ fontFamily: F.serif, fontSize: 40, color: C.papelClaro }}>a vila da empresa · Centro-Norte</div>
            </AbsoluteFill>
          }
          right={
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <Icon name="venda" size={240} />
              <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 130, color: C.tinta, marginTop: 16 }}>TIMÓTEO</div>
              <div style={{ fontFamily: F.serif, fontSize: 40, color: C.tinta }}>o povoado antigo · Centro-Sul</div>
            </AbsoluteFill>
          }
        />
      ) : null}
      <Sfx at={t200 - 6} name="pop" vol={0.3} />
      <Sfx at={t2mil} name="riser" vol={0.25} dur={60} />
      <Sfx at={tFab} name="whoosh" vol={0.35} />
      {[tCasas, tEsc, tClu, tHos].map((t, i) => (
        <Sfx key={i} at={t} name="pop" vol={0.35} />
      ))}
      <Sfx at={tFunc} name="click-soft" vol={0.4} />
      <Sfx at={tOper} name="click-soft" vol={0.4} />
      <Sfx at={t58} name="whoosh-short" vol={0.3} />
      <Sfx at={tSplit} name="whoosh" vol={0.4} />
      <Sfx at={tOutro} name="whoosh" vol={0.4} />
    </AbsoluteFill>
  );
};
