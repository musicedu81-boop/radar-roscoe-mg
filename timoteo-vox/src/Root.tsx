import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { ShortVideo } from "./short/ShortVideo";
import { ShortRef } from "./shortref/ShortRef";
import { LongoB } from "./longob/LongoB";
import { TIMING, TIMING_SHORT } from "./timing";
import { FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TimoteoVox"
        component={Video}
        durationInFrames={TIMING.totalFrames}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{ legendas: true }}
      />
      <Composition
        id="TimoteoVoxSemLegenda"
        component={Video}
        durationInFrames={TIMING.totalFrames}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{ legendas: false }}
      />
      <Composition
        id="TimoteoShort"
        component={ShortVideo}
        durationInFrames={TIMING_SHORT.totalFrames}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ legendas: true }}
      />
      <Composition
        id="TimoteoLongoB"
        component={LongoB}
        durationInFrames={TIMING.totalFrames}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ legendas: true }}
      />
      <Composition
        id="TimoteoShortRef"
        component={ShortRef}
        durationInFrames={TIMING_SHORT.totalFrames}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ legendas: true }}
      />
      <Composition
        id="TimoteoShortSemLegenda"
        component={ShortVideo}
        durationInFrames={TIMING_SHORT.totalFrames}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ legendas: false }}
      />
    </>
  );
};
