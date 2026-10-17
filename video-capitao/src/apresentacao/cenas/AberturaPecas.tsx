import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { clamp, COR, EASE, LOGO } from "../marca";

// Peças HTML da abertura e do encerramento (por cima do espaço 3D).

// Logo da marca com entrada em glitch (fatias deslocadas, separação RGB, piscadas), vinda da
// profundidade, com halo de luz atrás e reflexos de luz que atravessam a logo.
// O glitch é feito só com CSS barato (clip-path, translate, drop-shadow sem desfoque): um filtro
// SVG de deslocamento custava cerca de 10 s por quadro no render por software.
// `inicio`: quadro local (useCurrentFrame) em que o glitch começa. `reflexos`: idem, por reflexo.
const DURACAO_GLITCH = 16;
const FATIAS = 9;

export const LogoMarca: React.FC<{
  inicio: number;
  largura: number;
  reflexos: number[];
  escalaInicial?: number;
  halo?: number; // 0..1: força do halo atrás da logo
}> = ({ inicio, largura, reflexos, escalaInicial = 1.18, halo = 1 }) => {
  const frame = useCurrentFrame();
  const f = frame - inicio;
  const altura = largura / LOGO.proporcao;
  if (f < 0) {
    return <div style={{ width: largura, height: altura }} />;
  }
  const forca = interpolate(f, [0, DURACAO_GLITCH], [1, 0], clamp);
  const emGlitch = forca > 0.02;
  // Piscadas de sinal nos primeiros quadros
  const pisca =
    f < 10 ? (random(`logo-pisca-${inicio}-${f}`) > 0.3 ? 1 : 0.25) : 1;
  const tremor = (random(`logo-dx-${inicio}-${f}`) - 0.5) * 30 * forca;
  const rgb = Math.round(18 * forca);

  // Fatias horizontais de alturas irregulares; algumas saem do lugar a cada quadro
  const pesos = Array.from(
    { length: FATIAS },
    (_, k) => 0.4 + random(`logo-peso-${inicio}-${f}-${k}`),
  );
  const soma = pesos.reduce((a, b) => a + b, 0);
  let acumulado = 0;
  const fatias = pesos.map((p, k) => {
    const topo = (acumulado / soma) * 100;
    acumulado += p;
    const base = (acumulado / soma) * 100;
    const r = (c: string) => random(`logo-fatia-${inicio}-${f}-${k}-${c}`);
    const dx = r("m") < 0.5 ? (r("x") - 0.5) * 110 * forca : 0;
    return (
      <Img
        key={k}
        src={LOGO.branco}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: largura,
          height: altura,
          clipPath: `inset(${topo}% 0% ${100 - base}% 0%)`,
          translate: `${dx}px 0px`,
        }}
      />
    );
  });

  return (
    <div style={{ position: "relative", width: largura, height: altura }}>
      {/* Halo de luz atrás da logo */}
      <div
        style={{
          position: "absolute",
          left: -largura * 0.25,
          right: -largura * 0.25,
          top: -altura * 0.45,
          bottom: -altura * 0.45,
          background: `radial-gradient(ellipse at 50% 50%, rgba(0,92,219,0.55) 0%, rgba(5,75,135,0.28) 38%, transparent 68%)`,
          opacity:
            halo *
            interpolate(f, [0, 20], [0, 1], { ...clamp, easing: EASE.entrada }),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: pisca,
          translate: `${tremor}px 0px`,
          scale: interpolate(f, [0, 26], [escalaInicial, 1], {
            ...clamp,
            easing: EASE.entrada,
            output: "perceptual-scale",
          }),
          filter: emGlitch
            ? `drop-shadow(${rgb}px 0px 0px rgba(1,237,67,${0.85 * forca})) drop-shadow(${-rgb}px 0px 0px rgba(0,92,219,${0.95 * forca}))`
            : undefined,
        }}
      >
        {emGlitch ? (
          fatias
        ) : (
          <Img
            src={LOGO.branco}
            style={{ width: largura, height: altura, display: "block" }}
          />
        )}
        {reflexos.map((r) => (
          <ReflexoLogo key={r} inicio={r} largura={largura} altura={altura} />
        ))}
      </div>
    </div>
  );
};

// Reflexo de luz que atravessa a logo: cópia branca da logo (só os pixels da marca),
// recortada por uma faixa diagonal em movimento e somada por cima com brilho neon.
const ReflexoLogo: React.FC<{
  inicio: number;
  largura: number;
  altura: number;
}> = ({ inicio, largura, altura }) => {
  const frame = useCurrentFrame();
  const f = frame - inicio;
  if (f < 0 || f > 30) {
    return null;
  }
  const p = interpolate(f, [0, 30], [-20, 120], {
    ...clamp,
    easing: EASE.suave,
  });
  const faixa = `linear-gradient(105deg, transparent ${p - 16}%, rgba(0,0,0,0.35) ${p - 7}%, black ${p}%, rgba(0,0,0,0.35) ${p + 7}%, transparent ${p + 16}%)`;
  return (
    <Img
      src={LOGO.branco}
      style={{
        position: "absolute",
        inset: 0,
        width: largura,
        height: altura,
        filter: `brightness(0) invert(1) drop-shadow(0 0 10px ${COR.neon})`,
        mixBlendMode: "screen",
        opacity: 0.9,
        maskImage: faixa,
        WebkitMaskImage: faixa,
      }}
    />
  );
};

// Vazamento de luz (light leak) em CSS: manchas de luz quente, neon e azul que atravessam a
// tela em modo "screen". Sobe na primeira metade e recua na segunda, como o lightLeak().
export const VazamentoDeLuz: React.FC<{
  inicio: number;
  duracao: number;
  semente: string;
  forca?: number;
}> = ({ inicio, duracao, semente, forca = 1 }) => {
  const frame = useCurrentFrame();
  const p = (frame - inicio) / duracao;
  if (p <= 0 || p >= 1) {
    return null;
  }
  const intensidade = Math.sin(p * Math.PI) * forca;
  const r = (k: string) => random(`vazamento-${semente}-${k}`);
  const manchas = [
    { cor: "255,205,14", x0: r("x0") * 40, y0: 10 + r("y0") * 30, tam: 70 },
    { cor: "1,237,67", x0: 50 + r("x1") * 40, y0: 40 + r("y1") * 30, tam: 60 },
    { cor: "0,92,219", x0: r("x2") * 100, y0: 60 + r("y2") * 30, tam: 80 },
  ];
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: intensidade,
        pointerEvents: "none",
      }}
    >
      {manchas.map((m, k) => {
        const x = m.x0 + (p - 0.5) * 50 * (k % 2 === 0 ? 1 : -1);
        const y = m.y0 + (p - 0.5) * 20;
        return (
          <AbsoluteFill
            key={k}
            style={{
              background: `radial-gradient(ellipse ${m.tam}% ${m.tam * 0.6}% at ${x}% ${y}%, rgba(${m.cor},0.55) 0%, rgba(${m.cor},0.18) 40%, transparent 70%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Fundo do espaço 3D: degradê azul-noite com vinheta (leve: sem grão nem camadas extras)
export const FundoEspaco: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 90% 60% at 50% 42%, ${COR.fundo} 0%, ${COR.noite} 48%, ${COR.noiteProfunda} 100%)`,
    }}
  />
);

// Clarão branco e verde-neon a partir do centro (pico em `opacidade` = 1)
export const Clarao: React.FC<{ opacidade: number; centroY?: number }> = ({
  opacidade,
  centroY = 50,
}) => {
  if (opacidade <= 0.001) {
    return null;
  }
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: opacidade,
        background: `radial-gradient(ellipse 110% 75% at 50% ${centroY}%, rgba(255,255,255,1) 0%, rgba(236,255,242,0.97) 30%, rgba(120,245,160,0.8) 62%, rgba(0,92,219,0.55) 100%)`,
      }}
    />
  );
};

// Linha de varredura neon que cruza uma faixa da tela (usada na entrada da logo)
export const Varredura: React.FC<{
  inicio: number;
  topo: number;
  altura: number;
}> = ({ inicio, topo, altura }) => {
  const frame = useCurrentFrame();
  const f = frame - inicio;
  if (f < 0 || f > 14) {
    return null;
  }
  const y = interpolate(f, [0, 14], [topo, topo + altura], {
    ...clamp,
    easing: EASE.suave,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        height: 4,
        background: COR.neon,
        boxShadow: `0 0 24px 6px rgba(1,237,67,0.6)`,
        opacity: interpolate(f, [0, 3, 11, 14], [0, 1, 1, 0], clamp),
      }}
    />
  );
};
