import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PLANO } from "../dados";
import {
  ALTURA,
  clamp,
  COMPASSO,
  COR,
  EASE,
  FONTE_TEXTO,
  FONTE_TITULO,
  LARGURA,
} from "../marca";
import { CENAS, inicioLocal, momentoDaPalavra } from "../roteiro";
import { LinhaNeon, Texto, Titulo } from "../ui/Elementos";
import { Grao } from "../ui/Fundo";
import { EspacoMais, telaParaMundo } from "./AberturaEspaco";
import {
  Clarao,
  FundoEspaco,
  LogoMarca,
  VazamentoDeLuz,
} from "./AberturaPecas";

// Cena 12 · Encerramento: retoma o espaço 3D da abertura. Os rastros de luz desaceleram e
// os "+" se organizam num anel em volta da logo (moldura de fechamento). A logo entra com
// glitch e reflexo na primeira frase, a data de estreia e o crédito fecham, e a tela escurece
// para preto nos últimos 30 quadros.
const INDICE = 11;
const DURACAO = CENAS[INDICE].compassos * COMPASSO;
// Os componentes de ui (Titulo, Texto...) usam o quadro local da sequência, que começa 6
// quadros antes do corte: a eles passamos L + f. As interpolações desta cena usam f.
const L = inicioLocal(INDICE);

// Momentos (f local), ligados à narração
const T = {
  logo: 4, // a logo chega logo depois do impacto do corte
  linha1: momentoDaPalavra(INDICE, "plano") - 8,
  reflexo: momentoDaPalavra(INDICE, "entra") - 2,
  linha2: momentoDaPalavra(INDICE, "no") - 8,
  data: momentoDaPalavra(INDICE, "26/10") - 10, // a palavra-chave entra em +8
  capitao: momentoDaPalavra(INDICE, "Capitão") - 6,
  credito: 150, // tempo musical (10 x 15)
  povo: momentoDaPalavra(INDICE, "povo") - 4,
  escurece: DURACAO - 30,
};

// Texto da estreia vindo de dados.ts: "O plano entra" / "no ar em" / "26/10"
const PALAVRAS_ESTREIA = PLANO.estreia
  .replace(PLANO.periodo.inicio, "")
  .trim()
  .split(" ");
const LINHA_1 = PALAVRAS_ESTREIA.slice(0, 3).join(" ");
const LINHA_2 = PALAVRAS_ESTREIA.slice(3).join(" ");
const ANO = PLANO.periodo.fim.slice(-4);

// Grade vertical (y em px)
const LARGURA_LOGO = 780;
const CENTRO_LOGO = 570;
const Y = {
  logo: CENTRO_LOGO - LARGURA_LOGO / 1.728 / 2,
  titulo: 968,
  linha: 1246,
  credito: 1280,
};

// Anel de "+" centrado na logo (calculado para a câmera a 14 unidades do plano z = 0)
const [, ANEL_Y] = telaParaMundo(LARGURA / 2, CENTRO_LOGO, 14, LARGURA, ALTURA);
const [ANEL_RAIO] = telaParaMundo(LARGURA / 2 + 468, CENTRO_LOGO, 14, LARGURA, ALTURA);

export const CenaEncerramento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - inicioLocal(INDICE);

  // Câmera chega em alta velocidade (continuação dos rastros) e assenta; depois avança devagar
  const camZ =
    f < 40
      ? interpolate(f, [-6, 40], [36, 14], { ...clamp, easing: EASE.entrada })
      : interpolate(f, [40, DURACAO], [14, 12.6], clamp);
  const rastro = interpolate(f, [-6, 28], [1, 0], {
    ...clamp,
    easing: EASE.entrada,
  });
  const anel = interpolate(f, [0, 54], [0, 1], { ...clamp, easing: EASE.entrada });
  const pulso =
    interpolate(f, [T.logo, T.logo + 3, T.logo + 30], [0, 1, 0], clamp) +
    interpolate(f, [T.capitao, T.capitao + 3, T.capitao + 26], [0, 0.7, 0], clamp) +
    interpolate(f, [T.povo, T.povo + 3, T.povo + 30], [0, 1, 0], clamp);
  const escuro = interpolate(f, [T.escurece, DURACAO - 1], [0, 1], {
    ...clamp,
    easing: EASE.suave,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COR.noiteProfunda }}>
      <FundoEspaco />
      <EspacoMais
        quadro={f + 600}
        camera={[0, 0, camZ]}
        alvo={[0, 0, 0]}
        revela={1}
        rastro={rastro}
        anel={anel}
        anelCentro={[0, ANEL_Y, 0]}
        anelRaio={ANEL_RAIO}
        anelInclinacao={0.74}
        pulso={Math.min(1, pulso)}
      />

      {/* Sombra suave atrás do texto (leitura sobre o 3D) */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 60% 26% at 50% 60%, rgba(1,26,54,0.66) 0%, rgba(1,26,54,0.3) 60%, transparent 100%)",
          opacity: interpolate(f, [T.linha1 - 6, T.linha1 + 10], [0, 1], clamp),
        }}
      />

      {/* Logo grande no centro do anel */}
      <div
        style={{
          position: "absolute",
          left: (LARGURA - LARGURA_LOGO) / 2,
          top: Y.logo,
        }}
      >
        <LogoMarca
          inicio={L + T.logo}
          largura={LARGURA_LOGO}
          reflexos={[L + T.reflexo, L + T.capitao]}
          escalaInicial={1.45}
        />
      </div>

      {/* O plano entra no ar em 26/10 */}
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
        <Titulo linhas={[LINHA_1]} inicio={L + T.linha1} tamanho={124} alinhamento="center" />
        <div style={{ display: "flex", gap: 30, marginTop: -6 }}>
          <Titulo linhas={[LINHA_2]} inicio={L + T.linha2} tamanho={124} />
          <Titulo linhas={[`*${PLANO.periodo.inicio}*`]} inicio={L + T.data} tamanho={124} />
        </div>
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
        <LinhaNeon inicio={L + T.credito - 4} largura={180} espessura={6} />
      </div>

      {/* Crédito da agência */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: Y.credito,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Texto inicio={L + T.credito}>
          <span
            style={{
              fontFamily: FONTE_TITULO,
              fontSize: 48,
              letterSpacing: "0.12em",
              color: COR.branco,
              textTransform: "uppercase",
            }}
          >
            {PLANO.agencia}
          </span>
        </Texto>
        <Texto inicio={L + T.credito + 6}>
          <span
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "0.2em",
              color: COR.tintaClara,
              textTransform: "uppercase",
            }}
          >
            {PLANO.titulo} {ANO}
          </span>
        </Texto>
      </div>

      <VazamentoDeLuz inicio={L - 6} duracao={60} semente="fim" forca={0.7} />
      <VazamentoDeLuz inicio={L + T.capitao - 6} duracao={50} semente="capitao" forca={0.45} />

      {/* Impacto do corte e escurecimento final */}
      <Clarao
        opacidade={interpolate(f, [-6, 0, 18], [0.35, 0.7, 0], {
          ...clamp,
          easing: EASE.entrada,
        })}
        centroY={31}
      />
      <Grao opacidade={0.07} />
      <AbsoluteFill
        style={{ backgroundColor: "#000000", opacity: escuro, pointerEvents: "none" }}
      />

      <Audio
        name="SFX chegada da logo"
        src={staticFile("apresentacao/sfx-swoosh.wav")}
        from={L + T.logo - 2}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.2}
      />
    </AbsoluteFill>
  );
};
