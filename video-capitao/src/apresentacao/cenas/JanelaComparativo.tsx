import { TrendingDown } from "lucide-react";
import React from "react";
import {
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO, formatarNumero } from "../marca";
import { Cartao3D, Contador } from "../ui/Elementos";
import { GlitchTexto } from "../ui/Glitch";
import { COMPARATIVO, GRADE, LARGURA_UTIL, qJanela, T } from "./JanelaTempos";

// Cartão de dados (inversão da marca) com o comparativo do fim de semana: a barra da sexta
// cresce e conta em "o alcance"; em "cai" uma cópia dela despenca para a linha do sábado e
// encolhe até 3.409, deixando o contorno tracejado do que se perdeu; em "metade" o marcador
// tracejado corta as duas barras no meio e o selo da queda em % aparece.

const BARRA_X = 30;
const BARRA_MAX = 600;
const BARRA_ALTURA = 64;
const LINHA = [
  { rotulo: 22, barra: 88 },
  { rotulo: 190, barra: 256 },
];
const X_METADE = BARRA_X + BARRA_MAX / 2;
const X_SABADO = BARRA_X + BARRA_MAX * COMPARATIVO.fracao;

const RotuloDia: React.FC<{ texto: string; top: number; cor: string }> = ({
  texto,
  top,
  cor,
}) => (
  <div
    style={{
      position: "absolute",
      left: BARRA_X,
      top,
      fontFamily: FONTE_TITULO,
      fontSize: 46,
      lineHeight: 1.1,
      letterSpacing: "0.03em",
      textTransform: "uppercase",
      color: cor,
    }}
  >
    {texto}
  </div>
);

// Valor na coluna da direita, centralizado na altura da barra
const Valor: React.FC<{ top: number; cor: string; children: React.ReactNode }> = ({
  top,
  cor,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      right: 30,
      top: top + BARRA_ALTURA / 2 - 46,
      height: 92,
      display: "flex",
      alignItems: "center",
      fontFamily: FONTE_TITULO,
      fontSize: 84,
      lineHeight: 1,
      color: cor,
    }}
  >
    {children}
  </div>
);

export const JanelaComparativo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - qJanela(0);

  // Sexta: cresce e conta na fala "o alcance"
  const cresceSexta = interpolate(f, [T.sexta, T.sexta + 26], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  // Brilho que corre pela barra da sexta (movimento contínuo no estado final)
  const brilho = ((f - T.sexta) % 90) / 90;

  // Sábado: cópia da barra da sexta que cai para a linha de baixo e encolhe
  const t = f - T.cai;
  const queda = spring({
    frame: t,
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.8 },
  });
  const yQueda = interpolate(queda, [0, 1], [LINHA[0].barra, LINHA[1].barra]);
  const larguraSabado = interpolate(
    t,
    [2, 20],
    [BARRA_MAX, BARRA_MAX * COMPARATIVO.fracao],
    { ...clamp, easing: EASE.entrada },
  );
  const corSabado = interpolateColors(t, [0, 14], [COR.neon, COR.coral]);
  const pousou = T.cai + 16;
  const fantasma = interpolate(f, [pousou - 4, pousou + 8], [0, 1], clamp);

  // Marcador da metade e selo da queda
  const desenhaMetade = interpolate(f, [T.metade, T.metade + 14], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const sSelo = spring({
    frame: f - T.queda,
    fps,
    config: { damping: 11, stiffness: 190, mass: 0.6 },
  });
  const topoMarcador = LINHA[0].barra - 18;
  const baseMarcador = LINHA[1].barra + BARRA_ALTURA + 18;

  return (
    <Cartao3D
      inicio={qJanela(T.cartao)}
      de="baixo"
      style={{
        position: "absolute",
        left: GRADE.x,
        top: GRADE.cartao.top,
        width: LARGURA_UTIL,
        height: GRADE.cartao.altura,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #FFFFFF 0%, #EEF4FB 100%)",
          border: `3px solid ${COR.noite}`,
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 30px 60px rgba(1,10,25,0.5), 0 0 0 1px rgba(255,255,255,0.15)",
        }}
      >
        {/* Cabeçalho verde */}
        <div
          style={{
            height: 64,
            flexShrink: 0,
            background: COR.verde,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 26px",
            color: COR.branco,
            fontFamily: FONTE_TEXTO,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            borderBottom: `3px solid ${COR.noite}`,
          }}
        >
          <TrendingDown size={34} strokeWidth={2.6} color={COR.branco} />
          <span>Alcance às {COMPARATIVO.hora}</span>
        </div>

        <div style={{ position: "relative", flex: 1 }}>
          {/* Trilhos das barras */}
          {LINHA.map((l, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: BARRA_X,
                top: l.barra,
                width: BARRA_MAX,
                height: BARRA_ALTURA,
                borderRadius: 10,
                background: "rgba(2,53,100,0.08)",
              }}
            />
          ))}

          <RotuloDia texto={COMPARATIVO.sexta.dia} top={LINHA[0].rotulo} cor={COR.noite} />
          <RotuloDia texto={COMPARATIVO.sabado.dia} top={LINHA[1].rotulo} cor={COR.noite} />

          {/* Sexta */}
          <div
            style={{
              position: "absolute",
              left: BARRA_X,
              top: LINHA[0].barra,
              width: BARRA_MAX * cresceSexta,
              height: BARRA_ALTURA,
              borderRadius: 10,
              overflow: "hidden",
              background: `linear-gradient(180deg, ${COR.neon} 0%, ${COR.verde} 100%)`,
              boxShadow: "inset 0 3px 0 rgba(255,255,255,0.55)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(100deg, transparent ${brilho * 140 - 30}%, rgba(255,255,255,0.32) ${brilho * 140 - 15}%, transparent ${brilho * 140}%)`,
                opacity: f > T.sexta + 26 ? 1 : 0,
              }}
            />
          </div>
          <Valor top={LINHA[0].barra} cor={COR.noite}>
            <span style={{ opacity: interpolate(f, [T.sexta, T.sexta + 4], [0, 1], clamp) }}>
              <Contador
                valor={COMPARATIVO.sexta.valor}
                inicio={qJanela(T.sexta)}
                duracao={26}
              />
            </span>
          </Valor>

          {/* Sábado: contorno do que se perdeu (da metade até o tamanho da sexta) */}
          <div
            style={{
              position: "absolute",
              left: X_SABADO,
              top: LINHA[1].barra,
              width: BARRA_X + BARRA_MAX - X_SABADO,
              height: BARRA_ALTURA,
              boxSizing: "border-box",
              border: `3px dashed ${COR.coral}`,
              borderLeft: "none",
              borderRadius: "0 10px 10px 0",
              backgroundImage:
                "repeating-linear-gradient(-45deg, rgba(224,90,58,0.16) 0px, rgba(224,90,58,0.16) 8px, transparent 8px, transparent 18px)",
              opacity: fantasma,
            }}
          />
          {t >= 0 ? (
            <div
              style={{
                position: "absolute",
                left: BARRA_X,
                top: yQueda,
                width: larguraSabado,
                height: BARRA_ALTURA,
                borderRadius: 10,
                background: corSabado,
                boxShadow: "inset 0 3px 0 rgba(255,255,255,0.4)",
                opacity: interpolate(t, [0, 3], [0, 1], clamp),
              }}
            />
          ) : null}
          <Valor top={LINHA[1].barra} cor={COR.coral}>
            {f >= pousou ? (
              <GlitchTexto inicio={qJanela(pousou)} duracao={10}>
                {formatarNumero(COMPARATIVO.sabado.valor)}
              </GlitchTexto>
            ) : null}
          </Valor>

          {/* Marcador da metade */}
          <div
            style={{
              position: "absolute",
              left: X_METADE - 2,
              top: topoMarcador,
              width: 0,
              height: (baseMarcador - topoMarcador) * desenhaMetade,
              borderLeft: `4px dashed ${COR.noite}`,
              opacity: desenhaMetade > 0 ? 0.85 : 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: X_METADE - 90,
              width: 180,
              top: baseMarcador + 6,
              display: "flex",
              justifyContent: "center",
              opacity: interpolate(f, [T.metade + 8, T.metade + 14], [0, 1], clamp),
              translate: `0px ${interpolate(f, [T.metade + 8, T.metade + 20], [-12, 0], { ...clamp, easing: EASE.entrada })}px`,
            }}
          >
            <div
              style={{
                background: COR.noite,
                color: COR.branco,
                fontFamily: FONTE_TEXTO,
                fontWeight: 800,
                fontSize: 26,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "5px 16px",
                borderRadius: 999,
              }}
            >
              Metade
            </div>
          </div>

          {/* Selo da queda, dentro do contorno do que se perdeu */}
          <div
            style={{
              position: "absolute",
              left: X_SABADO,
              width: BARRA_X + BARRA_MAX - X_SABADO,
              top: LINHA[1].barra,
              height: BARRA_ALTURA,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {f >= T.queda ? (
              <div
                style={{
                  background: COR.coral,
                  color: COR.branco,
                  fontFamily: FONTE_TITULO,
                  fontSize: 44,
                  lineHeight: 1,
                  padding: "6px 16px 4px",
                  borderRadius: 8,
                  scale: interpolate(sSelo, [0, 1], [1.6, 1]),
                  opacity: interpolate(f, [T.queda, T.queda + 2], [0, 1], clamp),
                  rotate: `${interpolate(sSelo, [0, 1], [-10, -3])}deg`,
                }}
              >
                {COMPARATIVO.queda}
              </div>
            ) : null}
          </div>

          {/* Fonte */}
          <div
            style={{
              position: "absolute",
              right: 30,
              bottom: 22,
              fontFamily: FONTE_TEXTO,
              fontWeight: 600,
              fontSize: 26,
              color: "rgba(2,53,100,0.62)",
              opacity: interpolate(f, [T.sexta + 20, T.sexta + 30], [0, 1], clamp),
            }}
          >
            Fonte: Metricool
          </div>
        </div>
      </div>
    </Cartao3D>
  );
};
