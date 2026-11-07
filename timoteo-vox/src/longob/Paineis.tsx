/**
 * Versão longa (5 min) no estilo da Versão B (colagem editorial vertical).
 * Cada painel cobre uma ou mais falas; tempos sempre derivados da locução.
 */
import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { GEO, P, Sfx } from "../common";
import { camAt, Counter, ip, Shake, EASE_IO } from "../fx";
import { batidas } from "../timing";
import { Amassado, CarimboV, CirculoPincel, FS, Fita, Foto, Jornal, K, Marca, rasgado, Recorte, Selo, Serif, Seta, Entra } from "../short/kit";
import { Faixa, MapaTerreno, Rotulo } from "../short/Cenas";

export type B = ReturnType<typeof batidas>;
export type PainelProps = { b: B; off: number; len: number };

/** tempos locais do painel */
const mk = (b: B, off: number) => ({
  a: (i: number) => b.at(i) - off,
  w: (i: number, t: string) => b.word(i, t) - off,
});

const Escuro: React.FC<{ j?: string[] }> = ({ j }) => (
  <>
    <Amassado escuro />
    {j ? <Jornal linhas={j} opacity={0.08} /> : null}
  </>
);

/** Linha vermelha que risca algo (desenhada). */
const Risco: React.FC<{ x1: number; y1: number; x2: number; y2: number; at: number; cor?: string; largura?: number }> = ({ x1, y1, x2, y2, at, cor = K.vermelho, largura = 14 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = ip(f, [at, at + 8], [0, 1], EASE_IO);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={cor} strokeWidth={largura} strokeLinecap="round" />
    </svg>
  );
};

/** Texto que troca dentro de uma faixa. */
const Troca: React.FC<{ antes: React.ReactNode; depois: React.ReactNode; at: number }> = ({ antes, depois, at }) => {
  const f = useCurrentFrame();
  return <>{f < at ? antes : depois}</>;
};

// ================================================================= ABERTURA
export const PAb1: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/predio_acesita.jpg" x={60} y={180} w={960} h={640} at={t.a(0) - 4} rot={-3} de="cima" seed="la1" zoom={[1.0, 1.05]} dur={400} />
      <CirculoPincel x={600} y={272} w={440} h={140} at={t.w(0, "Acesita")} seed="la1c" largura={18} />
      <Fita texto="“onde fica a Acesita?”" x={110} y={760} at={t.w(0, "onde")} rot={-4} size={50} />
      <Seta de={[960, 640]} ate={[820, 330]} curva={-80} at={t.w(1, "apontar")} seed="la1s" largura={24} />
      <Rotulo texto="UM BAIRRO" at={t.w(1, "bairro")} x={600} y={560} rot={4} size={70} />
      <Foto src="fotos/saosebastiao_edu.jpg" x={250} y={828} w={580} h={652} at={t.a(2) - 4} rot={2.5} de="baixo" seed="la2" pb={0.6} zoom={[1.0, 1.02]} dur={300} />
      <Fita texto="“e onde fica Timóteo?”" x={360} y={1452} at={t.w(2, "onde")} rot={3} size={50} />
      <Rotulo texto="OUTRO LUGAR" at={t.w(3, "outro")} x={70} y={1280} rot={-3} size={70} fundo="#fff" />
      <Faixa y={735} h={210} at={t.a(4)} seed="la3">
        <Serif size={104} cor="#fff" italic>
          <Troca
            at={t.w(4, "Mas")}
            antes={<span>duas cidades?</span>}
            depois={
              <span>
                <Marca at={t.w(4, "Mas") + 2}>
                  <span style={{ color: K.tinta }}>uma só.</span>
                </Marca>
              </span>
            }
          />
        </Serif>
      </Faixa>
      <Sfx at={t.a(0) - 4} name="whoosh-short" vol={0.35} />
      <Sfx at={t.w(0, "Acesita")} name="click-soft" vol={0.45} />
      <Sfx at={t.w(0, "onde")} name="typing" vol={0.2} dur={30} />
      <Sfx at={t.a(2) - 4} name="whoosh-short" vol={0.35} />
      <Sfx at={t.w(3, "outro")} name="pop" vol={0.4} />
      <Sfx at={t.a(4)} name="whoosh" vol={0.35} />
      <Sfx at={t.w(4, "Mas")} name="pop" vol={0.45} />
    </AbsoluteFill>
  );
};

export const PAb2: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  const t44 = t.w(5, "1944");
  return (
    <AbsoluteFill>
      <Shake at={[t44]} amp={16}>
        <Escuro j={["Siderurgia", "Mata Atlântica", "Vale do Aço", "1944", "Rio Doce"]} />
        <Foto src="fotos/usina.jpg" x={40} y={150} w={1000} h={520} at={0} rot={-2} de="esq" seed="lb1" pb={1} pos="50% 70%" zoom={[1.15, 1.3]} />
        <Rotulo texto="AÇO" at={t.w(5, "aço")} x={80} y={600} rot={-4} size={110} />
        <Foto src="fotos/lagoa.jpg" x={40} y={960} w={1000} h={520} at={t.w(5, "floresta") - 6} rot={2} de="dir" seed="lb2" pb={0.4} />
        <Rotulo texto="FLORESTA" at={t.w(5, "floresta")} x={520} y={920} rot={3} size={110} fundo="#fff" />
        <Selo x={540} y={820} d={500} at={t44 - 3}>
          <Serif size={190} style={{ letterSpacing: -5 }}>1944</Serif>
        </Selo>
      </Shake>
      <Sfx at={t.w(5, "aço")} name="pop" vol={0.4} />
      <Sfx at={t.w(5, "floresta") - 6} name="whoosh-short" vol={0.35} />
      <Sfx at={t44 - 3} name="impact-bass-1" vol={0.7} />
    </AbsoluteFill>
  );
};

export const PTitulo: React.FC<PainelProps> = () => (
  <AbsoluteFill>
    <Escuro j={["Timóteo", "Acesita", "Vale do Aço", "Minas Gerais", "1944", "Rio Doce"]} />
    <Selo x={540} y={820} d={680} at={3}>
      <div style={{ textAlign: "center" }}>
        <Serif size={150} style={{ letterSpacing: -4 }}>Timóteo</Serif>
        <div style={{ fontFamily: FS.maquina, fontSize: 38, marginTop: 14, letterSpacing: 4, color: K.tinta }}>VALE DO AÇO · MG</div>
      </div>
    </Selo>
    <Fita texto="uma cidade, dois nomes" x={540} y={1260} at={18} rot={-2} size={56} centro />
    <Sfx at={3} name="impact-bass-2" vol={0.6} />
    <Sfx at={18} name="typing" vol={0.25} dur={40} />
  </AbsoluteFill>
);

// ================================================================= MAPA
const MapaMG: React.FC<{ tMinas: number; tBH: number }> = ({ tMinas, tBH }) => {
  const f = useCurrentFrame();
  const box = GEO.mgBox;
  const bhP = GEO.points["Belo Horizonte"];
  const tmP = GEO.points["Timóteo"];
  const cam = camAt(f, [
    { f: 0, c: { x: (box[0] + box[2]) / 2, y: (box[1] + box[3]) / 2, z: 980 / (box[2] - box[0]) } },
    { f: tMinas + 8, c: { x: (box[0] + box[2]) / 2, y: (box[1] + box[3]) / 2, z: 980 / (box[2] - box[0]) } },
    { f: tBH - 2, c: { x: (bhP[0] + tmP[0]) / 2, y: (bhP[1] + tmP[1]) / 2 + 2, z: 17 } },
  ]);
  const k = cam.z;
  const tp = (p: [number, number]) => [540 + (p[0] - cam.x) * k, 820 + (p[1] - cam.y) * k] as const;
  const bh = tp(bhP);
  const tm = tp(tmP);
  const pf = ip(f, [tMinas - 4, tMinas + 10], [0, 1], EASE_IO);
  const pl = ip(f, [tBH + 4, tBH + 20], [0, 1], EASE_IO);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 16px 18px rgba(0,0,0,0.35))" }}>
        <g transform={`translate(540 820) scale(${k}) translate(${-cam.x} ${-cam.y})`}>
          <path d={GEO.mgOutline} fill="#F2EFE8" stroke={K.tinta} strokeWidth={4 / k} />
          <path d={GEO.mgOutline} fill={K.lima} opacity={pf * 0.85} />
          {GEO.mgMun.map((m) => (
            <path key={m.name} d={m.d} fill="none" stroke={K.tinta} strokeOpacity={0.14} strokeWidth={1.2 / k} />
          ))}
          <path d={GEO.timoteo} fill={K.vermelho} stroke={K.tinta} strokeWidth={2 / k} />
        </g>
        <line x1={bh[0]} y1={bh[1]} x2={bh[0] + (tm[0] - bh[0]) * pl} y2={bh[1] + (tm[1] - bh[1]) * pl} stroke={K.tinta} strokeWidth={8} strokeDasharray="16 14" strokeLinecap="round" />
        <circle cx={bh[0]} cy={bh[1]} r={18 * ip(f, [tBH, tBH + 6], [0, 1])} fill={K.tinta} />
        <circle cx={tm[0]} cy={tm[1]} r={20 * ip(f, [tBH + 4, tBH + 10], [0, 1])} fill={K.vermelho} stroke={K.tinta} strokeWidth={5} />
      </svg>
      <Fita texto="Belo Horizonte" x={bh[0] - 160} y={bh[1] + 40} at={tBH} rot={-3} size={44} />
      <Fita texto="Timóteo" x={tm[0] - 150} y={tm[1] - 120} at={tBH + 6} rot={3} size={48} />
      <Rotulo texto="≈ 200 KM" at={tBH + 20} x={(bh[0] + tm[0]) / 2 - 170} y={(bh[1] + tm[1]) / 2 - 230} rot={-6} size={84} fundo="#fff" />
    </>
  );
};

export const PM1: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Rotulo texto="MINAS GERAIS" at={t.w(0, "Minas")} x={60} y={180} rot={-3} size={110} fundo="#fff" />
      <MapaMG tMinas={t.w(0, "Minas")} tBH={t.w(0, "Belo")} />
      <Fita texto="no leste do estado" x={500} y={1330} at={t.w(0, "leste")} rot={3} size={46} />
      <Sfx at={t.w(0, "Minas")} name="pop" vol={0.4} />
      <Sfx at={t.w(0, "Belo")} name="click-soft" vol={0.4} />
    </AbsoluteFill>
  );
};

export const PM2: React.FC<PainelProps> = ({ b, off, len }) => {
  const t = mk(b, off);
  const c = GEO.centroids["Timóteo"];
  return (
    <AbsoluteFill>
      <MapaTerreno escala={0.9} cx={c[0]} cy={c[1]} tilt={30} zoom={[1.0, 1.1]} dur={len} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #151515 0%, rgba(21,21,21,0.8) 9%, rgba(21,21,21,0) 22%)" }} />
      <Selo x={800} y={420} d={330} at={t.w(1, "cento") - 2} rot={7}>
        <div style={{ textAlign: "center", lineHeight: 0.9 }}>
          <Serif size={130}>144</Serif>
          <div style={{ fontFamily: FS.cond, fontSize: 56, color: K.tinta }}>KM²</div>
        </div>
      </Selo>
      <Entra at={t.w(1, "oitenta") - 2} style={{ left: 60, top: 1080 }} y={30}>
        <div style={{ background: K.tinta, padding: "8px 30px 0", rotate: "-2deg", boxShadow: "0 12px 24px rgba(0,0,0,0.5)" }}>
          <Serif size={170} cor={K.lima}>
            <Counter to={81579} at={t.w(1, "oitenta") - 2} dur={40} />
          </Serif>
        </div>
      </Entra>
      <Fita texto="habitantes · Censo 2022" x={220} y={1330} at={t.w(1, "Censo")} rot={2} size={44} />
      <Sfx at={t.w(1, "cento") - 2} name="pop" vol={0.4} />
      <Sfx at={t.w(1, "oitenta") - 2} name="riser" vol={0.22} dur={40} />
    </AbsoluteFill>
  );
};

export const PM3: React.FC<PainelProps> = ({ b, off, len }) => {
  const t = mk(b, off);
  const nomes = [
    { n: "Ipatinga", w: "Ipatinga" },
    { n: "Coronel Fabriciano", w: "Coronel" },
    { n: "Santana do Paraíso", w: "Santana" },
  ];
  return (
    <AbsoluteFill>
      <MapaTerreno
        escala={0.55}
        cx={276.2}
        cy={111.2}
        tilt={26}
        zoom={[1.0, 1.08]}
        dur={len}
        contornos={nomes.map((x) => ({ nome: x.n, at: t.w(2, x.w), cor: "#fff", preencher: true }))}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #151515 0%, rgba(21,21,21,0.8) 9%, rgba(21,21,21,0) 22%)" }} />
      <Fita texto="Região Metropolitana do Vale do Aço" x={540} y={170} at={t.w(2, "Região") - 4} rot={-2} size={42} centro />
      <Rotulo texto="TIMÓTEO" at={t.a(2) + 2} x={70} y={980} rot={-3} size={72} />
      {nomes.map((x, i) => (
        <Rotulo key={x.n} texto={x.n.toUpperCase()} at={t.w(2, x.w)} x={70 + (i % 2) * 40} y={1075 + i * 95} rot={i % 2 ? 2 : -2} size={64} fundo="#fff" />
      ))}
      {nomes.map((x) => (
        <Sfx key={x.n} at={t.w(2, x.w)} name="pop" vol={0.35} />
      ))}
    </AbsoluteFill>
  );
};

// ================================================================= ORIGEM
export const PO1: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Escuro j={["Século XIX", "Sertões do Rio Doce", "Tropeiros", "Fazendas", "Gado"]} />
      <Faixa y={760} h={260} at={2} seed="o1">
        <Serif size={110} cor="#fff" italic>
          antes da <Marca at={t.w(0, "indústria")}><span style={{ color: K.tinta }}>indústria</span></Marca>
        </Serif>
      </Faixa>
      <Sfx at={2} name="whoosh" vol={0.35} />
    </AbsoluteFill>
  );
};

export const PO2: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/pico.jpg" x={40} y={640} w={1000} h={620} at={t.a(1) + 4} rot={2} de="baixo" seed="o2f" pb={0.9} dur={300} />
      <Selo x={290} y={370} d={380} at={t.a(1)} rot={-6}>
        <Serif size={130}>1831</Serif>
      </Selo>
      <Fita texto="Francisco de Paula e Silva" x={480} y={300} at={t.w(1, "Francisco")} rot={-2} size={40} />
      <Fita texto="o “Chico Santa Maria”" x={540} y={400} at={t.w(1, "Chico")} rot={3} size={44} />
      <Fita texto="plantar e criar gado" x={110} y={1210} at={t.w(1, "plantar")} rot={-3} size={46} />
      <Rotulo texto="“ALEGRE”" at={t.w(1, "Alegre")} x={560} y={1140} rot={3} size={110} />
      <Sfx at={t.a(1)} name="pop" vol={0.45} />
      <Sfx at={t.w(1, "Chico")} name="typing" vol={0.2} dur={30} />
      <Sfx at={t.w(1, "Alegre")} name="click-soft" vol={0.45} />
    </AbsoluteFill>
  );
};

export const PO3: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Escuro j={["Tropeiro", "Venda", "Ribeirão", "Paragem", "Timóteo"]} />
      <Rotulo texto="O NOME TIMÓTEO" at={t.w(2, "Timóteo")} x={90} y={300} rot={-3} size={100} />
      <Fita texto="1 · um tropeiro" x={140} y={620} at={t.w(2, "tropeiro")} rot={-3} size={58} />
      <Seta de={[520, 720]} ate={[460, 830]} curva={-50} at={t.w(2, "abriu")} cor="#F2EFE8" seed="o3a" largura={20} />
      <Fita texto="2 · abre uma venda" x={260} y={860} at={t.w(2, "venda")} rot={2} size={58} />
      <Seta de={[640, 960]} ate={[560, 1070]} curva={-50} at={t.w(2, "margens")} cor="#F2EFE8" seed="o3b" largura={20} />
      <Fita texto="3 · às margens de um ribeirão" x={80} y={1100} at={t.w(2, "ribeirão")} rot={-2} size={52} />
      <Fita texto="segundo a versão mais contada" x={540} y={1330} at={t.w(2, "versão")} rot={1} size={34} centro />
      <Sfx at={t.w(2, "tropeiro")} name="click-soft" vol={0.4} />
      <Sfx at={t.w(2, "venda")} name="click-soft" vol={0.4} />
      <Sfx at={t.w(2, "ribeirão")} name="click-soft" vol={0.4} />
    </AbsoluteFill>
  );
};

export const PO4: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/cidade.jpg" x={40} y={180} w={1000} h={580} at={0} rot={-2} de="cima" seed="o4" pb={1} dur={200} />
      <Fita texto="a venda vira ponto de referência" x={540} y={720} at={t.w(3, "venda")} rot={-2} size={40} centro />
      <Faixa y={830} h={220} at={t.w(3, "ribeirão") - 2} seed="o4f">
        <Serif size={92} cor="#fff" italic>
          Ribeirão de <Marca at={t.w(3, "Timóteo.")}><span style={{ color: K.tinta }}>Timóteo</span></Marca>
        </Serif>
      </Faixa>
      <Rotulo texto="E O NOME FICOU." at={t.w(3, "nome")} x={150} y={1150} rot={-3} size={100} />
      <Sfx at={t.w(3, "ribeirão") - 2} name="whoosh" vol={0.35} />
      <Sfx at={t.w(3, "nome")} name="pop" vol={0.45} />
    </AbsoluteFill>
  );
};

export const PO5: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Shake at={[t.w(4, "distrito")]} amp={14}>
        <Escuro j={["Decreto estadual", "Distrito", "Antônio Dias", "1938"]} />
        <Selo x={540} y={560} d={480} at={t.a(4)} rot={-5}>
          <Serif size={170}>1938</Serif>
        </Selo>
        <CarimboV at={t.w(4, "distrito")} texto="DISTRITO" x={540} y={980} size={150} rot={-9} />
        <Fita texto="decreto estadual nº 148" x={540} y={1180} at={t.w(4, "distrito") + 8} rot={2} size={42} centro />
        <Fita texto="já com o nome de Timóteo" x={540} y={1290} at={t.w(4, "nome")} rot={-2} size={46} centro />
      </Shake>
      <Sfx at={t.a(4)} name="pop" vol={0.4} />
      <Sfx at={t.w(4, "distrito")} name="impact-bass-2" vol={0.6} />
    </AbsoluteFill>
  );
};

// ================================================================= A VIRADA
export const PP1: React.FC<PainelProps> = () => (
  <AbsoluteFill>
    <Shake at={[2]} amp={18}>
      <Escuro j={["1940", "Siderurgia", "Aço", "Minério", "Carvão"]} />
      <Faixa y={760} h={300} at={0} seed="p1">
        <Serif size={170} cor="#fff" italic>
          a <Marca at={4}><span style={{ color: K.tinta }}>virada.</span></Marca>
        </Serif>
      </Faixa>
    </Shake>
    <Sfx at={0} name="impact-bass-1" vol={0.6} />
  </AbsoluteFill>
);

export const PP2: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/usina.jpg" x={40} y={160} w={1000} h={460} at={0} rot={-2} de="cima" seed="p2u" pb={1} pos="50% 70%" zoom={[1.15, 1.3]} dur={260} />
      <Fita texto="anos 1940: onde construir uma siderúrgica?" x={540} y={590} at={t.w(1, "siderúrgica")} rot={-2} size={36} centro />
      <Foto src="fotos/farquhar.jpg" x={300} y={700} w={470} h={640} at={t.w(1, "Entre") - 4} rot={-3} de="pop" seed="p2f" pb={1} contraste={1.1} lados={{ top: true, bottom: true, left: true, right: true }} zoom={[1.0, 1.06]} dur={140} />
      <Rotulo texto="PERCIVAL FARQUHAR" at={t.w(1, "Farquhar")} x={90} y={1250} rot={-3} size={84} />
      <Fita texto="empresário norte-americano" x={560} y={1150} at={t.w(1, "norte-americano")} rot={4} size={38} />
      <Sfx at={t.w(1, "Entre") - 4} name="whoosh-short" vol={0.35} />
      <Sfx at={t.w(1, "Farquhar")} name="pop" vol={0.45} />
    </AbsoluteFill>
  );
};

export const PP3: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Shake at={[t.w(2, "acidentado")]} amp={12}>
        <Escuro j={["Itabira", "Minério de ferro", "Serras", "Relevo"]} />
        <Rotulo texto="ITABIRA" at={t.a(2)} x={110} y={420} rot={-4} size={170} />
        <Fita texto="onde estava o minério" x={150} y={660} at={t.w(2, "minério")} rot={2} size={50} />
        <CarimboV at={t.w(2, "acidentado")} texto="ACIDENTADO DEMAIS" x={540} y={1000} size={62} rot={-10} />
      </Shake>
      <Sfx at={t.a(2)} name="pop" vol={0.4} />
      <Sfx at={t.w(2, "acidentado")} name="impact-bass-2" vol={0.55} />
    </AbsoluteFill>
  );
};

export const PP4: React.FC<PainelProps> = ({ b, off, len }) => {
  const t = mk(b, off);
  const tF = t.w(3, "ferrovia");
  const tA = t.w(3, "água");
  const tM = t.w(3, "mata");
  const c = GEO.centroids["Timóteo"];
  return (
    <AbsoluteFill>
      <MapaTerreno escala={0.7} cx={c[0]} cy={c[1] - 0.5} tilt={32} zoom={[1.05, 1.18]} dur={len} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #151515 0%, rgba(21,21,21,0.85) 10%, rgba(21,21,21,0) 24%)" }} />
      <Fita texto="Timóteo tinha três coisas" x={540} y={150} at={t.a(3)} rot={-2} size={46} centro />
      <Selo x={850} y={330} d={210} at={t.w(3, "três")} rot={8}>
        <div style={{ textAlign: "center", fontFamily: FS.cond, fontSize: 52, lineHeight: 1, color: K.tinta }}>
          3<br />
          <span style={{ fontSize: 34 }}>MOTIVOS</span>
        </div>
      </Selo>
      <Foto src="fotos/trem.jpg" x={40} y={300} w={560} h={360} at={tF - 4} rot={-4} de="esq" seed="p4a" pb={0.6} dur={120} />
      <Fita texto="1 · ferrovia Vitória a Minas" x={70} y={620} at={tF} rot={-3} size={40} />
      <Foto src="fotos/rio.jpg" x={480} y={760} w={560} h={360} at={tA - 4} rot={3} de="dir" seed="p4b" pb={0.6} pos="50% 60%" dur={120} />
      <Fita texto="2 · água do rio Piracicaba" x={420} y={1080} at={tA} rot={2} size={40} />
      <Foto src="fotos/mata.jpg" x={40} y={1180} w={580} h={330} at={tM - 4} rot={-2} de="baixo" seed="p4c" pb={0.6} pos="50% 70%" dur={120} />
      <Fita texto="3 · mata → carvão" x={520} y={1290} at={tM} rot={-3} size={44} />
      <Sfx at={t.w(3, "três")} name="pop" vol={0.4} />
      <Sfx at={tF - 4} name="whoosh-short" vol={0.35} />
      <Sfx at={tA - 4} name="whoosh-short" vol={0.35} />
      <Sfx at={tM - 4} name="whoosh-short" vol={0.35} />
    </AbsoluteFill>
  );
};

export const PP5: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  const siglas = [
    { w: "Aços", a: "AÇ", r: "OS" },
    { w: "Especiais", a: "ES", r: "PECIAIS" },
    { w: "Itabira.", a: "ITA", r: "BIRA" },
  ];
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/usina.jpg" x={-30} y={140} w={1140} h={500} at={0} rot={-1.5} de="cima" seed="p5" pb={1} contraste={1.35} pos="50% 70%" zoom={[1.15, 1.3]} />
      <CarimboV at={t.w(4, "outubro")} texto="31 · OUT · 1944" x={540} y={700} size={88} rot={-6} cor={K.tinta} />
      <Entra at={t.w(4, "Acesita.") - 3} style={{ left: 60, top: 790 }} y={30}>
        <Serif size={190}>
          <Marca at={t.w(4, "Acesita.") + 2}>ACESITA</Marca>
        </Serif>
      </Entra>
      {siglas.map((s, i) => (
        <Entra key={s.w} at={t.w(4, s.w) - 2} style={{ left: 90 + i * 60, top: 1030 + i * 110 }} y={20}>
          <div style={{ fontFamily: FS.cond, fontSize: 88, color: K.tinta, letterSpacing: 2 }}>
            <Marca at={t.w(4, s.w)}>{s.a}</Marca>
            {s.r}
          </div>
        </Entra>
      ))}
      <Sfx at={t.w(4, "outubro")} name="impact-bass-2" vol={0.5} />
      <Sfx at={t.w(4, "Acesita.") - 3} name="pop" vol={0.45} />
      {siglas.map((s) => (
        <Sfx key={s.w} at={t.w(4, s.w)} name="click-soft" vol={0.35} />
      ))}
    </AbsoluteFill>
  );
};

// ================================================================= VILA
export const PV1: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Escuro j={["Povoado", "Vila operária", "Usina", "1944"]} />
      <Fita texto="quando a usina foi planejada" x={540} y={200} at={t.a(0)} rot={-2} size={46} centro />
      <Selo x={300} y={560} d={380} at={t.w(0, "200") - 4} rot={-6} cor="#F2EFE8">
        <div style={{ textAlign: "center" }}>
          <Serif size={120}>
            ~<Counter to={200} at={t.w(0, "200") - 4} dur={18} />
          </Serif>
          <div style={{ fontFamily: FS.maquina, fontSize: 32, color: K.tinta }}>moradores</div>
        </div>
      </Selo>
      <Seta de={[470, 650]} ate={[620, 830]} curva={-60} at={t.w(0, "vila")} cor="#F2EFE8" seed="v1s" largura={22} />
      <Selo x={720} y={1060} d={500} at={t.w(0, "mil.") - 8} rot={6}>
        <div style={{ textAlign: "center" }}>
          <Serif size={150}>
            <Counter to={2000} at={t.w(0, "mil.") - 8} dur={24} />
          </Serif>
          <div style={{ fontFamily: FS.maquina, fontSize: 34, color: K.tinta }}>vila prevista</div>
        </div>
      </Selo>
      <Sfx at={t.w(0, "200") - 4} name="pop" vol={0.4} />
      <Sfx at={t.w(0, "mil.") - 8} name="impact-bass-2" vol={0.45} />
    </AbsoluteFill>
  );
};

export const PV2: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  const itens = [
    { w: "Casas", txt: "✓ casas" },
    { w: "escolas", txt: "✓ escolas" },
    { w: "clubes", txt: "✓ clubes" },
    { w: "hospital", txt: "✓ hospital" },
  ];
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/usina.jpg" x={-30} y={140} w={1140} h={520} at={0} rot={-1.5} de="cima" seed="v2" pb={1} contraste={1.35} pos="50% 70%" zoom={[1.15, 1.3]} />
      <Fita texto="não ergueu só a fábrica" x={80} y={600} at={t.w(1, "fábrica")} rot={-3} size={46} />
      <Fita texto="ergueu a cidade" x={560} y={690} at={t.w(1, "Ergueu")} rot={3} size={46} />
      <Recorte src="recortes/saojose.png" x={30} y={930} w={700} at={t.w(1, "cidade")} seed="v2r" pb={0.35} />
      {itens.map((it, i) => (
        <Fita key={it.w} texto={it.txt} x={700} y={900 + i * 100} at={t.w(1, it.w)} rot={i % 2 ? 2 : -2} size={44} cps={60} />
      ))}
      {itens.map((it) => (
        <Sfx key={it.w} at={t.w(1, it.w)} name="click-soft" vol={0.4} />
      ))}
    </AbsoluteFill>
  );
};

export const PV3: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/cidade.jpg" x={40} y={170} w={1000} h={600} at={0} rot={-2} de="cima" seed="v3" pb={0.9} dur={300} />
      <Rotulo texto="HIERARQUIA" at={t.w(2, "hierarquia")} x={80} y={700} rot={-3} size={110} />
      <Fita texto="Funcionários: médicos, engenheiros e chefes" x={40} y={900} at={t.w(2, "Funcionários")} rot={-2} size={36} />
      <Fita texto="mais perto da fábrica" x={420} y={1000} at={t.w(2, "perto")} rot={3} size={44} />
      <Fita texto="mais longe: os operários" x={90} y={1140} at={t.w(2, "operários")} rot={-2} size={50} />
      <Seta de={[560, 1210]} ate={[740, 1330]} curva={60} at={t.w(2, "operários") + 6} seed="v3s" largura={22} />
      <Sfx at={t.w(2, "hierarquia")} name="pop" vol={0.45} />
      <Sfx at={t.w(2, "Funcionários")} name="typing" vol={0.2} dur={30} />
      <Sfx at={t.w(2, "operários")} name="click-soft" vol={0.4} />
    </AbsoluteFill>
  );
};

/** Casinhas desenhadas a mão (traço de nanquim), surgindo em ondas. */
const Casinha: React.FC<{ x: number; y: number; s: number; seed: string; telhado: string; p: number }> = ({ x, y, s, seed, telhado, p }) => {
  const j = (k: string, a = 0.07) => (random(seed + k) - 0.5) * 2 * a * s;
  const w = s;
  const h = s * 0.72;
  const corpo = `M${x + j("a")},${y + j("b")} L${x + w + j("c")},${y + j("d")} L${x + w + j("e")},${y + h + j("f")} L${x + j("g")},${y + h + j("h")} Z`;
  const teto = `M${x - s * 0.12 + j("i")},${y + j("j")} L${x + w / 2 + j("k")},${y - s * 0.52 + j("l")} L${x + w + s * 0.12 + j("m")},${y + j("n")} Z`;
  const porta = `M${x + w * 0.4},${y + h} L${x + w * 0.4},${y + h * 0.45} L${x + w * 0.62},${y + h * 0.45} L${x + w * 0.62},${y + h}`;
  return (
    <g opacity={p} transform={`translate(${x + w / 2} ${y + h}) scale(${0.4 + 0.6 * p}) rotate(${(random(seed + "r") - 0.5) * 8}) translate(${-(x + w / 2)} ${-(y + h)})`}>
      <path d={corpo} fill="#F2EFE8" stroke="#141414" strokeWidth={3.2} strokeLinejoin="round" />
      <path d={teto} fill={telhado} stroke="#141414" strokeWidth={3.2} strokeLinejoin="round" />
      <path d={porta} fill="none" stroke="#141414" strokeWidth={2.6} />
      <rect x={x + w * 0.12} y={y + h * 0.22} width={w * 0.18} height={w * 0.16} fill="none" stroke="#141414" strokeWidth={2.4} />
    </g>
  );
};

const CasasDesenhadas: React.FC<{ at: number; dur: number; x: number; y: number; cols: number; rows: number; gap: number; s: number }> = ({ at, dur, x, y, cols, rows, gap, s }) => {
  const f = useCurrentFrame();
  const n = cols * rows;
  const mostradas = ip(f, [at, at + dur], [0, n]);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        // ordem de surgimento: do centro para fora, em ondas
        const ordem = Math.abs(c - (cols - 1) / 2) + r * 0.9 + random(`o${i}`) * 1.2;
        const limite = (ordem / (cols / 2 + rows * 0.9 + 1.2)) * n;
        const p = Math.max(0, Math.min(1, (mostradas - limite) / 6));
        if (p <= 0) return null;
        const dx = (r % 2) * (gap / 2);
        const telhado = i % 9 === 0 ? K.vermelho : i % 3 === 0 ? K.lima : "#d8d3c8";
        return <Casinha key={i} x={x + c * gap + dx + (random(`jx${i}`) - 0.5) * 6} y={y + r * gap * 0.92 + (random(`jy${i}`) - 0.5) * 6} s={s} seed={`cs${i}`} telhado={telhado} p={p} />;
      })}
    </svg>
  );
};

export const PV4: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  const tN = t.w(3, "2.734") - 4;
  return (
    <AbsoluteFill>
      <Amassado />
      <Selo x={190} y={250} d={250} at={t.a(3)} rot={-8}>
        <Serif size={92}>1958</Serif>
      </Selo>
      <Entra at={tN} style={{ left: 330, top: 150 }} y={30}>
        <div style={{ background: K.tinta, padding: "6px 30px 0", rotate: "-2deg", boxShadow: "0 12px 24px rgba(0,0,0,0.45)" }}>
          <Serif size={190} cor={K.lima}>
            <Counter to={2734} at={tN} dur={36} />
          </Serif>
        </div>
      </Entra>
      <Fita texto="casas da empresa" x={420} y={400} at={t.w(3, "casas")} rot={2} size={52} />
      <CasasDesenhadas at={t.a(3) + 10} dur={58} x={70} y={570} cols={11} rows={10} gap={85} s={57} />
      <Fita texto="cada desenho ≈ 25 casas" x={540} y={1445} at={tN + 30} rot={-2} size={34} centro />
      <Sfx at={t.a(3)} name="pop" vol={0.4} />
      <Sfx at={tN} name="riser" vol={0.25} dur={40} />
      <Sfx at={tN + 8} name="typing" vol={0.18} dur={30} />
    </AbsoluteFill>
  );
};

export const PV5: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Fita texto="assim nasceram dois núcleos" x={540} y={110} at={t.a(4)} rot={-2} size={44} centro />
      <Foto src="fotos/saojose.jpg" x={40} y={200} w={1000} h={560} at={t.w(4, "lado") - 4} rot={-2} de="cima" seed="v5a" pb={0.9} dur={200} />
      <Fita texto="a vila da empresa" x={600} y={190} at={t.w(4, "vila")} rot={3} size={42} />
      <Rotulo texto="ACESITA" at={t.w(4, "Acesita.")} x={90} y={640} rot={-4} />
      <Foto src="fotos/saosebastiao_edu.jpg" x={250} y={830} w={580} h={652} at={t.w(4, "outro") - 6} rot={2} de="baixo" seed="v5b" pb={0.6} zoom={[1.0, 1.02]} dur={160} />
      <Fita texto="o povoado antigo" x={540} y={850} at={t.w(4, "povoado")} rot={3} size={42} />
      <Rotulo texto="TIMÓTEO" at={t.w(4, "Timóteo.")} x={560} y={1430} rot={3} fundo="#fff" />
      <Sfx at={t.w(4, "Acesita.")} name="pop" vol={0.45} />
      <Sfx at={t.w(4, "outro") - 6} name="whoosh-short" vol={0.35} />
      <Sfx at={t.w(4, "Timóteo.")} name="pop" vol={0.45} />
    </AbsoluteFill>
  );
};

// ================================================================= EMANCIPAÇÃO
export const PE1: React.FC<PainelProps> = ({ b, off, len }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <MapaTerreno escala={0.75} cx={274.6} cy={112.4} tilt={28} zoom={[1.0, 1.08]} dur={len} contornos={[{ nome: "Coronel Fabriciano", at: t.w(0, "Coronel"), cor: "#fff", preencher: true }]} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #151515 0%, rgba(21,21,21,0.8) 9%, rgba(21,21,21,0) 22%)" }} />
      <Selo x={230} y={330} d={260} at={t.a(0)} rot={-6}>
        <Serif size={96}>1948</Serif>
      </Selo>
      <Fita texto="o distrito passa a pertencer a…" x={440} y={300} at={t.w(0, "pertencer")} rot={3} size={38} />
      <Rotulo texto="CORONEL FABRICIANO" at={t.w(0, "Coronel")} x={60} y={1100} rot={-3} size={82} fundo="#fff" />
      <Fita texto="e a arrecadação da usina?" x={320} y={1260} at={t.w(0, "arrecadação")} rot={2} size={44} />
      <Sfx at={t.a(0)} name="pop" vol={0.4} />
      <Sfx at={t.w(0, "Coronel")} name="pop" vol={0.4} />
      <Sfx at={t.w(0, "arrecadação")} name="click-soft" vol={0.4} />
    </AbsoluteFill>
  );
};

export const PE2: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  const f = useCurrentFrame();
  const linhas = [
    { w: "aprovada", txt: "1962 · Assembleia aprova", risca: false },
    { w: "Vetada", txt: "governador veta", risca: true },
    { w: "aliança", txt: "uma aliança política se desfaz", risca: false },
  ];
  return (
    <AbsoluteFill>
      <Escuro j={["Emancipação", "Assembleia", "Governador", "Veto", "Aliança"]} />
      <Foto src="tex/folha.jpg" x={70} y={260} w={940} h={860} at={t.a(1) - 2} rot={-2} de="baixo" seed="e2" pb={0} contraste={1} zoom={[1, 1]} borda={false}>
        <div style={{ position: "absolute", inset: 0, padding: "80px 70px" }}>
          <div style={{ fontFamily: FS.maquina, fontSize: 40, color: "#333", letterSpacing: 4 }}>A EMANCIPAÇÃO</div>
          {linhas.map((l) => {
            const at = t.w(1, l.w);
            const p = ip(f, [at, at + 6], [0, 1]);
            const r = l.risca ? ip(f, [at + 10, at + 18], [0, 1], EASE_IO) : 0;
            return (
              <div key={l.w} style={{ position: "relative", marginTop: 54, opacity: p, fontFamily: FS.serif, fontWeight: 700, fontSize: 70, lineHeight: 1.05, color: K.tinta }}>
                {l.txt}
                {l.risca ? <div style={{ position: "absolute", left: -10, top: "52%", height: 12, width: `${r * 105}%`, background: K.vermelho, rotate: "-2deg" }} /> : null}
              </div>
            );
          })}
        </div>
      </Foto>
      {linhas.map((l) => (
        <Sfx key={l.w} at={t.w(1, l.w)} name="click-soft" vol={0.4} />
      ))}
    </AbsoluteFill>
  );
};

export const PE3: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Shake at={[t.w(2, "município")]} amp={16}>
        <Escuro j={["29 de abril", "1964", "Município", "Timóteo"]} />
        <Selo x={540} y={640} d={540} at={t.w(2, "29") - 2} rot={-5}>
          <div style={{ textAlign: "center", lineHeight: 0.95 }}>
            <Serif size={140}>29.04</Serif>
            <Serif size={110}>1964</Serif>
          </div>
        </Selo>
        <CarimboV at={t.w(2, "município")} texto="MUNICÍPIO" x={540} y={1150} size={140} rot={-8} />
      </Shake>
      <Sfx at={t.w(2, "29") - 2} name="pop" vol={0.45} />
      <Sfx at={t.w(2, "município")} name="impact-bass-1" vol={0.7} />
    </AbsoluteFill>
  );
};

// ================================================================= PLEBISCITO
export const PPl: React.FC<PainelProps> = ({ b, off }) => {
  const f = useCurrentFrame();
  const t = mk(b, off);
  const tC = t.a(0) + 8;
  const tV = t.a(1);
  const tB = t.w(2, "barrou");
  const total = 12861 + 4908;
  const pSim = ip(f, [tV, tV + 24], [0, 12861 / total], EASE_IO);
  const pNao = ip(f, [t.w(1, "4.908"), t.w(1, "4.908") + 22], [0, 4908 / total], EASE_IO);
  return (
    <AbsoluteFill>
      <Shake at={[tB]} amp={16}>
        <Escuro j={["Plebiscito", "Acesita ou Timóteo", "Assembleia", "1979 · 1981", "Mudança de nome"]} />
        <Fita texto="a marca era tão forte..." x={540} y={150} at={t.w(0, "marca") - 2} rot={-2} size={48} centro />
        <Foto src="tex/folha.jpg" x={90} y={260} w={900} h={640} at={tC} rot={-3} de="baixo" seed="pl1" pb={0} contraste={1} zoom={[1, 1]} borda={false}>
          <div style={{ position: "absolute", inset: 0, padding: "70px 70px" }}>
            <div style={{ fontFamily: FS.maquina, fontSize: 40, color: "#333", letterSpacing: 4 }}>PLEBISCITO · 1979–1981</div>
            <div style={{ fontFamily: FS.serif, fontWeight: 900, fontSize: 92, lineHeight: 1.0, color: K.tinta, marginTop: 30 }}>
              Trocar o nome da cidade para <Marca at={t.w(0, "trocar")}>Acesita?</Marca>
            </div>
          </div>
        </Foto>
        {f >= tV - 2 ? (
          <div style={{ position: "absolute", left: 90, top: 980, width: 900 }}>
            <div style={{ fontFamily: FS.cond, fontSize: 56, color: "#fff", letterSpacing: 2 }}>A FAVOR</div>
            <div style={{ height: 92, background: "rgba(255,255,255,0.08)", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pSim * 100}%`, background: K.lima }} />
              <div style={{ position: "absolute", left: 20, top: 10, fontFamily: FS.cond, fontSize: 64, color: K.tinta }}>
                <Counter to={12861} at={tV} dur={24} />
              </div>
            </div>
            <div style={{ fontFamily: FS.cond, fontSize: 56, color: "#fff", letterSpacing: 2, marginTop: 26 }}>CONTRA</div>
            <div style={{ height: 92, background: "rgba(255,255,255,0.08)", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pNao * 100}%`, background: "#fff" }} />
              <div style={{ position: "absolute", left: 20, top: 10, fontFamily: FS.cond, fontSize: 64, color: K.tinta }}>
                <Counter to={4908} at={t.w(1, "4.908")} dur={22} />
              </div>
            </div>
          </div>
        ) : null}
        <CarimboV at={tB} texto="BARRADO" x={540} y={700} size={180} rot={-14} />
        <Rotulo texto="CONTINUOU TIMÓTEO" at={t.w(2, "Timóteo.")} x={130} y={1380} rot={-2} size={78} />
      </Shake>
      <Sfx at={tC} name="whoosh-short" vol={0.35} />
      <Sfx at={tV} name="riser" vol={0.25} dur={40} />
      <Sfx at={tB} name="impact-bass-1" vol={0.7} />
      <Sfx at={t.w(2, "Timóteo.")} name="pop" vol={0.45} />
    </AbsoluteFill>
  );
};

// ================================================================= NOMES DA USINA
export const PN1: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  const tArc = t.w(0, "ArcelorMittal");
  const tApe = t.w(0, "Aperam");
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/predio_acesita.jpg" x={60} y={150} w={960} h={600} at={0} rot={-2} de="cima" seed="n1a" pb={0.8} zoom={[1, 1.05]} dur={300} />
      <Foto src="fotos/aperam.jpg" x={60} y={150} w={960} h={600} at={tApe - 4} rot={2} de="dir" seed="n1b" pb={0.8} dur={140} />
      <Fita texto="1992 · privatizada" x={80} y={770} at={t.w(0, "privatizada")} rot={-3} size={50} />
      <Rotulo texto="ACESITA" at={2} x={80} y={880} rot={-2} size={84} fundo="#fff" />
      <Risco x1={70} y1={940} x2={430} y2={925} at={tArc} />
      <Rotulo texto="ARCELORMITTAL TIMÓTEO" at={tArc} x={80} y={1010} rot={2} size={70} fundo="#fff" />
      <Risco x1={70} y1={1060} x2={940} y2={1040} at={tApe} />
      <Rotulo texto="APERAM SOUTH AMERICA" at={tApe} x={80} y={1150} rot={-2} size={74} />
      <Fita texto="2007" x={760} y={880} at={tArc} rot={4} size={44} />
      <Fita texto="2011" x={820} y={1270} at={tApe} rot={-3} size={44} />
      <Sfx at={t.w(0, "privatizada")} name="click-soft" vol={0.4} />
      <Sfx at={tArc} name="whoosh-short" vol={0.35} />
      <Sfx at={tApe} name="whoosh-short" vol={0.35} />
    </AbsoluteFill>
  );
};

export const PN2: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Escuro j={["Aço inoxidável", "Aço elétrico", "América do Sul", "Exportação"]} />
      <Foto src="fotos/usina.jpg" x={40} y={260} w={1000} h={620} at={0} rot={-2} de="esq" seed="n2" pb={0.2} pos="50% 70%" zoom={[1.1, 1.25]} dur={150} />
      <Faixa y={950} h={300} at={t.w(1, "maior") - 2} seed="n2f">
        <div style={{ textAlign: "center" }}>
          <Serif size={74} cor="#fff" italic>
            maior produtora de
          </Serif>
          <Serif size={96} cor="#fff" italic>
            <Marca at={t.w(1, "inoxidável")}><span style={{ color: K.tinta }}>aço inox</span></Marca> e elétrico
          </Serif>
        </div>
      </Faixa>
      <Fita texto="da América do Sul" x={540} y={1300} at={t.w(1, "América")} rot={-2} size={50} centro />
      <Sfx at={t.w(1, "maior") - 2} name="whoosh" vol={0.35} />
      <Sfx at={t.w(1, "inoxidável")} name="pop" vol={0.4} />
    </AbsoluteFill>
  );
};

export const PN3: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/predio_acesita.jpg" x={60} y={180} w={960} h={640} at={0} rot={-3} de="cima" seed="n3" zoom={[1.0, 1.05]} dur={250} />
      <CirculoPincel x={600} y={272} w={440} h={140} at={t.w(2, "Acesita.")} seed="n3c" largura={18} />
      <Rotulo texto="CENTRO-NORTE" at={t.w(2, "Centro-Norte")} x={90} y={760} rot={-3} size={80} />
      <Fita texto="“aqui ainda é Acesita”" x={420} y={900} at={t.w(2, "Acesita.")} rot={3} size={50} />
      <Fita texto="quem chega de fora…" x={100} y={1120} at={t.w(2, "fora")} rot={-2} size={50} />
      <Rotulo texto="SE CONFUNDE" at={t.w(2, "confunde.")} x={360} y={1230} rot={3} size={96} fundo="#fff" />
      <Sfx at={t.w(2, "Acesita.")} name="click-soft" vol={0.45} />
      <Sfx at={t.w(2, "confunde.")} name="pop" vol={0.45} />
    </AbsoluteFill>
  );
};

// ================================================================= PARQUE
export const PQ1: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Entra at={t.w(0, "1944") - 3} style={{ left: 0, right: 0, top: 170, textAlign: "center" }} y={30}>
        <Serif size={240} style={{ letterSpacing: -6 }}>
          <Marca at={t.w(0, "1944") + 4}>1944</Marca>
        </Serif>
      </Entra>
      <Fita texto="uma segunda herança" x={540} y={460} at={t.w(0, "segunda")} rot={-3} size={52} centro />
      <Foto src="fotos/usina.jpg" x={40} y={620} w={480} h={620} at={t.w(0, "herança") - 4} rot={-4} de="esq" seed="q1a" pb={1} pos="40% 70%" zoom={[1.3, 1.4]} />
      <Foto src="fotos/lagoa.jpg" x={560} y={660} w={480} h={620} at={t.w(0, "herança")} rot={4} de="dir" seed="q1b" pb={0.3} pos="50% 50%" />
      <Sfx at={t.w(0, "1944") - 3} name="impact-bass-2" vol={0.5} />
      <Sfx at={t.w(0, "herança") - 4} name="whoosh-short" vol={0.35} />
    </AbsoluteFill>
  );
};

export const PQ2: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/mata.jpg" x={40} y={160} w={1000} h={520} at={0} rot={-2} de="cima" seed="q2a" pb={0.6} pos="50% 70%" dur={200} />
      <Fita texto="a mata virava carvão" x={90} y={620} at={t.w(1, "carvão.") - 4} rot={-3} size={50} />
      <Risco x1={60} y1={420} x2={1010} y2={380} at={t.w(1, "derrubava")} largura={16} />
      <Foto src="fotos/lagoa.jpg" x={40} y={820} w={1000} h={560} at={t.w(1, "proteger") - 6} rot={2} de="baixo" seed="q2b" pb={0.3} dur={160} />
      <Fita texto="para proteger o que restava" x={480} y={770} at={t.w(1, "proteger")} rot={3} size={40} />
      <Rotulo texto="PARQUE ESTADUAL" at={t.w(1, "Parque")} x={60} y={1260} rot={-3} size={84} />
      <Rotulo texto="DO RIO DOCE" at={t.w(1, "Doce.")} x={360} y={1360} rot={-2} size={84} fundo="#fff" />
      <Sfx at={t.w(1, "derrubava")} name="click-soft" vol={0.45} />
      <Sfx at={t.w(1, "proteger") - 6} name="whoosh" vol={0.35} />
      <Sfx at={t.w(1, "Parque")} name="pop" vol={0.4} />
    </AbsoluteFill>
  );
};

export const PQ3: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Escuro j={["Parque Estadual do Rio Doce", "1944", "Conservação", "Minas Gerais"]} />
      <Selo x={540} y={700} d={520} at={t.a(2)} rot={-6}>
        <Serif size={230}>1ª</Serif>
      </Selo>
      <Fita texto="unidade de conservação" x={540} y={1060} at={t.w(2, "unidade")} rot={-2} size={56} centro />
      <Fita texto="de Minas Gerais" x={540} y={1170} at={t.w(2, "Minas")} rot={2} size={56} centro />
      <Sfx at={t.a(2)} name="impact-bass-2" vol={0.55} />
    </AbsoluteFill>
  );
};

export const PQ4: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/orbital.jpg" x={150} y={150} w={780} h={780} at={0} rot={-3} de="pop" seed="q4" pb={0.1} lados={{ top: true, bottom: true, left: true, right: true }} zoom={[1.1, 1.35]} dur={280} />
      <Fita texto="visto do espaço · foto NASA" x={560} y={880} at={8} rot={4} size={34} />
      <Rotulo texto="≈ 36 MIL HECTARES" at={t.w(3, "36")} x={60} y={990} rot={-3} size={84} />
      <Rotulo texto="~40 LAGOAS" at={t.w(3, "40")} x={460} y={1100} rot={3} size={84} fundo="#fff" />
      <Fita texto="maior área contínua de Mata Atlântica de MG" x={40} y={1235} at={t.w(3, "maior")} rot={-2} size={34} />
      <Sfx at={t.w(3, "36")} name="pop" vol={0.4} />
      <Sfx at={t.w(3, "40")} name="pop" vol={0.4} />
      <Bichos at={t.w(3, "Ali") - 4} onca={t.w(3, "onça-pintada") - 4} muriqui={t.w(3, "muriqui.") - 6} />
    </AbsoluteFill>
  );
};

/** "Ali vivem a onça-pintada e o muriqui": folha nova entra e os dois bichos chegam recortados. */
const Bichos: React.FC<{ at: number; onca: number; muriqui: number }> = ({ at, onca, muriqui }) => {
  const f = useCurrentFrame();
  if (f < at - 1) return null;
  const p = ip(f, [at, at + 9], [0, 1], EASE_IO);
  return (
    <AbsoluteFill style={{ translate: `${(1 - p) * 1080}px 0`, filter: p < 1 ? `blur(${(1 - p) * 20}px)` : undefined }}>
      <Amassado />
      <Fita texto="ali vivem" x={540} y={120} at={at + 2} rot={-2} size={48} centro />
      <Recorte src="recortes/onca.png" x={30} y={230} w={1000} at={onca} rot={-2} de="dir" seed="onca" pb={0.15} />
      <Rotulo texto="ONÇA-PINTADA" at={onca + 6} x={60} y={790} rot={-3} size={92} />
      <Fita texto="maior felino das Américas" x={430} y={900} at={onca + 14} rot={2} size={34} />
      <Recorte src="recortes/muriqui.png" x={420} y={930} w={600} at={muriqui} rot={3} de="esq" seed="muri" pb={0.15} />
      <Rotulo texto="MURIQUI" at={muriqui + 6} x={40} y={1150} rot={-4} size={96} fundo="#fff" />
      <Fita texto="maior primata das Américas" x={40} y={1290} at={muriqui + 14} rot={-2} size={32} />
      <Sfx at={at} name="whoosh-short" vol={0.35} />
      <Sfx at={onca} name="pop" vol={0.45} />
      <Sfx at={muriqui} name="pop" vol={0.45} />
    </AbsoluteFill>
  );
};

// ================================================================= ESPREMIDA
export const PS1: React.FC<PainelProps> = ({ b, off, len }) => {
  const t = mk(b, off);
  const c = GEO.centroids["Timóteo"];
  return (
    <AbsoluteFill>
      <MapaTerreno escala={0.95} cx={c[0] + 0.3} cy={c[1]} tilt={0} zoom={[1.0, 1.08]} dur={len} parqueAt={t.w(0, "terço") - 6} />
      <Entra at={t.w(0, "terço") - 4} style={{ left: 0, right: 0, top: 160, textAlign: "center" }} y={30}>
        <div style={{ display: "inline-block", background: K.tinta, padding: "10px 40px 0", rotate: "-2deg", boxShadow: "0 12px 24px rgba(0,0,0,0.5)" }}>
          <Serif size={230} cor={K.lima}>
            <Counter to={37} at={t.w(0, "terço") - 4} dur={20} suffix="%" />
          </Serif>
        </div>
      </Entra>
      <Fita texto="do território fica dentro do parque" x={540} y={480} at={t.w(0, "parque.") - 4} rot={2} size={42} centro />
      <Sfx at={t.w(0, "terço") - 4} name="riser" vol={0.25} dur={30} />
    </AbsoluteFill>
  );
};

export const PS2: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/rio.jpg" x={40} y={160} w={1000} h={540} at={0} rot={-2} de="cima" seed="s2a" pb={0.7} pos="50% 60%" dur={200} />
      <Fita texto="ao norte: o rio Piracicaba" x={80} y={640} at={t.w(1, "rio.") - 2} rot={-3} size={48} />
      <Foto src="fotos/pico_anamoura.jpg" x={40} y={820} w={1000} h={540} at={t.w(1, "oeste") - 6} rot={2} de="baixo" seed="s2b" pb={0.6} zoom={[1.0, 1.04]} dur={160} />
      <CirculoPincel x={695} y={1040} w={380} h={250} at={t.w(1, "Pico")} seed="s2c" largura={16} />
      <Fita texto="a oeste: as serras" x={560} y={790} at={t.w(1, "serras")} rot={3} size={46} />
      <Rotulo texto="PICO DO ANA MOURA · 864 M" at={t.w(1, "Pico")} x={50} y={1290} rot={-2} size={64} />
      <Sfx at={t.w(1, "oeste") - 6} name="whoosh-short" vol={0.35} />
      <Sfx at={t.w(1, "Pico")} name="pop" vol={0.4} />
    </AbsoluteFill>
  );
};

const CENSOS = [
  { a: "1970", v: 32760 },
  { a: "1980", v: 50601 },
  { a: "1991", v: 58298 },
  { a: "2000", v: 71478 },
  { a: "2010", v: 81243 },
  { a: "2022", v: 81579 },
];

export const PS3: React.FC<PainelProps> = ({ b, off }) => {
  const f = useCurrentFrame();
  const t = mk(b, off);
  const tE = t.w(2, "Entre");
  return (
    <AbsoluteFill>
      <Amassado />
      <Fita texto="resultado: pouco espaço para crescer" x={540} y={160} at={t.a(2)} rot={-2} size={40} centro />
      {CENSOS.map((c, i) => {
        const at = Math.min(tE - 20, t.a(2) + 6) + i * 5;
        const p = ip(f, [at, at + 14], [0, 1], EASE_IO);
        const h = (c.v / 90000) * 820 * p;
        const ult = i >= 4;
        return (
          <div key={c.a}>
            <div
              style={{
                position: "absolute",
                left: 70 + i * 160,
                top: 1220 - h,
                width: 130,
                height: h,
                background: i === 5 ? K.lima : ult ? "#F2EFE8" : "#d8d3c8",
                clipPath: rasgado("bar" + i, { top: true }, 6, 0),
                boxShadow: "0 8px 12px rgba(0,0,0,0.3)",
              }}
            />
            <div style={{ position: "absolute", left: 70 + i * 160, width: 130, top: 1240, textAlign: "center", fontFamily: FS.maquina, fontSize: 34, color: K.tinta, opacity: p }}>{c.a}</div>
          </div>
        );
      })}
      <Rotulo texto="+0,4%" at={t.w(2, "menos")} x={640} y={300} rot={4} size={140} />
      <Fita texto="2010 → 2022" x={660} y={470} at={t.w(2, "menos") + 4} rot={-3} size={44} />
      <Sfx at={tE - 20} name="riser" vol={0.22} dur={40} />
      <Sfx at={t.w(2, "menos")} name="pop" vol={0.45} />
    </AbsoluteFill>
  );
};

export const PS4: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Foto src="fotos/cidade.jpg" x={40} y={170} w={1000} h={620} at={0} rot={-2} de="cima" seed="s4" pb={0.9} dur={100} />
      <Faixa y={860} h={340} at={0} seed="s4f">
        <div style={{ textAlign: "center" }}>
          <Serif size={96} cor="#fff" italic>
            <span style={{ position: "relative" }}>
              não se espalha
              <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 12, background: K.vermelho, transformOrigin: "left", scale: `${ip(useCurrentFrame(), [t.w(3, "espalha.") + 4, t.w(3, "espalha.") + 12], [0, 1])} 1` }} />
            </span>
          </Serif>
          <Serif size={110} cor="#fff" italic>
            <Marca at={t.w(3, "adensa.")}><span style={{ color: K.tinta }}>se adensa.</span></Marca>
          </Serif>
        </div>
      </Faixa>
      <Sfx at={t.w(3, "adensa.")} name="pop" vol={0.45} />
    </AbsoluteFill>
  );
};

// ================================================================= NÚMEROS
export const PNu: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Escuro j={["PIB", "IDH", "IBGE", "PNUD", "Timóteo"]} />
      <Fita texto="e, mesmo assim, os números impressionam" x={540} y={190} at={t.a(0)} rot={-2} size={38} centro />
      <Selo x={540} y={640} d={560} at={t.w(1, "PIB") - 2} rot={-5}>
        <div style={{ textAlign: "center", lineHeight: 0.95 }}>
          <div style={{ fontFamily: FS.maquina, fontSize: 34, color: K.tinta }}>PIB por habitante</div>
          <Serif size={130}>R$ 56 mil</Serif>
          <div style={{ fontFamily: FS.maquina, fontSize: 28, color: K.tinta, marginTop: 6 }}>IBGE · 2023</div>
        </div>
      </Selo>
      <Selo x={600} y={1150} d={400} at={t.w(1, "Índice") - 2} rot={6} cor="#F2EFE8">
        <div style={{ textAlign: "center", lineHeight: 0.95 }}>
          <div style={{ fontFamily: FS.maquina, fontSize: 30, color: K.tinta }}>IDH</div>
          <Serif size={120}>0,770</Serif>
          <div style={{ fontFamily: FS.cond, fontSize: 48, color: K.tinta }}>ALTO</div>
        </div>
      </Selo>
      <Sfx at={t.w(1, "PIB") - 2} name="pop" vol={0.45} />
      <Sfx at={t.w(1, "Índice") - 2} name="pop" vol={0.45} />
    </AbsoluteFill>
  );
};

// ================================================================= FINAL
export const PF1: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  return (
    <AbsoluteFill>
      <Amassado />
      <Fita texto="no fim, Timóteo é isso" x={540} y={90} at={t.a(0)} rot={-2} size={44} centro />
      <Foto src="fotos/usina.jpg" x={-30} y={170} w={1140} h={600} at={t.w(1, "alto-forno") - 8} rot={-2} de="cima" seed="f1a" pb={1} contraste={1.35} pos="50% 70%" zoom={[1.2, 1.35]} dur={240} />
      <Rotulo texto="UM ALTO-FORNO" at={t.w(1, "alto-forno")} x={70} y={640} rot={-4} fundo={K.tinta} cor="#fff" size={84} />
      <Foto src="fotos/lagoa.jpg" x={-30} y={1000} w={1140} h={560} at={t.w(1, "floresta") - 6} rot={2} de="baixo" seed="f1b" pb={0.4} dur={200} />
      <Rotulo texto="UMA FLORESTA PROTEGIDA" at={t.w(1, "floresta")} x={70} y={1010} rot={3} fundo={K.tinta} cor="#fff" size={70} />
      <Faixa y={790} h={200} at={t.w(1, "Nascidos") - 2} seed="f1f">
        <Serif size={84} cor="#fff" italic>
          <Troca at={t.w(1, "Dividindo")} antes={<span>nascidos no mesmo ano.</span>} depois={<span>dividindo o mesmo chão.</span>} />
        </Serif>
      </Faixa>
      <Sfx at={t.w(1, "alto-forno") - 8} name="whoosh-short" vol={0.35} />
      <Sfx at={t.w(1, "floresta") - 6} name="whoosh-short" vol={0.35} />
      <Sfx at={t.w(1, "Nascidos") - 2} name="whoosh" vol={0.35} />
    </AbsoluteFill>
  );
};

export const PF2: React.FC<PainelProps> = ({ b, off }) => {
  const t = mk(b, off);
  const tD = t.w(3, "duas.");
  return (
    <AbsoluteFill>
      <Shake at={[tD - 2]} amp={12}>
        <Escuro j={["Acesita", "Timóteo", "Aço", "Mata Atlântica", "1964 · 2026"]} />
        <Rotulo texto="ACESITA?" at={t.a(2)} x={90} y={300} rot={-4} size={130} fundo="#F2EFE8" />
        <Rotulo texto="TIMÓTEO?" at={t.w(2, "Timóteo?")} x={400} y={470} rot={3} size={130} />
        <Faixa y={720} h={240} at={tD - 4} seed="f2f">
          <Serif size={130} cor="#fff" italic>
            <Marca at={tD}><span style={{ color: K.tinta }}>as duas.</span></Marca>
          </Serif>
        </Faixa>
        <Fita texto="aço + Mata Atlântica" x={540} y={1030} at={t.w(3, "Aço")} rot={-2} size={56} centro />
        <Selo x={540} y={1280} d={300} at={t.w(3, "62")} rot={6}>
          <div style={{ textAlign: "center", lineHeight: 0.9 }}>
            <Serif size={120}>62</Serif>
            <div style={{ fontFamily: FS.cond, fontSize: 42, color: K.tinta }}>ANOS</div>
          </div>
        </Selo>
      </Shake>
      <Sfx at={t.a(2)} name="pop" vol={0.45} />
      <Sfx at={t.w(2, "Timóteo?")} name="pop" vol={0.45} />
      <Sfx at={tD - 2} name="impact-bass-2" vol={0.6} />
      <Sfx at={t.w(3, "62")} name="chime" vol={0.45} />
    </AbsoluteFill>
  );
};

export const PCreditos: React.FC<PainelProps> = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Escuro j={["Timóteo", "Acesita", "Parque Estadual", "Rio Doce", "Vale do Aço", "1944"]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", opacity: ip(f, [0, 10], [0, 1]) }}>
        <Serif size={190} cor="#fff">Timóteo</Serif>
      </div>
      <Fita texto="uma cidade, dois nomes" x={540} y={760} at={6} rot={-2} size={56} centro />
      <div style={{ position: "absolute", left: 80, right: 80, top: 960, textAlign: "center", fontFamily: FS.maquina, fontSize: 26, lineHeight: 1.6, color: "#bdbdbd", opacity: ip(f, [14, 26], [0, 1]) }}>
        Fotos: HVL, Fernando Marino, Tico-Tico, Wesley Menezes, Charles J. Sharp, Peter Schoen (Wikimedia Commons, CC BY / CC BY-SA)
        <br />
        NASA e retrato de Percival Farquhar (domínio público)
        <br />
        Fontes: Wikipédia, IBGE, PNUD · Locução: HyperFrames TTS · Animação: Remotion
      </div>
      <Img src={staticFile("tex/folha.jpg")} style={{ display: "none" }} />
    </AbsoluteFill>
  );
};

/** Mapeamento: cena → painéis (fala inicial de cada painel). */
export const ROTEIRO_PAINEIS: { cena: string; de: number; C: React.FC<PainelProps> }[] = [
  { cena: "abertura", de: 0, C: PAb1 },
  { cena: "abertura", de: 5, C: PAb2 },
  { cena: "titulo", de: 0, C: PTitulo },
  { cena: "mapa", de: 0, C: PM1 },
  { cena: "mapa", de: 1, C: PM2 },
  { cena: "mapa", de: 2, C: PM3 },
  { cena: "origem", de: 0, C: PO1 },
  { cena: "origem", de: 1, C: PO2 },
  { cena: "origem", de: 2, C: PO3 },
  { cena: "origem", de: 3, C: PO4 },
  { cena: "origem", de: 4, C: PO5 },
  { cena: "porque", de: 0, C: PP1 },
  { cena: "porque", de: 1, C: PP2 },
  { cena: "porque", de: 2, C: PP3 },
  { cena: "porque", de: 3, C: PP4 },
  { cena: "porque", de: 4, C: PP5 },
  { cena: "vila", de: 0, C: PV1 },
  { cena: "vila", de: 1, C: PV2 },
  { cena: "vila", de: 2, C: PV3 },
  { cena: "vila", de: 3, C: PV4 },
  { cena: "vila", de: 4, C: PV5 },
  { cena: "emancipacao", de: 0, C: PE1 },
  { cena: "emancipacao", de: 1, C: PE2 },
  { cena: "emancipacao", de: 2, C: PE3 },
  { cena: "plebiscito", de: 0, C: PPl },
  { cena: "nomes", de: 0, C: PN1 },
  { cena: "nomes", de: 1, C: PN2 },
  { cena: "nomes", de: 2, C: PN3 },
  { cena: "parque", de: 0, C: PQ1 },
  { cena: "parque", de: 1, C: PQ2 },
  { cena: "parque", de: 2, C: PQ3 },
  { cena: "parque", de: 3, C: PQ4 },
  { cena: "espremida", de: 0, C: PS1 },
  { cena: "espremida", de: 1, C: PS2 },
  { cena: "espremida", de: 2, C: PS3 },
  { cena: "espremida", de: 3, C: PS4 },
  { cena: "numeros", de: 0, C: PNu },
  { cena: "final", de: 0, C: PF1 },
  { cena: "final", de: 2, C: PF2 },
  { cena: "creditos", de: 0, C: PCreditos },
];

export { P };
