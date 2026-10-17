import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { METAS, RITMO } from "../dados";
import {
  clamp,
  COR,
  EASE,
  FONTE_TEXTO,
  FONTE_TITULO,
  formatarNumero,
} from "../marca";

// Gráfico da trajetória de seguidores: trecho real sólido (série do Metricool) e projeções
// tracejadas até 31/12 (marco de 30/11 e meta em verde-neon, desafio em amarelo).
// Tudo é calculado a partir de `altura` (altura útil do gráfico), para o painel poder encolher
// e abrir espaço para os indicadores sem distorcer textos.

// Dia do ano de uma data "dd/mm" (2026 não é bissexto)
const DIAS_ANTES_DO_MES = [
  0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
];
const diaDoAno = (data: string) => {
  const [dia, mes] = data.split("/").map(Number);
  return DIAS_ANTES_DO_MES[mes - 1] + dia;
};

const [MARCO, META, DESAFIO] = METAS;
const INICIO = { data: RITMO.serie.inicio, valor: RITMO.seguidores2807 };
const HOJE = { data: RITMO.serie.fim, valor: RITMO.seguidores1610 };
const [NOTA_MARCO] = MARCO.leitura.split(", ").slice(-1);
const [ROTULO_DESAFIO] = DESAFIO.leitura.split(":");

// Geometria (px, relativa ao painel)
export const PAINEL_LARGURA = 920;
const ESQUERDA = 116;
const DIREITA = 690;
const TOPO = 96;
const RODAPE = 72; // eixo de datas abaixo do gráfico
const V_MIN = 24000;
const V_MAX = 28500;
const GRADE = [25000, 26000, 27000, 28000];

export const alturaDoPainel = (altura: number) => TOPO + altura + RODAPE;

const D0 = diaDoAno(INICIO.data);
const D1 = diaDoAno(META.data);
const x = (data: string) =>
  ESQUERDA + ((diaDoAno(data) - D0) / (D1 - D0)) * (DIREITA - ESQUERDA);

type Momentos = {
  real: number;
  chipInicio: number;
  chipHoje: number;
  marco: number;
  chipMarco: number;
  dataMarco: number;
  meta: number;
  chipMeta: number;
  dataMeta: number;
  desafio: number;
  chipDesafio: number;
};

// Ponto parcial de A a B (desenho progressivo de um segmento)
const ate = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  t: number,
) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

export const MetasGrafico: React.FC<{
  f: number;
  altura: number;
  M: Momentos;
}> = ({ f, altura, M }) => {
  const { fps } = useVideoConfig();
  const base = TOPO + altura;
  const y = (v: number) => base - ((v - V_MIN) / (V_MAX - V_MIN)) * altura;
  const P = {
    inicio: { x: x(INICIO.data), y: y(INICIO.valor) },
    hoje: { x: x(HOJE.data), y: y(HOJE.valor) },
    marco: { x: x(MARCO.data), y: y(MARCO.seguidores) },
    meta: { x: x(META.data), y: y(META.seguidores) },
    desafio: { x: x(DESAFIO.data), y: y(DESAFIO.seguidores) },
  };

  const desenha = (inicio: number, duracao: number) =>
    interpolate(f, [inicio, inicio + duracao], [0, 1], {
      ...clamp,
      easing: EASE.suave,
    });
  const pop = (inicio: number) =>
    spring({
      frame: f - inicio,
      fps,
      config: { damping: 13, stiffness: 170, mass: 0.7 },
    });
  const surge = (inicio: number) =>
    interpolate(f, [inicio, inicio + 10], [0, 1], clamp);

  const tReal = desenha(M.real, 26);
  const tMarco = desenha(M.marco, 18);
  const tMeta = desenha(M.meta, 18);
  const tDesafio = desenha(M.desafio, 22);
  const fimReal = ate(P.inicio, P.hoje, tReal);
  const fimMarco = ate(P.hoje, P.marco, tMarco);
  const fimMeta = ate(P.marco, P.meta, tMeta);
  const fimDesafio = ate(P.hoje, P.desafio, tDesafio);
  const formiga = -f * 0.9; // tracejado das projeções corre devagar
  const grade = interpolate(f, [2, 16], [0, 1], clamp);
  const pulso = (f % 45) / 45;

  const datas = [
    { data: INICIO.data, destaque: -1 },
    { data: HOJE.data, destaque: -1 },
    { data: MARCO.data, destaque: M.dataMarco },
    { data: META.data, destaque: M.dataMeta },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: PAINEL_LARGURA,
        height: alturaDoPainel(altura),
        boxSizing: "border-box",
        background:
          "linear-gradient(180deg, rgba(1,26,54,0.72) 0%, rgba(2,53,100,0.55) 100%)",
        border: "2px solid rgba(255,255,255,0.12)",
        borderRadius: 18,
        boxShadow: "0 30px 60px rgba(1,10,25,0.45)",
        overflow: "hidden",
      }}
    >
      {/* Cabeçalho do painel */}
      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: FONTE_TEXTO,
          opacity: grade,
        }}
      >
        <span
          style={{
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: "0.1em",
            color: COR.tintaClara,
            textTransform: "uppercase",
          }}
        >
          Trajetória de seguidores
        </span>
        <span style={{ fontWeight: 500, fontSize: 26, color: COR.tintaSuave }}>
          Fonte: Metricool
        </span>
      </div>

      <svg
        width={PAINEL_LARGURA}
        height={alturaDoPainel(altura)}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="metas-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COR.branco} stopOpacity={0.22} />
            <stop offset="100%" stopColor={COR.branco} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grade horizontal */}
        {GRADE.map((v) => (
          <line
            key={v}
            x1={ESQUERDA}
            x2={DIREITA}
            y1={y(v)}
            y2={y(v)}
            stroke={COR.branco}
            strokeOpacity={0.1 * grade}
            strokeWidth={2}
          />
        ))}
        {/* Eixo das datas */}
        <line
          x1={ESQUERDA}
          x2={ESQUERDA + (DIREITA - ESQUERDA) * grade}
          y1={base}
          y2={base}
          stroke={COR.branco}
          strokeOpacity={0.4}
          strokeWidth={3}
        />
        {/* Marcador de hoje: separa o real da projeção */}
        <line
          x1={P.hoje.x}
          x2={P.hoje.x}
          y1={TOPO}
          y2={TOPO + (base - TOPO) * desenha(M.chipHoje - 6, 16)}
          stroke={COR.branco}
          strokeOpacity={0.3}
          strokeWidth={2}
          strokeDasharray="6 8"
        />

        {/* Área sob o trecho real */}
        <polygon
          points={`${P.inicio.x},${base} ${P.inicio.x},${P.inicio.y} ${fimReal.x},${fimReal.y} ${fimReal.x},${base}`}
          fill="url(#metas-area)"
        />

        {/* Projeções (brilho largo por baixo + tracejado correndo) */}
        {tDesafio > 0 ? (
          <>
            <line
              x1={P.hoje.x}
              y1={P.hoje.y}
              x2={fimDesafio.x}
              y2={fimDesafio.y}
              stroke={COR.amarelo}
              strokeOpacity={0.18}
              strokeWidth={16}
              strokeLinecap="round"
            />
            <line
              x1={P.hoje.x}
              y1={P.hoje.y}
              x2={fimDesafio.x}
              y2={fimDesafio.y}
              stroke={COR.amarelo}
              strokeWidth={5}
              strokeDasharray="16 12"
              strokeDashoffset={formiga}
            />
          </>
        ) : null}
        {[
          { de: P.hoje, ate: fimMarco, t: tMarco },
          { de: P.marco, ate: fimMeta, t: tMeta },
        ].map((s, i) =>
          s.t > 0 ? (
            <React.Fragment key={i}>
              <line
                x1={s.de.x}
                y1={s.de.y}
                x2={s.ate.x}
                y2={s.ate.y}
                stroke={COR.neon}
                strokeOpacity={0.2}
                strokeWidth={16}
                strokeLinecap="round"
              />
              <line
                x1={s.de.x}
                y1={s.de.y}
                x2={s.ate.x}
                y2={s.ate.y}
                stroke={COR.neon}
                strokeWidth={6}
                strokeDasharray="16 12"
                strokeDashoffset={formiga}
              />
            </React.Fragment>
          ) : null,
        )}

        {/* Trecho real */}
        {tReal > 0 ? (
          <line
            x1={P.inicio.x}
            y1={P.inicio.y}
            x2={fimReal.x}
            y2={fimReal.y}
            stroke={COR.branco}
            strokeWidth={7}
            strokeLinecap="round"
          />
        ) : null}

        {/* Pontos */}
        {[
          { p: P.inicio, cor: COR.branco, em: M.real },
          { p: P.marco, cor: COR.neon, em: M.chipMarco },
          { p: P.meta, cor: COR.neon, em: M.chipMeta },
          { p: P.desafio, cor: COR.amarelo, em: M.chipDesafio },
        ].map(({ p, cor, em }, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={10 * pop(em)}
            fill={cor}
            stroke={COR.noiteProfunda}
            strokeWidth={4}
          />
        ))}
        {/* Hoje: ponto branco com anel pulsando */}
        <circle
          cx={P.hoje.x}
          cy={P.hoje.y}
          r={12 + 26 * pulso}
          fill="none"
          stroke={COR.branco}
          strokeWidth={3}
          strokeOpacity={(1 - pulso) * 0.6 * surge(M.chipHoje)}
        />
        <circle
          cx={P.hoje.x}
          cy={P.hoje.y}
          r={12 * pop(M.chipHoje - 4)}
          fill={COR.branco}
          stroke={COR.noite}
          strokeWidth={4}
        />
      </svg>

      {/* Rótulos REAL / PROJEÇÃO */}
      <RotuloTopo
        x={ESQUERDA + 8}
        cor="rgba(255,255,255,0.6)"
        opacidade={surge(M.real + 6)}
      >
        Real
      </RotuloTopo>
      <RotuloTopo x={P.hoje.x + 14} cor={COR.neon} opacidade={surge(M.marco)}>
        Projeção
      </RotuloTopo>

      {/* Escala: 25 mil a 28 mil */}
      {GRADE.map((v) => (
        <div
          key={v}
          style={{
            position: "absolute",
            right: PAINEL_LARGURA - ESQUERDA + 14,
            top: y(v) - 17,
            fontFamily: FONTE_TEXTO,
            fontWeight: 600,
            fontSize: 26,
            color: COR.tintaSuave,
            whiteSpace: "nowrap",
            opacity: grade,
          }}
        >
          {formatarNumero(v / 1000)} mil
        </div>
      ))}

      {/* Datas do eixo */}
      {datas.map(({ data, destaque }) => {
        const d = destaque < 0 ? 0 : surge(destaque);
        return (
          <div
            key={data}
            style={{
              position: "absolute",
              left: x(data) - 60,
              width: 120,
              top: base + 16,
              textAlign: "center",
              fontFamily: FONTE_TEXTO,
              fontWeight: 700,
              fontSize: 26,
              color: d > 0.5 ? COR.neon : COR.tintaClara,
              scale: 1 + 0.12 * d,
              opacity: grade,
            }}
          >
            {data}
          </div>
        );
      })}

      {/* Valor inicial da série */}
      <div
        style={{
          position: "absolute",
          left: P.inicio.x + 14,
          top: P.inicio.y + 10,
          fontFamily: FONTE_TITULO,
          fontSize: 36,
          lineHeight: 1,
          color: COR.tintaClara,
          opacity: surge(M.chipInicio),
        }}
      >
        {formatarNumero(INICIO.valor)}
      </div>

      {/* Hoje: cartão branco ("você está aqui") */}
      <div
        style={{
          position: "absolute",
          right: PAINEL_LARGURA - P.hoje.x + 16,
          top: P.hoje.y - 16,
          translate: "0px -100%",
          background: COR.branco,
          border: `3px solid ${COR.noite}`,
          borderRadius: 12,
          padding: "6px 16px 4px",
          textAlign: "right",
          scale: pop(M.chipHoje),
          transformOrigin: "100% 100%",
          boxShadow: "0 14px 30px rgba(1,10,25,0.4)",
        }}
      >
        <div
          style={{
            fontFamily: FONTE_TEXTO,
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: "0.12em",
            color: COR.verde,
            lineHeight: 1.1,
          }}
        >
          HOJE · {HOJE.data}
        </div>
        <div
          style={{
            fontFamily: FONTE_TITULO,
            fontSize: 50,
            color: COR.noite,
            lineHeight: 1.05,
          }}
        >
          {formatarNumero(HOJE.valor)}
        </div>
      </div>

      {/* Marco de 30/11 */}
      <Chip
        left={P.marco.x + 16}
        top={P.marco.y + 24}
        valor={MARCO.seguidores}
        rotulo={NOTA_MARCO}
        cor={COR.neon}
        corRotulo={COR.tintaClara}
        escala={pop(M.chipMarco)}
      />
      {/* Meta (abaixo do ponto) e desafio (acima) em 31/12, à direita */}
      <Chip
        left={P.meta.x + 18}
        top={P.meta.y - 20}
        valor={META.seguidores}
        rotulo="Meta"
        cor={COR.neon}
        escala={pop(M.chipMeta)}
      />
      <Chip
        left={P.desafio.x + 18}
        top={P.desafio.y + 20}
        acima
        valor={DESAFIO.seguidores}
        rotulo={ROTULO_DESAFIO}
        cor={COR.amarelo}
        escala={pop(M.chipDesafio)}
      />
    </div>
  );
};

const RotuloTopo: React.FC<{
  x: number;
  cor: string;
  opacidade: number;
  children: React.ReactNode;
}> = ({ x: esquerda, cor, opacidade, children }) => (
  <div
    style={{
      position: "absolute",
      left: esquerda,
      top: TOPO + 6,
      fontFamily: FONTE_TEXTO,
      fontWeight: 800,
      fontSize: 26,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: cor,
      opacity: opacidade,
    }}
  >
    {children}
  </div>
);

// Valor de um ponto da projeção: número em Anton e rótulo curto embaixo
const Chip: React.FC<{
  left: number;
  top: number;
  valor: number;
  rotulo: string;
  cor: string;
  corRotulo?: string;
  escala: number;
  acima?: boolean; // `top` marca a base do chip em vez do topo
}> = ({ left, top, valor, rotulo, cor, corRotulo, escala, acima }) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      translate: acima ? "0px -100%" : undefined,
      scale: escala,
      transformOrigin: acima ? "0% 100%" : "0% 0%",
      opacity: interpolate(escala, [0, 0.3], [0, 1], clamp),
    }}
  >
    <div
      style={{
        fontFamily: FONTE_TITULO,
        fontSize: 46,
        lineHeight: 1,
        color: cor,
        textShadow: "0 4px 18px rgba(1,10,25,0.6)",
      }}
    >
      {formatarNumero(valor)}
    </div>
    <div
      style={{
        fontFamily: FONTE_TEXTO,
        fontWeight: 800,
        fontSize: 26,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: corRotulo ?? cor,
        marginTop: 4,
        whiteSpace: "nowrap",
      }}
    >
      {rotulo}
    </div>
  </div>
);
