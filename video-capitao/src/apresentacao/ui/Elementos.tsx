import React from "react";
import {
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  clamp,
  COR,
  EASE,
  FONTE_TEXTO,
  FONTE_TITULO,
  formatarNumero,
  LOGO,
} from "../marca";
import { GlitchTexto } from "./Glitch";

// Etiqueta inclinada da marca (como no Radar: lugar em verde, assunto em azul)
export const Etiqueta: React.FC<{
  children: React.ReactNode;
  cor?: "azul" | "verde" | "amarelo" | "noite";
  tamanho?: number;
  inicio?: number;
  style?: React.CSSProperties;
}> = ({ children, cor = "azul", tamanho = 30, inicio = 0, style }) => {
  const frame = useCurrentFrame();
  const f = frame - inicio;
  const fundo = {
    azul: COR.vivo,
    verde: COR.neon,
    amarelo: COR.amarelo,
    noite: COR.noite,
  }[cor];
  const texto = cor === "azul" || cor === "noite" ? COR.branco : COR.noite;
  const abre = interpolate(f, [0, 10], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  return (
    <div
      style={{
        display: "inline-block",
        background: fundo,
        color: texto,
        fontFamily: FONTE_TITULO,
        fontSize: tamanho,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        lineHeight: 1.15,
        padding: `${tamanho * 0.12}px ${tamanho * 0.5}px`,
        transform: "skewX(-8deg)",
        clipPath: `inset(0 ${(1 - abre) * 100}% 0 0)`,
        ...style,
      }}
    >
      <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>
        {children}
      </span>
    </div>
  );
};

// Pill verde de chamada ("Arraste e confira →")
export const Pill: React.FC<{
  children: React.ReactNode;
  tamanho?: number;
  style?: React.CSSProperties;
}> = ({ children, tamanho = 22, style }) => (
  <div
    style={{
      display: "inline-block",
      background: COR.verde,
      color: COR.branco,
      fontFamily: FONTE_TEXTO,
      fontWeight: 800,
      fontSize: tamanho,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      padding: `${tamanho * 0.45}px ${tamanho * 1.1}px`,
      borderRadius: 999,
      ...style,
    }}
  >
    {children}
  </div>
);

// Título da marca: Anton em caixa alta. Trechos entre *asteriscos* viram a palavra-chave
// em amarelo itálico. Cada linha sobe por trás de uma máscara; a palavra-chave entra com glitch.
export const Titulo: React.FC<{
  linhas: string[];
  inicio?: number;
  tamanho?: number;
  cor?: string;
  corChave?: string;
  alinhamento?: "left" | "center";
  style?: React.CSSProperties;
}> = ({
  linhas,
  inicio = 0,
  tamanho = 120,
  cor = COR.branco,
  corChave = COR.amarelo,
  alinhamento = "left",
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ textAlign: alinhamento, ...style }}>
      {linhas.map((linha, i) => {
        const f = frame - inicio - i * 5;
        const sobe = interpolate(f, [0, 16], [110, 0], {
          ...clamp,
          easing: EASE.entrada,
        });
        const partes = linha.split("*");
        return (
          <div
            key={i}
            style={{ overflow: "hidden", paddingBottom: tamanho * 0.04 }}
          >
            <div
              style={{
                fontFamily: FONTE_TITULO,
                fontSize: tamanho,
                lineHeight: 1.02,
                textTransform: "uppercase",
                letterSpacing: "0.01em",
                color: cor,
                translate: `0px ${sobe}%`,
              }}
            >
              {partes.map((p, k) =>
                k % 2 === 1 ? (
                  <GlitchTexto key={k} inicio={inicio + i * 5 + 8}>
                    <em
                      style={{
                        color: corChave,
                        fontStyle: "italic",
                        paddingRight: "0.06em",
                      }}
                    >
                      {p}
                    </em>
                  </GlitchTexto>
                ) : (
                  <span key={k}>{p}</span>
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Texto de apoio em Montserrat que aparece com leve subida
export const Texto: React.FC<{
  children: React.ReactNode;
  inicio?: number;
  tamanho?: number;
  cor?: string;
  peso?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  inicio = 0,
  tamanho = 34,
  cor = COR.tintaClara,
  peso = 500,
  style,
}) => {
  const frame = useCurrentFrame();
  const f = frame - inicio;
  return (
    <div
      style={{
        fontFamily: FONTE_TEXTO,
        fontSize: tamanho,
        fontWeight: peso,
        lineHeight: 1.35,
        color: cor,
        opacity: interpolate(f, [0, 10], [0, 1], clamp),
        translate: `0px ${interpolate(f, [0, 14], [24, 0], { ...clamp, easing: EASE.entrada })}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Linha de assinatura verde-neon que se desenha
export const LinhaNeon: React.FC<{
  inicio?: number;
  largura?: number;
  espessura?: number;
  cor?: string;
}> = ({ inicio = 0, largura = 240, espessura = 6, cor = COR.neon }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - inicio, [0, 14], [0, largura], {
    ...clamp,
    easing: EASE.entrada,
  });
  return (
    <div
      style={{
        width: w,
        height: espessura,
        background: cor,
        boxShadow: `0 0 18px ${cor}`,
      }}
    />
  );
};

// Número que conta até o valor final, no formato brasileiro (25.850; 3,6)
export const Contador: React.FC<{
  valor: number;
  inicio?: number;
  duracao?: number;
  casas?: number;
  prefixo?: string;
  sufixo?: string;
  style?: React.CSSProperties;
}> = ({
  valor,
  inicio = 0,
  duracao = 40,
  casas = 0,
  prefixo = "",
  sufixo = "",
  style,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - inicio, [0, duracao], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const v = valor * t;
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefixo}
      {formatarNumero(casas ? v : Math.round(v), casas)}
      {sufixo}
    </span>
  );
};

// Logo do Capitão. `variante` branco para fundos azuis, azul para fundo branco.
export const Logo: React.FC<{
  largura: number;
  variante?: "branco" | "azul";
  style?: React.CSSProperties;
}> = ({ largura, variante = "branco", style }) => (
  <Img
    src={variante === "branco" ? LOGO.branco : LOGO.azul}
    style={{
      width: largura,
      height: largura / LOGO.proporcao,
      display: "block",
      ...style,
    }}
  />
);

// Cartão com entrada em 3D (gira no eixo X/Y em perspectiva) e reflexo de luz que passa
export const Cartao3D: React.FC<{
  inicio: number;
  children: React.ReactNode;
  de?: "baixo" | "esquerda" | "direita";
  style?: React.CSSProperties;
}> = ({ inicio, children, de = "baixo", style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - inicio,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.9 },
  });
  const rotX = de === "baixo" ? (1 - s) * 70 : 0;
  const rotY =
    de === "esquerda" ? (1 - s) * -70 : de === "direita" ? (1 - s) * 70 : 0;
  const brilho = interpolate(frame - inicio, [8, 34], [-30, 130], clamp);
  return (
    <div style={{ perspective: 1400, ...style }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${(1 - s) * -200}px)`,
          opacity: interpolate(frame - inicio, [0, 6], [0, 1], clamp),
          transformStyle: "preserve-3d",
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            background: `linear-gradient(115deg, transparent ${brilho - 15}%, rgba(255,255,255,0.28) ${brilho}%, transparent ${brilho + 15}%)`,
          }}
        />
      </div>
    </div>
  );
};
