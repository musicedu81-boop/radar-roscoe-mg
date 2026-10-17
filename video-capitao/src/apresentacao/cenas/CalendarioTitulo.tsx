import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp, COR, EASE, FONTE_TITULO } from "../marca";
import { GlitchTexto } from "../ui/Glitch";

// Mesmo comportamento do Titulo de ui/Elementos (a linha sobe por trás de uma máscara e a
// palavra-chave entre *asteriscos* entra em amarelo itálico com glitch), com duas diferenças:
// 1. folga na máscara: no Titulo compartilhado o acento do "Á" de CALENDÁRIO é cortado (a Anton
//    passa da caixa de linha); a folga é compensada por margens negativas;
// 2. a seta "→" vira um desenho vetorial: a Anton carregada não cobre U+2192 e o navegador
//    trocaria a fonte só nesse caractere.
// (Pedido de correção no ui/Elementos registrado no relatório.)
const FOLGA_ALTO = 0.22; // em
const FOLGA_BAIXO = 0.16; // em

const Seta: React.FC = () => (
  <svg
    viewBox="0 0 100 60"
    style={{
      width: "0.6em",
      height: "0.36em",
      margin: "0 0.1em 0 0.24em",
      verticalAlign: "0.2em",
      overflow: "visible",
      transform: "skewX(-12deg)",
    }}
  >
    <path
      d="M 4 30 L 82 30 M 58 6 L 90 30 L 58 54"
      fill="none"
      stroke="currentColor"
      strokeWidth={13}
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

// Troca cada "→" pela seta desenhada (os espaços em volta dela viram a margem da seta)
const comSeta = (texto: string) => {
  const partes = texto.split("→");
  return partes.map((parte, i) => {
    const antes = i > 0 ? parte.trimStart() : parte;
    const trecho = i < partes.length - 1 ? antes.trimEnd() : antes;
    return (
      <React.Fragment key={i}>
        {i > 0 ? <Seta /> : null}
        {trecho}
      </React.Fragment>
    );
  });
};

export const CalendarioTitulo: React.FC<{
  linhas: string[];
  inicio: number;
  tamanho: number;
  style?: React.CSSProperties;
}> = ({ linhas, inicio, tamanho, style }) => {
  const frame = useCurrentFrame();
  return (
    <div style={style}>
      {linhas.map((linha, i) => {
        const f = frame - inicio - i * 5;
        const partes = linha.split("*");
        return (
          <div
            key={i}
            style={{
              overflow: "hidden",
              paddingTop: tamanho * FOLGA_ALTO,
              marginTop: -tamanho * FOLGA_ALTO,
              paddingBottom: tamanho * FOLGA_BAIXO,
              marginBottom: -tamanho * (FOLGA_BAIXO - 0.04),
            }}
          >
            <div
              style={{
                fontFamily: FONTE_TITULO,
                fontSize: tamanho,
                lineHeight: 1.02,
                textTransform: "uppercase",
                letterSpacing: "0.01em",
                color: COR.branco,
                whiteSpace: "nowrap",
                translate: `0px ${interpolate(f, [0, 16], [125, 0], { ...clamp, easing: EASE.entrada })}%`,
              }}
            >
              {partes.map((parte, k) =>
                k % 2 === 1 ? (
                  <GlitchTexto key={k} inicio={inicio + i * 5 + 8}>
                    <em
                      style={{
                        color: COR.amarelo,
                        fontStyle: "italic",
                        paddingRight: "0.06em",
                      }}
                    >
                      {comSeta(parte)}
                    </em>
                  </GlitchTexto>
                ) : (
                  <span key={k}>{comSeta(parte)}</span>
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
