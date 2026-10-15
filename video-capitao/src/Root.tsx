import { Composition } from "remotion";
import meta from "./data/video-meta.json";
import { VideoCapitao } from "./Main";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VideoCapitao"
      component={VideoCapitao}
      durationInFrames={Math.ceil((meta.durationInSeconds + meta.endHoldInSeconds) * 30)}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
