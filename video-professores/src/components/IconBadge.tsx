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
  icon: LucideIcon;
  label: string;
  side: "left" | "right";
  y: number;
};

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Selo animado com ícone + rótulo que ilustra a fala ao lado do personagem
export const IconBadge: React.FC<Props> = ({ icon: Icon, label, side, y }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const x = side === "left" ? 180 : 900;
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
            fontSize: 34,
            letterSpacing: 2,
            color: COLORS.navy,
            background: COLORS.gold,
            padding: "8px 22px",
            borderRadius: 999,
            whiteSpace: "nowrap",
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
