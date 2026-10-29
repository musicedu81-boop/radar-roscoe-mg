import {Easing, Img, interpolate, staticFile} from 'remotion';
import type {Slide} from './linha';
import {chegada, clamp, C, saida as acelera} from './tokens';

// Caixa onde o slide cabe inteiro, dentro da faixa segura do vertical (texto entre 168 e 1330 px).
// O slide é prova: mantém a proporção e nunca é cortado.
export const CAIXA = {cx: 540, cy: 812, largura: 840, altura: 1016};

// Trocas com causa (de 3 a 5 tipos no vídeo, regra do HyperFrames):
// giro: o carrossel gira um passo em 3D, como o dedo passando o post
// foco: a câmera troca o foco do slide que sai para o que entra
// pontos: o slide novo se forma de pontos de luz (dot-reveal da skill de efeitos)
// borboleta: a borboleta atravessa o quadro e abre o slide novo atrás dela
export type Troca = 'giro' | 'foco' | 'pontos' | 'borboleta';
export const DURACAO_TROCA: Record<Troca, number> = {giro: 16, foco: 22, pontos: 18, borboleta: 22};

// Anel do carrossel 3D: raio e ângulo entre dois slides vizinhos
export const ANEL = {raio: 950, passo: 52};
// Tamanho do slide da frente no anel da abertura (ele cresce até o tamanho de leitura)
export const ESCALA_ANEL = 0.6;

const passada = Easing.bezier(0.65, 0, 0.35, 1);

export const medida = (s: Slide) => {
  const k = Math.min(CAIXA.largura / s.largura, CAIXA.altura / s.altura);
  return {w: Math.round(s.largura * k), h: Math.round(s.altura * k)};
};

// Caminho da borboleta que atravessa na troca 'borboleta' (coordenadas do quadro, t de 0 a 1)
export const voo = (t: number) => {
  const u = 1 - t;
  return {x: u * u * -160 + 2 * u * t * 380 + t * t * 1260, y: u * u * 1560 + 2 * u * t * 760 + t * t * 260};
};

type Pose = {x: number; y: number; z: number; anel: number; rotX: number; escala: number; opacidade: number; borrao: number; brilho: number; mascara?: React.CSSProperties};

const prog = (f: number, fim: number, dur: number, easing = passada) => interpolate(f, [fim - dur, fim], [0, 1], {...clamp, easing});

const entrar = (p: Pose, tipo: Troca | 'anel', f: number, pouso: number, w: number, h: number) => {
  if (f >= pouso) return;
  if (tipo === 'giro') {
    const t = prog(f, pouso, DURACAO_TROCA.giro);
    p.anel += (1 - t) * ANEL.passo;
    p.opacidade *= interpolate(t, [0, 0.45], [0, 1], clamp);
    p.brilho *= 0.55 + 0.45 * t;
    p.borrao += 5 * Math.sin(Math.PI * t);
  } else if (tipo === 'foco') {
    const t = prog(f, pouso, 14, chegada);
    p.borrao += 16 * (1 - t);
    p.opacidade *= t;
    p.escala *= 1.05 - 0.05 * t;
  } else if (tipo === 'pontos') {
    // grade de pontos de 24 px que crescem até se fundir (acima de ~17 px a imagem fecha inteira)
    const t = prog(f, pouso, 14, Easing.in(Easing.quad));
    const r = 18.5 * t;
    const mascara = `radial-gradient(circle, #000 ${r}px, transparent ${r + 1.2}px)`;
    p.mascara = {WebkitMaskImage: mascara, maskImage: mascara, WebkitMaskSize: '24px 24px', maskSize: '24px 24px', WebkitMaskPosition: 'center', maskPosition: 'center'};
    p.brilho *= 1 + 0.5 * (1 - t);
  } else if (tipo === 'borboleta') {
    // íris aberta pela borboleta: o círculo nasce nela e cresce enquanto ela atravessa
    const t = prog(f, pouso, DURACAO_TROCA.borboleta);
    const b = voo(t);
    const cx = b.x - (CAIXA.cx - w / 2);
    const cy = b.y - (CAIXA.cy - h / 2);
    p.mascara = {clipPath: `circle(${40 + 1900 * t}px at ${cx}px ${cy}px)`};
  } else {
    // vem do anel da abertura: começa como o slide da frente do anel e cresce até o tamanho de leitura
    const t = prog(f, pouso, 15);
    p.escala *= ESCALA_ANEL + (1 - ESCALA_ANEL) * t;
  }
};

const sair = (p: Pose, tipo: Troca | 'grade', f: number, saida: number, grade?: {x: number; y: number; escala: number}) => {
  if (tipo === 'giro') {
    const t = prog(f, saida, DURACAO_TROCA.giro);
    p.anel -= t * ANEL.passo;
    p.opacidade *= interpolate(t, [0.55, 1], [1, 0], clamp);
    p.brilho *= 1 - 0.45 * t;
    p.borrao += 5 * Math.sin(Math.PI * t);
  } else if (tipo === 'foco') {
    const t = interpolate(f, [saida - 22, saida - 8], [0, 1], {...clamp, easing: acelera});
    p.borrao += 16 * t;
    p.opacidade *= 1 - t;
    p.escala *= 1 - 0.04 * t;
  } else if (tipo === 'pontos') {
    const t = interpolate(f, [saida - 18, saida - 8], [0, 1], {...clamp, easing: acelera});
    p.borrao += 10 * t;
    p.brilho *= 1 - 0.5 * t;
    p.opacidade *= 1 - t;
  } else if (tipo === 'borboleta') {
    // fica embaixo enquanto a íris abre e some no fim (se for mais largo que o novo, a borda não aparece)
    const t = prog(f, saida, DURACAO_TROCA.borboleta);
    p.brilho *= 1 - 0.3 * t;
    p.opacidade *= interpolate(t, [0.6, 0.95], [1, 0], clamp);
  } else if (grade) {
    // encolhe até a sua casa na grade 3x3 do fim (place-in-grid da skill de efeitos)
    const t = interpolate(f, [saida - 25, saida - 5], [0, 1], {...clamp, easing: passada});
    p.x += grade.x * t;
    p.y += grade.y * t;
    p.escala *= 1 + (grade.escala - 1) * t;
  }
};

// Um slide do carrossel: entra no pouso, fica parado (o mundo atrás é que se mexe) e sai na troca seguinte
export const Cartao: React.FC<{
  slide: Slide;
  f: number;
  pouso: number;
  saida: number;
  entrada: Troca | 'anel';
  saidaTipo: Troca | 'grade';
  grade?: {x: number; y: number; escala: number};
}> = ({slide, f, pouso, saida, entrada, saidaTipo, grade}) => {
  const {w, h} = medida(slide);
  const p: Pose = {x: 0, y: 0, z: 0, anel: 0, rotX: 0, escala: 1, opacidade: 1, borrao: 0, brilho: 1};
  entrar(p, entrada, f, pouso, w, h);
  sair(p, saidaTipo, f, saida, grade);
  if (p.opacidade <= 0.001) return null;
  const R = ANEL.raio;
  const filtros = [p.borrao > 0.2 ? `blur(${p.borrao}px)` : '', p.brilho !== 1 ? `brightness(${p.brilho})` : ''].filter(Boolean).join(' ');
  return (
    <div
      style={{
        position: 'absolute',
        left: CAIXA.cx - w / 2,
        top: CAIXA.cy - h / 2,
        width: w,
        height: h,
        transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px) translateZ(${-R}px) rotateY(${p.anel}deg) translateZ(${R}px) rotateX(${p.rotX}deg) scale(${p.escala})`,
        opacity: p.opacidade,
        filter: filtros || undefined,
        ...p.mascara,
      }}
    >
      <div style={{width: w, height: h, borderRadius: 26, overflow: 'hidden', boxShadow: `0 40px 90px rgba(13,2,21,0.65), 0 0 0 1.5px ${C.lavanda}55`}}>
        <Img src={staticFile(slide.arquivo)} style={{width: w, height: h, display: 'block'}} />
      </div>
    </div>
  );
};
