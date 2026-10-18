import { CalendarCheck, Clock, Play, Users } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { KPIS } from "../dados";
import { clamp, EASE, FONTE_TITULO, MARGEM } from "../marca";
import { inicioLocal, momentoDaPalavra } from "../roteiro";
import { Cartao3D, Etiqueta, LinhaNeon, Titulo } from "../ui/Elementos";
import { Fundo } from "../ui/Fundo";
import { MetasGrafico, PAINEL_LARGURA } from "./MetasGrafico";
import { ALTURA_KPI, MetasKpi } from "./MetasKpi";

// Cena 10 · Metas e KPIs. O gráfico da trajetória se desenha na fala das metas (26.400 em
// 30/11, 27 mil em 31/12, desafio de 28 mil); na frase dos indicadores o painel encolhe e os
// quatro KPIs entram, cada um quando a locutora fala dele.
const INDICE = 9;

const q = (f: number) => f + inicioLocal(INDICE);
const p = (palavra: string, ocorrencia = 0) =>
  momentoDaPalavra(INDICE, palavra, ocorrencia);

// O painel só encolhe depois que o selo do desafio entrou (os dois movimentos não se atropelam)
const ENCOLHE = Math.max(p("indicadores") - 20, p("31/12") + 36);

const M = {
  titulo: 0,
  linha: 10,
  painel: 2,
  grafico: {
    real: 6,
    chipInicio: 14,
    chipHoje: 26,
    marco: p("26.400") - 12,
    chipMarco: p("26.400") - 4,
    dataMarco: p("30/11") - 4,
    meta: p("27") - 12,
    chipMeta: p("27") - 2,
    dataMeta: p("31/12") - 4,
    // O desafio não é falado: entra logo depois do 31/12, antes dos indicadores
    desafio: p("31/12") + 12,
    chipDesafio: p("31/12") + 26,
  },
  // O painel encolhe na virada para os indicadores; a etiqueta e as vagas só entram depois
  // que ele terminou de subir, para não cobrir o gráfico
  encolhe: ENCOLHE,
  etiqueta: Math.max(p("indicadores") + 10, ENCOLHE + 30),
  vagas: Math.max(p("indicadores") + 16, ENCOLHE + 36),
  kpis: [
    p("views") - 6,
    p("seguidores", 1) - 6,
    p("horário") - 6,
    p("dia") - 6,
  ],
  resumo: 432, // todos voltam ao pleno depois da última palavra
  brilho: 444,
};

const ICONES = [Play, Users, Clock, CalendarCheck];

// Grade vertical (px). Conteúdo entre y 230 e 1450; a legenda (1480+) fica livre.
const Y = { titulo: 236, linha: 372, painel: 404, etiqueta: 968, kpis: 1018 };
const ALTURA_GRAFICO = { cheio: 760, compacto: 376 };
const PASSO_KPI = ALTURA_KPI + 10;

const focoDoKpi = (f: number, k: number) => {
  const proximo = M.kpis[k + 1];
  if (proximo === undefined) {
    return 1;
  }
  return interpolate(
    f,
    [proximo, proximo + 12, M.resumo - 8, M.resumo + 8],
    [1, 0, 0, 1],
    { ...clamp, easing: EASE.suave },
  );
};

export const CenaMetas: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - inicioLocal(INDICE);

  const altura = interpolate(
    f,
    [M.encolhe, M.encolhe + 30],
    [ALTURA_GRAFICO.cheio, ALTURA_GRAFICO.compacto],
    { ...clamp, easing: EASE.suave },
  );
  const entraPainel = interpolate(f, [M.painel, M.painel + 16], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const vagas = interpolate(f, [M.vagas, M.vagas + 12], [0, 1], clamp);
  const brilho = interpolate(f, [M.brilho, M.brilho + 30], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <Fundo />

      <div style={{ position: "absolute", left: MARGEM, top: Y.titulo }}>
        <Titulo
          linhas={["Metas e *KPIs*"]}
          inicio={q(M.titulo)}
          tamanho={120}
        />
      </div>
      <div style={{ position: "absolute", left: MARGEM, top: Y.linha }}>
        <LinhaNeon inicio={q(M.linha)} largura={200} />
      </div>

      <div
        style={{
          position: "absolute",
          left: MARGEM,
          top: Y.painel,
          width: PAINEL_LARGURA,
          opacity: entraPainel,
          translate: `0px ${(1 - entraPainel) * 50}px`,
        }}
      >
        <MetasGrafico f={f} altura={altura} M={M.grafico} />
      </div>

      {/* Indicadores */}
      <div
        style={{
          position: "absolute",
          left: MARGEM,
          top: Y.etiqueta,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Etiqueta cor="verde" tamanho={32} inicio={q(M.etiqueta)}>
          Indicadores
        </Etiqueta>
      </div>
      {KPIS.map((kpi, k) => {
        const top = Y.kpis + k * PASSO_KPI;
        const entrou = interpolate(
          f,
          [M.kpis[k] + 6, M.kpis[k] + 14],
          [1, 0],
          clamp,
        );
        return (
          <React.Fragment key={kpi.indicador}>
            {/* Vaga tracejada, à espera da fala */}
            <div
              style={{
                position: "absolute",
                left: MARGEM,
                top,
                width: PAINEL_LARGURA,
                height: ALTURA_KPI,
                boxSizing: "border-box",
                border: "2px dashed rgba(255,255,255,0.28)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                paddingLeft: 28,
                fontFamily: FONTE_TITULO,
                fontSize: 44,
                color: "rgba(255,255,255,0.3)",
                opacity: vagas * entrou,
              }}
            >
              {String(k + 1).padStart(2, "0")}
            </div>
            <Cartao3D
              inicio={q(M.kpis[k])}
              de="baixo"
              style={{
                position: "absolute",
                left: MARGEM,
                top,
                width: PAINEL_LARGURA,
                height: ALTURA_KPI,
                borderRadius: 14,
              }}
            >
              <MetasKpi
                kpi={kpi}
                Icone={ICONES[k]}
                f={f - M.kpis[k]}
                foco={focoDoKpi(f, k)}
                brilho={brilho}
              />
            </Cartao3D>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
