import type { LucideIcon } from "lucide-react";
import React from "react";
import { COR, FONTE_TEXTO } from "../marca";

// Cartão de dados na inversão da marca: fundo branco, borda azul-noite de 3 px, cabeçalho
// verde com rótulo em Montserrat 800 caixa alta e corpo livre para o número em Anton.
// `foco` (0 a 1) escurece de leve o cartão quando a narração já passou para o próximo.
export const NumerosCartao: React.FC<{
  rotulo: string;
  Icone: LucideIcon;
  direita?: React.ReactNode;
  foco?: number;
  children: React.ReactNode;
}> = ({ rotulo, Icone, direita, foco = 1, children }) => (
  <div
    style={{
      position: "relative",
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      background: "linear-gradient(180deg, #FFFFFF 0%, #EEF4FB 100%)",
      border: `3px solid ${COR.noite}`,
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: `0 30px 60px rgba(1,10,25,0.5), 0 0 0 1px rgba(255,255,255,0.15)`,
      scale: 0.985 + 0.015 * foco,
    }}
  >
    <div
      style={{
        height: 64,
        flexShrink: 0,
        background: COR.verde,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 26px",
        color: COR.branco,
        fontFamily: FONTE_TEXTO,
        fontWeight: 800,
        fontSize: 28,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        borderBottom: `3px solid ${COR.noite}`,
      }}
    >
      <Icone size={32} strokeWidth={2.6} color={COR.branco} />
      <span style={{ flex: 1 }}>{rotulo}</span>
      {direita}
    </div>
    <div style={{ position: "relative", flex: 1, padding: "0 30px" }}>
      {children}
    </div>
    {/* Véu de foco: o cartão que já foi narrado recua um pouco */}
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
