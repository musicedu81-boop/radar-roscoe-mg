import { ChartColumnIncreasing, Trophy } from "lucide-react";
import React from "react";
import { COR, FONTE_TEXTO, FONTE_TITULO } from "../marca";
import { GlitchTexto } from "../ui/Glitch";

// Conteúdo das placas que se levantam do plano nos marcos (inversão da marca: cartão branco,
// borda azul-noite de 3 px, cabeçalho colorido com rótulo Montserrat 800 em caixa alta).

const Casca: React.FC<{
  cabecalho: React.ReactNode;
  corCabecalho: string;
  corTextoCabecalho: string;
  children: React.ReactNode;
}> = ({ cabecalho, corCabecalho, corTextoCabecalho, children }) => (
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
      boxShadow: "0 26px 50px rgba(1,10,25,0.55)",
    }}
  >
    <div
      style={{
        height: 54,
        flexShrink: 0,
        background: corCabecalho,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 22px",
        color: corTextoCabecalho,
        fontFamily: FONTE_TEXTO,
        fontWeight: 800,
        fontSize: 26,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        borderBottom: `3px solid ${COR.noite}`,
      }}
    >
      {cabecalho}
    </div>
    <div style={{ position: "relative", flex: 1 }}>{children}</div>
  </div>
);

// "Os Números": data grande e o que a edição traz
export const MarcoNumeros: React.FC<{
  titulo: string;
  semana: number;
  data: string;
  texto: string;
  inicioGlitch: number;
}> = ({ titulo, semana, data, texto, inicioGlitch }) => (
  <Casca
    corCabecalho={COR.verde}
    corTextoCabecalho={COR.branco}
    cabecalho={
      <>
        <ChartColumnIncreasing size={32} strokeWidth={2.6} color={COR.branco} />
        <span style={{ flex: 1 }}>{titulo}</span>
        <span style={{ opacity: 0.85 }}>Semana {semana}</span>
      </>
    }
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 24px",
      }}
    >
      <div
        style={{
          fontFamily: FONTE_TITULO,
          fontSize: 96,
          lineHeight: 1,
          color: COR.noite,
          whiteSpace: "nowrap",
        }}
      >
        <GlitchTexto inicio={inicioGlitch} duracao={12}>
          {data}
        </GlitchTexto>
      </div>
      <div
        style={{
          fontFamily: FONTE_TEXTO,
          fontWeight: 700,
          fontSize: 32,
          lineHeight: 1.15,
          color: COR.noite,
        }}
      >
        {texto}
      </div>
    </div>
  </Casca>
);

// Última semana: "BALANÇO 2026" com o ano marcado em amarelo e o destaque da semana
export const MarcoFinal: React.FC<{
  semana: number;
  datas: string;
  eixo: string;
  texto: string;
  inicioGlitch: number;
  marca: number; // 0 a 1: o marca-texto amarelo se desenha sob o ano
}> = ({ semana, datas, eixo, texto, inicioGlitch, marca }) => {
  const palavras = eixo.split(" ");
  const ano = palavras.pop() ?? "";
  return (
    <Casca
      corCabecalho={COR.amarelo}
      corTextoCabecalho={COR.noite}
      cabecalho={
        <>
          <Trophy size={32} strokeWidth={2.6} color={COR.noite} />
          <span>
            Semana {semana} · {datas}
          </span>
        </>
      }
    >
      <div style={{ position: "absolute", left: 24, right: 24, top: 14 }}>
        <div
          style={{
            fontFamily: FONTE_TITULO,
            fontSize: 76,
            lineHeight: 1.1,
            color: COR.noite,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {palavras.join(" ")}{" "}
          <span
            style={{
              backgroundImage: `linear-gradient(${COR.amarelo}, ${COR.amarelo})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 80%",
              backgroundSize: `${marca * 100}% 46%`,
              padding: "0 6px",
            }}
          >
            <GlitchTexto inicio={inicioGlitch} duracao={14}>
              {ano}
            </GlitchTexto>
          </span>
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: FONTE_TEXTO,
            fontWeight: 700,
            fontSize: 28,
            lineHeight: 1.2,
            color: "rgba(2,53,100,0.85)",
            whiteSpace: "nowrap",
          }}
        >
          {texto}
        </div>
      </div>
    </Casca>
  );
};
