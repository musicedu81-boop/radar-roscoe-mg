import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import React, { useMemo } from "react";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
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

export const DiaDosProfessores: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const musicVolume = useMusicVolume(durationInFrames, fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TrackedVideo
        src={meta.src}
        sourceWidth={meta.width}
        sourceHeight={meta.height}
        track={faceTrack}
        punchIns={PUNCH_INS}
      />

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
    </AbsoluteFill>
  );
};
