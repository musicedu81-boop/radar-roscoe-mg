import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SomAbertura} from './Abertura';
import {Cartao, CAIXA, type Troca} from './Cartao';
import {Fundo} from './Fundo';
import {DESLIZE, LINHA, SLIDES} from './linha';
import {MarcaAbertura} from './Logo';
import {Pontos} from './Pontos';
import {chegada, clamp} from './tokens';

// Tipo de cada troca: o deslize do próprio carrossel, e a cada três trocas o slide sai levantando
// de cima da pilha (variação com causa: o mesmo gesto de passar o post, em duas versões)
const trocaDepois = (i: number): Troca => (i === SLIDES.length - 1 ? 'fecho' : i % 3 === 2 ? 'pilha' : 'deslize');

// Pico do whoosh no arquivo, em frames (0,16s e 0,18s): o som cai 1 frame depois do frame mais rápido
const WHOOSH = [
  {arquivo: 'sfx/whoosh.mp3', pico: 5},
  {arquivo: 'sfx/whoosh-grave.mp3', pico: 5},
];

export const Carrossel: React.FC = () => {
  const f = useCurrentFrame();
  const {pousos, saidaUltimo, pousoAssinatura} = LINHA;

  // Posição contínua do indicador: anda junto com cada troca
  let posicao = 0;
  pousos.forEach((p, i) => {
    if (i > 0) posicao += interpolate(f, [p - DESLIZE, p], [0, 1], {...clamp, easing: chegada});
  });
  const pontosOpacidade = SLIDES.length ? interpolate(f, [pousos[0] - 6, pousos[0] + 6, saidaUltimo - 10, saidaUltimo], [0, 1, 1, 0], clamp) : 0;

  // Frames das trocas (o frame mais rápido de cada uma fica ~6 frames antes do pouso)
  const trocas = [...pousos, saidaUltimo];

  return (
    <AbsoluteFill>
      <Fundo orbita />
      {/* Do último para o primeiro: o slide que sai fica por cima do que entra (na pilha, o novo vem de trás) */}
      {SLIDES.map((slide, i) => ({slide, i})).reverse().map(({slide, i}) => {
        const pouso = pousos[i];
        const saida = i + 1 < SLIDES.length ? pousos[i + 1] : saidaUltimo;
        if (f < pouso - 20 || f > saida + 2) return null;
        const entrada: Troca = i === 0 ? 'deslize' : trocaDepois(i - 1) === 'pilha' ? 'pilha' : 'deslize';
        return <Cartao key={slide.arquivo} slide={slide} indice={i} f={f} pouso={pouso} saida={saida} entrada={entrada} saidaTipo={trocaDepois(i)} />;
      })}
      <Pontos n={SLIDES.length} posicao={posicao} opacidade={pontosOpacidade} y={CAIXA.cy + CAIXA.altura / 2 + 46} />
      <MarcaAbertura retorno={pousoAssinatura} />

      {/* Som: trilha de fundo, marca sonora da abertura e um whoosh por troca, alternando dois takes */}
      <Audio src={staticFile('trilha.wav')} />
      <SomAbertura />
      {trocas.map((t, k) => {
        const w = WHOOSH[k % WHOOSH.length];
        return (
          <Sequence key={t} from={t - 6 + 1 - w.pico} layout="none">
            <Audio src={staticFile(w.arquivo)} volume={0.55} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
