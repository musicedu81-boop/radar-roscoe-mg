import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT } from "../theme";

type Props = {
  captions: Caption[];
  // Intervalos (ms) em que a legenda some para dar espaço a um motion
  hiddenRanges: { startMs: number; endMs: number }[];
  // Centro vertical da legenda, em px
  centerY: number;
};

// Palavras que ganham destaque extra quando faladas
const KEYWORDS = /professor|professora|professores|educa|escola|ensin|aprend|obrigad|gratid|futuro|aluno|sala|parab|respeito|valoriz|amor|dedica/i;

export const Captions: React.FC<Props> = ({ captions, hiddenRanges, centerY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;

  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: 1100,
        breakOnSilenceAfterMilliseconds: 600,
      }),
    [captions],
  );

  const hidden = hiddenRanges.some((r) => nowMs >= r.startMs && nowMs < r.endMs);
  if (hidden) {
    return null;
  }

  const pageIndex = pages.findIndex((p, i) => {
    const next = pages[i + 1];
    const end = Math.min(p.startMs + p.durationMs, next ? next.startMs : Infinity);
    return nowMs >= p.startMs && nowMs < end;
  });
  if (pageIndex === -1) {
    return null;
  }
  const page = pages[pageIndex];
  const pageFrame = frame - (page.startMs / 1000) * fps;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: centerY,
          translate: "0px -50%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          columnGap: 22,
          rowGap: 6,
          scale: interpolate(pageFrame, [0, 7], [0.82, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 14 }),
          }),
          opacity: interpolate(pageFrame, [0, 3], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {page.tokens.map((token, i) => {
          const active = nowMs >= token.fromMs && nowMs < token.toMs;
          const spoken = nowMs >= token.fromMs;
          const isKey = KEYWORDS.test(token.text);
          const tokenFrame = frame - (token.fromMs / 1000) * fps;
          return (
            <span
              key={`${page.startMs}-${i}`}
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: isKey ? 92 : 80,
                lineHeight: 1.08,
                textTransform: "uppercase",
                letterSpacing: -1,
                color: active || (spoken && isKey) ? COLORS.gold : COLORS.white,
                WebkitTextStroke: "14px rgba(5,10,30,0.92)",
                paintOrder: "stroke fill",
                textShadow: "0 8px 24px rgba(0,0,0,0.55)",
                display: "inline-block",
                scale: active
                  ? interpolate(tokenFrame, [0, 4, 9], [1, 1.14, 1.06], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })
                  : 1,
                translate: active ? "0px -4px" : "0px 0px",
              }}
            >
              {token.text.trim()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
