import { Play } from "lucide-react";
import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { SEMANA } from "../dados";
import { clamp, COR, EASE, FONTE_TITULO, PILAR } from "../marca";

// Os sete quadros da semana na cena Estratégia central.
// Na fala "série" eles aparecem como uma fileira de molduras vazias que acendem em sequência.
// Na subida (último compasso) a fileira sobe ao centro, cada sigla (SEG...DOM) se monta letra
// por letra vindo do fundo, em ritmo de semicolcheias, e o conjunto avança para a câmera.

export const FILEIRA = {
  x: 80,
  y: 1150, // topo da fileira de molduras na fala "série"
  lado: 92,
  vao: 16,
};
const FAIXA = {
  y: 742, // topo da faixa de siglas montada (centro em 840)
  largura: 120,
  altura: 196,
  vao: 40 / 3,
};
// Intervalo (quadros) entre o início de uma sigla e o da seguinte: semicolcheias da subida
const PASSO_SIGLA = 3;
export const CENTRO_FAIXA = { x: 540, y: FAIXA.y + FAIXA.altura / 2 };

export type TemposSubida = {
  serie: number; // as molduras acendem
  sobe: number; // a fileira sobe ao centro (início do último compasso)
  monta: number; // a primeira sigla começa a se montar
  avanca: number; // o conjunto avança para a câmera
  fim: number; // corte
};

const TINTA: Record<string, string> = {
  Utilidade: COR.branco,
  Orgulho: COR.noite,
  Cuidado: COR.noite,
};

// Uma letra que voa do fundo (posição aleatória fixa, por semente) até o seu lugar na sigla
const Letra: React.FC<{
  letra: string;
  f: number;
  inicio: number;
  semente: string;
}> = ({ letra, f, inicio, semente }) => {
  const r = (k: string) => random(`${semente}-${k}`);
  const t = interpolate(f, [inicio, inicio + 13], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const dx = (r("x") - 0.5) * 900 * (1 - t);
  const dy = (r("y") - 0.5) * 1100 * (1 - t);
  const dz = -(900 + r("z") * 900) * (1 - t);
  const rx = (r("rx") - 0.5) * 140 * (1 - t);
  const ry = (r("ry") - 0.5) * 140 * (1 - t);
  return (
    <span
      style={{
        display: "inline-block",
        transform: `translate3d(${dx}px, ${dy}px, ${dz}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
        opacity: interpolate(f, [inicio, inicio + 4], [0, 1], clamp),
      }}
    >
      {letra}
    </span>
  );
};

// Uma das sete molduras: pequena, com o ícone de post, na fala "série"; na subida cresce,
// recebe a sigla que se monta letra por letra e, quando a sigla pousa, ganha a cor do pilar
const Moldura: React.FC<{ k: number; f: number; tempos: TemposSubida }> = ({
  k,
  f,
  tempos,
}) => {
  const dia = SEMANA[k];
  const cor = PILAR[dia.pilar];
  const acende = tempos.serie + 2.5 * k;
  const aparece = interpolate(f, [acende, acende + 8], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  if (aparece <= 0) {
    return null;
  }
  // Da fileira pequena (fala "série") para a faixa de siglas (subida)
  const m = interpolate(f, [tempos.sobe + k, tempos.sobe + k + 16], [0, 1], {
    ...clamp,
    easing: EASE.suave,
  });
  const x0 = FILEIRA.x + k * (FILEIRA.lado + FILEIRA.vao);
  const x1 = FILEIRA.x + k * (FAIXA.largura + FAIXA.vao);
  const largura = interpolate(m, [0, 1], [FILEIRA.lado, FAIXA.largura]);
  const altura = interpolate(m, [0, 1], [FILEIRA.lado, FAIXA.altura]);
  const x = interpolate(m, [0, 1], [x0, x1]);
  const y = interpolate(m, [0, 1], [FILEIRA.y, FAIXA.y]);

  // Clarão neon quando a moldura acende; clarão branco e cor do pilar quando a sigla pousa
  const inicioSigla = tempos.monta + PASSO_SIGLA * k;
  const pousa = inicioSigla + 13;
  const flashSerie = interpolate(f, [acende, acende + 3, acende + 14], [0, 1, 0], clamp);
  const flashPouso = interpolate(f, [pousa - 2, pousa, pousa + 10], [0, 1, 0], clamp);
  const solido = interpolate(f, [pousa - 1, pousa + 5], [0, 1], clamp);
  const letras = Array.from(dia.sigla);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: largura,
        height: altura,
        transformStyle: "preserve-3d",
        scale: interpolate(aparece, [0, 1], [0.55, 1]),
        opacity: aparece,
      }}
    >
      {/* Corpo da moldura: vidro escuro com contorno neon, depois sólido na cor do pilar */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxSizing: "border-box",
          borderRadius: 12,
          border: `3px solid ${solido > 0.5 ? "rgba(255,255,255,0.85)" : `rgba(1,237,67,${0.8 - 0.3 * m})`}`,
          background: `rgba(1,26,54,${0.4 + 0.45 * m})`,
          boxShadow: `0 0 ${10 + 30 * flashSerie + 26 * flashPouso}px rgba(1,237,67,${0.25 + 0.6 * flashSerie}), 0 18px 40px rgba(1,10,25,${0.5 * m})`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 40%), ${cor}`,
            opacity: solido,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: COR.neon,
            opacity: 0.85 * flashSerie,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: COR.branco,
            opacity: 0.9 * flashPouso,
          }}
        />
        {/* Ícone de post na fileira da fala "série" */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: 1 - interpolate(m, [0, 0.4], [0, 1], clamp),
          }}
        >
          <Play size={36} strokeWidth={2.6} color={COR.neon} fill="rgba(1,237,67,0.25)" />
        </div>
      </div>
      {/* Sigla que se monta letra por letra */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONTE_TITULO,
          fontSize: 58,
          lineHeight: 1,
          color: solido > 0.5 ? TINTA[dia.pilar] : COR.branco,
          transformStyle: "preserve-3d",
        }}
      >
        {letras.map((letra, j) => (
          <Letra
            key={j}
            letra={letra}
            f={f}
            inicio={inicioSigla + j}
            semente={`sigla-${k}-${j}`}
          />
        ))}
      </div>
    </div>
  );
};

// Reflexo de cada sigla pousada num piso brilhante, abaixo da faixa
const Reflexo: React.FC<{ k: number; f: number; tempos: TemposSubida }> = ({
  k,
  f,
  tempos,
}) => {
  const pousa = tempos.monta + PASSO_SIGLA * k + 13;
  const t = interpolate(f, [pousa - 1, pousa + 8], [0, 1], clamp);
  if (t <= 0) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: FILEIRA.x + k * (FAIXA.largura + FAIXA.vao),
        top: FAIXA.y + FAIXA.altura + 14,
        width: FAIXA.largura,
        height: FAIXA.altura * 0.6,
        borderRadius: 12,
        background: `linear-gradient(180deg, ${PILAR[SEMANA[k].pilar]} 0%, rgba(1,26,54,0) 100%)`,
        opacity: 0.26 * t,
      }}
    />
  );
};

// Linha de horizonte neon que corta a tela atrás da faixa quando a subida começa
const Horizonte: React.FC<{ f: number; tempos: TemposSubida }> = ({ f, tempos }) => {
  const t = interpolate(f, [tempos.sobe + 4, tempos.sobe + 20], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  if (t <= 0) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: CENTRO_FAIXA.x - 700 * t,
        width: 1400 * t,
        top: CENTRO_FAIXA.y - 2,
        height: 4,
        background: `linear-gradient(90deg, rgba(1,237,67,0) 0%, ${COR.neon} 30%, ${COR.neon} 70%, rgba(1,237,67,0) 100%)`,
        boxShadow: `0 0 22px ${COR.neon}`,
        opacity: 0.8,
      }}
    />
  );
};

// A fileira / faixa com as sete molduras
export const EstrategiaSemana: React.FC<{ f: number; tempos: TemposSubida }> = ({
  f,
  tempos,
}) => (
  <>
    <Horizonte f={f} tempos={tempos} />
    {SEMANA.map((dia, k) => (
      <Reflexo key={`r-${dia.sigla}`} k={k} f={f} tempos={tempos} />
    ))}
    {SEMANA.map((dia, k) => (
      <Moldura key={dia.sigla} k={k} f={f} tempos={tempos} />
    ))}
  </>
);

// Linhas de velocidade que irradiam do centro quando o conjunto avança para a câmera
export const LinhasDeVelocidade: React.FC<{ f: number; tempos: TemposSubida }> = ({
  f,
  tempos,
}) => {
  const forca = interpolate(f, [tempos.avanca - 8, tempos.fim - 4], [0, 1], {
    ...clamp,
    easing: EASE.saida,
  });
  if (forca <= 0) {
    return null;
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 34 }, (_, i) => {
        const r = (k: string) => random(`linha-${i}-${k}`);
        const angulo = (i / 34) * 360 + (r("a") - 0.5) * 8;
        const velocidade = 18 + r("v") * 26;
        const raio =
          140 + ((r("o") * 900 + (f - tempos.avanca + 8) * velocidade * (0.4 + forca)) % 900);
        const comprimento = 60 + 260 * forca * (0.5 + r("c"));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: CENTRO_FAIXA.x,
              top: CENTRO_FAIXA.y,
              width: comprimento,
              height: 2 + 2 * r("e"),
              transformOrigin: "0% 50%",
              transform: `rotate(${angulo}deg) translateX(${raio}px)`,
              background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${i % 3 === 0 ? COR.neon : COR.branco} 100%)`,
              opacity: forca * (0.35 + 0.5 * r("op")),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
