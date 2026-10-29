import {Easing, Img, interpolate, staticFile} from 'remotion';
import {DESLIZE, type Slide} from './linha';
import {C, chegada, clamp, saida as acelera} from './tokens';

// Caixa onde o slide cabe inteiro, dentro da faixa segura do vertical (texto entre 168 e 1330 px).
// O slide é prova: mantém a proporção e nunca é cortado.
export const CAIXA = {cx: 540, cy: 812, largura: 840, altura: 1016};

export type Troca = 'deslize' | 'pilha' | 'fecho';

// Deslize do carrossel: os dois slides andam juntos, lado a lado, como o dedo passando o post.
// Rápido no meio da troca (é ali que o borrão e o whoosh caem) e assentando no pouso.
// Longe o bastante para o slide da vez ficar todo fora do quadro antes e depois da troca
const DISTANCIA = 1000;
const passada = Easing.bezier(0.7, 0, 0.25, 1);
const deslize = (f: number, troca: number) => interpolate(f, [troca - DESLIZE, troca], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: passada});

const medida = (s: Slide) => {
  const k = Math.min(CAIXA.largura / s.largura, CAIXA.altura / s.altura);
  return {w: Math.round(s.largura * k), h: Math.round(s.altura * k)};
};

// Um slide do carrossel: entra no pouso, fica parado (o mundo atrás é que se mexe) e sai na troca seguinte
export const Cartao: React.FC<{slide: Slide; indice: number; f: number; pouso: number; saida: number; entrada: Troca; saidaTipo: Troca}> = ({slide, indice, f, pouso, saida, entrada, saidaTipo}) => {
  const {w, h} = medida(slide);
  let x = 0;
  let y = 0;
  let giro = 0;
  let escala = 1;
  let opacidade = 1;
  let brilho = 1;
  let borraoX = 0;
  let borrao = 0;

  // Entrada
  if (entrada === 'deslize') {
    const p = deslize(f, pouso);
    x += (1 - p) * DISTANCIA;
    borraoX += 18 * 4 * p * (1 - p);
  } else if (entrada === 'pilha') {
    const p = interpolate(f, [pouso - 16, pouso], [0, 1], {...clamp, easing: chegada});
    escala *= 0.9 + 0.1 * p;
    y += (1 - p) * 40;
    brilho *= 0.55 + 0.45 * p;
  }

  // Saída: 40% mais curta que a entrada
  if (saidaTipo === 'deslize') {
    const p = deslize(f, saida);
    x -= p * DISTANCIA;
    borraoX += 18 * 4 * p * (1 - p);
  } else if (saidaTipo === 'pilha') {
    const p = interpolate(f, [saida - 14, saida - 4], [0, 1], {...clamp, easing: acelera});
    x -= p * 140;
    y -= p * 190;
    giro -= p * 7;
    escala *= 1 + 0.05 * p;
    opacidade *= 1 - p;
  } else {
    const p = interpolate(f, [saida - 12, saida], [0, 1], {...clamp, easing: acelera});
    escala *= 1 - 0.15 * p;
    opacidade *= 1 - p;
    borrao += 8 * p;
  }

  const id = `rastro-${indice}`;
  const filtros = [borraoX > 0.3 ? `url(#${id})` : '', borrao > 0.3 ? `blur(${borrao}px)` : '', brilho < 0.999 ? `brightness(${brilho})` : ''].filter(Boolean).join(' ');
  return (
    <>
      {/* Borrão só na horizontal, no sentido do deslize */}
      <svg style={{position: 'absolute', width: 0, height: 0}}>
        <filter id={id} x="-20%" y="0" width="140%" height="100%">
          <feGaussianBlur stdDeviation={`${borraoX} 0`} />
        </filter>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: CAIXA.cx - w / 2,
          top: CAIXA.cy - h / 2,
          width: w,
          height: h,
          borderRadius: 26,
          overflow: 'hidden',
          translate: `${x}px ${y}px`,
          rotate: `${giro}deg`,
          scale: `${escala}`,
          opacity: opacidade,
          filter: filtros || undefined,
          boxShadow: `0 40px 90px rgba(13,2,21,0.65), 0 0 0 1.5px ${C.lavanda}55`,
        }}
      >
        <Img src={staticFile(slide.arquivo)} style={{width: w, height: h, display: 'block'}} />
      </div>
    </>
  );
};
