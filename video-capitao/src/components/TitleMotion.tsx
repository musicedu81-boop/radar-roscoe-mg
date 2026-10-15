import type { LucideIcon } from "lucide-react";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT } from "../theme";

type Props = {
  centerY: number;
  // Linha de cima, menor (ex.: "DIA DOS")
  kicker: string;
  // Linha principal, em dourado (ex.: "PROFESSORES")
  title: string;
  // Selo abaixo do cartão (ex.: "15 DE OUTUBRO")
  badge?: string;
  // Ícones que flutuam nos quatro cantos do cartão
  icons: [LucideIcon, LucideIcon, LucideIcon, LucideIcon];
};

// Largura útil do texto dentro do cartão; a fonte diminui para textos longos
const TEXT_WIDTH = 900;
const fitFont = (text: string, max: number, emPerChar: number) =>
  Math.min(max, TEXT_WIDTH / (Math.max(1, text.length) * emPerChar));

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const Star: React.FC<{ x: number; y: number; size: number; delay: number }> = ({
  x,
  y,
  size,
  delay,
}) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  const s = interpolate(f, [0, 8, 16, 26], [0, 1.2, 0.7, 1], clamp);
  const twinkle = 0.65 + 0.35 * Math.sin((frame + delay * 3) / 4);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        scale: s,
        opacity: f < 0 ? 0 : twinkle,
        rotate: `${f * 2}deg`,
      }}
    >
      <path
        d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z"
        fill={COLORS.gold}
      />
    </svg>
  );
};

const FloatingIcon: React.FC<{
  x: number;
  y: number;
  delay: number;
  tilt: number;
  children: React.ReactNode;
}> = ({ x, y, delay, tilt, children }) => {
  const frame = useCurrentFrame();
  const f = frame - delay;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 70,
        top: y - 70,
        width: 140,
        height: 140,
        borderRadius: 999,
        background: `linear-gradient(145deg, ${COLORS.gold}, ${COLORS.goldDeep})`,
        boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        scale: interpolate(f, [0, 14], [0, 1], {
          ...clamp,
          easing: Easing.spring({ damping: 9 }),
        }),
        rotate: `${tilt + Math.sin(frame / 10 + delay) * 6}deg`,
        translate: `0px ${Math.sin(frame / 8 + delay) * 8}px`,
      }}
    >
      {children}
    </div>
  );
};

export const TitleMotion: React.FC<Props> = ({
  centerY,
  kicker,
  title,
  badge,
  icons,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const exitStart = durationInFrames - 12;

  const exit = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    ...clamp,
    easing: Easing.bezier(0.55, 0, 1, 0.45),
  });

  const [IconA, IconB, IconC, IconD] = icons;
  const kickerSize = fitFont(kicker, 78, 0.78);
  const titleSize = fitFont(title, 116, 0.7);

  return (
    <AbsoluteFill
      style={{ opacity: exit, scale: interpolate(exit, [0, 1], [0.9, 1]) }}
    >
      {/* Raios dourados de explosão na entrada */}
      <div
        style={{
          position: "absolute",
          left: 540 - 700,
          top: centerY - 700,
          width: 1400,
          height: 1400,
          borderRadius: 999,
          background: `repeating-conic-gradient(rgba(255,201,60,0.28) 0deg 6deg, rgba(255,201,60,0) 6deg 18deg)`,
          maskImage: "radial-gradient(circle, black 20%, transparent 65%)",
          WebkitMaskImage:
            "radial-gradient(circle, black 20%, transparent 65%)",
          scale: interpolate(frame, [0, 18], [0.2, 1], {
            ...clamp,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          rotate: `${frame * 0.6}deg`,
          opacity: interpolate(frame, [0, 6, 40, 70], [0, 1, 0.7, 0.35], clamp),
        }}
      />

      {/* Cartão principal */}
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: centerY,
          translate: `0px ${
            interpolate(frame, [0, 16], [220, 0], {
              ...clamp,
              easing: Easing.spring({ damping: 13 }),
            }) - 0
          }px`,
          marginTop: -200,
          height: 400,
          borderRadius: 48,
          background: `linear-gradient(160deg, ${COLORS.navy} 0%, ${COLORS.blue} 100%)`,
          border: `6px solid ${COLORS.gold}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          scale: interpolate(frame, [0, 16], [0.6, 1], {
            ...clamp,
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
          opacity: interpolate(frame, [0, 5], [0, 1], clamp),
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {kicker.split("").map((ch, i) => (
            <span
              key={`t${i}`}
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: kickerSize,
                color: COLORS.white,
                letterSpacing: 6,
                whiteSpace: "pre",
                display: "inline-block",
                translate: `0px ${interpolate(
                  frame,
                  [6 + i * 1.5, 18 + i * 1.5],
                  [50, 0],
                  {
                    ...clamp,
                    easing: Easing.spring({ damping: 12 }),
                  },
                )}px`,
                opacity: interpolate(
                  frame,
                  [6 + i * 1.5, 12 + i * 1.5],
                  [0, 1],
                  clamp,
                ),
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: -6 }}>
          {title.split("").map((ch, i) => (
            <span
              key={`m${i}`}
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: titleSize,
                lineHeight: 1.05,
                letterSpacing: -2,
                color: COLORS.gold,
                display: "inline-block",
                textShadow: "0 6px 0 rgba(0,0,0,0.25)",
                translate: `0px ${interpolate(
                  frame,
                  [12 + i * 1.6, 26 + i * 1.6],
                  [90, 0],
                  {
                    ...clamp,
                    easing: Easing.spring({ damping: 10 }),
                  },
                )}px`,
                scale: interpolate(
                  frame,
                  [12 + i * 1.6, 26 + i * 1.6],
                  [0.4, 1],
                  {
                    ...clamp,
                    easing: Easing.spring({ damping: 10 }),
                  },
                ),
                opacity: interpolate(
                  frame,
                  [12 + i * 1.6, 17 + i * 1.6],
                  [0, 1],
                  clamp,
                ),
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        {/* Sublinhado em giz desenhado à mão */}
        <svg
          width={760}
          height={46}
          viewBox="0 0 760 46"
          style={{ marginTop: 2 }}
        >
          <path
            d="M10 30 C 140 12, 300 40, 420 22 S 650 14, 750 26"
            fill="none"
            stroke={COLORS.white}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={800}
            strokeDashoffset={interpolate(frame, [30, 52], [800, 0], {
              ...clamp,
              easing: Easing.bezier(0.65, 0, 0.35, 1),
            })}
          />
        </svg>
      </div>

      {/* Selo abaixo do cartão */}
      {badge ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: centerY + 225,
            display: "flex",
            justifyContent: "center",
            opacity: interpolate(frame, [40, 50], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [40, 54], [30, 0], {
              ...clamp,
              easing: Easing.spring({ damping: 12 }),
            })}px`,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 46,
              letterSpacing: 4,
              color: COLORS.navy,
              background: COLORS.white,
              padding: "14px 40px",
              borderRadius: 999,
              boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
            }}
          >
            {badge}
          </div>
        </div>
      ) : null}

      <FloatingIcon x={130} y={centerY - 230} delay={20} tilt={-12}>
        <IconA size={78} color={COLORS.navy} strokeWidth={2.4} />
      </FloatingIcon>
      <FloatingIcon x={950} y={centerY - 220} delay={26} tilt={10}>
        <IconB size={74} color={COLORS.navy} strokeWidth={2.4} />
      </FloatingIcon>
      <FloatingIcon x={120} y={centerY + 210} delay={32} tilt={8}>
        <IconC size={74} color={COLORS.navy} strokeWidth={2.4} />
      </FloatingIcon>
      <FloatingIcon x={960} y={centerY + 200} delay={38} tilt={-8}>
        <IconD size={70} color={COLORS.navy} strokeWidth={2.4} />
      </FloatingIcon>

      <Star x={260} y={centerY - 260} size={46} delay={22} />
      <Star x={830} y={centerY - 280} size={38} delay={28} />
      <Star x={540} y={centerY - 290} size={54} delay={18} />
      <Star x={300} y={centerY + 300} size={34} delay={44} />
      <Star x={790} y={centerY + 310} size={42} delay={48} />
    </AbsoluteFill>
  );
};
