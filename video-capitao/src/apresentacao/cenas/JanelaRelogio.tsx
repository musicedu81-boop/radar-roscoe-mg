import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, COR, EASE, FONTE_TEXTO, FONTE_TITULO } from "../marca";
import { GRADE, HORAS, horaDoCursor, qJanela, T, TEXTO } from "./JanelaTempos";

// Relógio de 24 h (0h no alto, sentido horário) em CSS 3D: anel de horas que se monta, blocos
// acesos com a "janela" de luz saindo do centro (10h às 12h em verde-neon, pintado pelo cursor;
// 18h em amarelo), cursor com rastro de luz percorrendo o dia e um mostrador digital flutuando
// acima do disco. Na fase 2 o relógio encolhe e vai para a esquerda; o mostrador corre da sexta
// às 18h até o sábado às 10h, o horário comparado no cartão.

const TAM = 780; // lado do SVG
const C = TAM / 2; // centro
const R_EXT = 300; // borda externa do anel das horas
const R_INT = 254; // borda interna do anel
const R_DISCO = 244;
const R_ROTULO = 346;
const FOLGA = 0.07; // folga entre os segmentos de hora (em horas)

const polar = (r: number, h: number): [number, number] => {
  const a = (h / 24) * Math.PI * 2;
  return [C + r * Math.sin(a), C - r * Math.cos(a)];
};

// Setor de anel entre os raios r1 < r2, da hora h1 à hora h2 (h1 < h2). r1 = 0 faz uma cunha.
const setor = (r1: number, r2: number, h1: number, h2: number) => {
  const grande = h2 - h1 > 12 ? 1 : 0;
  const [ax, ay] = polar(r2, h1);
  const [bx, by] = polar(r2, h2);
  const [cx, cy] = polar(r1, h2);
  const [dx, dy] = polar(r1, h1);
  return `M ${ax.toFixed(2)} ${ay.toFixed(2)} A ${r2} ${r2} 0 ${grande} 1 ${bx.toFixed(2)} ${by.toFixed(2)} L ${cx.toFixed(2)} ${cy.toFixed(2)} A ${r1} ${r1} 0 ${grande} 0 ${dx.toFixed(2)} ${dy.toFixed(2)} Z`;
};

// Parte acesa de cada segmento de hora dentro do intervalo [a, b] (com a folga entre eles)
const segmentosAcesos = (a: number, b: number) => {
  const partes: [number, number][] = [];
  for (let k = Math.floor(a); k < Math.ceil(b); k++) {
    const ini = Math.max(k + FOLGA, a);
    const fim = Math.min(k + 1 - FOLGA, b);
    if (fim - ini > 0.004) {
      partes.push([ini, fim]);
    }
  }
  return partes;
};

// Bloco aceso: cunha de luz até o centro, segmentos sólidos, brilho interno e halo externo
// em camadas (sem filtro de blur)
const BlocoAceso: React.FC<{
  a: number;
  b: number;
  cor: string;
  cunha: string;
  pulso: number;
}> = ({ a, b, cor, cunha, pulso }) => {
  if (b - a <= 0.004) {
    return null;
  }
  return (
    <g>
      <path d={setor(0, R_INT, a, b)} fill={`url(#${cunha})`} opacity={0.75 + 0.25 * pulso} />
      <path d={setor(R_EXT, R_EXT + 34, a, b)} fill={cor} opacity={0.08 * pulso} />
      <path d={setor(R_EXT, R_EXT + 15, a, b)} fill={cor} opacity={0.22 * pulso} />
      <path d={setor(R_INT - 20, R_INT, a, b)} fill={cor} opacity={0.3} />
      {segmentosAcesos(a, b).map(([i, f]) => (
        <path key={i} d={setor(R_INT, R_EXT, i, f)} fill={cor} />
      ))}
    </g>
  );
};

const Rotulo: React.FC<{
  h: number;
  texto: string;
  cor: string;
  opacidade: number;
}> = ({ h, texto, cor, opacidade }) => {
  const [x, y] = polar(R_ROTULO, h);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill={cor}
      opacity={opacidade}
      style={{
        fontFamily: FONTE_TEXTO,
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: "0.02em",
      }}
    >
      {texto}
    </text>
  );
};

// Degradê radial da cunha de luz: transparente no centro, cor na borda do anel
const Cunha: React.FC<{ id: string; cor: string }> = ({ id, cor }) => (
  <radialGradient id={id} cx={C} cy={C} r={R_INT} gradientUnits="userSpaceOnUse">
    <stop offset="0%" stopColor={cor} stopOpacity={0} />
    <stop offset="45%" stopColor={cor} stopOpacity={0.03} />
    <stop offset="100%" stopColor={cor} stopOpacity={0.3} />
  </radialGradient>
);

export const JanelaRelogio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - qJanela(0);
  const h = horaDoCursor(f);
  const velocidade = Math.abs(h - horaDoCursor(f - 1));

  // Fase 2: encolhe e vai para a esquerda
  const fase = interpolate(f, [T.fase2 - 2, T.fase2 + 22], [0, 1], {
    ...clamp,
    easing: EASE.suave,
  });
  const { relogio1: r1, relogio2: r2 } = GRADE;
  const centroX = interpolate(fase, [0, 1], [r1.x, r2.x]);
  const centroY = interpolate(fase, [0, 1], [r1.y, r2.y]);
  const escala = interpolate(fase, [0, 1], [r1.escala, r2.escala]);

  // Montagem
  const monta = interpolate(f, [T.relogio, T.relogio + 22], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const rotulosVisiveis =
    interpolate(f, [T.relogio + 12, T.relogio + 24], [0, 1], clamp) *
    (1 - fase);

  // Blocos acesos
  const aceso10 = interpolate(
    Math.min(h, HORAS.picoFim),
    [HORAS.picoIni, HORAS.picoFim],
    [0, 1],
    clamp,
  );
  const aceso18 = interpolate(f, [T.dezoito, T.dezoito + 14], [0, 1], {
    ...clamp,
    easing: EASE.entrada,
  });
  const pulso = 0.5 + 0.5 * Math.sin((f / 60) * Math.PI * 2);

  // Rastro do cursor: mais longo quando ele corre
  const rastro = interpolate(velocidade, [0, 0.3], [0.45, 2.4], clamp);
  const N_RASTRO = 16;

  // Mostrador digital: hora corrente enquanto o cursor corre; trava no pico quando ele pousa.
  // Na fase 2 ele mostra o dia (SEX, depois SÁB ao passar da meia-noite) e pousa nas 10h de
  // sábado em coral.
  const fase2 = f >= T.fase2;
  const pousouSabado = f >= T.sexta + 6;
  const travado10 = f >= T.dez && f < T.tarde;
  const travado18 = f >= T.dezoito + 2 && !fase2;
  const horaMostrada = travado18
    ? HORAS.segundo
    : travado10
      ? HORAS.picoIni
      : Math.floor(h) % 24;
  const corDestaque = pousouSabado
    ? COR.coral
    : travado18
      ? COR.amarelo
      : travado10
        ? COR.neon
        : null;
  const pouso = pousouSabado ? T.sexta + 6 : travado18 ? T.dezoito + 2 : T.dez;
  const sPouso = spring({
    frame: f - pouso,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.7 },
  });
  const pop = corDestaque ? interpolate(sPouso, [0, 1], [1.28, 1]) : 1;
  const mostrador = interpolate(f, [T.partida - 4, T.partida + 6], [0, 1], clamp);
  const rotuloPico =
    interpolate(f, [T.pico, T.pico + 8], [0, 1], clamp) *
    interpolate(f, [T.tarde, T.tarde + 8], [1, 0], clamp);
  // "SEGUNDO PICO" só entra com o pouso nas 18h (enquanto o cursor corre, o número é outro)
  const rotuloSegundo =
    interpolate(f, [T.dezoito + 2, T.dezoito + 10], [0, 1], clamp) *
    interpolate(f, [T.fase2, T.fase2 + 8], [1, 0], clamp);
  // Na fala "segundo pico" o segmento das 18h pisca com contorno amarelo até acender
  const alvo18 =
    interpolate(f, [T.segundo, T.segundo + 6], [0, 1], clamp) *
    interpolate(f, [T.dezoito + 4, T.dezoito + 12], [1, 0], clamp) *
    (0.75 + 0.25 * Math.cos(((f - T.segundo) / 15) * Math.PI * 2));
  const rotuloDia = interpolate(f, [T.fase2 + 4, T.fase2 + 14], [0, 1], clamp);
  const sabado = h >= 24;
  const corHalo = corDestaque ?? COR.branco;

  // Deriva 3D lenta e contida do disco (o mostrador fica legível, sem inclinar o texto)
  const rotX = interpolate(f, [-6, T.fim], [11, 7], clamp);
  const rotY = interpolate(f, [-6, T.fim], [-6, 5], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: centroX - C,
        top: centroY - C,
        width: TAM,
        height: TAM,
        perspective: 1800,
        scale: escala * interpolate(monta, [0, 1], [0.86, 1]),
        opacity: interpolate(f, [T.relogio, T.relogio + 6], [0, 1], clamp),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        }}
      >
        <svg
          width={TAM}
          height={TAM}
          viewBox={`0 0 ${TAM} ${TAM}`}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <defs>
            <radialGradient id="janela-disco" cx="42%" cy="34%" r="70%">
              <stop offset="0%" stopColor={COR.fundo} stopOpacity={0.75} />
              <stop offset="55%" stopColor={COR.noite} stopOpacity={0.8} />
              <stop offset="100%" stopColor={COR.noiteProfunda} stopOpacity={0.92} />
            </radialGradient>
            <Cunha id="janela-cunha-neon" cor={COR.neon} />
            <Cunha id="janela-cunha-amarelo" cor={COR.amarelo} />
          </defs>

          {/* Sombra no chão, para assentar o disco no espaço */}
          <ellipse
            cx={C}
            cy={C + R_EXT + 30}
            rx={R_EXT * 0.9}
            ry={26}
            fill="rgba(1,10,25,0.35)"
            opacity={monta * (1 - fase)}
          />
          {/* Disco e aros */}
          <circle cx={C} cy={C} r={R_EXT + 8} fill="url(#janela-disco)" opacity={monta} />
          <circle
            cx={C}
            cy={C}
            r={R_EXT + 24}
            fill="none"
            stroke="rgba(255,255,255,0.26)"
            strokeWidth={2}
            opacity={monta}
          />
          {/* Aro pontilhado que gira devagar (movimento contínuo) */}
          <circle
            cx={C}
            cy={C}
            r={R_EXT + 52}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={3}
            strokeDasharray="2 16"
            transform={`rotate(${f * 0.25} ${C} ${C})`}
            opacity={monta * (1 - fase * 0.6)}
          />
          <circle
            cx={C}
            cy={C}
            r={R_DISCO}
            fill="none"
            stroke="rgba(1,237,67,0.22)"
            strokeWidth={2}
            opacity={monta}
          />

          {/* Anel das 24 horas: os segmentos entram em sequência, no sentido horário */}
          {Array.from({ length: 24 }, (_, k) => (
            <path
              key={k}
              d={setor(R_INT, R_EXT, k + FOLGA, k + 1 - FOLGA)}
              fill="rgba(255,255,255,0.13)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1.5}
              opacity={interpolate(
                f,
                [T.relogio + k * 0.7, T.relogio + k * 0.7 + 6],
                [0, 1],
                clamp,
              )}
            />
          ))}

          {/* Marcas de hora e de quarto de hora */}
          <g opacity={monta}>
            {Array.from({ length: 96 }, (_, k) => {
              const hora = k % 4 === 0;
              const [x1, y1] = polar(hora ? 222 : 232, k / 4);
              const [x2, y2] = polar(242, k / 4);
              return (
                <line
                  key={k}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={hora ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.22)"}
                  strokeWidth={hora ? 3 : 1.5}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Blocos acesos, com a janela de luz saindo do centro */}
          <BlocoAceso
            a={HORAS.picoIni}
            b={HORAS.picoIni + (HORAS.picoFim - HORAS.picoIni) * aceso10}
            cor={COR.neon}
            cunha="janela-cunha-neon"
            pulso={pulso}
          />
          <BlocoAceso
            a={HORAS.segundo}
            b={HORAS.segundo + aceso18}
            cor={COR.amarelo}
            cunha="janela-cunha-amarelo"
            pulso={pulso}
          />

          {/* Alvo do segundo pico: contorno amarelo piscando */}
          {alvo18 > 0.01 ? (
            <path
              d={setor(R_INT - 6, R_EXT + 6, HORAS.segundo, HORAS.segundo + 1)}
              fill="rgba(255,205,14,0.2)"
              stroke={COR.amarelo}
              strokeWidth={5}
              strokeDasharray="10 8"
              opacity={alvo18}
            />
          ) : null}

          {/* Rastro de luz do cursor */}
          {Array.from({ length: N_RASTRO }, (_, i) => {
            const a = h - (rastro * (i + 1)) / N_RASTRO;
            const b = h - (rastro * i) / N_RASTRO;
            return (
              <path
                key={i}
                d={setor(R_INT, R_EXT, a, b)}
                fill={COR.branco}
                opacity={0.42 * Math.pow(1 - i / N_RASTRO, 1.6) * monta}
              />
            );
          })}

          {/* Cursor: agulha no anel e ponta com halo na cor da janela */}
          {(() => {
            const [x1, y1] = polar(R_DISCO - 22, h);
            const [x2, y2] = polar(R_EXT + 20, h);
            const [px, py] = polar((R_INT + R_EXT) / 2, h);
            return (
              <g opacity={monta}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={COR.branco}
                  strokeWidth={6}
                  strokeLinecap="round"
                />
                <circle cx={px} cy={py} r={40} fill={corHalo} opacity={0.12} />
                <circle cx={px} cy={py} r={28} fill={corHalo} opacity={0.22} />
                <circle
                  cx={px}
                  cy={py}
                  r={17}
                  fill={COR.branco}
                  stroke={COR.noite}
                  strokeWidth={4}
                />
              </g>
            );
          })()}

          {/* Rótulos das horas (somem na fase 2, quando o relógio fica pequeno) */}
          <Rotulo h={0} texto="0h" cor={COR.branco} opacidade={0.62 * rotulosVisiveis} />
          <Rotulo h={6} texto="6h" cor={COR.branco} opacidade={0.62 * rotulosVisiveis} />
          <Rotulo
            h={HORAS.picoFim}
            texto={`${HORAS.picoFim}h`}
            cor={aceso10 >= 1 ? COR.neon : COR.branco}
            opacidade={(aceso10 >= 1 ? 1 : 0.62) * rotulosVisiveis}
          />
          <Rotulo
            h={HORAS.picoIni}
            texto={`${HORAS.picoIni}h`}
            cor={COR.neon}
            opacidade={interpolate(f, [T.dez, T.dez + 8], [0, 1], clamp) * rotulosVisiveis}
          />
          <Rotulo
            h={HORAS.segundo}
            texto={`${HORAS.segundo}h`}
            cor={aceso18 > 0.5 ? COR.amarelo : COR.branco}
            opacidade={(aceso18 > 0.5 ? 1 : 0.62) * rotulosVisiveis}
          />
        </svg>

        {/* Mostrador digital flutuando acima do disco */}
        <div
          style={{
            position: "absolute",
            left: C - 210,
            top: C - 170,
            width: 420,
            height: 340,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateZ(50px)",
            opacity: mostrador,
          }}
        >
          {/* Dia (só na fase 2): SEX até a meia-noite, depois SÁB */}
          <div
            style={{
              height: rotuloDia * 74,
              overflow: "hidden",
              fontFamily: FONTE_TITULO,
              fontSize: 64,
              lineHeight: 1.1,
              letterSpacing: "0.12em",
              color: sabado ? COR.coral : COR.neon,
              opacity: rotuloDia,
            }}
          >
            {sabado ? TEXTO.siglas[5] : TEXTO.siglas[4]}
          </div>
          <div
            style={{
              fontFamily: FONTE_TITULO,
              fontSize: 168,
              lineHeight: 1,
              color: corDestaque ?? "rgba(255,255,255,0.62)",
              fontVariantNumeric: "tabular-nums",
              scale: pop,
              textShadow: corDestaque
                ? `0 0 36px ${corDestaque === COR.neon ? "rgba(1,237,67,0.45)" : corDestaque === COR.amarelo ? "rgba(255,205,14,0.45)" : "rgba(224,90,58,0.5)"}`
                : undefined,
            }}
          >
            {horaMostrada}H
          </div>
          <div
            style={{
              position: "relative",
              height: 36 * (1 - rotuloDia),
              width: 420,
              marginTop: 10 * (1 - rotuloDia),
              fontFamily: FONTE_TEXTO,
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: "0.1em",
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                color: COR.neon,
                opacity: rotuloPico,
                translate: `0px ${(1 - rotuloPico) * 10}px`,
              }}
            >
              Pico de audiência
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                color: COR.amarelo,
                opacity: rotuloSegundo,
                translate: `0px ${(1 - rotuloSegundo) * 10}px`,
              }}
            >
              Segundo pico
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
