import { Audio } from "@remotion/media";
import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Award,
  Backpack,
  BookOpen,
  BookOpenText,
  BriefcaseBusiness,
  GraduationCap,
  Heart,
  HeartHandshake,
  PartyPopper,
  Pencil,
  School,
  Sprout,
  Star,
  Users,
} from "lucide-react";
import React from "react";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import { IconBadge } from "./components/IconBadge";
import { TitleMotion } from "./components/TitleMotion";

// Motion do título: entra no instante da frase-tema (segundos no vídeo original).
// Aqui, quando ele fala "Dia do professor, da professora".
export const TITLE = {
  at: 1.4,
  duration: 3.7,
  kicker: "DIA DOS",
  title: "PROFESSORES",
  badge: "15 DE OUTUBRO",
  icons: [GraduationCap, Apple, BookOpen, Pencil] as [
    LucideIcon,
    LucideIcon,
    LucideIcon,
    LucideIcon,
  ],
};

// Zooms de ênfase, sincronizados com as falas fortes
export const PUNCH_INS = [
  { at: TITLE.at, duration: TITLE.duration, amount: 1.1 },
  // "com muita saudade a dona Iracy..."
  { at: 33.7, duration: 3.4, amount: 1.08 },
  // "Valorize o seu professor, a sua professora"
  { at: 50.1, duration: 3.1, amount: 1.08 },
  // "Juntos por uma educação cada vez melhor"
  { at: 58.7, duration: 2.9, amount: 1.06 },
];

type IconCue = {
  at: number;
  duration?: number;
  icon: LucideIcon;
  label: string;
  side: "left" | "right";
};

const ICON_DURATION = 2.6;

// Ícones que ilustram a fala, no instante da palavra-chave (segundos)
const ICONS: IconCue[] = [
  // "para parabenizar a vocês"
  { at: 7.1, icon: PartyPopper, label: "PARABÉNS", side: "right" },
  // "pelo papel importantíssimo"
  { at: 10.3, icon: Star, label: "ESSENCIAL", side: "left" },
  // "eu estive lá no banco da escola"
  { at: 15.5, icon: School, label: "BANCO DA ESCOLA", side: "right" },
  // "todas as profissões passam pelas mãos de vocês"
  { at: 18.6, icon: BriefcaseBusiness, label: "PROFISSÕES", side: "left" },
  // "preparando o nosso futuro"
  { at: 24.7, icon: Sprout, label: "NOSSO FUTURO", side: "right" },
  // "o nome de todos os meus mestres"
  {
    at: 31.5,
    duration: 2.4,
    icon: GraduationCap,
    label: "MESTRES",
    side: "left",
  },
  // "com muita saudade"
  { at: 34.0, icon: Heart, label: "SAUDADE", side: "right" },
  // "me ensinou a ler, a escrever"
  { at: 41.6, icon: BookOpenText, label: "LER E ESCREVER", side: "left" },
  // "você que é estudante"
  {
    at: 48.3,
    duration: 1.9,
    icon: Backpack,
    label: "ESTUDANTE",
    side: "right",
  },
  // "valorize o seu professor"
  { at: 50.3, icon: Award, label: "VALORIZE", side: "left" },
  // "você que é pai, você que é mãe"
  { at: 53.4, icon: Users, label: "FAMÍLIA", side: "right" },
  // "juntos por uma educação cada vez melhor"
  { at: 58.6, icon: HeartHandshake, label: "JUNTOS", side: "left" },
];

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
        <TitleMotion
          centerY={1300}
          kicker={TITLE.kicker}
          title={TITLE.title}
          badge={TITLE.badge}
          icons={TITLE.icons}
        />
        <Audio
          name="SFX whoosh título"
          src={staticFile("sfx-whoosh.wav")}
          volume={0.5}
          premountFor={fps}
        />
        <Sequence from={14} premountFor={fps}>
          <Audio
            name="SFX brilho título"
            src={staticFile("sfx-brilho.wav")}
            volume={0.35}
            premountFor={fps}
          />
        </Sequence>
      </Sequence>

      {ICONS.map((cue) => (
        <Sequence
          key={cue.label}
          name={`Ícone: ${cue.label}`}
          from={Math.round(cue.at * fps)}
          durationInFrames={Math.round((cue.duration ?? ICON_DURATION) * fps)}
          premountFor={fps}
        >
          <IconBadge
            icon={cue.icon}
            label={cue.label}
            side={cue.side}
            y={560}
          />
          <Audio
            name={`SFX pop ${cue.label}`}
            src={staticFile("sfx-pop.wav")}
            volume={0.4}
            premountFor={fps}
          />
        </Sequence>
      ))}
    </>
  );
};
