import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { GEO } from "../common";
import { Counter, ip, Shake, EASE_IO } from "../fx";
import { batidasShort } from "../timing";
import { Sfx } from "../common";
import terreno from "../data/terreno.json";
import {
  Amassado,
  CarimboV,
  CirculoPincel,
  Entra,
  FS,
  Fita,
  Foto,
  Jornal,
  K,
  Marca,
  rasgado,
  Recorte,
  Selo,
  Serif,
  Seta,
  SW,
} from "./kit";

const Rotulo: React.FC<{ texto: string; at: number; x: number; y: number; rot?: number; fundo?: string; cor?: string; size?: number }> = ({
  texto,
  at,
  x,
  y,
  rot = -3,
  fundo = K.lima,
  cor = K.tinta,
  size = 96,
}) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + 7], [0, 1]);
  if (f < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        rotate: `${rot}deg`,
        scale: String(0.7 + 0.3 * p),
        opacity: p,
        background: fundo,
        color: cor,
        fontFamily: FS.cond,
        fontSize: size,
        lineHeight: 1.05,
        padding: "4px 26px 0",
        letterSpacing: 2,
        boxShadow: "0 10px 18px rgba(0,0,0,0.35)",
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </div>
  );
};

/** Faixa escura rasgada atravessando a tela (como na referência). */
const Faixa: React.FC<{ y: number; h: number; at: number; children: React.ReactNode; seed?: string; out?: number }> = ({ y, h, at, children, seed = "fx", out }) => {
  const f = useCurrentFrame();
  const p = ip(f, [at, at + 8], [0, 1], EASE_IO);
  const o = out !== undefined ? ip(f, [out, out + 8], [1, 0]) : 1;
  if (f < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: -20,
        top: y,
        width: SW + 40,
        height: h,
        clipPath: rasgado(seed, { top: true, bottom: true }, 7, 0),
        background: "#151515",
        translate: `${(1 - p) * -1200}px 0`,
        opacity: o,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        <Img src={staticFile("tex/amassado-escuro.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};

// =========================================================== 1. gancho
export const Gancho: React.FC = () => {
  const b = batidasShort("gancho");
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/predio_acesita.jpg" x={60} y={180} w={960} h={640} at={4} rot={-3} de="cima" seed="g1" pos="50% 50%" zoom={[1.0, 1.05]} dur={250} />
      <CirculoPincel x={600} y={272} w={440} h={140} at={b.word(0, "Acesita")} seed="g1c" largura={18} />
      <Fita texto="“eu moro na Acesita”" x={110} y={760} at={b.word(0, "mora")} rot={-4} size={50} />
      <Foto src="fotos/saosebastiao.jpg" x={40} y={880} w={1000} h={560} at={b.at(1)} rot={2.5} de="baixo" seed="g2" pos="40% 30%" pb={0.75} dur={200} />
      <Fita texto="“eu moro em Timóteo”" x={420} y={1390} at={b.word(1, "mora")} rot={3} size={50} />
      <Faixa y={735} h={210} at={b.at(2)} seed="g3">
        <Serif size={112} cor="#fff" italic>
          a <Marca at={b.word(2, "mesma")}><span style={{ color: K.tinta }}>mesma</span></Marca> cidade.
        </Serif>
      </Faixa>
      <Seta de={[930, 760]} ate={[800, 330]} curva={-90} at={b.word(2, "mesma")} seed="g4" largura={24} />
      <Seta de={[150, 940]} ate={[300, 1120]} curva={-80} at={b.word(2, "cidade") - 2} seed="g5" largura={24} />
      <Sfx at={4} name="whoosh-short" vol={0.35} />
      <Sfx at={b.word(0, "Acesita")} name="click-soft" vol={0.45} />
      <Sfx at={b.word(0, "mora")} name="typing" vol={0.22} dur={30} />
      <Sfx at={b.at(1)} name="whoosh-short" vol={0.35} />
      <Sfx at={b.word(1, "mora")} name="typing" vol={0.22} dur={30} />
      <Sfx at={b.at(2)} name="whoosh" vol={0.35} />
      <Sfx at={b.word(2, "mesma")} name="pop" vol={0.4} />
    </AbsoluteFill>
  );
};

// =========================================================== 2. 1944
export const Ano: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidasShort("ano");
  const t = b.word(0, "1944");
  return (
    <AbsoluteFill>
      <Shake at={[t]} amp={18}>
        <Amassado escuro />
        <Jornal linhas={["Siderurgia no vale", "Aços Especiais", "Rio Piracicaba", "Estrada de Ferro", "Mata Atlântica", "Minas Gerais", "Vitória a Minas"]} opacity={0.09} />
        <Fita texto="a explicação começa em..." x={540} y={520} at={b.at(0) + 2} rot={-3} size={52} centro />
        <Selo x={540} y={1000} d={760} at={t - 3}>
          <Serif size={270} style={{ letterSpacing: -6 }}>1944</Serif>
        </Selo>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", opacity: ip(f, [t + 10, t + 20], [0, 1]) }}>
          <span style={{ fontFamily: FS.maquina, fontSize: 40, color: "#ddd", letterSpacing: 6 }}>VALE DO AÇO · MINAS GERAIS</span>
        </div>
      </Shake>
      <Sfx at={b.at(0) + 2} name="typing" vol={0.22} dur={40} />
      <Sfx at={t - 3} name="impact-bass-1" vol={0.7} />
    </AbsoluteFill>
  );
};

// =========================================================== mapa (terreno estilo satélite)
const S_TER = 200;
const MapaTerreno: React.FC<{ escala: number; cx: number; cy: number; tilt: number; zoom?: [number, number]; dur: number; children?: React.ReactNode; parqueAt?: number }> = ({
  escala,
  cx,
  cy,
  tilt,
  zoom = [1, 1.08],
  dur,
  children,
  parqueAt,
}) => {
  const f = useCurrentFrame();
  const W = terreno.w * escala;
  const H = terreno.h * escala;
  const px = (cx - terreno.x0) * S_TER * escala;
  const py = (cy - terreno.y0) * S_TER * escala;
  const z = interpolate(f, [0, dur], zoom, { extrapolateRight: "clamp" });
  const k = S_TER * escala;
  return (
    <AbsoluteFill style={{ perspective: 1500, overflow: "hidden", background: "#2c3a24" }}>
      <div
        style={{
          position: "absolute",
          left: 540 - px,
          top: 960 - py,
          width: W,
          height: H,
          transformOrigin: `${px}px ${py}px`,
          transform: `rotateX(${tilt}deg) scale(${z})`,
        }}
      >
        <Img src={staticFile("tex/terreno.jpg")} style={{ position: "absolute", inset: 0, width: W, height: H }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <pattern id="hachuraLima" patternUnits="userSpaceOnUse" width={0.06} height={0.06} patternTransform="rotate(45)">
              <line x1={0} y1={0} x2={0} y2={0.06} stroke={K.lima} strokeWidth={0.02} />
            </pattern>
          </defs>
          <g transform={`scale(${k}) translate(${-terreno.x0} ${-terreno.y0})`}>
            {parqueAt !== undefined ? (
              <path d={GEO.parqueTimoteo} fill="url(#hachuraLima)" opacity={ip(f, [parqueAt, parqueAt + 12], [0, 1])} stroke={K.lima} strokeWidth={4 / k} />
            ) : null}
            <path d={GEO.timoteo} fill="none" stroke={K.lima} strokeWidth={7 / k} strokeLinejoin="round" />
          </g>
        </svg>
        <Img
          src={staticFile("tex/nuvens.png")}
          style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: 0.8, translate: `${f * 0.9}px ${f * 0.3}px` }}
        />
        {children}
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// =========================================================== 3. três motivos
export const Motivos: React.FC = () => {
  const b = batidasShort("motivos");
  const tF = b.word(0, "ferrovia");
  const tA = b.word(0, "água");
  const tM = b.word(0, "mata");
  const cent = GEO.centroids["Timóteo"];
  return (
    <AbsoluteFill>
      <MapaTerreno escala={0.7} cx={cent[0]} cy={cent[1] - 0.5} tilt={32} zoom={[1.05, 1.18]} dur={b.frames} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #151515 0%, rgba(21,21,21,0.85) 10%, rgba(21,21,21,0) 24%)" }} />
      <Fita texto="uma siderúrgica procura um lugar" x={540} y={150} at={b.word(0, "siderúrgica") - 4} rot={-2} size={44} centro />
      <Selo x={850} y={330} d={210} at={b.word(0, "três")} rot={8}>
        <div style={{ textAlign: "center", fontFamily: FS.cond, fontSize: 52, lineHeight: 1, color: K.tinta }}>
          3<br />
          <span style={{ fontSize: 34 }}>MOTIVOS</span>
        </div>
      </Selo>
      <Foto src="fotos/trem.jpg" x={40} y={300} w={560} h={360} at={tF - 4} rot={-4} de="esq" seed="m1" pb={0.6} dur={120} />
      <Fita texto="1 · a ferrovia" x={80} y={620} at={tF} rot={-3} size={46} />
      <Seta de={[470, 700]} ate={[560, 880]} curva={-60} at={tF + 6} cor={K.tinta} seed="m1s" largura={20} />
      <Foto src="fotos/rio.jpg" x={480} y={760} w={560} h={360} at={tA - 4} rot={3} de="dir" seed="m2" pb={0.6} pos="50% 60%" dur={120} />
      <Fita texto="2 · a água do Piracicaba" x={430} y={1080} at={tA} rot={2} size={44} />
      <Foto src="fotos/mata.jpg" x={40} y={1200} w={580} h={340} at={tM - 4} rot={-2} de="baixo" seed="m3" pb={0.6} pos="50% 70%" dur={120} />
      <Fita texto="3 · a mata → carvão" x={500} y={1300} at={tM} rot={-3} size={44} />
      <Sfx at={b.word(0, "três")} name="pop" vol={0.4} />
      <Sfx at={tF - 4} name="whoosh-short" vol={0.35} />
      <Sfx at={tA - 4} name="whoosh-short" vol={0.35} />
      <Sfx at={tM - 4} name="whoosh-short" vol={0.35} />
    </AbsoluteFill>
  );
};

// =========================================================== 4. nasce a Acesita e a vila
export const Vila: React.FC = () => {
  const b = batidasShort("vila");
  const itens = [
    { t: b.word(0, "casas"), txt: "✓ casas" },
    { t: b.word(0, "escolas"), txt: "✓ escolas" },
    { t: b.word(0, "igreja"), txt: "✓ igreja" },
    { t: b.word(0, "hospital"), txt: "✓ hospital" },
  ];
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/usina.jpg" x={-30} y={140} w={1140} h={560} at={0} rot={-1.5} de="cima" seed="v1" pb={1} contraste={1.35} pos="50% 70%" zoom={[1.15, 1.3]} dur={190} />
      <Entra at={b.word(0, "Acesita") - 3} style={{ left: 50, top: 640 }} y={30}>
        <Serif size={190}>
          <Marca at={b.word(0, "Acesita") + 2}>ACESITA</Marca>
        </Serif>
      </Entra>
      <Fita texto="31 · out · 1944" x={600} y={600} at={b.word(0, "Acesita") + 6} rot={5} size={46} />
      <Recorte src="recortes/saojose.png" x={30} y={940} w={720} at={b.word(0, "vila") - 4} seed="v2" pb={0.35} />
      <Fita texto="a vila operária" x={60} y={880} at={b.word(0, "vila")} rot={-3} size={44} />
      {itens.map((it, i) => (
        <Fita key={i} texto={it.txt} x={700} y={930 + i * 100} at={it.t} rot={(i % 2 ? 2 : -2) as number} size={44} cps={60} />
      ))}
      <CirculoPincel x={390} y={1180} w={760} h={560} at={b.word(0, "igreja")} seed="v3" largura={16} />
      <Sfx at={b.word(0, "Acesita") - 3} name="impact-bass-2" vol={0.5} />
      <Sfx at={b.word(0, "vila") - 4} name="whoosh-short" vol={0.35} />
      {itens.map((it, i) => (
        <Sfx key={i} at={it.t} name="click-soft" vol={0.4} />
      ))}
    </AbsoluteFill>
  );
};

// =========================================================== 5. dois nomes
export const Nomes: React.FC = () => {
  const b = batidasShort("nomes");
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/saojose.jpg" x={40} y={130} w={1000} h={620} at={0} rot={-2} de="cima" seed="n1" pb={0.9} dur={160} />
      <Fita texto="a vila da empresa" x={80} y={110} at={b.word(0, "vila")} rot={-3} size={46} />
      <Rotulo texto="ACESITA" at={b.word(0, "nome")} x={90} y={600} rot={-4} />
      <Seta de={[700, 820]} ate={[480, 700]} curva={70} at={b.word(0, "fábrica")} seed="n1s" largura={22} />
      <Foto src="fotos/saosebastiao.jpg" x={40} y={860} w={1000} h={600} at={b.word(0, "povoado") - 6} rot={2} de="baixo" seed="n2" pb={0.85} pos="40% 30%" dur={120} />
      <Fita texto="o povoado antigo" x={540} y={850} at={b.word(0, "povoado")} rot={3} size={46} />
      <Rotulo texto="TIMÓTEO" at={b.word(0, "Timóteo")} x={520} y={1330} rot={3} fundo="#fff" />
      <Sfx at={b.word(0, "nome")} name="pop" vol={0.45} />
      <Sfx at={b.word(0, "povoado") - 6} name="whoosh-short" vol={0.35} />
      <Sfx at={b.word(0, "Timóteo")} name="pop" vol={0.45} />
    </AbsoluteFill>
  );
};

// =========================================================== 6. plebiscito
export const Plebiscito: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidasShort("plebiscito");
  const tCard = b.word(0, "plebiscito") - 6;
  const tVoto = b.word(0, "maioria");
  const tBarr = b.word(0, "barrou");
  const total = 12861 + 4908;
  const pSim = ip(f, [tVoto, tVoto + 24], [0, 12861 / total], EASE_IO);
  const pNao = ip(f, [tVoto + 8, tVoto + 30], [0, 4908 / total], EASE_IO);
  return (
    <AbsoluteFill>
      <Shake at={[tBarr]} amp={16}>
        <Amassado escuro />
        <Jornal linhas={["Plebiscito", "Acesita ou Timóteo", "Assembleia", "1979 · 1981", "Mudança de nome", "Vale do Aço"]} opacity={0.08} />
        <Fita texto="a marca pegou" x={540} y={150} at={b.word(0, "marca") - 2} rot={-2} size={50} centro />
        <Foto src="tex/folha.jpg" x={90} y={260} w={900} h={640} at={tCard} rot={-3} de="baixo" seed="p1" pb={0} contraste={1} zoom={[1, 1]} borda={false}>
          <div style={{ position: "absolute", inset: 0, padding: "70px 70px" }}>
            <div style={{ fontFamily: FS.maquina, fontSize: 40, color: "#333", letterSpacing: 4 }}>PLEBISCITO · 1979–1981</div>
            <div style={{ fontFamily: FS.serif, fontWeight: 900, fontSize: 92, lineHeight: 1.0, color: K.tinta, marginTop: 30 }}>
              Trocar o nome da cidade para <Marca at={b.word(0, "trocar")}>Acesita?</Marca>
            </div>
            <div style={{ display: "flex", gap: 60, marginTop: 40, fontFamily: FS.maquina, fontSize: 46, color: K.tinta }}>
              <span>☒ SIM</span>
              <span>☐ NÃO</span>
            </div>
          </div>
        </Foto>
        {f >= tVoto - 2 ? (
          <div style={{ position: "absolute", left: 90, top: 980, width: 900 }}>
            <div style={{ fontFamily: FS.cond, fontSize: 56, color: "#fff", letterSpacing: 2 }}>A FAVOR</div>
            <div style={{ height: 92, background: "rgba(255,255,255,0.08)", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pSim * 100}%`, background: K.lima }} />
              <div style={{ position: "absolute", left: 20, top: 10, fontFamily: FS.cond, fontSize: 64, color: K.tinta }}>
                <Counter to={12861} at={tVoto} dur={24} />
              </div>
            </div>
            <div style={{ fontFamily: FS.cond, fontSize: 56, color: "#fff", letterSpacing: 2, marginTop: 26 }}>CONTRA</div>
            <div style={{ height: 92, background: "rgba(255,255,255,0.08)", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pNao * 100}%`, background: "#fff" }} />
              <div style={{ position: "absolute", left: 20, top: 10, fontFamily: FS.cond, fontSize: 64, color: K.tinta }}>
                <Counter to={4908} at={tVoto + 8} dur={22} />
              </div>
            </div>
          </div>
        ) : null}
        <CarimboV at={tBarr} texto="BARRADO" x={540} y={700} size={180} rot={-14} />
      </Shake>
      <Sfx at={tCard} name="whoosh-short" vol={0.35} />
      <Sfx at={tVoto} name="riser" vol={0.25} dur={40} />
      <Sfx at={tBarr} name="impact-bass-1" vol={0.7} />
    </AbsoluteFill>
  );
};

// =========================================================== 7. o parque
export const Parque: React.FC = () => {
  const f = useCurrentFrame();
  const b = batidasShort("parque");
  const tB = b.at(1);
  const tTerco = b.word(1, "terço");
  const faseA = f < tB + 6;
  const cent = GEO.centroids["Timóteo"];
  return (
    <AbsoluteFill>
      {faseA ? (
        <AbsoluteFill style={{ opacity: ip(f, [tB - 4, tB + 6], [1, 0]) }}>
          <Amassado />
          <Entra at={b.word(0, "1944") - 3} style={{ left: 0, right: 0, top: 130, textAlign: "center" }} y={30}>
            <Serif size={240} style={{ letterSpacing: -6 }}>
              <Marca at={b.word(0, "1944") + 4}>1944</Marca>
            </Serif>
          </Entra>
          <Fita texto="deixou outra herança" x={540} y={400} at={b.word(0, "herança") - 4} rot={-3} size={50} centro />
          <Foto src="fotos/lagoa.jpg" x={30} y={520} w={1020} h={720} at={b.word(0, "nasceu") - 6} rot={2} de="baixo" seed="pa1" pb={0.45} dur={140} />
          <Rotulo texto="PARQUE ESTADUAL" at={b.word(0, "Parque")} x={60} y={1150} rot={-3} size={82} />
          <Rotulo texto="DO RIO DOCE" at={b.word(0, "Rio")} x={330} y={1250} rot={-2} size={82} fundo="#fff" />
          <Foto src="fotos/orbital.jpg" x={700} y={430} w={330} h={330} at={b.word(0, "Doce") - 4} rot={7} de="pop" seed="pa2" pb={0.2} lados={{ top: true, bottom: true, left: true, right: true }} zoom={[1.3, 1.5]} dur={100} />
          <Fita texto="visto do espaço · NASA" x={640} y={760} at={b.word(0, "Doce")} rot={6} size={30} />
        </AbsoluteFill>
      ) : null}
      {f >= tB - 4 ? (
        <AbsoluteFill style={{ opacity: ip(f, [tB - 4, tB + 6], [0, 1]) }}>
          <MapaTerreno escala={0.95} cx={cent[0] + 0.3} cy={cent[1]} tilt={0} zoom={[1.0, 1.1]} dur={b.frames - tB} parqueAt={tTerco - 6} />
          <Entra at={tTerco - 4} style={{ left: 0, right: 0, top: 150, textAlign: "center" }} y={30}>
            <div style={{ display: "inline-block", background: K.tinta, padding: "10px 40px 0", rotate: "-2deg", boxShadow: "0 12px 24px rgba(0,0,0,0.5)" }}>
              <Serif size={230} cor={K.lima}>
                <Counter to={37} at={tTerco - 4} dur={20} suffix="%" />
              </Serif>
            </div>
          </Entra>
          <Fita texto="do território de Timóteo" x={540} y={470} at={b.word(1, "Timóteo")} rot={2} size={46} centro />
          <Rotulo texto="MATA ATLÂNTICA PROTEGIDA" at={b.word(1, "Mata")} x={60} y={1330} rot={-2} size={78} />
        </AbsoluteFill>
      ) : null}
      <Sfx at={b.word(0, "1944") - 3} name="impact-bass-2" vol={0.5} />
      <Sfx at={b.word(0, "nasceu") - 6} name="whoosh" vol={0.35} />
      <Sfx at={b.word(0, "Parque")} name="pop" vol={0.4} />
      <Sfx at={tB} name="whoosh" vol={0.35} />
      <Sfx at={tTerco - 4} name="riser" vol={0.25} dur={30} />
    </AbsoluteFill>
  );
};

// =========================================================== 8. final
export const Final: React.FC = () => {
  const b = batidasShort("final");
  const tDuas = b.word(0, "duas");
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/usina.jpg" x={-30} y={110} w={1140} h={640} at={0} rot={-2} de="cima" seed="fi1" pb={1} contraste={1.35} pos="50% 70%" zoom={[1.2, 1.35]} dur={160} />
      <Rotulo texto="ACESITA?" at={b.word(0, "Acesita")} x={70} y={600} rot={-4} fundo={K.tinta} cor="#fff" />
      <Foto src="fotos/lagoa.jpg" x={-30} y={960} w={1140} h={600} at={b.word(0, "Timóteo") - 6} rot={2} de="baixo" seed="fi2" pb={0.4} dur={130} />
      <Rotulo texto="TIMÓTEO?" at={b.word(0, "Timóteo")} x={500} y={990} rot={3} fundo={K.tinta} cor="#fff" />
      <Faixa y={760} h={220} at={tDuas - 4} seed="fi3">
        <Serif size={130} cor="#fff" italic>
          <Marca at={tDuas}><span style={{ color: K.tinta }}>as duas.</span></Marca>
        </Serif>
      </Faixa>
      <Fita texto="aço + floresta" x={80} y={1300} at={b.word(1, "Aço")} rot={-3} size={52} />
      <Fita texto="nascidos em 1944" x={470} y={1400} at={b.word(1, "nascidos")} rot={3} size={52} />
      <Sfx at={b.word(0, "Acesita")} name="pop" vol={0.4} />
      <Sfx at={b.word(0, "Timóteo") - 6} name="whoosh-short" vol={0.35} />
      <Sfx at={tDuas - 4} name="impact-bass-2" vol={0.55} />
    </AbsoluteFill>
  );
};

// =========================================================== 9. encerramento
export const Fim: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Amassado escuro />
      <Jornal linhas={["Timóteo", "Acesita", "Parque Estadual", "Rio Doce", "Vale do Aço", "1944"]} opacity={0.07} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 620, textAlign: "center", opacity: ip(f, [0, 10], [0, 1]) }}>
        <Serif size={190} cor="#fff">Timóteo</Serif>
      </div>
      <Fita texto="uma cidade, dois nomes" x={540} y={850} at={6} rot={-2} size={52} centro />
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 1080,
          textAlign: "center",
          fontFamily: FS.maquina,
          fontSize: 26,
          lineHeight: 1.6,
          color: "#bdbdbd",
          opacity: ip(f, [14, 26], [0, 1]),
        }}
      >
        Fotos: HVL, Fernando Marino, Tico-Tico (Wikimedia Commons, CC BY / CC BY-SA) · NASA (domínio público)
        <br />
        Fontes: Wikipédia, IBGE · Locução: HyperFrames TTS · Animação: Remotion
      </div>
    </AbsoluteFill>
  );
};
