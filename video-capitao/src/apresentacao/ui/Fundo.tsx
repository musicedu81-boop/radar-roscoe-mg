import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { clamp, COR } from "../marca";

// Símbolo "+" da marca (usado em baixa opacidade nos fundos, como nos posts de saúde)
export const SimboloMais: React.FC<{
  tamanho: number;
  cor?: string;
  style?: React.CSSProperties;
}> = ({ tamanho, cor = COR.branco, style }) => (
  <div
    style={{ position: "absolute", width: tamanho, height: tamanho, ...style }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "37%",
        height: "26%",
        background: cor,
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "37%",
        width: "26%",
        background: cor,
      }}
    />
  </div>
);

// Piso de grade em perspectiva que corre em direção à câmera
const Grade: React.FC<{
  cor: string;
  opacidade: number;
  velocidade: number;
}> = ({ cor, opacidade, velocidade }) => {
  const frame = useCurrentFrame();
  const passo = 90;
  const desloca = (frame * velocidade) % passo;
  return (
    <AbsoluteFill
      style={{
        perspective: 900,
        perspectiveOrigin: "50% 30%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-60%",
          width: "220%",
          top: "52%",
          height: "140%",
          transformOrigin: "50% 0%",
          transform: "rotateX(76deg)",
          backgroundImage: `linear-gradient(${cor} 2px, transparent 2px), linear-gradient(90deg, ${cor} 2px, transparent 2px)`,
          backgroundSize: `${passo}px ${passo}px`,
          backgroundPosition: `0px ${desloca}px`,
          opacity: opacidade,
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 25%, black 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 25%, black 60%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Grão de filme leve: textura de ruído pré-calculada (public/apresentacao/grao.png),
// ladrilhada e deslocada para uma posição aleatória a cada quadro. Bem mais barata que
// feTurbulence ao vivo. <Img> garante que a textura carregou antes da captura.
const LADRILHO = 512;
export const Grao: React.FC<{ opacidade?: number }> = ({
  opacidade = 0.07,
}) => {
  const frame = useCurrentFrame();
  const x = Math.floor(random(`grao-x-${frame}`) * LADRILHO);
  const y = Math.floor(random(`grao-y-${frame}`) * LADRILHO);
  return (
    <AbsoluteFill
      style={{
        opacity: opacidade,
        mixBlendMode: "overlay",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -x,
          top: -y,
          width: LADRILHO * 3,
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {Array.from({ length: 15 }, (_, i) => (
          <Img
            key={i}
            src={staticFile("apresentacao/grao.png")}
            style={{ width: LADRILHO, height: LADRILHO, display: "block" }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

type Variante = "azul" | "noite" | "branco";

// Fundo padrão das cenas: degradê azul da marca, grade em perspectiva, símbolos "+",
// faixa de luz, vinheta e grão. `branco` é a inversão usada em slides de dados.
export const Fundo: React.FC<{
  variante?: Variante;
  grade?: boolean;
  simbolos?: boolean;
}> = ({ variante = "azul", grade = true, simbolos = true }) => {
  const frame = useCurrentFrame();
  const branco = variante === "branco";
  const degrade =
    variante === "noite"
      ? `radial-gradient(ellipse at 50% 35%, ${COR.fundo} 0%, ${COR.noite} 45%, ${COR.noiteProfunda} 100%)`
      : branco
        ? `radial-gradient(ellipse at 50% 30%, #FFFFFF 0%, #F1F6FC 60%, #E3EDF9 100%)`
        : `radial-gradient(ellipse at 30% 20%, ${COR.vivo} 0%, ${COR.fundo} 35%, ${COR.noite} 75%, ${COR.noiteProfunda} 100%)`;

  const luz = interpolate(frame % 240, [0, 240], [-40, 140], clamp);

  return (
    <AbsoluteFill style={{ background: degrade, overflow: "hidden" }}>
      {grade ? (
        <Grade
          cor={branco ? "rgba(5,75,135,0.22)" : "rgba(1,237,67,0.35)"}
          opacidade={branco ? 0.6 : 0.5}
          velocidade={1.2}
        />
      ) : null}
      {simbolos
        ? Array.from({ length: 7 }, (_, i) => {
            const r = (k: string) => random(`mais-${i}-${k}`);
            const tam = 60 + r("t") * 180;
            // Sobe devagar e reaparece embaixo
            const y =
              ((((r("y") * 1300 - frame * (0.3 + r("v") * 0.6)) % 1300) +
                1300) %
                1300) -
              150;
            return (
              <SimboloMais
                key={i}
                tamanho={tam}
                cor={branco ? COR.fundo : COR.branco}
                style={{
                  left: `${r("x") * 100}%`,
                  top: y,
                  opacity: (branco ? 0.04 : 0.05) + r("o") * 0.04,
                  rotate: `${frame * (r("r") - 0.5) * 0.4}deg`,
                }}
              />
            );
          })
        : null}
      {/* Faixa de luz diagonal que atravessa devagar */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(110deg, transparent ${luz - 12}%, rgba(255,255,255,${branco ? 0.35 : 0.06}) ${luz}%, transparent ${luz + 12}%)`,
        }}
      />
      {/* Vinheta */}
      <AbsoluteFill
        style={{
          background: branco
            ? "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(2,53,100,0.10) 100%)"
            : "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(1,10,25,0.55) 100%)",
        }}
      />
      <Grao opacidade={branco ? 0.04 : 0.08} />
    </AbsoluteFill>
  );
};
