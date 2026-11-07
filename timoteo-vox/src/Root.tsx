import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { TIMING } from "./timing";
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
    </>
  );
};
