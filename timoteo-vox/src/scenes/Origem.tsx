import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx } from "../common";
import { C, F } from "../theme";
import { batidas } from "../timing";
import { Icon } from "../icons";
import {
  Callout,
  DrawPath,
  Highlight,
  ip,
  Kicker,
  MaskReveal,
  Parallax,
  Pop,
  Stamp,
  TornCard,
  Typewriter,
  YearTicker,
  EASE_IO,
  Fade,
} from "../fx";

const RIO = "M-40,905 C220,860 360,960 600,915 C820,872 980,960 1220,925 C1460,890 1620,960 1980,915";
const ESTRADA = "M-40,820 C300,800 520,840 760,815 C980,792 1120,800 1300,790";

export const Origem: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidas("origem");
  const tGado = b.word(1, "gado");
  const tAlegre = b.word(1, "Alegre");
  const tTrop = b.word(2, "tropeiro");
  const tVenda = b.word(2, "venda");
  const tRib = b.word(2, "ribeirão");
  const tRef = b.word(3, "referência");
  const tRib2 = b.word(3, "Ribeirão");
  const tNome = b.word(3, "nome");
  const tDist = b.word(4, "distrito");
  const trop = ip(f, [tTrop - 10, tVenda + 30], [0, 1], EASE_IO);
  const tx = -160 + trop * 1330;
  const bob = Math.abs(Math.sin(f / 4)) * 8 * (trop > 0 && trop < 1 ? 1 : 0);
  const year = f < b.at(4) ? (
    <YearTicker from={1800} to={1831} at={b.at(1)} dur={30} />
  ) : (
    <YearTicker from={1831} to={1938} at={b.at(4)} dur={34} />
  );
  return (
    <AbsoluteFill>
      {/* céu / sol */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <circle cx={1580} cy={300} r={ip(f, [0, 30], [0, 110])} fill={C.marca} opacity={0.85} />
      </svg>
      {/* camadas de colinas com paralaxe (FX 27) */}
      <Parallax depth={0.4} dur={b.frames}>
        <svg width={2100} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d="M0,640 C240,520 420,600 640,540 C880,470 1080,600 1320,520 C1540,450 1760,560 2100,500 L2100,1080 L0,1080 Z" fill={C.mataClara} stroke={C.tinta} strokeWidth={4} opacity={ip(f, [0, 16], [0, 1])} />
        </svg>
      </Parallax>
      <Parallax depth={1} dur={b.frames}>
        <svg width={2200} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d="M0,720 C300,650 520,720 780,680 C1040,640 1260,720 1560,670 C1800,630 2000,700 2200,660 L2200,1080 L0,1080 Z" fill="#7FB287" stroke={C.tinta} strokeWidth={4} opacity={ip(f, [6, 20], [0, 1])} />
          <DrawPath d={ESTRADA} at={10} dur={30} color={C.terra} width={18} />
          <DrawPath d={RIO} at={tRib - 6} dur={40} color={C.rio} width={30} />
        </svg>
      </Parallax>
      {/* fazenda + gado */}
      <Pop at={b.at(1) + 10} style={{ left: 170, top: 560 }}>
        <Icon name="casa" size={190} />
      </Pop>
      {[0, 1, 2].map((i) => (
        <Pop key={i} at={tGado + i * 4} style={{ left: 380 + i * 120, top: 660 + (i % 2) * 30 }}>
          <Icon name="vaca" size={110} />
        </Pop>
      ))}
      {f >= tAlegre - 2 ? (
        <Pop at={tAlegre - 2} style={{ left: 190, top: 470 }}>
          <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 64, color: C.tinta }}>
            <Highlight at={tAlegre} dur={10}>“ALEGRE”</Highlight>
          </div>
        </Pop>
      ) : null}
      {/* tropeiro + venda */}
      {f >= tTrop - 10 ? (
        <div style={{ position: "absolute", left: tx, top: 690 - bob }}>
          <Icon name="tropeiro" size={150} />
        </div>
      ) : null}
      <Pop at={tVenda} style={{ left: 1170, top: 600 }}>
        <Icon name="venda" size={210} />
      </Pop>
      {f >= tRef - 4 ? (
        <Callout x={1275} y={620} tx={1420} ty={470} at={tRef - 4}>
          a venda vira
          <br />
          ponto de referência
        </Callout>
      ) : null}
      {f >= tRib2 ? (
        <div style={{ position: "absolute", left: 1330, top: 950, rotate: "-2deg" }}>
          <Typewriter text="Ribeirão de Timóteo" at={tRib2} cps={18} caret={false} style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 62, color: C.papelClaro, textShadow: `0 2px 0 ${C.tinta}` }} />
        </div>
      ) : null}
      {/* cabeçalho */}
      <Fade at={4} out={b.at(1) - 4} style={{ left: 120, top: 120 }}>
        <Kicker>Antes da indústria</Kicker>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 110, color: C.tinta, marginTop: 10 }}>Século XIX</div>
      </Fade>
      {/* ano grande */}
      <Fade at={b.at(1) - 2} style={{ left: 120, top: 90 }}>
        <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 190, color: C.tinta, lineHeight: 1, textShadow: `8px 8px 0 ${C.marca}` }}>{year}</div>
      </Fade>
      <TornCard x={1180} y={120} w={620} h={250} at={b.at(1) + 14} out={tTrop - 12} rot={2} seed="chico">
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "36px 40px" }}>
          <Icon name="pessoa" size={130} />
          <div>
            <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 38, color: C.tinta, lineHeight: 1.1 }}>Francisco de Paula e Silva</div>
            <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 48, color: C.aco }}>“Chico Santa Maria”</div>
          </div>
        </div>
      </TornCard>
      {/* nome */}
      {f >= tNome - 2 && f < b.at(4) ? (
        <AbsoluteFill style={{ alignItems: "center", top: -280 }}>
          <MaskReveal at={tNome - 2} dur={14} style={{ marginTop: 420 }}>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 200, color: C.tinta, background: C.marca, padding: "0 40px", border: `6px solid ${C.tinta}` }}>TIMÓTEO</div>
          </MaskReveal>
        </AbsoluteFill>
      ) : null}
      {/* 1938 distrito */}
      <TornCard x={1060} y={110} w={720} h={300} at={b.at(4) + 10} rot={-1.5} seed="decreto">
        <div style={{ padding: "34px 44px", display: "flex", gap: 24 }}>
          <Icon name="documento" size={130} />
          <div>
            <Kicker color={C.tinta2} style={{ fontSize: 24 }}>Decreto estadual nº 148</Kicker>
            <div style={{ fontFamily: F.serif, fontSize: 40, color: C.tinta, marginTop: 8, lineHeight: 1.2 }}>
              17/12/1938 · povoado elevado a <b>distrito de Timóteo</b>
            </div>
          </div>
        </div>
      </TornCard>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Stamp at={tDist} color={C.aco} rot={-7} style={{ fontSize: 120, top: 440 }}>
          Distrito
        </Stamp>
      </AbsoluteFill>
      <Sfx at={b.at(1)} name="whoosh-short" vol={0.3} />
      <Sfx at={tGado} name="pop" vol={0.35} />
      <Sfx at={tAlegre} name="click-soft" vol={0.4} />
      <Sfx at={tVenda} name="pop" vol={0.4} />
      <Sfx at={tRib2} name="typing" vol={0.22} dur={36} />
      <Sfx at={tNome - 2} name="whoosh-short" vol={0.35} />
      <Sfx at={b.at(4)} name="whoosh-short" vol={0.3} />
      <Sfx at={tDist} name="impact-bass-2" vol={0.55} />
    </AbsoluteFill>
  );
};
