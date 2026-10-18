import {useEffect, useState} from 'react';
import {AbsoluteFill, Easing, Img, Sequence, continueRender, delayRender, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {measureText} from '@remotion/layout-utils';
import {Butterfly} from './Butterfly';
import {FAMILIA, fonteCarregada} from './fonte';
import {LuzVazada} from './LuzVazada';
import {MEIO, NOME, QUADRO, SLOGAN, type Tempos, abertura, clamp, progressoDescida, progressoEscrita, progressoRosto, saida, suave, useTempos} from './roteiro';
import {C, FONT} from './tokens';

const WEIGHT = 900;
const SPACING = 0.02;
const LINE = 1.3;
// Distância do topo da linha até a baseline, em em (Montserrat: ascender 0.968, descender 0.251)
const BASELINE_EM = (LINE - 1.219) / 2 + 0.968;

type Medidas = {fs: number; wC: number; wMeio: number; wS: number; wTotal: number};

const useMedidas = () => {
  const [m, setM] = useState<Medidas | null>(null);
  const [h] = useState(() => delayRender('Medindo o nome'));
  useEffect(() => {
    fonteCarregada.then(() => {
      const base = 100;
      const med = (t: string) => measureText({text: t, fontFamily: FAMILIA, fontSize: base, fontWeight: String(WEIGHT), letterSpacing: `${SPACING}em`}).width;
      const fs = (base * QUADRO.larguraNome) / med(NOME);
      const k = fs / base;
      setM({fs, wC: med('C') * k, wMeio: med(MEIO) * k, wS: med('S') * k, wTotal: med(NOME) * k});
      continueRender(h);
    });
  }, [h]);
  return m;
};

// Geometria do nome em um frame qualquer (px)
const geometria = (f: number, m: Medidas, T: Tempos, W: number, H: number) => {
  const left = (W - m.wTotal) / 2;
  const prog = progressoEscrita(f, T);
  const baseY = H / 2 + m.fs * 0.35 + progressoDescida(f, T) * QUADRO.descidaNome;
  return {left, prog, revelado: prog * m.wMeio, baseY, capTop: baseY - m.fs * 0.7};
};

// A borboleta é o lápis: posição pura em função do frame (permite desenhar o rastro)
const posBorboleta = (f: number, m: Medidas, T: Tempos, W: number, H: number) => {
  const g = geometria(f, m, T, W, H);
  const bob = Math.sin(f / 4.5) * 10;
  let x = g.left + m.wC + g.revelado + 6;
  let y = g.capTop - 34 + bob - Math.sin(g.prog * Math.PI * 9) * 14;
  // Entrada: arco vindo do alto, pela direita, até a ponta do lápis
  const ent = interpolate(f, [0, T.writeStart], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const u = 1 - ent;
  x = u * u * (W + 100) + 2 * u * ent * W * 0.62 + ent * ent * x;
  y = u * u * (g.capTop - 420) + 2 * u * ent * (g.capTop - 40) + ent * ent * y;
  // Pousa sobre o S final
  x = interpolate(f, [T.writeEnd, T.writeEnd + 14], [x, g.left + m.wC + m.wMeio + m.wS / 2], {...clamp, easing: suave});
  y = interpolate(f, [T.writeEnd, T.writeEnd + 14], [y, g.capTop - 30 + bob * 0.3], {...clamp, easing: suave});
  // Abaixa e sobe junto com o rosto até a metade borboleta
  y += interpolate(f, [T.dive, T.rise], [0, 300], {...clamp, easing: Easing.in(Easing.cubic)});
  x = interpolate(f, [T.rise, T.merge - 6], [x, QUADRO.alvoBorboleta.x], {...clamp, easing: suave});
  y = interpolate(f, [T.rise, T.merge - 6], [y, QUADRO.alvoBorboleta.y], {...clamp, easing: Easing.out(Easing.cubic)});
  const size = interpolate(f, [T.dive, T.rise, T.merge - 6], [120, 150, 480], {...clamp, easing: suave});
  const opacity = interpolate(f, [T.merge - 12, T.merge + 6], [1, 0], clamp);
  return {x, y, size, opacity};
};

const textoStyle = (fs: number): React.CSSProperties => ({
  fontFamily: FONT,
  fontWeight: WEIGHT,
  fontSize: fs,
  letterSpacing: `${SPACING}em`,
  lineHeight: LINE,
  whiteSpace: 'pre',
  backgroundImage: `linear-gradient(180deg, ${C.creme} 35%, ${C.lavanda} 90%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: `drop-shadow(0 0 18px ${C.claro}88)`,
});

export const Vinheta2D: React.FC = () => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const T = useTempos();
  const m = useMedidas();
  if (!m) return null;

  const g = geometria(f, m, T, W, H);
  const b = posBorboleta(f, m, T, W, H);
  const rostoP = progressoRosto(f, T);

  // Rastro de luz: a trajetória recente da borboleta
  const rastro = [];
  for (let k = 0; k < 28; k++) {
    const t0 = f - k * 0.5;
    const t1 = f - (k + 1) * 0.5;
    if (t1 < 0 || t0 > T.merge) continue;
    const a = posBorboleta(t0, m, T, W, H);
    const c = posBorboleta(t1, m, T, W, H);
    const v = 1 - k / 28;
    rastro.push(
      <line key={k} x1={a.x} y1={a.y + a.size * 0.12} x2={c.x} y2={c.y + c.size * 0.12} stroke={C.lavanda} strokeWidth={1 + 5 * v} strokeOpacity={0.8 * v * v * a.opacity} strokeLinecap="round" />,
    );
  }

  // Faíscas que caem da borboleta
  const particulas = [];
  for (let i = 0; i < 220; i++) {
    const nasce = T.writeStart - 10 + i;
    const vida = f - nasce;
    if (vida < 0 || vida > 32 || nasce > T.merge - 4) continue;
    const o = posBorboleta(nasce, m, T, W, H);
    const px = o.x + (random(`x${i}`) - 0.5) * 60 - vida * 1.2;
    const py = o.y + o.size * 0.1 + (random(`y${i}`) - 0.3) * 40 + vida * 1.5;
    const r = 1.5 + random(`r${i}`) * 3;
    particulas.push(
      <div key={i} style={{position: 'absolute', left: px, top: py, width: r * 2, height: r * 2, borderRadius: '50%', background: C.creme, opacity: interpolate(vida, [0, 4, 32], [0, 1, 0], clamp), boxShadow: `0 0 ${r * 4}px ${C.lavanda}`}} />,
    );
  }

  // Explosão de brilho quando a borboleta se funde ao retrato
  const explosao = [];
  for (let i = 0; i < 48; i++) {
    const vida = f - (T.merge - 6);
    if (vida < 0 || vida > 34) continue;
    const ang = random(`a${i}`) * Math.PI * 2;
    const vel = 3 + random(`v${i}`) * 9;
    const d = vel * vida * (1 - vida / 90);
    const r = 1.5 + random(`s${i}`) * 3.5;
    explosao.push(
      <div key={i} style={{position: 'absolute', left: QUADRO.alvoBorboleta.x + Math.cos(ang) * d, top: QUADRO.alvoBorboleta.y + Math.sin(ang) * d, width: r * 2, height: r * 2, borderRadius: '50%', background: C.creme, opacity: interpolate(vida, [0, 3, 34], [0, 1, 0], clamp), boxShadow: `0 0 ${r * 5}px ${C.lavanda}`}} />,
    );
  }

  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 35%, ${C.principal} 0%, ${C.profundo} 45%, ${C.noite} 100%)`, overflow: 'hidden'}}>
      {/* Luz de topo, como na vinheta original */}
      <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.lavanda}22 0%, transparent 40%)`}} />

      {/* Retrato: metade rosto, metade borboleta (cor já tratada no arquivo) */}
      <AbsoluteFill style={{opacity: rostoP}}>
        <Img
          src={staticFile('rosto.png')}
          style={{
            position: 'absolute',
            width: QUADRO.retrato.largura,
            left: QUADRO.retrato.esquerda,
            top: QUADRO.retrato.topo,
            translate: `0px ${(1 - rostoP) * 380}px`,
            scale: interpolate(f, [T.rise, T.end], [1.08, 1], clamp),
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: rostoP, background: `linear-gradient(180deg, transparent 45%, ${C.profundo}cc 72%, ${C.noite} 88%)`}} />
      <AbsoluteFill style={{opacity: rostoP * 0.85, background: `radial-gradient(75% 55% at 50% 40%, transparent 60%, ${C.noite} 100%)`}} />

      {/* Clarão da fusão */}
      <div
        style={{
          position: 'absolute',
          left: QUADRO.alvoBorboleta.x - 300,
          top: QUADRO.alvoBorboleta.y - 300,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.lavanda}aa 0%, ${C.claro}44 35%, transparent 70%)`,
          mixBlendMode: 'screen',
          opacity: interpolate(f, [T.merge - 12, T.merge - 4, T.merge + 18], [0, 0.9, 0], clamp),
          scale: interpolate(f, [T.merge - 12, T.merge + 18], [0.6, 1.4], clamp),
        }}
      />

      {/* Linha de base */}
      <div
        style={{
          position: 'absolute',
          left: g.left - 30,
          top: g.baseY + 22,
          width: (m.wTotal + 60) * interpolate(f, [2, T.writeEnd], [0, 1], {...clamp, easing: suave}),
          height: 2,
          background: `linear-gradient(90deg, transparent, ${C.lavanda}, ${C.creme})`,
          boxShadow: `0 0 12px ${C.claro}`,
        }}
      />

      {/* Nome: C parado, meio revelado pela borboleta, S empurrado para a direita */}
      <div style={{position: 'absolute', left: g.left, top: g.baseY - m.fs * BASELINE_EM, display: 'flex', opacity: interpolate(f, [0, 12], [0, 1], clamp)}}>
        <span style={textoStyle(m.fs)}>C</span>
        <span
          style={{
            width: g.revelado,
            overflow: 'hidden',
            padding: '24px 0',
            margin: '-24px 0',
            WebkitMaskImage: `linear-gradient(90deg, #000 calc(100% - ${m.fs * 0.45}px), transparent)`,
            maskImage: `linear-gradient(90deg, #000 calc(100% - ${m.fs * 0.45}px), transparent)`,
          }}
        >
          <span style={textoStyle(m.fs)}>{MEIO}</span>
        </span>
        <span style={textoStyle(m.fs)}>S</span>
      </div>

      {/* Slogan */}
      <div
        style={{
          position: 'absolute',
          width: W,
          top: g.baseY + 50,
          textAlign: 'center',
          paddingLeft: '0.42em',
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 30,
          letterSpacing: '0.42em',
          color: C.lavanda,
          opacity: interpolate(f, [T.tagline, T.tagline + 18], [0, 1], clamp),
          translate: `0px ${interpolate(f, [T.tagline, T.tagline + 18], [14, 0], {...clamp, easing: saida})}px`,
        }}
      >
        {SLOGAN}
      </div>

      <svg width={W} height={H} style={{position: 'absolute', inset: 0, filter: `drop-shadow(0 0 8px ${C.claro})`}}>
        {rastro}
      </svg>
      {particulas}
      {explosao}

      <div style={{position: 'absolute', left: b.x - b.size / 2, top: b.y - b.size / 2, opacity: b.opacity, rotate: `${Math.sin(f / 6) * 8}deg`}}>
        <Butterfly size={b.size} flap={abertura(f)} glow={1 + (b.size - 120) / 300} />
      </div>

      <Sequence from={T.rise - 8} durationInFrames={T.merge - T.rise + 30} layout="none">
        <LuzVazada seed={4} intensidade={0.3} />
      </Sequence>
    </AbsoluteFill>
  );
};
