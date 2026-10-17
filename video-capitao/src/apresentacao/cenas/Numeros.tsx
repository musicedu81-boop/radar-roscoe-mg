import { Audio } from "@remotion/media";
import { ArrowRight, Flag, Play, Target, Users } from "lucide-react";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NUMEROS, PLANO } from "../dados";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO, MARGEM } from "../marca";
import { inicioLocal, momentoDaPalavra } from "../roteiro";
import { Cartao3D, Contador, LinhaNeon, Titulo } from "../ui/Elementos";
import { Fundo } from "../ui/Fundo";
import { GlitchTexto } from "../ui/Glitch";
import { NumerosCartao } from "./NumerosCartao";

// Cena 02 · Ponto de partida. Quatro cartões de dados (inversão da marca) que entram em 3D
// quando a locutora fala de cada número, e o selo "O plano entra no ar em 26/10" no fim.
const INDICE = 1;

// f (a partir do corte) para o quadro local da sequência, que é o que os componentes de ui usam
const q = (f: number) => f + inicioLocal(INDICE);
const p = (palavra: string, ocorrencia = 0) =>
  momentoDaPalavra(INDICE, palavra, ocorrencia);

// Momentos da cena, em f, ligados à fala (a entrada começa 4 a 8 quadros antes da palavra)
const M = {
  titulo: 0,
  linha: 10,
  hoje: p("25.850") - 8,
  hojeConta: p("25.850") - 4,
  meta: p("meta") - 6,
  realista: p("realista") - 4,
  // A contagem começa com o cartão e desacelera até cair no número quando ele é falado
  metaConta: p("meta") - 2,
  metaPouso: p("27") + 6,
  metaDelta: p("27") + 22,
  desafio: p("desafio") - 6,
  desafioConta: p("desafio") - 2,
  desafioPouso: p("28") + 8,
  desafioNota: 315, // não é falado: entra no tempo musical seguinte
  views: p("mediana") - 6,
  viewsConta: p("mediana"),
  viewsPouso: p("3,6") + 6,
  viewsMeta: p("5") - 6,
  selo: 495, // depois da última frase, no tempo musical
};

// Grade vertical (px). Conteúdo entre y 230 e 1450; a faixa da legenda (1480+) fica livre.
const X = MARGEM;
const LARGURA_UTIL = 920;
const METADE = (LARGURA_UTIL - 24) / 2;
const Y = {
  titulo: 236,
  linha: 372,
  hoje: 404,
  linha2: 728,
  views: 1042,
  selo: 1358,
};
const ALTURA = { hoje: 300, linha2: 290, views: 290 };

// Textos derivados de dados.ts (nada redigitado)
const [NOTA_META, DELTA_META] = NUMEROS.meta.nota.split(", ");
const ROTULO_VIEWS = NUMEROS.viewsPorReel.legenda.replace(/\s*\(mil\)/, "");
const [ESTREIA_ANTES] = PLANO.estreia.split(PLANO.periodo.inicio);

// Foco: o cartão narrado fica pleno; quando a fala passa para o próximo, ele recua um pouco.
// No selo final, todos voltam ao pleno para o quadro de resumo.
const foco = (f: number, proximo: number) =>
  interpolate(f, [proximo, proximo + 12, M.selo - 8, M.selo + 8], [1, 0, 0, 1], {
    ...clamp,
    easing: EASE.suave,
  });

// Marca-texto animado (fundo que se desenha da esquerda para a direita)
const MarcaTexto: React.FC<{
  inicio: number;
  cor: string;
  children: React.ReactNode;
}> = ({ inicio, cor, children }) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${cor}, ${cor})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 88%",
        backgroundSize: `${interpolate(frame - inicio, [0, 12], [0, 100], { ...clamp, easing: EASE.entrada })}% 42%`,
        padding: "0 4px",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
};

// Número em Anton com a unidade menor ao lado ("27 MIL")
const NumeroMil: React.FC<{
  valor: number;
  inicio: number;
  casas?: number;
  tamanho: number;
  cor?: string;
  duracao?: number;
}> = ({ valor, inicio, casas = 0, tamanho, cor = COR.noite, duracao = 26 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: tamanho * 0.08,
        fontFamily: FONTE_TITULO,
        color: cor,
        lineHeight: 1,
        opacity: interpolate(frame - inicio, [0, 4], [0, 1], clamp),
      }}
    >
      <Contador
        valor={valor}
        inicio={inicio}
        duracao={duracao}
        casas={casas}
        style={{ fontSize: tamanho }}
      />
      <span style={{ fontSize: tamanho * 0.38, letterSpacing: "0.04em" }}>
        MIL
      </span>
    </div>
  );
};

// Selo final: "O plano entra no ar em 26/10", com o ponto de "no ar" pulsando
const SeloNoAr: React.FC<{ inicio: number }> = ({ inicio }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - inicio;
  if (t < 0) {
    return null;
  }
  const s = spring({
    frame: t,
    fps,
    config: { damping: 13, stiffness: 170, mass: 0.8 },
  });
  const pulso = 0.5 + 0.5 * Math.cos((t / 30) * Math.PI * 2);
  return (
    <div
      style={{
        position: "absolute",
        left: X,
        width: LARGURA_UTIL,
        top: Y.selo,
        height: 88,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          height: 88,
          padding: "0 42px 0 32px",
          borderRadius: 999,
          background: COR.noite,
          border: `3px solid ${COR.neon}`,
          boxShadow: `0 0 ${18 + 16 * pulso}px rgba(1,237,67,0.45), 0 20px 40px rgba(1,10,25,0.5)`,
          scale: interpolate(s, [0, 1], [1.35, 1]),
          opacity: interpolate(t, [0, 5], [0, 1], clamp),
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            background: COR.neon,
            boxShadow: `0 0 ${8 + 14 * pulso}px ${COR.neon}`,
            opacity: 0.55 + 0.45 * pulso,
          }}
        />
        <GlitchTexto inicio={inicio} duracao={12}>
          <span
            style={{
              fontFamily: FONTE_TITULO,
              fontSize: 52,
              letterSpacing: "0.04em",
              color: COR.branco,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {ESTREIA_ANTES}
            <span style={{ color: COR.amarelo }}>{PLANO.periodo.inicio}</span>
          </span>
        </GlitchTexto>
      </div>
    </div>
  );
};

export const CenaNumeros: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - inicioLocal(INDICE);

  // Barra de views por Reel: 0 a 5 mil; a parte de hoje (3,6) e a parte da proposta
  const fracaoHoje = NUMEROS.viewsPorReel.valor / NUMEROS.viewsPorReel.proposta;
  const barraHoje =
    fracaoHoje *
    interpolate(f, [M.viewsConta, M.viewsPouso], [0, 1], {
      ...clamp,
      easing: EASE.entrada,
    });
  const setaViews = interpolate(f, [M.viewsMeta, M.viewsMeta + 14], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const barraProposta =
    (1 - fracaoHoje) *
    interpolate(f, [M.viewsMeta, M.viewsMeta + 24], [0, 1], {
      ...clamp,
      easing: EASE.entrada,
    });

  return (
    <AbsoluteFill>
      <Fundo />

      {/* Título */}
      <Titulo
        linhas={["Ponto de *partida*"]}
        inicio={q(M.titulo)}
        tamanho={112}
        style={{ position: "absolute", left: X, top: Y.titulo }}
      />
      <div style={{ position: "absolute", left: X, top: Y.linha }}>
        <LinhaNeon inicio={q(M.linha)} largura={220} />
      </div>

      {/* 1 · Seguidores hoje (cartão herói) */}
      <Cartao3D
        inicio={q(M.hoje)}
        de="baixo"
        style={{
          position: "absolute",
          left: X,
          top: Y.hoje,
          width: LARGURA_UTIL,
          height: ALTURA.hoje,
        }}
      >
        <NumerosCartao
          rotulo={NUMEROS.seguidoresHoje.legenda}
          Icone={Users}
          foco={foco(f, M.meta)}
        >
          <Users
            size={230}
            strokeWidth={1.4}
            color={COR.noite}
            style={{
              position: "absolute",
              right: 20,
              top: -4,
              opacity: 0.07,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 30,
              top: 14,
              fontFamily: FONTE_TITULO,
              fontSize: 196,
              lineHeight: 1,
              color: COR.noite,
            }}
          >
            <Contador
              valor={NUMEROS.seguidoresHoje.valor}
              inicio={q(M.hojeConta)}
              duracao={34}
            />
          </div>
          <div
            style={{
              position: "absolute",
              right: 30,
              bottom: 24,
              textAlign: "right",
              fontFamily: FONTE_TEXTO,
              fontWeight: 600,
              fontSize: 26,
              lineHeight: 1.3,
              color: "rgba(2,53,100,0.62)",
              opacity: interpolate(f, [M.hojeConta + 24, M.hojeConta + 36], [0, 1], clamp),
            }}
          >
            Fonte:
            <br />
            {NUMEROS.seguidoresHoje.fonte}
          </div>
        </NumerosCartao>
      </Cartao3D>

      {/* 2 · Meta 31/12 */}
      <Cartao3D
        inicio={q(M.meta)}
        de="esquerda"
        style={{
          position: "absolute",
          left: X,
          top: Y.linha2,
          width: METADE,
          height: ALTURA.linha2,
        }}
      >
        <NumerosCartao
          rotulo={NUMEROS.meta.legenda}
          Icone={Target}
          foco={foco(f, M.desafio)}
        >
          <div style={{ position: "absolute", left: 30, top: 20 }}>
            <NumeroMil
              valor={NUMEROS.meta.valor / 1000}
              inicio={q(M.metaConta)}
              duracao={M.metaPouso - M.metaConta}
              tamanho={140}
            />
          </div>
          <div
            style={{
              position: "absolute",
              right: 26,
              top: 30,
              fontFamily: FONTE_TITULO,
              fontSize: 40,
              lineHeight: 1,
              padding: "8px 14px",
              borderRadius: 8,
              background: COR.neon,
              color: COR.noite,
              opacity: interpolate(f, [M.metaDelta, M.metaDelta + 6], [0, 1], clamp),
              translate: `0px ${interpolate(f, [M.metaDelta, M.metaDelta + 12], [16, 0], { ...clamp, easing: EASE.entrada })}px`,
            }}
          >
            {DELTA_META}
          </div>
          <div
            style={{
              position: "absolute",
              left: 30,
              bottom: 24,
              fontFamily: FONTE_TEXTO,
              fontWeight: 700,
              fontSize: 30,
              color: COR.noite,
              opacity: interpolate(f, [M.realista, M.realista + 6], [0, 1], clamp),
            }}
          >
            <MarcaTexto inicio={q(M.realista)} cor="rgba(1,237,67,0.55)">
              {NOTA_META}
            </MarcaTexto>
          </div>
        </NumerosCartao>
      </Cartao3D>

      {/* 3 · Desafio 31/12 */}
      <Cartao3D
        inicio={q(M.desafio)}
        de="direita"
        style={{
          position: "absolute",
          left: X + METADE + 24,
          top: Y.linha2,
          width: METADE,
          height: ALTURA.linha2,
        }}
      >
        <NumerosCartao
          rotulo={NUMEROS.desafio.legenda}
          Icone={Flag}
          foco={foco(f, M.views)}
        >
          <div style={{ position: "absolute", left: 30, top: 20 }}>
            <NumeroMil
              valor={NUMEROS.desafio.valor / 1000}
              inicio={q(M.desafioConta)}
              duracao={M.desafioPouso - M.desafioConta}
              tamanho={140}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 30,
              right: 20,
              bottom: 24,
              fontFamily: FONTE_TEXTO,
              fontWeight: 700,
              fontSize: 28,
              lineHeight: 1.25,
              color: COR.noite,
              opacity: interpolate(f, [M.desafioNota, M.desafioNota + 6], [0, 1], clamp),
            }}
          >
            <MarcaTexto inicio={q(M.desafioNota)} cor="rgba(255,205,14,0.75)">
              {NUMEROS.desafio.nota}
            </MarcaTexto>
          </div>
        </NumerosCartao>
      </Cartao3D>

      {/* 4 · Views por Reel: de 3,6 mil para 5 mil */}
      <Cartao3D
        inicio={q(M.views)}
        de="baixo"
        style={{
          position: "absolute",
          left: X,
          top: Y.views,
          width: LARGURA_UTIL,
          height: ALTURA.views,
        }}
      >
        <NumerosCartao
          rotulo={ROTULO_VIEWS}
          Icone={Play}
          direita={
            <span style={{ fontSize: 26, fontWeight: 700, opacity: 0.9 }}>
              {NUMEROS.viewsPorReel.nota}
            </span>
          }
        >
          {/* Hoje à esquerda, proposta alinhada ao fim da barra, seta que se desenha entre eles */}
          <div style={{ position: "absolute", left: 30, top: 10 }}>
            <NumeroMil
              valor={NUMEROS.viewsPorReel.valor}
              casas={1}
              inicio={q(M.viewsConta)}
              duracao={M.viewsPouso - M.viewsConta}
              tamanho={116}
            />
          </div>
          <div style={{ position: "absolute", right: 30, top: 10 }}>
            <NumeroMil
              valor={NUMEROS.viewsPorReel.proposta}
              inicio={q(M.viewsMeta + 4)}
              tamanho={116}
              cor={COR.verde}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 300,
              top: 58,
              width: 380 * setaViews,
              height: 6,
              borderRadius: 3,
              background: COR.verde,
            }}
          />
          <ArrowRight
            size={64}
            strokeWidth={3}
            color={COR.verde}
            style={{
              position: "absolute",
              left: 300 + 380 * setaViews - 40,
              top: 29,
              opacity: setaViews > 0.05 ? 1 : 0,
            }}
          />
          {/* Barra de 0 a 5 mil: hoje em azul-noite, proposta em verde listrado */}
          <div
            style={{
              position: "absolute",
              left: 30,
              right: 30,
              top: 146,
              height: 22,
              borderRadius: 999,
              background: "rgba(2,53,100,0.12)",
              overflow: "hidden",
              opacity: interpolate(f, [M.viewsConta - 6, M.viewsConta], [0, 1], clamp),
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${barraHoje * 100}%`,
                background: COR.noite,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${fracaoHoje * 100}%`,
                top: 0,
                bottom: 0,
                width: `${barraProposta * 100}%`,
                backgroundColor: COR.verde,
                backgroundImage:
                  "repeating-linear-gradient(-45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 8px, transparent 8px, transparent 16px)",
              }}
            />
          </div>
          {/* Rótulos sob a barra, no ponto de cada valor */}
          <div
            style={{
              position: "absolute",
              left: 30,
              right: 30,
              top: 176,
              height: 32,
              fontFamily: FONTE_TEXTO,
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                position: "absolute",
                right: `${(1 - fracaoHoje) * 100}%`,
                color: "rgba(2,53,100,0.6)",
                opacity: interpolate(f, [M.viewsPouso - 8, M.viewsPouso], [0, 1], clamp),
              }}
            >
              Hoje
            </span>
            <span
              style={{
                position: "absolute",
                right: 0,
                color: COR.verde,
                opacity: interpolate(f, [M.viewsMeta + 14, M.viewsMeta + 22], [0, 1], clamp),
              }}
            >
              Proposta
            </span>
          </div>
        </NumerosCartao>
      </Cartao3D>

      {/* Selo final */}
      <SeloNoAr inicio={q(M.selo)} />

      {/* Efeitos discretos (no máximo 3): giro 3D dos cartões e o selo */}
      <Audio
        name="SFX swoosh · cartão seguidores"
        src={staticFile("apresentacao/sfx-swoosh.wav")}
        from={q(M.hoje)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.22}
      />
      <Audio
        name="SFX swoosh · cartão views"
        src={staticFile("apresentacao/sfx-swoosh.wav")}
        from={q(M.views)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.2}
      />
      <Audio
        name="SFX tick · selo"
        src={staticFile("apresentacao/sfx-tick.wav")}
        from={q(M.selo)}
        durationInFrames={fps}
        premountFor={fps}
        volume={0.2}
      />
    </AbsoluteFill>
  );
};
