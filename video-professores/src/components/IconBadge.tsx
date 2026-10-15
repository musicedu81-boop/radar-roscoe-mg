import type { LucideIcon } from "lucide-react";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, WIDTH } from "../theme";

type Props = {
  icon: LucideIcon;
  label: string;
  side: "left" | "right";
  y: number;
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const LABEL_FONT = 36;
const LABEL_MAX_WIDTH = 300;
const LABEL_PADDING = 44;
const SCREEN_MARGIN = 24;

// Largura aproximada de um texto em Montserrat Black, caixa alta
const textWidth = (text: string, fontSize: number) => text.length * (fontSize * 0.74 + 2);

// Rótulos longos quebram em duas linhas; se uma palavra sozinha não couber,
// a fonte diminui. O selo é deslocado para o rótulo nunca sair da tela.
const labelLayout = (label: string) => {
  const longest = label.split(" ").reduce((a, b) => (b.length > a.length ? b : a), "");
  const fontSize = Math.min(
    LABEL_FONT,
    (LABEL_MAX_WIDTH - LABEL_PADDING - 2 * longest.length) / (0.74 * longest.length),
  );
  const width = Math.min(LABEL_MAX_WIDTH, textWidth(label, fontSize) + LABEL_PADDING);
  return { fontSize, width };
};

// Selo animado com ícone + rótulo que ilustra a fala ao lado do personagem
export const IconBadge: React.FC<Props> = ({ icon: Icon, label, side, y }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { fontSize, width: labelWidth } = labelLayout(label);
  const half = Math.max(110, labelWidth / 2) + SCREEN_MARGIN;
  const x =
    side === "left" ? Math.max(190, half) : Math.min(890, WIDTH - half);
  const dir = side === "left" ? -1 : 1;

  const enter = interpolate(frame, [0, 14], [0, 1], {
    ...clamp,
    easing: Easing.spring({ damping: 9 }),
  });
  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    ...clamp,
    easing: Easing.bezier(0.55, 0, 1, 0.45),
  });
  const ring = interpolate(frame, [4, 26], [0.6, 1.7], clamp);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: x - 110,
          top: y - 110,
          width: 220,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          scale: enter * exit,
          rotate: `${interpolate(frame, [0, 14], [dir * 25, 0], clamp) + Math.sin(frame / 9) * 4}deg`,
          translate: `${interpolate(frame, [0, 14], [dir * 120, 0], {
            ...clamp,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })}px ${Math.sin(frame / 7) * 7}px`,
        }}
      >
        <div style={{ position: "relative", width: 200, height: 200 }}>
          {/* Onda de choque na entrada */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              border: `6px solid ${COLORS.gold}`,
              scale: ring,
              opacity: interpolate(frame, [4, 26], [0.9, 0], clamp),
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              background: `linear-gradient(150deg, ${COLORS.blue}, ${COLORS.navy})`,
              border: `7px solid ${COLORS.gold}`,
              boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={104} color={COLORS.white} strokeWidth={2.2} />
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize,
            lineHeight: 1.1,
            letterSpacing: 2,
            textAlign: "center",
            color: COLORS.navy,
            background: COLORS.gold,
            padding: "8px 22px",
            borderRadius: 28,
            maxWidth: LABEL_MAX_WIDTH,
            width: "max-content",
            boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
            opacity: interpolate(frame, [8, 14], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [8, 18], [20, 0], {
              ...clamp,
              easing: Easing.spring({ damping: 12 }),
            })}px`,
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
