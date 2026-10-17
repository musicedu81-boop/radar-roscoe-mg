import { ArrowRight, Zap } from "lucide-react";
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { RITMO } from "../dados";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO, formatarNumero } from "../marca";
import { Cartao3D, Contador, Etiqueta } from "../ui/Elementos";
import { NumerosCartao } from "./NumerosCartao";
import { PICO, qRitmo, T } from "./RitmoTempos";

// Cartão do anel de 76%: "76% do ganho veio num único pico, entre 14/09 e 05/10"
export const ANEL = { left: 80, top: 1172, largura: 920, altura: 268 };
const DIAMETRO = 172;
const RAIO = 74;
const TRACO = 20;
const CIRC = 2 * Math.PI * RAIO;

export const RitmoAnel: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - qRitmo(0);
  const enche = interpolate(f, [T.anel + 4, T.anel + 40], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const fracao = (RITMO.percentualNoPico / 100) * enche;
  const surge = (inicio: number) =>
    interpolate(f, [inicio, inicio + 12], [0, 1], {
      ...clamp,
      easing: EASE.entrada,
    });

  return (
    <Cartao3D
      inicio={qRitmo(T.anel)}
      de="baixo"
      style={{
        position: "absolute",
        left: ANEL.left,
        top: ANEL.top,
        width: ANEL.largura,
        height: ANEL.altura,
      }}
    >
      <NumerosCartao rotulo="De onde veio o ganho" Icone={Zap}>
        {/* Anel */}
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 12,
            width: DIAMETRO,
            height: DIAMETRO,
          }}
        >
          <svg
            width={DIAMETRO}
            height={DIAMETRO}
            viewBox={`0 0 ${DIAMETRO} ${DIAMETRO}`}
            style={{ rotate: "-90deg" }}
          >
            <circle
              cx={DIAMETRO / 2}
              cy={DIAMETRO / 2}
              r={RAIO}
              fill="none"
              stroke="rgba(2,53,100,0.12)"
              strokeWidth={TRACO}
            />
            <circle
              cx={DIAMETRO / 2}
              cy={DIAMETRO / 2}
              r={RAIO}
              fill="none"
              stroke={COR.vivo}
              strokeWidth={TRACO}
              strokeLinecap="butt"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - fracao)}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: FONTE_TITULO,
              fontSize: 46,
              color: COR.noite,
              lineHeight: 1,
            }}
          >
            <Contador
              valor={RITMO.percentualNoPico}
              inicio={qRitmo(T.anel + 4)}
              duracao={36}
              sufixo="%"
            />
          </div>
        </div>

        {/* Texto ao lado do anel */}
        <div
          style={{
            position: "absolute",
            left: 24 + DIAMETRO + 34,
            right: 24,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 800,
              fontSize: 36,
              lineHeight: 1.18,
              color: COR.noite,
              opacity: surge(T.anelTexto),
              translate: `0px ${(1 - surge(T.anelTexto)) * 18}px`,
            }}
          >
            do ganho veio num{" "}
            <span style={{ color: COR.vivo }}>único pico</span>
          </div>
          <Etiqueta cor="verde" tamanho={36} inicio={qRitmo(T.pico)}>
            {PICO.inicio}
            <ArrowRight
              size={30}
              strokeWidth={3.2}
              style={{ verticalAlign: "-3px", margin: "0 10px" }}
            />
            {PICO.fim}
          </Etiqueta>
          <div
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 600,
              fontSize: 26,
              color: "rgba(2,53,100,0.65)",
              opacity: surge(T.picoTotal),
            }}
          >
            {formatarNumero(RITMO.ganhoNoPico)} de{" "}
            {formatarNumero(RITMO.ganho11Semanas)} seguidores ganhos
          </div>
        </div>
      </NumerosCartao>
    </Cartao3D>
  );
};
