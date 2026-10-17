import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp, COR, EASE, FONTE_TITULO } from "../marca";
import { GlitchTexto } from "../ui/Glitch";

// Mesmo comportamento do Titulo de ui/Elementos (a linha sobe por trás de uma máscara e a
// palavra-chave entre *asteriscos* entra em amarelo itálico com glitch), mas com folga na
// máscara: no Titulo compartilhado o til do "Ã" e a cedilha do "Ç" de PUBLICAÇÃO são cortados
// (a Anton passa da caixa de linha). A folga é compensada por margens negativas, então a
// posição na tela é a mesma do Titulo. (Pedido de correção no ui/Elementos no relatório.)
const FOLGA_ALTO = 0.22; // em
const FOLGA_BAIXO = 0.16; // em

export const JanelaTitulo: React.FC<{
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
                      {parte}
                    </em>
                  </GlitchTexto>
                ) : (
                  <span key={k}>{parte}</span>
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
