import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PLANO } from "../dados";
import {
  clamp,
  COR,
  EASE,
  FONTE_TEXTO,
  LARGURA,
} from "../marca";
import { frasesDaCena, inicioLocal, momentoDaPalavra } from "../roteiro";
import { Etiqueta, LinhaNeon, Texto, Titulo } from "../ui/Elementos";
import { Grao } from "../ui/Fundo";
import { EspacoMais } from "./AberturaEspaco";
import {
  Clarao,
  FundoEspaco,
  LogoMarca,
  VazamentoDeLuz,
  Varredura,
} from "./AberturaPecas";

// Cena 01 · Abertura: vinheta em three.js. Os "+" da marca surgem da escuridão com a luz,
// a logo entra com glitch e reflexo na primeira frase, o período e o lema entram na fala,
// e na subida a câmera acelera para dentro do espaço, os "+" viram rastros e há um clarão.
const INDICE = 0;
const REVELA = Easing.bezier(0.3, 0.55, 0.35, 1); // os "+" surgem cedo e assentam devagar
const FRASES = frasesDaCena(INDICE);
const DURACAO = 420;

// Momentos (f local), ligados à narração
const T = {
  luz: 0, // a luz abre na escuridão
  apresenta: 14, // "Talentos Business apresenta"
  logo: FRASES[0].inicio - 12, // glitch da logo, logo antes da primeira frase
  planejamento: momentoDaPalavra(INDICE, "Planejamento") - 8,
  estrategico: momentoDaPalavra(INDICE, "estratégico") - 10, // a palavra-chave entra em +8
  capitao: momentoDaPalavra(INDICE, "Capitão") - 6, // reflexo na logo
  inicioPeriodo: momentoDaPalavra(INDICE, "26/10") - 6,
  fimPeriodo: momentoDaPalavra(INDICE, "31/12") - 6,
  gestao: momentoDaPalavra(INDICE, "Gestão") - 6,
  entrega: momentoDaPalavra(INDICE, "entrega"),
  prefeito: momentoDaPalavra(INDICE, "prefeito") - 6,
  aparece: momentoDaPalavra(INDICE, "aparece"),
  credito: 330, // tempo musical (22 x 15), no fim da última frase
  subida: 360, // último compasso: a trilha sobe
};

const [PALAVRA_1, PALAVRA_2] = PLANO.titulo.split(" ");
const LEMA = PLANO.lema.split(", ");
const ANO = PLANO.periodo.fim.slice(-4);

// Grade vertical (y em px) da composição
const Y = {
  logo: 236,
  titulo: 690,
  linha: 972,
  periodo: 1012,
  lema: 1150,
  credito: 1360,
};
const LARGURA_LOGO = 760;

// Lema: a última palavra de cada metade acende em amarelo, com sublinhado neon, na fala
const PalavraDestaque: React.FC<{ texto: string; momento: number }> = ({
  texto,
  momento,
}) => {
  const frame = useCurrentFrame();
  const f = frame - momento;
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          color: interpolateColors(f, [-2, 5], [COR.branco, COR.amarelo]),
        }}
      >
        {texto}
      </span>
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: -4,
          height: 6,
          width: `${interpolate(f, [0, 14], [0, 100], { ...clamp, easing: EASE.entrada })}%`,
          background: COR.neon,
          boxShadow: `0 0 14px ${COR.neon}`,
        }}
      />
    </span>
  );
};

const LinhaDoLema: React.FC<{
  texto: string;
  inicio: number;
  momento: number;
  final?: string;
}> = ({ texto, inicio, momento, final = "" }) => {
  const palavras = texto.split(" ");
  const ultima = palavras.pop() ?? "";
  return (
    <Texto
      inicio={inicio}
      tamanho={54}
      peso={800}
      cor={COR.branco}
      style={{ textAlign: "center", lineHeight: 1.3, letterSpacing: "-0.01em" }}
    >
      {palavras.join(" ")} <PalavraDestaque texto={ultima} momento={momento} />
      {final}
    </Texto>
  );
};

// Seta do período: linha neon que se desenha de 26/10 até 31/12 enquanto a locutora fala
const SetaPeriodo: React.FC<{ inicio: number; fim: number; largura: number }> = ({
  inicio,
  fim,
  largura,
}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [inicio, fim], [0, largura], {
    ...clamp,
    easing: EASE.suave,
  });
  return (
    <div style={{ position: "relative", width: largura, height: 40 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 17,
          width: w,
          height: 6,
          background: COR.neon,
          boxShadow: `0 0 16px ${COR.neon}`,
        }}
      />
      {/* Ponta da seta */}
      <div
        style={{
          position: "absolute",
          left: Math.max(0, w - 18),
          top: 6,
          width: 0,
          height: 0,
          borderTop: "14px solid transparent",
          borderBottom: "14px solid transparent",
          borderLeft: `22px solid ${COR.neon}`,
          filter: `drop-shadow(0 0 8px ${COR.neon})`,
          opacity: interpolate(w, [0, 24], [0, 1], clamp),
        }}
      />
    </div>
  );
};

// Faixa de luz anamórfica que abre a vinheta no escuro
const LuzAnamorfica: React.FC = () => {
  const frame = useCurrentFrame();
  const abre = interpolate(frame, [0, 26], [0.12, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const some = interpolate(frame, [30, 64], [1, 0], clamp);
  if (some <= 0) {
    return null;
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: some }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 958,
          width: LARGURA * 1.4 * abre,
          height: 4,
          translate: "-50% 0px",
          background: `linear-gradient(90deg, transparent 0%, rgba(1,237,67,0.9) 25%, #FFFFFF 50%, rgba(1,237,67,0.9) 75%, transparent 100%)`,
          boxShadow: `0 0 30px 8px rgba(0,92,219,0.55)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 960,
          width: 520,
          height: 520,
          translate: "-50% -50%",
          scale: 0.4 + 0.6 * abre,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(1,237,67,0.28) 18%, rgba(0,92,219,0.18) 40%, transparent 68%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const CenaAbertura: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - inicioLocal(INDICE);

  // Câmera: dolly lento até a subida; no último compasso acelera para dentro do espaço
  const camZ =
    f < T.subida
      ? interpolate(f, [0, T.subida], [18, 10.5], { ...clamp, easing: EASE.suave })
      : interpolate(f, [T.subida, DURACAO], [10.5, -18], {
          ...clamp,
          easing: EASE.saida,
        });
  const camX = Math.sin(f / 70) * 0.25;
  const camY = interpolate(f, [0, T.subida], [0.8, 0], clamp);
  const rastro = interpolate(f, [T.subida + 4, DURACAO - 6], [0, 1], {
    ...clamp,
    easing: EASE.saida,
  });
  const pulso =
    interpolate(f, [T.logo, T.logo + 3, T.logo + 34], [0, 1, 0], clamp) +
    interpolate(
      f,
      [T.fimPeriodo, T.fimPeriodo + 3, T.fimPeriodo + 24],
      [0, 0.6, 0],
      clamp,
    );

  // Saída na subida: o conteúdo cresce, desfoca e some enquanto a câmera passa por ele
  const saida = interpolate(f, [T.subida + 6, DURACAO - 14], [0, 1], {
    ...clamp,
    easing: EASE.saida,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COR.noiteProfunda }}>
      <FundoEspaco />
      <EspacoMais
        quadro={f}
        camera={[camX, camY, camZ]}
        alvo={[camX * 0.5, camY * 0.5, camZ - 12]}
        revela={interpolate(f, [0, 76], [0, 1], { ...clamp, easing: REVELA })}
        rastro={rastro}
        pulso={Math.min(1, pulso)}
        luz={{
          posicao: [
            interpolate(f, [0, 90], [-7, 7], { ...clamp, easing: EASE.suave }),
            1.5,
            camZ - 6,
          ],
          intensidade: interpolate(f, [0, 18, 70, 110], [0, 220, 220, 60], clamp),
        }}
      />

      {/* Sombra suave atrás da coluna de texto (leitura sobre o 3D) */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 62% 42% at 50% 46%, rgba(1,26,54,0.62) 0%, rgba(1,26,54,0.3) 55%, transparent 100%)",
          opacity: interpolate(f, [T.logo, T.logo + 20], [0, 1], clamp) * (1 - saida),
        }}
      />

      {/* Assinatura da produtora antes da logo */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: interpolate(
            f,
            [T.apresenta, T.apresenta + 12, T.logo - 12, T.logo - 2],
            [0, 1, 1, 0],
            clamp,
          ),
        }}
      >
        <div
          style={{
            marginTop: 120,
            fontFamily: FONTE_TEXTO,
            fontWeight: 700,
            fontSize: 30,
            color: COR.tintaClara,
            textTransform: "uppercase",
            letterSpacing: `${interpolate(f, [T.apresenta, T.logo], [0.28, 0.42], clamp)}em`,
          }}
        >
          {PLANO.agencia} apresenta
        </div>
      </AbsoluteFill>

      <Varredura inicio={T.logo - 4} topo={Y.logo - 40} altura={LARGURA_LOGO / 1.728 + 80} />

      {/* Conteúdo principal, em coluna centrada */}
      <AbsoluteFill
        style={{
          transformOrigin: "50% 42%",
          scale: interpolate(saida, [0, 1], [1, 1.9], { output: "perceptual-scale" }),
          opacity: interpolate(saida, [0, 0.55], [1, 0], clamp),
          filter:
            saida > 0.001
              ? `blur(${interpolate(saida, [0, 1], [0, 12])}px)`
              : undefined,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: (LARGURA - LARGURA_LOGO) / 2,
            top: Y.logo,
          }}
        >
          <LogoMarca inicio={T.logo} largura={LARGURA_LOGO} reflexos={[T.capitao]} />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: Y.titulo,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Titulo
            linhas={[PALAVRA_1]}
            inicio={T.planejamento}
            tamanho={128}
            alinhamento="center"
          />
          <Titulo
            linhas={[`*${PALAVRA_2}*`]}
            inicio={T.estrategico}
            tamanho={128}
            alinhamento="center"
            style={{ marginTop: -6 }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: Y.linha,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <LinhaNeon inicio={T.estrategico + 18} largura={180} espessura={6} />
        </div>

        {/* Período: 26/10 → 31/12/2026, entrando na fala */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: Y.periodo,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
          }}
        >
          <Etiqueta cor="verde" tamanho={58} inicio={T.inicioPeriodo}>
            {PLANO.periodo.inicio}
          </Etiqueta>
          <SetaPeriodo
            inicio={T.inicioPeriodo + 8}
            fim={T.fimPeriodo + 2}
            largura={130}
          />
          <Etiqueta cor="verde" tamanho={58} inicio={T.fimPeriodo}>
            {PLANO.periodo.fim.slice(0, -5)}
            <span style={{ opacity: 0.72 }}>/{ANO}</span>
          </Etiqueta>
        </div>

        {/* Lema, metade por metade na fala */}
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            top: Y.lema,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <LinhaDoLema texto={LEMA[0]} inicio={T.gestao} momento={T.entrega} final="," />
          <LinhaDoLema texto={LEMA[1]} inicio={T.prefeito} momento={T.aparece} />
        </div>

        {/* Crédito */}
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            top: Y.credito,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Texto
            inicio={T.credito}
            tamanho={28}
            peso={600}
            cor={COR.tintaClara}
            style={{ letterSpacing: "0.04em", textAlign: "center" }}
          >
            {PLANO.cliente} · {PLANO.cidade} · {PLANO.agencia}
          </Texto>
        </div>
      </AbsoluteFill>

      {/* Vazamentos de luz: na entrada da logo e na subida */}
      <VazamentoDeLuz inicio={T.logo - 6} duracao={56} semente="logo" forca={0.55} />
      <VazamentoDeLuz inicio={T.subida - 4} duracao={56} semente="subida" forca={0.6} />

      {/* Escuridão inicial e clarão no corte */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000000",
          opacity: interpolate(f, [0, 30], [0.92, 0], { ...clamp, easing: EASE.suave }),
          pointerEvents: "none",
        }}
      />
      <LuzAnamorfica />
      <Clarao
        opacidade={interpolate(f, [DURACAO - 16, DURACAO - 1], [0, 1], {
          ...clamp,
          easing: EASE.saida,
        })}
      />
      <Grao opacidade={0.07} />

      {/* Efeitos: glitch na entrada da logo e passagem na subida */}
      <Audio
        name="SFX glitch da logo"
        src={staticFile("apresentacao/sfx-glitch.wav")}
        from={T.logo - 1}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.22}
      />
      <Audio
        name="SFX passagem da subida"
        src={staticFile("apresentacao/sfx-swoosh.wav")}
        from={T.subida + 4}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.25}
      />
    </AbsoluteFill>
  );
};
