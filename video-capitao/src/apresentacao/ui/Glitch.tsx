import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import React, { useId } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { clamp, COR } from "../marca";

// Filtro SVG de glitch: fatias horizontais deslocadas (turbulência quantizada) e
// separação RGB. `forca` vai de 0 (limpo) a 1 (máximo). `semente` muda a cada quadro.
export const FiltroGlitch: React.FC<{
  id: string;
  forca: number;
  semente: number;
}> = ({ id, forca, semente }) => {
  const deslocamento = 180 * forca;
  const rgb = 26 * forca;
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <defs>
        <filter
          id={id}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          {/* Mapa de fatias: ruído quase constante no eixo x, quantizado em degraus */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency={`0.00001 ${0.012 + 0.03 * random(`f-${semente}`)}`}
            numOctaves={1}
            seed={Math.floor(semente)}
            result="ruido"
          />
          <feComponentTransfer in="ruido" result="degraus">
            <feFuncR
              type="discrete"
              tableValues="0.5 0.5 0.15 0.5 0.85 0.5 0.5 0.3 0.7 0.5"
            />
            <feFuncG type="discrete" tableValues="0.5" />
          </feComponentTransfer>
          <feDisplacementMap
            in="SourceGraphic"
            in2="degraus"
            scale={deslocamento}
            xChannelSelector="R"
            yChannelSelector="G"
            result="fatiado"
          />
          {/* Separação RGB */}
          <feColorMatrix
            in="fatiado"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="r"
          />
          <feOffset in="r" dx={rgb} dy={0} result="r2" />
          <feColorMatrix
            in="fatiado"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="g"
          />
          <feColorMatrix
            in="fatiado"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="b"
          />
          <feOffset in="b" dx={-rgb} dy={0} result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
};

// Sobreposição de glitch: linhas de varredura, blocos de cor da marca e uma barra de rasgo
export const RuidoGlitch: React.FC<{ forca: number; semente: number }> = ({
  forca,
  semente,
}) => {
  if (forca <= 0.01) {
    return null;
  }
  const blocos = Array.from({ length: 9 }, (_, i) => {
    const r = (k: string) => random(`bloco-${semente}-${i}-${k}`);
    if (r("mostra") > forca * 0.9) {
      return null;
    }
    const cores = [COR.neon, COR.vivo, COR.amarelo, COR.branco];
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${r("x") * 100}%`,
          top: `${r("y") * 100}%`,
          width: `${6 + r("w") * 38}%`,
          height: 4 + r("h") * 46,
          background: cores[Math.floor(r("c") * cores.length)],
          opacity: 0.55 + 0.45 * r("o"),
          mixBlendMode: "screen",
        }}
      />
    );
  });
  const rasgo = random(`rasgo-${semente}`);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 5px)",
          opacity: forca,
        }}
      />
      {blocos}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${rasgo * 100}%`,
          height: 3 + 10 * forca,
          background: COR.branco,
          opacity: 0.85 * forca,
          boxShadow: `0 0 24px ${COR.neon}`,
        }}
      />
    </AbsoluteFill>
  );
};

type GlitchProps = Record<string, never>;

// Transição de glitch: a cena que sai se desfaz em fatias e RGB até o meio da transição,
// o corte acontece no pico, e a cena que entra se recompõe. O pico cai no compasso.
const GlitchPresentation: React.FC<
  TransitionPresentationComponentProps<GlitchProps>
> = ({ children, presentationDirection, presentationProgress }) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, "");
  const p = presentationProgress;
  const forca = Math.pow(Math.max(0, 1 - Math.abs(p - 0.5) * 2), 0.6);
  const visivel = presentationDirection === "exiting" ? p < 0.5 : p >= 0.5;
  const semente = frame * 7 + (presentationDirection === "exiting" ? 1 : 2);
  const tremor = (random(`tremor-${semente}`) - 0.5) * 40 * forca;
  return (
    <AbsoluteFill style={{ opacity: visivel ? 1 : 0 }}>
      <FiltroGlitch id={`glitch-${id}`} forca={forca} semente={semente} />
      <AbsoluteFill
        style={{
          filter: forca > 0.02 ? `url(#glitch-${id})` : undefined,
          translate: `${tremor}px 0px`,
          scale: 1 + 0.04 * forca,
        }}
      >
        {children}
      </AbsoluteFill>
      <RuidoGlitch forca={forca} semente={semente} />
      {/* Clarão no instante do corte */}
      <AbsoluteFill
        style={{
          background: COR.neon,
          mixBlendMode: "overlay",
          opacity: interpolate(forca, [0.85, 1], [0, 0.35], clamp),
        }}
      />
    </AbsoluteFill>
  );
};

export const glitch = (): TransitionPresentation<GlitchProps> => ({
  component: GlitchPresentation,
  props: {},
});

// Texto que entra com um glitch curto (separação RGB por sombra, fatias e tremor) e assenta.
// `inicio` é o quadro local em que o glitch começa; dura `duracao` quadros.
export const GlitchTexto: React.FC<{
  inicio: number;
  duracao?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ inicio, duracao = 12, children, style }) => {
  const frame = useCurrentFrame();
  const f = frame - inicio;
  const ativo = f >= 0 && f < duracao;
  const forca = ativo ? 1 - f / duracao : 0;
  const s = `${inicio}-${frame}`;
  const dx = (random(`gx-${s}`) - 0.5) * 30 * forca;
  const corte = random(`gc-${s}`);
  const fatia = ativo && random(`gf-${s}`) < 0.6;
  return (
    <span
      style={{
        display: "inline-block",
        opacity: f < 0 ? 0 : 1,
        translate: `${dx}px 0px`,
        textShadow: forca
          ? `${10 * forca}px 0 rgba(1,237,67,0.9), ${-10 * forca}px 0 rgba(0,92,219,0.95)`
          : undefined,
        clipPath: fatia
          ? `inset(${corte * 60}% 0 ${(1 - corte) * 25}% 0)`
          : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
