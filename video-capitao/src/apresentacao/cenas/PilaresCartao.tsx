import { Eye, type LucideIcon } from "lucide-react";
import React from "react";
import { COR, FONTE_TEXTO, FONTE_TITULO, PILAR, type Pilar } from "../marca";
import { Contador } from "../ui/Elementos";

// Cartão de um pilar na inversão da marca: fundo branco, borda azul-noite de 3 px, bloco
// lateral na cor do pilar com o ícone, título em Anton, prova em Montserrat e selo de views
// que conta. `foco` (0 a 1) recua o cartão de leve quando a fala já passou para o próximo.

// "16,8 mil views" -> 16,8 com uma casa e o sufixo " mil views" (derivado de dados.ts)
const lerViews = (texto: string) => {
  const [numero, ...resto] = texto.split(" ");
  const casas = numero.includes(",") ? numero.split(",")[1].length : 0;
  return {
    valor: parseFloat(numero.replace(",", ".")),
    casas,
    sufixo: ` ${resto.join(" ")}`,
  };
};

export const ALTURA_CARTAO = 246;
const LARGURA_BLOCO = 186;

export const PilaresCartao: React.FC<{
  numero: number;
  pilar: Pilar;
  titulo: string;
  prova: string;
  views: string;
  Icone: LucideIcon;
  inicioConta: number; // quadro local em que o selo de views começa a contar
  foco?: number;
}> = ({ numero, pilar, titulo, prova, views, Icone, inicioConta, foco = 1 }) => {
  const cor = PILAR[pilar];
  const tinta = pilar === "Utilidade" ? COR.branco : COR.noite;
  const v = lerViews(views);
  const rotulo = String(numero).padStart(2, "0");
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        background: "linear-gradient(180deg, #FFFFFF 0%, #EEF4FB 100%)",
        border: `3px solid ${COR.noite}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: `0 28px 60px rgba(1,10,25,0.5), 0 0 0 1px rgba(255,255,255,0.12), 0 0 40px ${cor}33`,
        scale: 0.985 + 0.015 * foco,
      }}
    >
      {/* Bloco do pilar: cor, ícone e número */}
      <div
        style={{
          width: LARGURA_BLOCO,
          flexShrink: 0,
          background: `linear-gradient(160deg, ${cor} 0%, ${cor} 62%, ${cor}D9 100%)`,
          borderRight: `3px solid ${COR.noite}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Icone size={92} strokeWidth={2.1} color={tinta} />
        <div
          style={{
            fontFamily: FONTE_TITULO,
            fontSize: 34,
            letterSpacing: "0.08em",
            color: tinta,
            opacity: 0.85,
            lineHeight: 1,
          }}
        >
          {rotulo}
        </div>
      </div>

      {/* Texto: rótulo + selo de views, título, prova */}
      <div
        style={{
          flex: 1,
          padding: "22px 28px 22px 30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: COR.fundo,
            }}
          >
            {pilar}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: COR.noite,
              borderRadius: 999,
              padding: "6px 18px 6px 14px",
            }}
          >
            <Eye size={28} strokeWidth={2.6} color={COR.neon} />
            <Contador
              valor={v.valor}
              casas={v.casas}
              sufixo={v.sufixo}
              inicio={inicioConta}
              duracao={30}
              style={{
                fontFamily: FONTE_TITULO,
                fontSize: 30,
                letterSpacing: "0.03em",
                color: COR.branco,
                lineHeight: 1.1,
                textTransform: "uppercase",
              }}
            />
          </div>
        </div>
        <div
          style={{
            fontFamily: FONTE_TITULO,
            fontSize: 52,
            lineHeight: 1.02,
            textTransform: "uppercase",
            color: COR.noite,
          }}
        >
          {titulo}
        </div>
        <div
          style={{
            fontFamily: FONTE_TEXTO,
            fontWeight: 600,
            fontSize: 30,
            lineHeight: 1.25,
            color: "rgba(2,53,100,0.82)",
          }}
        >
          {prova}
        </div>
      </div>

      {/* Véu de foco: o cartão que já foi narrado recua um pouco */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: COR.noite,
          opacity: (1 - foco) * 0.2,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
