import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp, COR, EASE, FONTE_TITULO } from "../marca";
import { GlitchTexto } from "../ui/Glitch";

// Mesmo comportamento do Titulo de ui/Elementos (linha sobe por trás de uma máscara e a
// palavra-chave entre *asteriscos* entra em amarelo itálico com glitch), mas a máscara tem
// folga no alto: o Titulo compartilhado corta acentos de maiúsculas como o Ê de "TRÊS".
// (Pedido de correção no ui/Elementos registrado no relatório.)
export const PilaresTitulo: React.FC<{
  linhas: string[];
  inicio?: number;
  tamanho?: number;
}> = ({ linhas, inicio = 0, tamanho = 120 }) => {
  const frame = useCurrentFrame();
  const folga = tamanho * 0.18;
  return (
    <div>
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
            style={{
              overflow: "hidden",
              paddingTop: folga,
              marginTop: -folga,
              paddingBottom: tamanho * 0.04,
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
                translate: `0px ${sobe * 1.2}%`,
              }}
            >
              {partes.map((p, k) =>
                k % 2 === 1 ? (
                  <GlitchTexto key={k} inicio={inicio + i * 5 + 8}>
                    <em
                      style={{
                        color: COR.amarelo,
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
