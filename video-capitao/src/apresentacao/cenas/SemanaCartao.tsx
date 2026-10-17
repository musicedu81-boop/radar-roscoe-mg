import {
  Clapperboard,
  Coffee,
  type LucideIcon,
  MessageSquareHeart,
  Mic,
  Radar,
  RotateCcw,
  Send,
  Stethoscope,
} from "lucide-react";
import React from "react";
import { interpolate } from "remotion";
import { SEMANA } from "../dados";
import {
  clamp,
  COR,
  EASE,
  FONTE_TEXTO,
  FONTE_TITULO,
  PILAR,
  type Pilar,
} from "../marca";

// Cartão de um dia da grade semanal, na inversão da marca: fundo branco, borda azul-noite de
// 3 px, bloco lateral na cor do pilar com a sigla grande e o ícone do quadro; à direita o dia,
// a etiqueta do pilar, o nome do quadro, a função e o formato. Os textos entram quando a
// locutora fala deles. `compacto` (0 a 1) transforma o cartão na linha da grade final.

// Ícone de cada quadro, na ordem de SEMANA (segunda a domingo)
const ICONES: LucideIcon[] = [
  Radar, // Radar do Capitão
  Stethoscope, // A Saúde Tem Nome
  Mic, // Prefeito Cast ou Prefeito no Bairro
  RotateCcw, // Vale a Pena Ver de Novo (TBT)
  MessageSquareHeart, // E o Povo Aprova!
  Coffee, // Lo-fi
  Send, // Radar Resumo (recirculação e broadcast)
];

// Cor do texto sobre a cor de cada pilar
export const TINTA: Record<Pilar, string> = {
  Utilidade: COR.branco,
  Orgulho: COR.noite,
  Cuidado: COR.noite,
};

// Medidas do cartão (px)
export const CARTAO = {
  largura: 920,
  altura: 430, // cartão cheio, no carrossel
  linha: 132, // linha da grade final
  bloco: 250, // bloco lateral do cartão cheio
  blocoLinha: 150, // bloco lateral da linha da grade
};

export type TemposDoCartao = {
  quadro: number; // f em que o nome do quadro entra (na fala)
  funcao: number; // f em que a função entra (na fala)
  formato: number; // f em que o formato entra (no tempo musical)
};

// Etiqueta do pilar (pílula na cor do pilar)
const EtiquetaPilar: React.FC<{ pilar: Pilar; style?: React.CSSProperties }> = ({
  pilar,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      height: 40,
      padding: "0 16px",
      borderRadius: 999,
      background: PILAR[pilar],
      color: TINTA[pilar],
      fontFamily: FONTE_TEXTO,
      fontWeight: 800,
      fontSize: 26,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      boxShadow: "inset 0 0 0 2px rgba(2,53,100,0.18)",
      ...style,
    }}
  >
    {pilar}
  </div>
);

const entrada = (f: number, inicio: number, duracao = 11) =>
  interpolate(f, [inicio, inicio + duracao], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });

export const SemanaCartao: React.FC<{
  k: number;
  f: number;
  tempos: TemposDoCartao;
  foco: number; // 1 = cartão da frente, 0 = recuado
  compacto: number; // 0 = cartão cheio, 1 = linha da grade
  brilho: number; // posição (0 a 1) do reflexo de luz que atravessa o cartão
}> = ({ k, f, tempos, foco, compacto, brilho }) => {
  const dia = SEMANA[k];
  const cor = PILAR[dia.pilar];
  const tinta = TINTA[dia.pilar];
  const Icone = ICONES[k];
  const bloco = interpolate(compacto, [0, 1], [CARTAO.bloco, CARTAO.blocoLinha]);
  const cheio = interpolate(compacto, [0, 0.45], [1, 0], clamp);
  const linha = interpolate(compacto, [0.4, 0.85], [0, 1], clamp);

  const tQuadro = entrada(f, tempos.quadro);
  const tFuncao = entrada(f, tempos.funcao, 12);
  const tFormato = entrada(f, tempos.formato, 12);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        boxSizing: "border-box",
        background: "linear-gradient(180deg, #FFFFFF 0%, #EEF4FB 100%)",
        border: `3px solid ${COR.noite}`,
        borderRadius: 18,
        overflow: "hidden",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Bloco do dia: cor do pilar, sigla grande e ícone do quadro */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: bloco,
          background: `linear-gradient(160deg, ${cor} 0%, ${cor} 62%, ${cor}D9 100%)`,
          borderRight: `3px solid ${COR.noite}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: interpolate(compacto, [0, 1], [10, 0]),
        }}
      >
        <div
          style={{
            fontFamily: FONTE_TITULO,
            fontSize: interpolate(compacto, [0, 1], [128, 60]),
            lineHeight: 1,
            color: tinta,
            letterSpacing: "0.01em",
          }}
        >
          {dia.sigla}
        </div>
        <div
          style={{
            height: interpolate(compacto, [0, 0.5], [64, 0], clamp),
            opacity: cheio,
            overflow: "hidden",
          }}
        >
          <Icone size={60} strokeWidth={2.2} color={tinta} />
        </div>
      </div>

      {/* Conteúdo do cartão cheio */}
      {cheio > 0 ? (
        <div
          style={{
            position: "absolute",
            left: CARTAO.bloco + 3,
            right: 0,
            top: "50%",
            height: CARTAO.altura - 6,
            translate: "0px -50%",
            padding: "26px 34px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 14,
            opacity: cheio,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: FONTE_TEXTO,
                fontWeight: 800,
                fontSize: 28,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: COR.fundo,
              }}
            >
              {dia.dia}
            </span>
            <EtiquetaPilar pilar={dia.pilar} />
          </div>
          {/* Nome do quadro: sobe por trás de uma máscara na fala */}
          <div style={{ overflow: "hidden", paddingTop: 12, marginTop: -12 }}>
            <div
              style={{
                fontFamily: FONTE_TITULO,
                fontSize: 60,
                lineHeight: 1.04,
                textTransform: "uppercase",
                color: COR.noite,
                translate: `0px ${(1 - tQuadro) * 110}%`,
                opacity: tQuadro > 0 ? 1 : 0,
              }}
            >
              {dia.quadro}
            </div>
          </div>
          <div
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 600,
              fontSize: 34,
              lineHeight: 1.25,
              color: "rgba(2,53,100,0.85)",
              opacity: tFuncao,
              translate: `0px ${(1 - tFuncao) * 18}px`,
            }}
          >
            {dia.funcao}
          </div>
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 18px 8px 14px",
                borderRadius: 10,
                background: "rgba(0,92,219,0.1)",
                border: "2px solid rgba(0,92,219,0.25)",
                fontFamily: FONTE_TEXTO,
                fontWeight: 700,
                fontSize: 30,
                lineHeight: 1.2,
                color: COR.noite,
                whiteSpace: "nowrap",
                clipPath: `inset(-4px ${(1 - tFormato) * 100}% -4px -4px round 10px)`,
              }}
            >
              <Clapperboard size={30} strokeWidth={2.4} color={COR.vivo} />
              {dia.formato}
            </div>
          </div>
        </div>
      ) : null}

      {/* Conteúdo da linha da grade final */}
      {linha > 0 ? (
        <div
          style={{
            position: "absolute",
            left: CARTAO.blocoLinha + 3,
            right: 0,
            top: "50%",
            height: CARTAO.linha - 6,
            padding: "0 26px 0 28px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            opacity: linha,
            translate: `${(1 - linha) * 30}px -50%`,
          }}
        >
          <div
            style={{
              fontFamily: FONTE_TITULO,
              fontSize: 46,
              lineHeight: 1,
              textTransform: "uppercase",
              color: COR.noite,
              whiteSpace: "nowrap",
            }}
          >
            {dia.quadro}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: FONTE_TEXTO,
                fontWeight: 600,
                fontSize: 27,
                color: "rgba(2,53,100,0.8)",
                whiteSpace: "nowrap",
              }}
            >
              {dia.formato}
            </span>
            <EtiquetaPilar
              pilar={dia.pilar}
              style={{ height: 36, padding: "0 14px" }}
            />
          </div>
        </div>
      ) : null}

      {/* Reflexo de luz que atravessa o cartão quando ele chega à frente */}
      {brilho > 0 && brilho < 1 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(115deg, transparent ${brilho * 160 - 45}%, rgba(255,255,255,0.55) ${brilho * 160 - 30}%, transparent ${brilho * 160 - 15}%)`,
          }}
        />
      ) : null}

      {/* Véu dos cartões recuados */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: COR.noite,
          opacity: (1 - foco) * 0.5,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// Verso do cartão (aparece quando ele passa por trás do cilindro)
export const SemanaVerso: React.FC<{ k: number }> = ({ k }) => {
  const dia = SEMANA[k];
  const cor = PILAR[dia.pilar];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        boxSizing: "border-box",
        borderRadius: 18,
        border: `3px solid ${COR.noite}`,
        background: `linear-gradient(180deg, ${COR.noite} 0%, ${COR.noiteProfunda} 100%)`,
        overflow: "hidden",
        transform: "rotateX(180deg)",
        backfaceVisibility: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 14,
          background: cor,
        }}
      />
    </div>
  );
};
