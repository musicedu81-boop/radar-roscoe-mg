import { Video } from "@remotion/media";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HEIGHT, WIDTH } from "../theme";

export type FacePoint = {
  // Tempo em segundos e centro do rosto normalizado (0 a 1) no quadro original
  t: number;
  x: number;
  y: number;
};

type Props = {
  src: string;
  sourceWidth: number;
  sourceHeight: number;
  track: FacePoint[];
  // Momentos de punch-in (zoom de ênfase), em segundos
  punchIns: { at: number; duration: number; amount: number }[];
};

// Altura onde o rosto fica no quadro vertical (terço superior, livre da legenda)
const FACE_TARGET_Y = 0.36 * HEIGHT;
// Zoom base para sempre sobrar margem e permitir centralizar o personagem
const BASE_ZOOM = 1.12;

const sampleTrack = (track: FacePoint[], t: number) => {
  if (track.length === 0) {
    return { x: 0.5, y: 0.4 };
  }
  if (t <= track[0].t) {
    return track[0];
  }
  const last = track[track.length - 1];
  if (t >= last.t) {
    return last;
  }
  let lo = 0;
  let hi = track.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (track[mid].t <= t) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const a = track[lo];
  const b = track[hi];
  const k = (t - a.t) / (b.t - a.t || 1);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
};

export const TrackedVideo: React.FC<Props> = ({
  src,
  sourceWidth,
  sourceHeight,
  track,
  punchIns,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const punch = useMemo(() => {
    let z = 1;
    for (const p of punchIns) {
      const inF = p.at * fps;
      const outF = (p.at + p.duration) * fps;
      const v = interpolate(
        frame,
        [inF - 6, inF + 8, outF - 8, outF + 10],
        [1, p.amount, p.amount, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.33, 1, 0.68, 1),
        },
      );
      z = Math.max(z, v);
    }
    return z;
  }, [frame, fps, punchIns]);

  // Leve zoom de entrada nos primeiros segundos
  const intro = interpolate(frame, [0, 2.5 * fps], [1.06, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const scale =
    Math.max(WIDTH / sourceWidth, HEIGHT / sourceHeight) *
    BASE_ZOOM *
    punch *
    intro;
  const w = sourceWidth * scale;
  const h = sourceHeight * scale;

  const face = sampleTrack(track, t);
  const x = Math.min(0, Math.max(WIDTH - w, WIDTH / 2 - face.x * w));
  const y = Math.min(0, Math.max(HEIGHT - h, FACE_TARGET_Y - face.y * h));

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          height: h,
          translate: `${x}px ${y}px`,
        }}
      >
        <Video
          name="Vídeo original"
          src={staticFile(src)}
          premountFor={fps}
          objectFit="fill"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      {/* Vinheta suave para dar profundidade e destacar o personagem */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)",
        }}
      />
      {/* Degradê inferior para leitura da legenda */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(5,10,30,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
