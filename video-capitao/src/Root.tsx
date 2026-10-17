import { Composition } from "remotion";
import { Apresentacao } from "./apresentacao/Apresentacao";
import { ALTURA, FPS, LARGURA } from "./apresentacao/marca";
import { DURACAO_TOTAL } from "./apresentacao/roteiro";
import meta from "./data/video-meta.json";
import { VideoCapitao } from "./Main";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoCapitao"
        component={VideoCapitao}
        durationInFrames={Math.ceil((meta.durationInSeconds + meta.endHoldInSeconds) * 30)}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Apresentação em motion do Planejamento Estratégico (16:9) */}
      <Composition
        id="ApresentacaoPlano"
        component={Apresentacao}
        durationInFrames={DURACAO_TOTAL}
        fps={FPS}
        width={LARGURA}
        height={ALTURA}
      />
    </>
  );
};
