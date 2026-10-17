import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import React from "react";
import { interpolate } from "remotion";
import type { KPIS } from "../dados";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO } from "../marca";

// Linha de indicador (inversão da marca): ícone em bloco azul, nome do KPI, barra de progresso
// de hoje até a meta e os valores. "A medir": só a meta, em contorno tracejado.
export const ALTURA_KPI = 98;

export const MetasKpi: React.FC<{
  kpi: (typeof KPIS)[number];
  Icone: LucideIcon;
  f: number; // quadros desde a entrada da linha
  foco: number;
  brilho: number; // 0 a 1: reflexo que passa pela barra no fim da cena
}> = ({ kpi, Icone, f, foco, brilho }) => {
  const aMedir = kpi.hojeNum === null;
  const proporcao = aMedir ? 0 : (kpi.hojeNum ?? 0) / kpi.metaNum;
  const enche = interpolate(f, [10, 34], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const contorno = interpolate(f, [10, 30], [0, 1], clamp);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: ALTURA_KPI,
        boxSizing: "border-box",
        display: "flex",
        background: "linear-gradient(180deg, #FFFFFF 0%, #EEF4FB 100%)",
        border: `3px solid ${COR.noite}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 18px 40px rgba(1,10,25,0.45)",
        scale: 0.985 + 0.015 * foco,
      }}
    >
      <div
        style={{
          width: 92,
          flexShrink: 0,
          background: COR.vivo,
          borderRight: `3px solid ${COR.noite}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icone size={42} strokeWidth={2.4} color={COR.branco} />
      </div>
      <div
        style={{
          flex: 1,
          padding: "10px 24px 12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: FONTE_TEXTO,
            fontWeight: 800,
            fontSize: 28,
            color: COR.noite,
            whiteSpace: "nowrap",
            lineHeight: 1.15,
          }}
        >
          {kpi.indicador}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Barra: trilho = meta; preenchimento = hoje */}
          <div
            style={{
              position: "relative",
              flex: 1,
              height: 20,
              borderRadius: 10,
              background: aMedir ? "transparent" : "#D7E3F1",
              border: aMedir
                ? `3px dashed rgba(2,53,100,${0.55 * contorno})`
                : "none",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {aMedir ? null : (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${proporcao * enche * 100}%`,
                  borderRadius: 10,
                  background: `linear-gradient(90deg, ${COR.verde} 0%, ${COR.neon} 100%)`,
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(100deg, transparent ${brilho * 160 - 40}%, rgba(255,255,255,0.75) ${brilho * 160 - 20}%, transparent ${brilho * 160}%)`,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            {aMedir ? (
              <span
                style={{
                  fontFamily: FONTE_TEXTO,
                  fontWeight: 800,
                  fontSize: 26,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: COR.fundo,
                  background: "#DCE7F4",
                  borderRadius: 8,
                  padding: "2px 10px",
                }}
              >
                {kpi.hoje}
              </span>
            ) : (
              <span
                style={{
                  fontFamily: FONTE_TITULO,
                  fontSize: 34,
                  color: "#5E7391",
                  lineHeight: 1,
                }}
              >
                {kpi.hoje}
              </span>
            )}
            <ArrowRight size={28} strokeWidth={3} color={COR.noite} />
            <span
              style={{
                fontFamily: FONTE_TITULO,
                fontSize: 42,
                color: COR.noite,
                lineHeight: 1,
              }}
            >
              {kpi.meta}
            </span>
          </div>
        </div>
      </div>
      {/* Véu de foco: a linha já narrada recua um pouco */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: COR.noite,
          opacity: (1 - foco) * 0.18,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
