import { Composition } from "remotion";
import meta from "./data/video-meta.json";
import { DiaDosProfessores } from "./Main";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DiaDosProfessores"
      component={DiaDosProfessores}
      durationInFrames={Math.ceil(meta.durationInSeconds * 30)}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
