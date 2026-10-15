import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions } from "./components/Captions";
import type { FacePoint } from "./components/TrackedVideo";
import { TrackedVideo } from "./components/TrackedVideo";
import captionsJson from "./data/captions.json";
import faceTrackJson from "./data/face-track.json";
import meta from "./data/video-meta.json";
import { Overlays, PUNCH_INS, TITLE } from "./Overlays";

const captions = captionsJson as Caption[];
const faceTrack = faceTrackJson as FacePoint[];

// Volume da trilha com "ducking": abaixa quando ele fala, sobe nas pausas
const useMusicVolume = (durationInFrames: number, fps: number) => {
  return useMemo(() => {
    const speaking = new Float32Array(durationInFrames);
    for (const c of captions) {
      const a = Math.max(0, Math.floor(((c.startMs - 150) / 1000) * fps));
      const b = Math.min(durationInFrames, Math.ceil(((c.endMs + 300) / 1000) * fps));
      for (let f = a; f < b; f++) {
        speaking[f] = 1;
      }
    }
    const vol = new Float32Array(durationInFrames);
    let cur = 0.1;
    for (let f = 0; f < durationInFrames; f++) {
      const target = speaking[f] ? 0.1 : 0.2;
      cur += (target - cur) * 0.12;
      vol[f] = cur;
    }
    return vol;
  }, [durationInFrames, fps]);
};

export const VideoCapitao: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const musicVolume = useMusicVolume(durationInFrames, fps);

  // Depois do último quadro gravado, a imagem congela com uma leve aproximação
  // e escurece até o fim, enquanto a trilha termina o fade
  const lastSourceFrame = Math.round(meta.durationInSeconds * fps) - 1;
  const holdZoom = interpolate(frame, [lastSourceFrame, durationInFrames - 1], [1, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.67, 1),
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - Math.round(0.9 * fps), durationInFrames - 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ scale: holdZoom }}>
        <Freeze frame={lastSourceFrame} active={frame > lastSourceFrame}>
          <TrackedVideo
            src={meta.src}
            sourceWidth={meta.width}
            sourceHeight={meta.height}
            track={faceTrack}
            punchIns={PUNCH_INS}
          />
        </Freeze>
      </AbsoluteFill>

      <Audio
        name="Trilha Dia dos Professores"
        src={staticFile("trilha.wav")}
        premountFor={fps}
        volume={(f) => musicVolume[Math.min(f, musicVolume.length - 1)] ?? 0.1}
      />

      <Captions
        captions={captions}
        centerY={1330}
        hiddenRanges={[
          { startMs: TITLE.at * 1000, endMs: (TITLE.at + TITLE.duration) * 1000 },
        ]}
      />

      <Overlays />

      <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
