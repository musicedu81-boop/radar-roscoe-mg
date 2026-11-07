import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { GEO, P, Sfx } from "../common";
import { Counter, ip, Shake, EASE_IO } from "../fx";
import { batidasShort } from "../timing";
import { Amassado, FS, Jornal, K } from "../short/kit";
import {
  Chicote,
  ElipseMao,
  EmPe,
  FC,
  FotoFundo,
  MapaSat,
  Marcador,
  MOSTARDA,
  Pincelada,
  Polaroide,
  Pontilhado,
  RotuloSerif,
} from "./pecas";

const Escuro: React.FC<{ jornal?: string[] }> = ({ jornal }) => (
  <>
    <Amassado escuro />
    {jornal ? <Jornal linhas={jornal} opacity={0.06} /> : null}
  </>
);

// =========================================================== 1. gancho
export const RGancho: React.FC = () => {
  const b = batidasShort("gancho");
  const tA = b.word(0, "Acesita");
  const tT = b.word(1, "Timóteo");
  const tM = b.word(2, "mesma");
  return (
    <Chicote>
      <Escuro jornal={["Vale do Aço", "Acesita", "Centro-Norte", "Centro-Sul", "Timóteo"]} />
      <FotoFundo src="fotos/predio_sel.jpg" pos="55% 20%" zoom={[1.0, 1.12]} dur={250} fade="linear-gradient(180deg, #000 60%, transparent 98%)" />
      <ElipseMao x={600} y={152} w={430} h={120} at={tA - 2} seed="g" />
      <RotuloSerif texto="Acesita" sub="Centro-Norte" x={70} y={230} at={tA} size={72} />
      <Polaroide src="fotos/saosebastiao_sel.jpg" x={570} y={190} w={370} h={280} at={b.at(1)} rot={6} texto="Timóteo?" textoAt={tT} pb={0} pos="45% 35%" de="dir" seed="g2" />
      <Pontilhado d="M 250 330 C 320 450, 450 470, 580 420" at={tT + 4} cor="#F2EFE8" />
      <Marcador texto="a mesma cidade!" x={60} y={455} at={tM - 4} size={62} cor={K.lima} rot={-5} cps={24} />
      <Sfx at={tA - 2} name="click-soft" vol={0.45} />
      <Sfx at={b.at(1)} name="whoosh-short" vol={0.35} />
      <Sfx at={tT} name="pop" vol={0.35} />
      <Sfx at={tM - 4} name="typing" vol={0.2} dur={30} />
    </Chicote>
  );
};

// =========================================================== 2. linha do tempo (1831 → 1944)
export const RAno: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidasShort("ano");
  const t44 = b.word(0, "1944");
  const marcos = [
    { ano: "1831", sub: "povoado do Alegre", y: 545, at: 6, lado: 1 },
    { ano: "1938", sub: "vira distrito: Timóteo", y: 365, at: 40, lado: -1 },
    { ano: "1944", sub: "nasce a Acesita", y: 175, at: t44 - 4, lado: 1 },
  ];
  const topo = ip(f, [4, 40, t44 - 4, t44 + 6], [560, 380, 380, 150], EASE_IO);
  return (
    <Chicote>
      <Amassado />
      {f >= t44 ? <Pincelada x={600} y={110} w={330} h={120} at={t44} cor={K.lima} seed="ano" /> : null}
      <div style={{ position: "absolute", left: 505, top: topo, width: 70, height: 600 - topo, background: MOSTARDA, boxShadow: "0 8px 14px rgba(0,0,0,0.3)" }}>
        <Img src={staticFile("tex/folha.jpg")} style={{ width: "100%", height: "100%", mixBlendMode: "multiply", opacity: 0.6 }} />
      </div>
      {marcos.map((m, i) => {
        const p = ip(f, [m.at, m.at + 8], [0, 1]);
        const u = ip(f, [m.at + 3, m.at + 12], [0, 1], EASE_IO);
        const grande = i === 2;
        return (
          <div key={m.ano} style={{ position: "absolute", top: m.y - (grande ? 70 : 40), left: m.lado > 0 ? 600 : 0, width: 480, textAlign: m.lado > 0 ? "left" : "right", paddingRight: m.lado > 0 ? 0 : 520 - 480 + 25, opacity: p }}>
            <div style={{ fontFamily: FS.serif, fontWeight: 700, fontSize: grande ? 120 : 64, color: "#1b1b1b", lineHeight: 1 }}>{m.ano}</div>
            <div style={{ height: 3, background: "#1b1b1b", width: `${u * (grande ? 300 : 170)}px`, marginLeft: m.lado > 0 ? 0 : "auto", marginTop: 4 }} />
            <div style={{ fontFamily: FC, fontSize: grande ? 36 : 30, color: "#2a2a2a", marginTop: 8 }}>{m.sub}</div>
          </div>
        );
      })}
      <Sfx at={6} name="click-soft" vol={0.35} />
      <Sfx at={40} name="click-soft" vol={0.35} />
      <Sfx at={t44 - 4} name="impact-bass-1" vol={0.6} />
    </Chicote>
  );
};

// =========================================================== 3. três motivos no mapa
export const RMotivos: React.FC = () => {
  const b = batidasShort("motivos");
  const tF = b.word(0, "ferrovia");
  const tA = b.word(0, "água");
  const tM = b.word(0, "mata");
  const TILT = 52;
  const cent = GEO.centroids["Timóteo"];
  return (
    <Chicote>
      <MapaSat cx={cent[0] - 0.4} cy={cent[1] - 0.2} escala={0.75} tilt={TILT} zoom={[1.0, 1.12]} dur={b.frames} rioAt={tA}>
        {(k, toPx) => {
          const loco = toPx(...P(-42.6, -19.528));
          const igreja = toPx(...P(-42.63, -19.55));
          return (
            <>
              <EmPe src="recortes/saojose.png" x={igreja[0]} y={igreja[1]} w={250} tilt={TILT} at={8} />
              <EmPe src="recortes/locomotiva.png" x={loco[0]} y={loco[1]} w={360} tilt={TILT} at={tF - 4} de="dir" />
            </>
          );
        }}
      </MapaSat>
      <Marcador texto="#1 a ferrovia" x={60} y={70} at={tF} size={56} cor="#fff" rot={-6} style={{ textShadow: "0 3px 8px rgba(0,0,0,0.8)" }} />
      <Pontilhado d="M 260 150 C 300 230, 330 260, 380 300" at={tF + 4} cor="#fff" />
      <Marcador texto="#2 a água" x={620} y={120} at={tA} size={56} cor="#fff" rot={5} style={{ textShadow: "0 3px 8px rgba(0,0,0,0.8)" }} />
      <Pontilhado d="M 740 200 C 700 260, 640 300, 600 340" at={tA + 4} cor="#fff" />
      <Polaroide src="fotos/mata.jpg" x={600} y={360} w={340} h={240} at={tM - 4} rot={7} texto="#3 a mata" textoAt={tM} pb={0.4} pos="50% 70%" de="dir" seed="m3" textoSize={46} />
      <Marcador texto="vira carvão" x={90} y={560} at={b.word(0, "carvão") - 4} size={54} cor={K.lima} rot={-4} style={{ textShadow: "0 3px 8px rgba(0,0,0,0.8)" }} />
      <Sfx at={tF - 4} name="whoosh-short" vol={0.35} />
      <Sfx at={tA} name="pop" vol={0.35} />
      <Sfx at={tM - 4} name="whoosh-short" vol={0.35} />
    </Chicote>
  );
};

// =========================================================== 4. nasce a Acesita, a vila
export const RVila: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidasShort("vila");
  const tV = b.word(0, "vila");
  const itens = [
    { t: b.word(0, "casas"), txt: "casas", x: 60, y: 380 },
    { t: b.word(0, "escolas"), txt: "escolas", x: 60, y: 480 },
    { t: b.word(0, "igreja"), txt: "igreja", x: 760, y: 380 },
    { t: b.word(0, "hospital"), txt: "hospital", x: 760, y: 480 },
  ];
  const fase2 = f >= tV - 4;
  return (
    <Chicote>
      <Escuro jornal={["Siderurgia", "Aços Especiais Itabira", "Vila operária", "1944"]} />
      {!fase2 || f < tV + 6 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tV - 4, tV + 6], [1, 0]) }}>
          <FotoFundo src="fotos/usina.jpg" pb={1} pos="50% 75%" zoom={[1.2, 1.32]} dur={90} fade="linear-gradient(180deg, transparent 0%, #000 25%, #000 65%, transparent 100%)" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center" }}>
            <div style={{ fontFamily: FS.serif, fontWeight: 700, fontSize: 64, color: "#F2EFE8", opacity: ip(f, [2, 10], [0, 1]) }}>Nasceu a</div>
            <div style={{ fontFamily: FS.serif, fontWeight: 900, fontSize: 150, color: MOSTARDA, lineHeight: 1, opacity: ip(f, [b.word(0, "Acesita") - 2, b.word(0, "Acesita") + 6], [0, 1]), textShadow: "0 6px 20px rgba(0,0,0,0.6)" }}>
              Acesita
            </div>
            <div style={{ fontFamily: FC, fontSize: 36, color: "#F2EFE8", marginTop: 14, opacity: ip(f, [b.word(0, "Acesita") + 8, b.word(0, "Acesita") + 16], [0, 1]) }}>31 de outubro de 1944</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {fase2 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tV - 4, tV + 6], [0, 1]) }}>
          <FotoFundo src="fotos/saojose_sel.jpg" at={tV - 4} pos="50% 40%" zoom={[1.0, 1.08]} dur={110} fade="linear-gradient(180deg, #000 70%, transparent 100%)" brilho={0.85} />
          <RotuloSerif texto="a vila operária" x={540} y={40} at={tV} size={60} alinhar="center" />
          {itens.map((it, i) => (
            <RotuloSerif key={i} texto={it.txt} x={it.x} y={it.y} at={it.t} size={52} cor={i === 2 ? MOSTARDA : "#F2EFE8"} />
          ))}
          <ElipseMao x={540} y={330} w={720} h={420} at={b.word(0, "igreja")} seed="vi" />
        </AbsoluteFill>
      ) : null}
      <Sfx at={b.word(0, "Acesita") - 2} name="impact-bass-2" vol={0.5} />
      <Sfx at={tV - 4} name="whoosh-short" vol={0.35} />
      {itens.map((it, i) => (
        <Sfx key={i} at={it.t} name="click-soft" vol={0.35} />
      ))}
    </Chicote>
  );
};

// =========================================================== 5. dois nomes (polaroides)
export const RNomes: React.FC = () => {
  const b = batidasShort("nomes");
  const tP = b.word(0, "povoado");
  return (
    <Chicote>
      <Amassado />
      <Polaroide src="fotos/saojose_sel.jpg" x={40} y={50} w={420} h={300} at={2} rot={-5} texto="Acesita" textoAt={b.word(0, "nome")} pb={0} seed="n1" de="esq" />
      <Marcador texto="vila da empresa" x={60} y={520} at={b.word(0, "vila")} size={44} rot={-4} />
      <Polaroide src="fotos/saosebastiao_sel.jpg" x={560} y={80} w={420} h={300} at={tP - 6} rot={5} texto="Timóteo" textoAt={b.word(0, "Timóteo")} pb={0} pos="45% 35%" seed="n2" de="dir" />
      <Marcador texto="povoado antigo" x={600} y={545} at={tP} size={44} rot={3} />
      <Pontilhado d="M 440 300 C 500 200, 560 200, 600 260" at={tP + 6} />
      <Sfx at={2} name="whoosh-short" vol={0.35} />
      <Sfx at={tP - 6} name="whoosh-short" vol={0.35} />
      <Sfx at={b.word(0, "Timóteo")} name="pop" vol={0.4} />
    </Chicote>
  );
};

// =========================================================== 6. plebiscito
export const RPlebiscito: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidasShort("plebiscito");
  const tC = b.word(0, "plebiscito") - 6;
  const tV = b.word(0, "maioria");
  const tB = b.word(0, "barrou");
  const total = 12861 + 4908;
  const pS = ip(f, [tV, tV + 24], [0, 12861 / total], EASE_IO);
  const pN = ip(f, [tV + 8, tV + 30], [0, 4908 / total], EASE_IO);
  return (
    <Chicote>
      <Shake at={[tB]} amp={10}>
        <Escuro jornal={["Plebiscito", "Acesita ou Timóteo", "Assembleia Legislativa", "1979 · 1981"]} />
        <div style={{ position: "absolute", left: 60, top: 40, opacity: ip(f, [tC, tC + 8], [0, 1]), rotate: "-3deg", width: 560 }}>
          <Img src={staticFile("tex/folha.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", boxShadow: "0 14px 24px rgba(0,0,0,0.5)" }} />
          <div style={{ position: "relative", padding: "34px 36px" }}>
            <div style={{ fontFamily: FC, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: "#333" }}>PLEBISCITO · 1979–1981</div>
            <div style={{ fontFamily: FS.serif, fontWeight: 700, fontSize: 56, lineHeight: 1.04, color: "#111", marginTop: 14 }}>
              Trocar o nome da cidade para <span style={{ background: MOSTARDA, padding: "0 6px" }}>Acesita</span>?
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 650, top: 70, width: 380, opacity: ip(f, [tV - 2, tV + 6], [0, 1]) }}>
          {[
            { lab: "A FAVOR", p: pS, v: 12861, at: tV, cor: MOSTARDA },
            { lab: "CONTRA", p: pN, v: 4908, at: tV + 8, cor: "#F2EFE8" },
          ].map((r, i) => (
            <div key={i} style={{ marginBottom: 30 }}>
              <div style={{ fontFamily: FC, fontWeight: 700, fontSize: 30, color: "#F2EFE8", letterSpacing: 3 }}>{r.lab}</div>
              <div style={{ height: 70, position: "relative", background: "rgba(255,255,255,0.08)" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${r.p * 100}%`, background: r.cor }} />
                <div style={{ position: "absolute", left: 14, top: 6, fontFamily: FS.serif, fontWeight: 700, fontSize: 48, color: "#111" }}>
                  <Counter to={r.v} at={r.at} dur={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <ElipseMao x={840} y={175} w={420} h={140} at={tV + 26} seed="pl" />
        {f >= tB - 2 ? (
          <svg width={1080} height={810} style={{ position: "absolute", inset: 0 }}>
            <path d="M 80 150 L 600 420" stroke="#D8231B" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ip(f, [tB - 2, tB + 6], [0, 1])} />
          </svg>
        ) : null}
        <Marcador texto="barrado pela Assembleia" x={120} y={520} at={tB} size={66} cor="#E5372C" rot={-5} cps={26} />
      </Shake>
      <Sfx at={tC} name="whoosh-short" vol={0.35} />
      <Sfx at={tV} name="riser" vol={0.22} dur={40} />
      <Sfx at={tB} name="impact-bass-1" vol={0.6} />
    </Chicote>
  );
};

// =========================================================== 7. o parque
export const RParque: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidasShort("parque");
  const tB = b.at(1);
  const tT = b.word(1, "terço");
  const cent = GEO.centroids["Timóteo"];
  return (
    <Chicote>
      {f < tB + 8 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tB - 2, tB + 8], [1, 0]) }}>
          <Amassado />
          <div style={{ position: "absolute", left: 60, top: 40 }}>
            <Pincelada x={-10} y={20} w={330} h={120} at={b.word(0, "1944")} />
            <div style={{ position: "relative", fontFamily: FS.serif, fontWeight: 700, fontSize: 120, color: "#1b1b1b", lineHeight: 1, opacity: ip(f, [b.word(0, "1944") - 2, b.word(0, "1944") + 4], [0, 1]) }}>1944</div>
            <div style={{ fontFamily: FC, fontSize: 36, color: "#222", marginTop: 6, opacity: ip(f, [b.word(0, "herança") - 4, b.word(0, "herança") + 4], [0, 1]) }}>outra herança</div>
          </div>
          <Polaroide src="fotos/orbital.jpg" x={70} y={250} w={280} h={230} at={b.word(0, "mesmo") - 4} rot={-8} texto="visto do espaço" pb={0.1} seed="pq2" de="esq" textoSize={38} />
          <Polaroide src="fotos/lagoa.jpg" x={470} y={70} w={470} h={340} at={b.word(0, "nasceu") - 6} rot={5} texto="Parque Est. do Rio Doce" textoAt={b.word(0, "Parque")} pb={0.15} seed="pq1" de="dir" textoSize={44} />
          <Pontilhado d="M 370 420 C 420 470, 440 470, 480 430" at={b.word(0, "Parque")} />
        </AbsoluteFill>
      ) : null}
      {f >= tB - 2 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tB - 2, tB + 8], [0, 1]) }}>
          <MapaSat cx={cent[0] + 0.5} cy={cent[1]} escala={0.8} tilt={34} zoom={[1.0, 1.08]} dur={b.frames - tB} parqueAt={tT - 6} />
          <div style={{ position: "absolute", left: 60, top: 60, opacity: ip(f, [tT - 4, tT + 4], [0, 1]) }}>
            <div style={{ display: "inline-block", background: "#151515", padding: "4px 26px 0", rotate: "-3deg", boxShadow: "0 12px 24px rgba(0,0,0,0.5)" }}>
              <div style={{ fontFamily: FS.serif, fontWeight: 900, fontSize: 170, color: MOSTARDA, lineHeight: 1 }}>
                <Counter to={37} at={tT - 4} dur={20} suffix="%" />
              </div>
            </div>
          </div>
          <Marcador texto="é Mata Atlântica protegida" x={60} y={330} at={b.word(1, "Mata") - 2} size={52} cor="#fff" rot={-4} cps={24} style={{ textShadow: "0 3px 8px rgba(0,0,0,0.85)" }} />
        </AbsoluteFill>
      ) : null}
      <Sfx at={b.word(0, "1944")} name="impact-bass-2" vol={0.45} />
      <Sfx at={b.word(0, "nasceu") - 6} name="whoosh-short" vol={0.35} />
      <Sfx at={tB} name="whoosh" vol={0.35} />
      <Sfx at={tT - 4} name="riser" vol={0.22} dur={30} />
    </Chicote>
  );
};

// =========================================================== 8. final
export const RFinal: React.FC = () => {
  const b = batidasShort("final");
  const tD = b.word(0, "duas");
  return (
    <Chicote>
      <Escuro jornal={["Acesita", "Timóteo", "1944", "Aço", "Floresta"]} />
      <Polaroide src="fotos/usina.jpg" x={40} y={60} w={440} h={300} at={2} rot={-6} texto="Acesita?" textoAt={b.word(0, "Acesita")} pb={1} pos="50% 70%" seed="f1" de="esq" />
      <Polaroide src="fotos/lagoa.jpg" x={570} y={60} w={440} h={300} at={b.word(0, "Timóteo") - 6} rot={5} texto="Timóteo?" textoAt={b.word(0, "Timóteo")} pb={0.2} seed="f2" de="dir" />
      {useCurrentFrame() >= tD - 2 ? <Pincelada x={300} y={455} w={480} h={130} at={tD - 2} seed="fd" /> : null}
      <Marcador texto="as duas." x={330} y={452} at={tD - 2} size={92} rot={-3} cps={20} />
      <Marcador texto="aço + floresta, 1944" x={270} y={572} at={b.word(1, "Aço")} size={46} cor="#F2EFE8" rot={-2} cps={22} />
      <Sfx at={2} name="whoosh-short" vol={0.35} />
      <Sfx at={b.word(0, "Timóteo") - 6} name="whoosh-short" vol={0.35} />
      <Sfx at={tD - 2} name="impact-bass-2" vol={0.5} />
    </Chicote>
  );
};

// =========================================================== 9. encerramento
export const RFim: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Chicote>
      <Escuro jornal={["Timóteo", "Vale do Aço", "Minas Gerais"]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", opacity: ip(f, [0, 10], [0, 1]) }}>
        <div style={{ fontFamily: FS.serif, fontWeight: 700, fontSize: 92, color: "#F2EFE8" }}>uma cidade,</div>
        <div style={{ fontFamily: FS.serif, fontWeight: 900, fontSize: 120, color: MOSTARDA, lineHeight: 1 }}>dois nomes</div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 470, textAlign: "center", fontFamily: FC, fontSize: 24, lineHeight: 1.6, color: "#bdbdbd", opacity: ip(f, [12, 24], [0, 1]) }}>
        Fotos: HVL, Fernando Marino, Tico-Tico (Wikimedia Commons, CC BY / CC BY-SA) · NASA
        <br />
        Fontes: Wikipédia, IBGE · Locução: HyperFrames TTS · Animação: Remotion
      </div>
    </Chicote>
  );
};
