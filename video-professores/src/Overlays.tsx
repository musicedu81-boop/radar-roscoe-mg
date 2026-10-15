import { Audio } from "@remotion/media";
import { Heart, Lightbulb } from "lucide-react";
import React from "react";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import { IconBadge } from "./components/IconBadge";
import { TitleMotion } from "./components/TitleMotion";

// Momento em que ele fala "Dia dos Professores" (segundos no vídeo original)
export const TITLE = { at: 2, duration: 4 };

// Zooms de ênfase, sincronizados com as falas fortes
export const PUNCH_INS = [{ at: TITLE.at, duration: TITLE.duration, amount: 1.1 }];

export const Overlays: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      <Sequence
        name="Motion: Dia dos Professores"
        from={Math.round(TITLE.at * fps)}
        durationInFrames={Math.round(TITLE.duration * fps)}
        premountFor={fps}
      >
        <TitleMotion centerY={1300} />
        <Audio name="SFX whoosh título" src={staticFile("sfx-whoosh.wav")} volume={0.5} premountFor={fps} />
        <Sequence from={14} premountFor={fps}>
          <Audio name="SFX brilho título" src={staticFile("sfx-brilho.wav")} volume={0.35} premountFor={fps} />
        </Sequence>
      </Sequence>

      <Sequence name="Ícone: Gratidão" from={Math.round(8 * fps)} durationInFrames={Math.round(2.5 * fps)} premountFor={fps}>
        <IconBadge icon={Heart} label="GRATIDÃO" side="left" y={560} />
        <Audio name="SFX pop gratidão" src={staticFile("sfx-pop.wav")} volume={0.45} premountFor={fps} />
      </Sequence>

      <Sequence name="Ícone: Conhecimento" from={Math.round(11 * fps)} durationInFrames={Math.round(2.5 * fps)} premountFor={fps}>
        <IconBadge icon={Lightbulb} label="CONHECIMENTO" side="right" y={560} />
        <Audio name="SFX pop conhecimento" src={staticFile("sfx-pop.wav")} volume={0.45} premountFor={fps} />
      </Sequence>
    </>
  );
};
