import {Audio} from '@remotion/media';
import {AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SomAbertura} from './Abertura';
import {voo} from './Cartao';
import {useAjuste} from './cenas/ajuste';
import {CENAS, FADIGA_ANEL, FADIGA_CENA, NEVOA_DEFINICAO, NEVOA_GANCHO, VIAGEM, type Camera} from './cenas/Cenas';
import linha from './cenas/linha.json';
import {Palavra3D} from './cenas/Palavra3D';
import roteiro from './cenas/roteiro.json';
import {Revoada} from './efeitos/Borboletas3D';
import {Nevoa, Veu} from './efeitos/Nevoa';
import {Travessia} from './efeitos/Travessia';
import {Fundo} from './Fundo';
import {MarcaAbertura} from './Logo';
import {Pontos} from './Pontos';
import {chegada, clamp, saida as acelera} from './tokens';

type Entrada = 'nevoa' | 'giro' | 'pontos' | 'borboleta' | 'cruzamento';
type Cena = {id: string; tempos: number; entrada: Entrada; camera: Camera};
const CENAS_ROTEIRO = roteiro.cenas as Cena[];
const {inicios: INICIOS, fim: FIM, pousoAssinatura: POUSO} = linha;
const N = CENAS_ROTEIRO.length;

// Duração de cada tipo de troca, em frames (sempre terminando no início da cena seguinte)
const DURACAO: Record<Entrada, number> = {nevoa: 22, giro: 16, pontos: 18, borboleta: 22, cruzamento: VIAGEM};
// O conteúdo da cena começa a se montar durante a troca (no crossover, a palavra que viaja é o começo)
const ADIANTA: Record<Entrada, number> = {nevoa: 8, giro: 16, pontos: 18, borboleta: 22, cruzamento: 0};
const RAIO_GIRO = 1100;
const passada = Easing.bezier(0.65, 0, 0.35, 1);
const ORIGEM = '540px 860px';

type Pose = {ang: number; opacidade: number; borrao: number; mascara?: React.CSSProperties};

const entrar = (p: Pose, tipo: Entrada, f: number, S: number) => {
  if (tipo === 'nevoa') {
    const t = interpolate(f, [S - 14, S + 4], [0, 1], {...clamp, easing: chegada});
    p.borrao += 18 * (1 - t);
    p.opacidade *= t;
  } else if (tipo === 'giro') {
    const t = interpolate(f, [S - DURACAO.giro, S], [0, 1], {...clamp, easing: passada});
    p.ang += 50 * (1 - t);
    p.opacidade *= interpolate(t, [0, 0.45], [0, 1], clamp);
    p.borrao += 4 * Math.sin(Math.PI * t);
  } else if (tipo === 'pontos') {
    // dot-reveal: a cena nasce de uma grade de pontos de luz que crescem até se fundir
    const t = interpolate(f, [S - 14, S], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
    if (t < 1) {
      const r = 18.5 * t;
      const m = `radial-gradient(circle, #000 ${r}px, transparent ${r + 1.2}px)`;
      p.mascara = {WebkitMaskImage: m, maskImage: m, WebkitMaskSize: '24px 24px', maskSize: '24px 24px'};
    }
  } else if (tipo === 'borboleta') {
    const t = interpolate(f, [S - DURACAO.borboleta, S], [0, 1], {...clamp, easing: passada});
    if (t < 1) {
      const b = voo(t);
      p.mascara = {clipPath: `circle(${40 + 2100 * t}px at ${b.x}px ${b.y}px)`};
    }
  } else {
    const t = interpolate(f, [S - 8, S + 6], [0, 1], {...clamp, easing: chegada});
    p.opacidade *= t;
    p.borrao += 10 * (1 - t);
  }
};

const sair = (p: Pose, tipo: Entrada, f: number, S: number) => {
  if (tipo === 'nevoa') {
    const t = interpolate(f, [S - 22, S - 6], [0, 1], {...clamp, easing: acelera});
    p.borrao += 18 * t;
    p.opacidade *= 1 - t;
  } else if (tipo === 'giro') {
    const t = interpolate(f, [S - DURACAO.giro, S], [0, 1], {...clamp, easing: passada});
    p.ang -= 50 * t;
    p.opacidade *= interpolate(t, [0.55, 1], [1, 0], clamp);
    p.borrao += 4 * Math.sin(Math.PI * t);
  } else if (tipo === 'pontos') {
    const t = interpolate(f, [S - 18, S - 8], [0, 1], {...clamp, easing: acelera});
    p.borrao += 10 * t;
    p.opacidade *= 1 - t;
  } else if (tipo === 'borboleta') {
    // some exatamente onde o círculo da borboleta abre (as cenas não têm fundo próprio)
    const t = interpolate(f, [S - DURACAO.borboleta, S], [0, 1], {...clamp, easing: passada});
    if (t >= 1) p.opacidade = 0;
    else if (t > 0) {
      const v = voo(t);
      const r = 40 + 2100 * t;
      const m = `radial-gradient(circle at ${v.x}px ${v.y}px, transparent ${r}px, #000 ${r + 2}px)`;
      p.mascara = {WebkitMaskImage: m, maskImage: m};
    }
  } else {
    const t = interpolate(f, [S - VIAGEM, S - 8], [0, 1], {...clamp, easing: acelera});
    p.borrao += 10 * t;
    p.opacidade *= 1 - t;
  }
};

// Movimento de câmera dentro da cena: zoom lento ou órbita (a câmera gira em volta do texto)
const camera = (tipo: Camera, f: number, S: number, fim: number) => {
  const p = interpolate(f, [S, fim], [0, 1], clamp);
  if (tipo === 'zoom') return `scale(${1 + 0.07 * p})`;
  return `rotateY(${-7 + 14 * p}deg) rotateX(${2.5 * Math.sin(Math.PI * p)}deg) scale(${1 + 0.03 * p})`;
};

// Crossover: a palavra viaja de uma cena para o título da seguinte, com desfoque no meio do caminho
const Viajante: React.FC<{f: number; S: number; texto: string; deY: number; deTam: number; paraY: number; paraTam: number}> = ({f, S, texto, deY, deTam, paraY, paraTam}) => {
  if (f < S - VIAGEM || f > S + 6) return null;
  const t = interpolate(f, [S - VIAGEM, S + 2], [0, 1], {...clamp, easing: passada});
  const tam = deTam + (paraTam - deTam) * t;
  const y = deY + (paraY - deY) * t - Math.sin(Math.PI * t) * 40;
  const opacidade = interpolate(f, [S - VIAGEM, S - VIAGEM + 4, S + 2, S + 6], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y - paraTam / 2, display: 'flex', justifyContent: 'center', transformOrigin: `50% ${paraTam / 2}px`, scale: `${tam / paraTam}`, opacity: opacidade, filter: `blur(${6 * Math.sin(Math.PI * t)}px)`}}>
      <Palavra3D texto={texto} tamanho={paraTam} />
    </div>
  );
};

const Efeito: React.FC<{arquivo: string; pico: number; rapido: number; volume: number}> = ({arquivo, pico, rapido, volume}) => (
  <Sequence from={rapido + 1 - pico} layout="none">
    <Audio src={staticFile(arquivo)} volume={volume} />
  </Sequence>
);

export const NevoaLupica: React.FC = () => {
  const f = useCurrentFrame();
  const nevoaGancho = useAjuste('NÉVOA', NEVOA_GANCHO.largura, NEVOA_GANCHO.maximo);
  const nevoaDefinicao = useAjuste('NÉVOA', NEVOA_DEFINICAO.largura, NEVOA_DEFINICAO.maximo);
  const fadigaCena = useAjuste('FADIGA', FADIGA_CENA.largura, FADIGA_CENA.maximo);

  // Névoa: densa no começo, véu por cima nas trocas de névoa, e se dissipa na última cena
  let neblina = 0;
  CENAS_ROTEIRO.forEach((c, k) => {
    if (c.entrada !== 'nevoa' || k === 0) return;
    const t = interpolate(f, [INICIOS[k] - DURACAO.nevoa, INICIOS[k]], [0, 1], clamp);
    neblina = Math.max(neblina, Math.sin(Math.PI * t));
  });
  const base = f < INICIOS[N - 1] ? interpolate(f, [0, INICIOS[0], INICIOS[1] - 20, INICIOS[1] + 10], [0.6, 1, 1, 0.45], clamp) : interpolate(f, [INICIOS[N - 1], FIM], [0.45, 0], clamp);
  const densidade = Math.max(base, 0.4 * (f < INICIOS[N - 1] ? 1 : 0) + 0.6 * neblina);
  const focoFundo = Math.max(0.8 * neblina, interpolate(f, [INICIOS[N - 1] + 40, FIM], [0, 1], clamp));

  // Indicador de pontos: anda a cada troca
  let posicao = 0;
  CENAS_ROTEIRO.forEach((c, k) => {
    if (k > 0) posicao += interpolate(f, [INICIOS[k] - DURACAO[c.entrada], INICIOS[k]], [0, 1], clamp);
  });
  const pontosOpacidade = interpolate(f, [INICIOS[0] - 6, INICIOS[0] + 6, FIM - 20, FIM - 8], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill>
      <Fundo orbita />
      <Revoada foco={focoFundo} />
      <Nevoa densidade={densidade} />

      <div style={{position: 'absolute', inset: 0, perspective: 1800, perspectiveOrigin: ORIGEM}}>
        {CENAS_ROTEIRO.map((c, k) => {
          const S = INICIOS[k];
          const proxima = k + 1 < N ? INICIOS[k + 1] : FIM;
          const tipoSaida: Entrada = k + 1 < N ? CENAS_ROTEIRO[k + 1].entrada : 'nevoa';
          if (f < S - DURACAO[c.entrada] - 2 || f > proxima + 2) return null;
          const p: Pose = {ang: 0, opacidade: 1, borrao: 0};
          entrar(p, c.entrada, f, S);
          sair(p, tipoSaida, f, proxima);
          if (p.opacidade <= 0.001) return null;
          const Componente = CENAS[c.id];
          return (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                inset: 0,
                transformOrigin: ORIGEM,
                transform: p.ang ? `translateZ(${-RAIO_GIRO}px) rotateY(${p.ang}deg) translateZ(${RAIO_GIRO}px)` : undefined,
                perspective: 1600,
                perspectiveOrigin: ORIGEM,
                opacity: p.opacidade,
                filter: p.borrao > 0.2 ? `blur(${p.borrao}px)` : undefined,
                ...p.mascara,
              }}
            >
              <div style={{position: 'absolute', inset: 0, transformOrigin: ORIGEM, transform: camera(c.camera, f, S, proxima)}}>
                <Componente f={f} inicio={S} fim={proxima} camera={c.camera} adianta={ADIANTA[c.entrada]} />
              </div>
            </div>
          );
        })}
      </div>

      <Veu intensidade={neblina} />
      {nevoaGancho && nevoaDefinicao ? <Viajante f={f} S={INICIOS[1]} texto="NÉVOA" deY={NEVOA_GANCHO.y} deTam={nevoaGancho} paraY={NEVOA_DEFINICAO.y} paraTam={nevoaDefinicao} /> : null}
      {fadigaCena ? <Viajante f={f} S={INICIOS[4]} texto="FADIGA" deY={FADIGA_ANEL.y} deTam={FADIGA_ANEL.tamanho} paraY={FADIGA_CENA.y} paraTam={fadigaCena} /> : null}
      {CENAS_ROTEIRO.map((c, k) => (c.entrada === 'borboleta' ? <Travessia key={c.id} f={f} pouso={INICIOS[k]} /> : null))}
      <Pontos n={N} posicao={posicao} opacidade={pontosOpacidade} y={1380} />
      <MarcaAbertura retorno={POUSO} />

      {/* Som: trilha, marca sonora da abertura e efeitos só onde a imagem pede */}
      <Audio src={staticFile('trilha-nevoa.wav')} />
      <SomAbertura />
      <Sequence from={INICIOS[3] - 5} durationInFrames={60} layout="none">
        <Audio src={staticFile('sfx/whoosh-cinematic.mp3')} volume={(t) => interpolate(t, [0, 40, 60], [0.3, 0.3, 0], clamp)} />
      </Sequence>
      {CENAS_ROTEIRO.map((c, k) => {
        if (k === 0) return null;
        const S = INICIOS[k];
        const giros = CENAS_ROTEIRO.slice(1, k).filter((x) => x.entrada === 'giro').length;
        if (c.entrada === 'giro') return <Efeito key={c.id} arquivo={giros % 2 ? 'sfx/whoosh-grave.mp3' : 'sfx/whoosh.mp3'} pico={5} rapido={S - 8} volume={0.5} />;
        if (c.entrada === 'pontos') return <Efeito key={c.id} arquivo="sfx/sparkle.mp3" pico={3} rapido={S - 2} volume={0.4} />;
        if (c.entrada === 'cruzamento') return <Efeito key={c.id} arquivo="sfx/whoosh-grave.mp3" pico={5} rapido={S - 9} volume={0.35} />;
        if (c.entrada === 'borboleta')
          return (
            <Sequence key={c.id} layout="none">
              <Efeito arquivo="sfx/whoosh-grave.mp3" pico={5} rapido={S - 11} volume={0.5} />
              <Efeito arquivo="sfx/sparkle.mp3" pico={3} rapido={S - 9} volume={0.35} />
            </Sequence>
          );
        return null;
      })}
    </AbsoluteFill>
  );
};
