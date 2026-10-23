import {Audio} from '@remotion/media';
import {lightLeak} from '@remotion/effects/light-leak';
import {shine} from '@remotion/effects/shine';
import {AbsoluteFill, Easing, Img, Sequence, Solid, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import CAMADAS from './camadas.json';
import {C} from './cores';
import {Paredao} from './Paredao';
import {amasso, pulso, salto, useRitmo} from './ritmo';

type Nome = keyof typeof CAMADAS.camadas;
const FW = CAMADAS.largura;
const FH = CAMADAS.altura;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const saida = Easing.bezier(0.16, 1, 0.3, 1);

// Woofers das torres de som do flyer (x, y, raio)
const WOOFERS = [
  [95, 770, 28], [90, 845, 30], [85, 920, 33], [80, 1000, 34], [70, 1085, 36],
  [811, 765, 28], [826, 852, 30], [826, 935, 33], [834, 1015, 35], [846, 1095, 34],
];
// Rodas da carreta e da cabine (x, y, raio)
const RODAS = [[145, 1195, 28], [190, 1195, 28], [335, 1215, 33], [405, 1215, 33], [680, 1230, 40]];
const PAREDAO = {x: 98, y: 955};

const src = (n: Nome) => staticFile(`camadas/${n}.png`);

const Camada: React.FC<{nome: Nome; origem?: string; style?: React.CSSProperties}> = ({nome, origem, style}) => {
  const c = CAMADAS.camadas[nome];
  return <Img src={src(nome)} style={{position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h, transformOrigin: origem ?? 'center', ...style}} />;
};

// Woofer do flyer bombeando: recorte circular do próprio fundo, ampliado no kick
const Woofer: React.FC<{x: number; y: number; r: number; p: number}> = ({x, y, r, p}) => {
  const R = r + 3;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - R,
        top: y - R,
        width: 2 * R,
        height: 2 * R,
        borderRadius: '50%',
        overflow: 'hidden',
        scale: `${1 + 0.13 * p}`,
        filter: `brightness(${1 + 0.35 * p})`,
        boxShadow: `0 0 ${16 * p}px ${5 * p}px rgba(77,255,92,${0.65 * p})`,
      }}
    >
      <Img src={staticFile('camadas/fundo.png')} style={{position: 'absolute', left: -(x - R), top: -(y - R), width: FW, height: FH}} />
    </div>
  );
};

// Bandeira tremulando: o recorte é fatiado em tiras verticais que ondulam (o mastro fica parado no fundo)
const Bandeira: React.FC<{nome: Nome; f: number; fase: number; abertura: number; forca: number}> = ({nome, f, fase, abertura, forca}) => {
  const c = CAMADAS.camadas[nome];
  const N = 18;
  const w = c.w / N;
  return (
    <div style={{position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h, transformOrigin: '0% 30%', scale: `${abertura} 1`}}>
      {Array.from({length: N}, (_, i) => {
        const u = (i + 0.5) / N;
        const ph = 0.55 * i - 0.33 * f + fase;
        const dy = (3 + 6 * forca) * u * Math.sin(ph);
        return (
          <div key={i} style={{position: 'absolute', left: i * w, top: dy, width: w + 1, height: c.h, overflow: 'hidden', filter: `brightness(${1 + 0.14 * u * Math.cos(ph)})`}}>
            <Img src={src(nome)} style={{position: 'absolute', left: -i * w, top: 0, width: c.w, height: c.h}} />
          </div>
        );
      })}
    </div>
  );
};

// Roda girando enquanto o caminhão anda (recorte circular da própria roda)
const Roda: React.FC<{x: number; y: number; r: number; angulo: number}> = ({x, y, r, angulo}) => {
  const c = CAMADAS.camadas.caminhao;
  const R = r + 2;
  return (
    <div style={{position: 'absolute', left: x - R, top: y - R, width: 2 * R, height: 2 * R, borderRadius: '50%', overflow: 'hidden', rotate: `${angulo}rad`}}>
      <Img src={src('caminhao')} style={{position: 'absolute', left: c.x - (x - R), top: c.y - (y - R), width: c.w, height: c.h}} />
    </div>
  );
};

// Raios verdes em leque atrás das cabeças
const Raios: React.FC<{giro: number; p: number}> = ({giro, p}) => {
  const n = 26;
  return (
    <svg width={FW} height={FH} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <radialGradient id="raioFade" cx="447" cy="590" r="430" gradientUnits="userSpaceOnUse">
          <stop offset="0.15" stopColor={C.verde} stopOpacity={0} />
          <stop offset="0.35" stopColor={C.verde} stopOpacity={0.85} />
          <stop offset="1" stopColor={C.verde} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`rotate(${giro} 447 590)`} fill="url(#raioFade)">
        {Array.from({length: n}, (_, i) => {
          const a = ((-172 + (164 * i) / (n - 1)) * Math.PI) / 180;
          const da = 0.012 + 0.006 * p;
          const r0 = 60;
          const r1 = 420 + 40 * p;
          const pt = (r: number, ang: number) => `${447 + r * Math.cos(ang)},${590 + r * Math.sin(ang)}`;
          return <polygon key={i} points={`${pt(r0, a - da / 3)} ${pt(r1, a - da)} ${pt(r1, a + da)} ${pt(r0, a + da / 3)}`} />;
        })}
      </g>
    </svg>
  );
};

// Feixes de luz de palco varrendo
const Feixe: React.FC<{x: number; angulo: number; opacidade: number; cor: string}> = ({x, angulo, opacidade, cor}) => (
  <div
    style={{
      position: 'absolute',
      left: x - 70,
      top: -60,
      width: 140,
      height: 1500,
      transformOrigin: '50% 0%',
      rotate: `${angulo}deg`,
      background: `linear-gradient(180deg, ${cor} 0%, transparent 85%)`,
      clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)',
      mixBlendMode: 'screen',
      opacity: opacidade,
      filter: 'blur(6px)',
    }}
  />
);

// Confete caindo e explodindo nos golpes
const Confete: React.FC<{f: number; explosoes: number[]}> = ({f, explosoes}) => {
  const cores = [C.verde, C.amarelo, C.branco, C.azul, '#16C24A'];
  const pecas = [];
  for (let i = 0; i < 70; i++) {
    const x0 = random(`cx${i}`) * FW;
    const vel = 2.2 + random(`cv${i}`) * 3.2;
    const y = ((random(`cy${i}`) * (FH + 200) + f * vel) % (FH + 200)) - 100;
    const x = x0 + Math.sin(f / (8 + random(`cs${i}`) * 6) + i) * 18;
    const giro = f * (4 + random(`cr${i}`) * 8) + i * 40;
    pecas.push({x, y, giro, flip: Math.cos(f / 5 + i), cor: cores[i % cores.length], w: 9 + random(`cw${i}`) * 8, h: 5 + random(`ch${i}`) * 4, k: `c${i}`, o: 0.95});
  }
  explosoes.forEach((e, j) => {
    const t = f - e;
    if (t < 0 || t > 50) return;
    for (let i = 0; i < 46; i++) {
      const ang = random(`ea${j}${i}`) * Math.PI * 2;
      const v = 9 + random(`ev${j}${i}`) * 16;
      const x = 447 + Math.cos(ang) * v * t;
      const y = 640 + Math.sin(ang) * v * t + 0.55 * t * t;
      pecas.push({x, y, giro: t * 18 + i * 30, flip: Math.cos(t / 3 + i), cor: cores[i % cores.length], w: 10 + random(`ew${j}${i}`) * 9, h: 6 + random(`eh${j}${i}`) * 4, k: `e${j}${i}`, o: interpolate(t, [36, 50], [1, 0], clamp)});
    }
  });
  return (
    <>
      {pecas.map((p) => (
        <div key={p.k} style={{position: 'absolute', left: p.x, top: p.y, width: p.w, height: p.h, background: p.cor, rotate: `${p.giro}deg`, scale: `1 ${p.flip}`, opacity: p.o, borderRadius: 1.5}} />
      ))}
    </>
  );
};

export const Carreata: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const R = useRitmo();
  const k = width / FW;

  const kick = pulso(f, R.kick, 3.5);
  const palma = pulso(f, R.palma, 4);
  const crash = pulso(f, R.crash, 6);
  const tempoP = pulso(f, R.tempos, 5);
  const tempoIdx = Math.max(0, Math.floor(f / (4 * R.q)));
  const naVirada = f >= R.virada[0] && f < R.drop;
  const tremor = naVirada ? Math.sin(f * 2.7) * 3 : 0;

  // ---- entradas ----
  const tituloEntra = spring({frame: f, fps, config: {damping: 11, stiffness: 160, mass: 0.8}});
  // Chega dirigindo da esquerda (a cabine aponta para a direita) e freia
  const caminhaoX = interpolate(f, [0, 16], [-980, 0], {...clamp, easing: Easing.bezier(0.2, 0.9, 0.3, 1)});
  const freio = f >= 13 && f < 30 ? Math.sin(((f - 13) / 17) * Math.PI * 2) * Math.exp(-(f - 13) / 7) * 1.8 : 0;
  const homemE = spring({frame: f + 3, fps, config: {damping: 11, stiffness: 190}});
  const homemD = spring({frame: f + 1, fps, config: {damping: 11, stiffness: 190}});
  const bandeiraAbre = spring({frame: f - 12, fps, config: {damping: 14, stiffness: 110}});
  const info = (atraso: number) => spring({frame: f - atraso, fps, config: {damping: 10, stiffness: 170, mass: 0.7}});
  const faixaEntra = interpolate(f, [34, 46], [-950, 0], {...clamp, easing: saida});
  const assinaturaOp = interpolate(f, [44, 56], [0, 1], clamp);

  // ---- dança ----
  const passos = R.tempos.filter((t) => t >= 24);
  const saltosE = passos.filter((t) => (t / (4 * R.q)) % 2 === 0); // 1 e 3
  const saltosD = passos.filter((t) => (t / (4 * R.q)) % 2 === 1 && t >= 36); // 2 e 4
  const finalP = f >= R.final ? Math.sin((Math.min(f - R.final, 10) / 10) * Math.PI) : 0;
  const pulaE = salto(f, saltosE, 9, 16) + finalP * 26;
  const pulaD = salto(f, saltosD, 9, 16) + finalP * 26;
  const amE = amasso(f, saltosE, 9);
  const amD = amasso(f, saltosD, 9);
  const balanco = (fase: number) => Math.sin((f / (8 * R.q)) * Math.PI + fase) * 3;

  const tituloDanca = f >= 24 ? tempoP : 0;
  const tituloInclina = f >= 24 ? (tempoIdx % 2 === 0 ? 1 : -1) * 1.6 * tempoP : 0;
  const brilhoTitulo = ((f - 24 + 48 * 10) % 48) / 20;

  const ondas = R.kick.filter((e) => f - e >= 0 && f - e < 12).map((e) => (f - e) / 12);
  const suspensao = 2.5 * kick + (f >= R.final ? 6 * finalP : 0);
  const camera = 1 + 0.012 * kick + 0.03 * crash + interpolate(f, [0, 240], [0, 0.025]);
  const chacoalha = 4 * crash;

  const sireneOn = f >= R.sirene && f < R.drop;
  const strobo = sireneOn ? (Math.floor(f / 3) % 2 === 0 ? 1 : 0.2) : 1;

  return (
    <AbsoluteFill style={{background: C.verdeEscuro, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: (width - FW * k) / 2,
          top: (height - FH * k) / 2,
          width: FW,
          height: FH,
          transformOrigin: '0 0',
          scale: `${k}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: '50% 45%',
            scale: `${camera}`,
            translate: `${Math.sin(f * 1.9) * chacoalha + tremor}px ${Math.cos(f * 2.3) * chacoalha}px`,
          }}
        >
          <Img src={staticFile('camadas/fundo.png')} style={{position: 'absolute', left: 0, top: 0, width: FW, height: FH}} />

          <Feixe x={140} angulo={18 + 22 * Math.sin(f / 24)} opacidade={0.22 * strobo} cor="#FFF6B0" />
          <Feixe x={760} angulo={-18 - 22 * Math.sin(f / 24 + 1.2)} opacidade={0.22 * strobo} cor="#FFF6B0" />
          <Feixe x={450} angulo={14 * Math.sin(f / 16)} opacidade={0.12 + 0.18 * kick} cor="#E8FFD0" />

          <Raios giro={Math.sin(f / 30) * 6} p={kick} />

          {WOOFERS.map(([x, y, r], i) => (
            <Woofer key={i} x={x} y={y} r={r} p={kick} />
          ))}

          <Bandeira nome="bandeira-esq" f={f} fase={0} abertura={bandeiraAbre} forca={0.5 + kick} />
          <Bandeira nome="bandeira-dir" f={f} fase={1.7} abertura={bandeiraAbre} forca={0.5 + kick} />

          <Camada
            nome="homem-esq"
            origem="50% 92%"
            style={{
              translate: `${tremor * 0.6}px ${-pulaE}px`,
              rotate: `${balanco(0)}deg`,
              scale: `${(0.9 + 0.1 * homemE) * (1 + 0.045 * amE)} ${(0.9 + 0.1 * homemE) * (1 - 0.06 * amE)}`,
              opacity: Math.min(1, homemE * 1.6),
              filter: `brightness(${1 + 1.2 * Math.max(0, 1 - homemE * 1.4)})`,
            }}
          />
          <Camada
            nome="homem-dir"
            origem="50% 92%"
            style={{
              translate: `${-tremor * 0.6}px ${-pulaD}px`,
              rotate: `${balanco(Math.PI)}deg`,
              scale: `${(0.9 + 0.1 * homemD) * (1 + 0.045 * amD)} ${(0.9 + 0.1 * homemD) * (1 - 0.06 * amD)}`,
              opacity: Math.min(1, homemD * 1.6),
              filter: `brightness(${1 + 1.2 * Math.max(0, 1 - homemD * 1.4)})`,
            }}
          />

          {/* Caminhão com o paredão novo na traseira da carreta */}
          <div style={{position: 'absolute', inset: 0, translate: `${caminhaoX}px ${suspensao}px`, rotate: `${freio}deg`, transformOrigin: '680px 1230px'}}>
            <div style={{position: 'absolute', left: PAREDAO.x, top: PAREDAO.y, transformOrigin: '50% 100%', scale: `${1 + 0.03 * kick} ${1 + 0.05 * kick}`}}>
              <Paredao pulso={kick} ondas={ondas} />
            </div>
            <Camada nome="caminhao" />
            {RODAS.map(([x, y, r], i) => (
              <Roda key={i} x={x} y={y} r={r} angulo={caminhaoX / r} />
            ))}
          </div>

          <Img
            src={src('titulo')}
            effects={[shine({progress: Math.min(brilhoTitulo, 1), angle: 25, haloIntensity: 0.28, coreIntensity: 0.65})]}
            style={{
              position: 'absolute',
              left: CAMADAS.camadas.titulo.x,
              top: CAMADAS.camadas.titulo.y,
              width: CAMADAS.camadas.titulo.w,
              height: CAMADAS.camadas.titulo.h,
              transformOrigin: '50% 60%',
              translate: `${tremor}px ${(1 - tituloEntra) * -620}px`,
              scale: `${1 + 0.035 * tituloDanca + 0.08 * finalP} ${1 + 0.05 * tituloDanca + 0.08 * finalP}`,
              rotate: `${tituloInclina}deg`,
            }}
          />

          <Camada nome="info-dia" style={{scale: `${info(24) * (1 + 0.07 * pulso(f, R.tempos.filter((t) => t >= 40 && (t / 12) % 4 === 0), 4))}`}} />
          <Camada nome="info-hora" style={{scale: `${info(28) * (1 + 0.07 * pulso(f, R.tempos.filter((t) => t >= 40 && (t / 12) % 4 === 1), 4))}`}} />
          <Camada nome="info-local" style={{scale: `${info(32) * (1 + 0.07 * pulso(f, R.tempos.filter((t) => t >= 40 && (t / 12) % 4 === 2), 4))}`}} />
          <Camada nome="faixa" style={{translate: `${faixaEntra}px 0px`, scale: `${1 + (f >= R.drop ? 0.035 * kick : 0.015 * palma)}`}} />
          <Camada nome="assinatura" style={{opacity: assinaturaOp}} />

          <Confete f={f} explosoes={[R.drop, R.final]} />
        </div>
      </div>

      {/* clarões nos pratos */}
      <AbsoluteFill style={{background: '#FFFBD8', opacity: 0.45 * pulso(f, R.crash, 3), mixBlendMode: 'screen'}} />

      <Sequence from={R.drop - 6} durationInFrames={36} layout="none">
        <VazamentoLuz />
      </Sequence>

      <Audio src={staticFile('batida.wav')} />
    </AbsoluteFill>
  );
};

// Vazamento de luz âmbar no drop (hueShift 0 = tom âmbar)
const VazamentoLuz: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  return (
    <Solid
      width={width}
      height={height}
      style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.35}}
      effects={[lightLeak({seed: 3, hueShift: 0, progress: interpolate(f, [0, durationInFrames - 1], [0, 1], clamp)})]}
    />
  );
};

