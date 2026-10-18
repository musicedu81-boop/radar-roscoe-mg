import {useEffect, useState} from 'react';
import {AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {measureText} from '@remotion/layout-utils';
import {Butterfly} from './Butterfly';
import {C, FONT} from './tokens';

const FAMILIA = 'Montserrat';
const fonteCarregada = Promise.all(
  [500, 900].map((w) => loadFont({family: FAMILIA, url: staticFile(`fonts/montserrat-latin-${w}-normal.woff2`), weight: String(w)})),
);

const NOME = 'CRIS SANTOS & LUPUS';
const MEIO = NOME.slice(1, -1); // "RIS SANTOS & LUPU"
const W = 1080;
const H = 1920;
const LARGURA_FINAL = 940;
const WEIGHT = 900;
const SPACING = 0.02;

// Linha do tempo (frames @30fps)
const T = {in: 0, writeStart: 16, writeEnd: 128, tagline: 132, dive: 150, rise: 168, merge: 212, end: 240};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);

const useMedidas = () => {
  const [m, setM] = useState<null | {fs: number; wC: number; wMeio: number; wTotal: number}>(null);
  const [h] = useState(() => delayRender('fonte'));
  useEffect(() => {
    fonteCarregada.then(() => {
      const base = 100;
      const med = (t: string) => measureText({text: t, fontFamily: FAMILIA, fontSize: base, fontWeight: String(WEIGHT), letterSpacing: `${SPACING}em`}).width;
      const fs = (base * LARGURA_FINAL) / med(NOME);
      const k = fs / base;
      setM({fs, wC: med('C') * k, wMeio: med(MEIO) * k, wTotal: med(NOME) * k});
      continueRender(h);
    });
  }, [h]);
  return m;
};

const textoStyle = (fs: number): React.CSSProperties => ({
  fontFamily: FONT,
  fontWeight: WEIGHT,
  fontSize: fs,
  letterSpacing: `${SPACING}em`,
  lineHeight: 1,
  whiteSpace: 'pre',
  backgroundImage: `linear-gradient(180deg, ${C.creme} 30%, ${C.lavanda} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: `drop-shadow(0 0 18px ${C.claro}88)`,
});

export const Vinheta: React.FC = () => {
  const f = useCurrentFrame();
  const m = useMedidas();
  if (!m) return null;

  const left = (W - m.wTotal) / 2;
  const prog = interpolate(f, [T.writeStart, T.writeEnd], [0, 1], {...clamp, easing: ease});
  const revelado = prog * m.wMeio;

  // Bloco do nome: centro da tela, depois desce para o terço inferior quando o rosto sobe
  const baseY0 = H / 2 + m.fs * 0.35;
  const baseY = baseY0 + interpolate(f, [T.rise, T.merge], [0, 470], {...clamp, easing: ease});
  const topoTexto = baseY - m.fs * 0.82;

  // Ponta do lápis = borda do texto revelado (antes do S)
  const pontaX = left + m.wC + revelado;
  const bob = Math.sin(f / 4.5) * 10;
  let bx = pontaX + 6;
  let by = topoTexto - 26 + bob - Math.sin(prog * Math.PI * 9) * 14;
  // Entrada: chega voando da direita até o S
  bx = interpolate(f, [0, T.writeStart], [W + 120, bx], {...clamp, easing: Easing.out(Easing.cubic)});
  // Depois de escrever, pousa sobre o S
  const sX = left + m.wC + m.wMeio + m.fs * 0.35;
  bx = interpolate(f, [T.writeEnd, T.writeEnd + 14], [bx, sX], {...clamp, easing: ease});
  // Mergulha e sobe com o rosto
  const divY = interpolate(f, [T.dive, T.rise], [0, 300], {...clamp, easing: Easing.in(Easing.cubic)});
  const alvoX = 770;
  bx = interpolate(f, [T.rise, T.merge - 6], [bx, alvoX], {...clamp, easing: ease});
  by = interpolate(f, [T.rise, T.merge - 6], [by + divY, 900], {...clamp, easing: Easing.out(Easing.cubic)});
  const bSize = interpolate(f, [T.dive, T.rise, T.merge - 6], [120, 150, 520], {...clamp, easing: ease});
  const bOpacity = interpolate(f, [T.merge - 14, T.merge + 6], [1, 0], clamp);
  const flapSpeed = f > T.dive ? 0.9 : 0.6;
  const flap = Math.abs(Math.cos(f * flapSpeed));

  // Rosto: metade rosto, metade borboleta
  const rostoP = interpolate(f, [T.rise, T.merge + 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const rostoScale = interpolate(f, [T.rise, T.end], [1.08, 1], clamp);

  const textIn = interpolate(f, [0, 12], [0, 1], clamp);
  const linha = interpolate(f, [2, T.writeEnd], [0, 1], {...clamp, easing: ease});
  const tag = interpolate(f, [T.tagline, T.tagline + 18], [0, 1], clamp);

  // Rastro de brilho
  const particulas = [];
  for (let i = 0; i < 160; i++) {
    const nasce = T.writeStart + i * 1.2;
    const vida = f - nasce;
    if (vida < 0 || vida > 32 || nasce > T.merge) continue;
    const pf = Math.round(nasce);
    const pp = interpolate(pf, [T.writeStart, T.writeEnd], [0, 1], {...clamp, easing: ease});
    const px0 = pf < T.dive ? left + m.wC + pp * m.wMeio : bx;
    const py0 = pf < T.dive ? topoTexto - 10 : by;
    const px = px0 + (random(`x${i}`) - 0.5) * 60 - vida * 1.2;
    const py = py0 + (random(`y${i}`) - 0.3) * 50 + vida * 1.4;
    const a = interpolate(vida, [0, 4, 32], [0, 1, 0], clamp);
    const r = 1.5 + random(`r${i}`) * 3;
    particulas.push(
      <div key={i} style={{position: 'absolute', left: px, top: py, width: r * 2, height: r * 2, borderRadius: '50%', background: C.creme, opacity: a, boxShadow: `0 0 ${r * 4}px ${C.lavanda}`}} />,
    );
  }

  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 35%, ${C.principal} 0%, ${C.profundo} 45%, #0d0215 100%)`, overflow: 'hidden'}}>
      {/* Luz de topo, como na vinheta original */}
      <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.lavanda}22 0%, transparent 40%)`}} />

      {/* Rosto */}
      <AbsoluteFill style={{opacity: rostoP, transform: `translateY(${(1 - rostoP) * 380}px) scale(${rostoScale})`}}>
        <Img src={staticFile('rosto.png')} style={{position: 'absolute', width: 1000, left: 40, top: -230, filter: 'saturate(0.9) contrast(1.05)'}} />
        <AbsoluteFill style={{background: `linear-gradient(180deg, transparent 45%, ${C.profundo}cc 72%, #0d0215 88%)`}} />
        <AbsoluteFill style={{background: `radial-gradient(60% 40% at 50% 46%, transparent 40%, ${C.profundo} 100%)`, mixBlendMode: 'multiply', opacity: 0.9}} />
        <AbsoluteFill style={{background: C.medio, mixBlendMode: 'soft-light', opacity: 0.5}} />
      </AbsoluteFill>

      {/* Linha de base */}
      <div style={{position: 'absolute', left: left - 30, top: baseY + 22, width: (m.wTotal + 60) * linha, height: 2, background: `linear-gradient(90deg, transparent, ${C.lavanda}, ${C.creme})`, boxShadow: `0 0 12px ${C.claro}`}} />

      {/* Nome: C fixo, meio revelado, S empurrado */}
      <div style={{position: 'absolute', left, top: topoTexto, display: 'flex', opacity: textIn}}>
        <span style={textoStyle(m.fs)}>C</span>
        <span style={{display: 'inline-block', width: revelado, overflow: 'hidden', paddingBottom: 12}}>
          <span style={textoStyle(m.fs)}>{MEIO}</span>
        </span>
        <span style={textoStyle(m.fs)}>S</span>
      </div>

      {/* Assinatura */}
      <div style={{position: 'absolute', width: W, top: baseY + 50, textAlign: 'center', fontFamily: FONT, fontWeight: 500, fontSize: 30, letterSpacing: '0.42em', color: C.lavanda, opacity: tag, transform: `translateY(${(1 - tag) * 14}px)`}}>
        A REALIDADE DE QUEM VIVE
      </div>

      {particulas}

      <div style={{position: 'absolute', left: bx - bSize / 2, top: by - bSize / 2, opacity: bOpacity, transform: `rotate(${Math.sin(f / 6) * 8}deg)`}}>
        <Butterfly size={bSize} flap={flap} glow={1 + (bSize - 120) / 300} />
      </div>
    </AbsoluteFill>
  );
};
