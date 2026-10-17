import { TriangleAlert } from "lucide-react";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CRISE } from "../dados";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO, MARGEM } from "../marca";
import { inicioLocal, momentoDaPalavra } from "../roteiro";
import { Cartao3D, LinhaNeon, Titulo } from "../ui/Elementos";
import { Fundo } from "../ui/Fundo";
import { GlitchTexto } from "../ui/Glitch";

// Cena 11 · Contingência. O gatilho de 17/09 em alerta coral, a linha do tempo de quatro
// passos revelada na fala e, na última frase, a regra de ouro no centro. No compasso final
// (subida da trilha) tudo converge para o centro antes do corte para o encerramento.
const INDICE = 10;

const q = (f: number) => f + inicioLocal(INDICE);
const p = (palavra: string, ocorrencia = 0) =>
  momentoDaPalavra(INDICE, palavra, ocorrencia);

const M = {
  titulo: 0,
  linha: 10,
  gatilho: p("crise") - 8,
  espinha: p("protocolo") - 4,
  passos: [
    p("comunicado") - 6,
    p("utilidade") - 6,
    p("atualização") - 6,
    p("72") - 6,
  ],
  unicaFonte: p("única") - 2,
  duasHoras: p("2"),
  regra: p("regra") - 6,
  regraLinha1: p("nunca") - 6,
  regraLinha2: p("ajustar") - 6,
  converge: 480,
};

// Grade vertical (px)
const Y = {
  titulo: 236,
  linha: 372,
  gatilho: 404,
  passos: [660, 840, 1020, 1200],
};
const NO = 40; // diâmetro do nó da linha do tempo
const ESPINHA_X = MARGEM + NO / 2;
const CONTEUDO_X = MARGEM + 80;
const CENTRO_TAG = 25; // centro vertical da etiqueta de tempo, a partir do topo do passo
const CENTRO_TELA = "540px 840px";

// Trecho de cada passo que ganha destaque amarelo (é texto de dados.ts)
const DESTAQUES = [
  "uma única fonte oficial",
  "Utilidade primeiro",
  "Atualização mesmo sem novidade",
  "Retomar os quadros",
];

const [REGRA_1, REGRA_2] = CRISE.regraDeOuro.split(", ");
const PALAVRAS_REGRA_2 = REGRA_2.split(" ");
const CHAVE_REGRA = PALAVRAS_REGRA_2.slice(-1)[0];
const INICIO_REGRA_2 = PALAVRAS_REGRA_2.slice(0, -1).join(" ");

// Texto com um trecho destacado (cor que acende em `acende`)
const ComDestaque: React.FC<{
  texto: string;
  trecho: string;
  acende: number; // 0 a 1
}> = ({ texto, trecho, acende }) => {
  const i = texto.indexOf(trecho);
  if (i < 0) {
    return <>{texto}</>;
  }
  return (
    <>
      {texto.slice(0, i)}
      <span
        style={{
          color: acende > 0.5 ? COR.amarelo : "inherit",
          fontWeight: 800,
        }}
      >
        {trecho}
      </span>
      {texto.slice(i + trecho.length)}
    </>
  );
};

// Gatilho: data e números em destaque dentro da frase de dados.ts
const Gatilho: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const abre = interpolate(f, [0, 16], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const icone = spring({
    frame: f - 6,
    fps,
    config: { damping: 11, stiffness: 160, mass: 0.7 },
  });
  const alerta = 0.55 + 0.45 * Math.abs(Math.sin((f / 30) * Math.PI));
  const partes = CRISE.gatilho.split(
    /(\d{2}\/\d{2}|\d+ mil views|\d+ seguidores novos)/,
  );
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        gap: 24,
        alignItems: "center",
        boxSizing: "border-box",
        width: 920,
        padding: "22px 30px 22px 26px",
        background: "rgba(224,90,58,0.13)",
        border: "2px solid rgba(224,90,58,0.5)",
        borderLeft: `10px solid ${COR.coral}`,
        borderRadius: 14,
        clipPath: `inset(0 ${(1 - abre) * 100}% 0 0 round 14px)`,
        translate: `${(1 - abre) * -30}px 0px`,
        boxShadow: `0 0 ${30 * alerta}px rgba(224,90,58,${0.25 * alerta})`,
      }}
    >
      <div style={{ scale: icone, flexShrink: 0 }}>
        <TriangleAlert size={56} strokeWidth={2.4} color={COR.coral} />
      </div>
      <div
        style={{
          fontFamily: FONTE_TEXTO,
          fontWeight: 600,
          fontSize: 32,
          lineHeight: 1.32,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        {partes.map((t, i) =>
          i % 2 === 1 ? (
            <span key={i} style={{ color: COR.amarelo, fontWeight: 800 }}>
              {t}
            </span>
          ) : (
            <span key={i}>{t}</span>
          ),
        )}
      </div>
    </div>
  );
};

// Etiqueta de tempo do passo (coral, inclinada como as etiquetas da marca)
const TagTempo: React.FC<{ f: number; pulso: number; children: string }> = ({
  f,
  pulso,
  children,
}) => {
  const abre = interpolate(f, [0, 10], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  return (
    <div
      style={{
        display: "inline-block",
        background: COR.coral,
        color: COR.branco,
        fontFamily: FONTE_TITULO,
        fontSize: 36,
        lineHeight: 1.2,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        padding: "2px 20px",
        transform: "skewX(-8deg)",
        clipPath: `inset(0 ${(1 - abre) * 100}% 0 0)`,
        scale: 1 + 0.08 * pulso,
        transformOrigin: "0% 50%",
        boxShadow: `0 0 ${24 * pulso}px ${COR.coral}`,
      }}
    >
      <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>
        {children}
      </span>
    </div>
  );
};

const Passo: React.FC<{
  k: number;
  f: number; // quadros desde a entrada do passo
  foco: number;
  pulso: number;
  acende: number;
}> = ({ k, f, foco, pulso, acende }) => {
  const passo = CRISE.passos[k];
  const texto = interpolate(f, [4, 18], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: CONTEUDO_X,
        top: Y.passos[k],
        width: 1000 - CONTEUDO_X,
        opacity: f < 0 ? 0 : 0.5 + 0.5 * foco,
      }}
    >
      <TagTempo f={f} pulso={pulso}>
        {passo.quando}
      </TagTempo>
      <div
        style={{
          marginTop: 12,
          fontFamily: FONTE_TEXTO,
          fontWeight: 600,
          fontSize: 32,
          lineHeight: 1.3,
          color: "rgba(255,255,255,0.92)",
          opacity: texto,
          translate: `${(1 - texto) * 30}px 0px`,
        }}
      >
        <ComDestaque texto={passo.acao} trecho={DESTAQUES[k]} acende={acende} />
      </div>
    </div>
  );
};

// Nó da linha do tempo: anel vazio que acende em coral quando o passo entra
const No: React.FC<{ k: number; aparece: number; f: number }> = ({
  k,
  aparece,
  f,
}) => {
  const { fps } = useVideoConfig();
  const acende = spring({
    frame: f,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.6 },
  });
  const onda = interpolate(f, [0, 22], [0, 1], clamp);
  const cy = Y.passos[k] + CENTRO_TAG;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: ESPINHA_X - NO / 2,
          top: cy - NO / 2,
          width: NO,
          height: NO,
          borderRadius: "50%",
          border: `3px solid ${COR.coral}`,
          scale: 1 + 1.4 * onda,
          opacity: f >= 0 ? (1 - onda) * 0.8 : 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: ESPINHA_X - NO / 2,
          top: cy - NO / 2,
          width: NO,
          height: NO,
          boxSizing: "border-box",
          borderRadius: "50%",
          border: `4px solid ${COR.coral}`,
          background: f >= 0 ? COR.coral : COR.noiteProfunda,
          boxShadow: f >= 0 ? `0 0 22px ${COR.coral}` : "none",
          opacity: aparece,
          scale: 0.7 + 0.3 * aparece + (f >= 0 ? 0.12 * (1 - acende) : 0),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: COR.branco,
            scale: f >= 0 ? acende : 0,
          }}
        />
      </div>
    </>
  );
};

export const CenaCrise: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - inicioLocal(INDICE);

  const y0 = Y.passos[0] + CENTRO_TAG;
  const y3 = Y.passos[3] + CENTRO_TAG;
  const espinha = interpolate(f, [M.espinha, M.espinha + 40], [y0, y3], {
    ...clamp,
    easing: EASE.suave,
  });
  // Parte acesa da espinha: vai até o último passo que já entrou
  const centros = Y.passos.map((y) => y + CENTRO_TAG);
  const alcance = interpolate(
    f,
    M.passos.flatMap((m) => [m, m + 12]),
    [y0, y0, y0, centros[1], centros[1], centros[2], centros[2], centros[3]],
    { ...clamp, easing: EASE.suave },
  );
  const focoDoPasso = (k: number) => {
    const proximo = M.passos[k + 1];
    return proximo === undefined
      ? 1
      : interpolate(f, [proximo, proximo + 12], [1, 0], clamp);
  };

  // Regra de ouro: o resto recua; no último compasso tudo converge para o centro
  const recua = interpolate(f, [M.regra - 4, M.regra + 12], [1, 0], {
    ...clamp,
    easing: EASE.suave,
  });
  const converge = interpolate(f, [M.converge, M.converge + 56], [0, 1], {
    ...clamp,
    easing: EASE.saida,
  });
  const linha1 = interpolate(f, [M.regraLinha1, M.regraLinha1 + 14], [1, 0], {
    ...clamp,
    easing: EASE.entrada,
  });
  const linha2 = interpolate(f, [M.regraLinha2, M.regraLinha2 + 14], [1, 0], {
    ...clamp,
    easing: EASE.entrada,
  });

  return (
    <AbsoluteFill>
      <Fundo variante="noite" />

      {/* Tudo o que não é a regra de ouro: recua na regra e converge no fim */}
      <AbsoluteFill
        style={{
          transformOrigin: CENTRO_TELA,
          scale: 1 - 0.32 * converge,
          opacity: 1 - converge,
        }}
      >
        <div style={{ opacity: 0.55 + 0.45 * recua }}>
          <div style={{ position: "absolute", left: MARGEM, top: Y.titulo }}>
            <Titulo
              linhas={["Protocolo de *crise*"]}
              inicio={q(M.titulo)}
              tamanho={104}
              corChave={COR.coral}
            />
          </div>
          <div style={{ position: "absolute", left: MARGEM, top: Y.linha }}>
            <LinhaNeon inicio={q(M.linha)} largura={200} cor={COR.coral} />
          </div>
        </div>

        <div style={{ opacity: 0.18 + 0.82 * recua }}>
          <div
            style={{
              position: "absolute",
              left: MARGEM,
              top: Y.gatilho,
              opacity: f < M.gatilho ? 0 : 1,
            }}
          >
            <Gatilho f={f - M.gatilho} />
          </div>

          {/* Espinha da linha do tempo */}
          <div
            style={{
              position: "absolute",
              left: ESPINHA_X - 2,
              top: y0,
              width: 4,
              height: Math.max(0, espinha - y0),
              background: "rgba(224,90,58,0.35)",
              borderRadius: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: ESPINHA_X - 3,
              top: y0,
              width: 6,
              height: Math.max(0, alcance - y0),
              background: COR.coral,
              borderRadius: 3,
              boxShadow: `0 0 16px ${COR.coral}`,
            }}
          />
          {Y.passos.map((_, k) => (
            <No
              key={k}
              k={k}
              f={f - M.passos[k]}
              aparece={
                interpolate(
                  espinha,
                  [centros[k] - 30, centros[k]],
                  [0, 1],
                  clamp,
                ) * interpolate(f, [M.espinha, M.espinha + 8], [0, 1], clamp)
              }
            />
          ))}
          {Y.passos.map((_, k) => (
            <Passo
              key={k}
              k={k}
              f={f - M.passos[k]}
              foco={focoDoPasso(k)}
              pulso={
                k === 0
                  ? interpolate(
                      f,
                      [M.duasHoras - 4, M.duasHoras + 4, M.duasHoras + 18],
                      [0, 1, 0],
                      clamp,
                    )
                  : 0
              }
              acende={
                k === 0
                  ? interpolate(
                      f,
                      [M.unicaFonte, M.unicaFonte + 1],
                      [0, 1],
                      clamp,
                    )
                  : interpolate(
                      f,
                      [M.passos[k] + 10, M.passos[k] + 11],
                      [0, 1],
                      clamp,
                    )
              }
            />
          ))}
        </div>
      </AbsoluteFill>

      {/* Regra de ouro, no centro */}
      <Cartao3D
        inicio={q(M.regra)}
        style={{
          position: "absolute",
          left: MARGEM,
          top: 700,
          width: 920,
          borderRadius: 20,
        }}
      >
        <div
          style={{
            boxSizing: "border-box",
            width: 920,
            padding: "40px 44px 44px",
            background: `linear-gradient(160deg, ${COR.noite} 0%, ${COR.noiteProfunda} 100%)`,
            border: `3px solid ${COR.amarelo}`,
            borderRadius: 20,
            boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 ${60 + 50 * converge}px rgba(255,205,14,${0.18 + 0.25 * converge})`,
            scale: 1 + 0.08 * converge,
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: COR.amarelo,
              color: COR.noite,
              fontFamily: FONTE_TITULO,
              fontSize: 38,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "2px 22px",
              transform: "skewX(-8deg)",
            }}
          >
            <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>
              Regra de ouro
            </span>
          </div>
          {[
            { conteudo: <>{REGRA_1},</>, sobe: linha1 },
            {
              conteudo: (
                <>
                  {INICIO_REGRA_2}{" "}
                  <GlitchTexto inicio={q(M.regraLinha2) + 10}>
                    <em
                      style={{
                        color: COR.amarelo,
                        fontStyle: "italic",
                        paddingRight: "0.06em",
                      }}
                    >
                      {CHAVE_REGRA}
                    </em>
                  </GlitchTexto>
                </>
              ),
              sobe: linha2,
            },
          ].map(({ conteudo, sobe }, i) => (
            <div
              key={i}
              style={{
                overflow: "hidden",
                paddingTop: 14,
                marginTop: i === 0 ? 18 : -14,
              }}
            >
              <div
                style={{
                  fontFamily: FONTE_TITULO,
                  fontSize: 72,
                  lineHeight: 1.08,
                  textTransform: "uppercase",
                  color: COR.branco,
                  translate: `0px ${sobe * 115}%`,
                  whiteSpace: "nowrap",
                }}
              >
                {conteudo}
              </div>
            </div>
          ))}
        </div>
      </Cartao3D>
    </AbsoluteFill>
  );
};
