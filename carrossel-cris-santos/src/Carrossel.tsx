import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SomAbertura} from './Abertura';
import {Cartao, CAIXA, DURACAO_TROCA, type Troca} from './Cartao';
import {Anel3D} from './efeitos/Anel3D';
import {Revoada} from './efeitos/Borboletas3D';
import {Grade, destinoNaGrade, slidesDaGrade} from './efeitos/Grade';
import {Travessia} from './efeitos/Travessia';
import {Fundo} from './Fundo';
import {LINHA, SLIDES} from './linha';
import {MARCA, MarcaAbertura} from './Logo';
import {Pontos} from './Pontos';
import {clamp} from './tokens';

const TROCAS = LINHA.trocas as Troca[];
// O carrossel 3D entra quando a logo começa a subir para o canto e para de girar uma batida antes do primeiro pouso
const ANEL_INICIO = MARCA.saida - 5;
const ANEL_PARADA = LINHA.pousos.length ? LINHA.pousos[0] - 25 : 0;
// A grade segura uma batida e então recua, enquanto a logo volta ao centro
const RECUO_GRADE = LINHA.pousoAssinatura - 18;

// Pico de cada efeito no arquivo, em frames: o som cai 1 frame depois do frame mais rápido da imagem
const SOM = {
  whoosh: {arquivo: 'sfx/whoosh.mp3', pico: 5},
  whooshGrave: {arquivo: 'sfx/whoosh-grave.mp3', pico: 5},
  brilho: {arquivo: 'sfx/sparkle.mp3', pico: 3},
};

const Efeito: React.FC<{som: keyof typeof SOM; rapido: number; volume: number}> = ({som, rapido, volume}) => (
  <Sequence from={rapido + 1 - SOM[som].pico} layout="none">
    <Audio src={staticFile(SOM[som].arquivo)} volume={volume} />
  </Sequence>
);

export const Carrossel: React.FC = () => {
  const f = useCurrentFrame();
  const {pousos, saidaUltimo, pousoAssinatura} = LINHA;
  const n = SLIDES.length;
  const grade = slidesDaGrade(SLIDES);

  // Foco do fundo: a câmera puxa o foco para a revoada no meio das trocas de foco e volta para o slide
  let focoFundo = 0;
  TROCAS.forEach((tipo, k) => {
    if (tipo !== 'foco') return;
    const t = interpolate(f, [pousos[k + 1] - 14, pousos[k + 1]], [0, 1], clamp);
    focoFundo = Math.max(focoFundo, 0.8 * Math.sin(Math.PI * t));
  });

  // Indicador: anda junto com cada troca
  let posicao = 0;
  TROCAS.forEach((tipo, k) => {
    posicao += interpolate(f, [pousos[k + 1] - DURACAO_TROCA[tipo], pousos[k + 1]], [0, 1], clamp);
  });
  const pontosOpacidade = n ? interpolate(f, [pousos[0] - 6, pousos[0] + 6, saidaUltimo - 25, saidaUltimo - 15], [0, 1, 1, 0], clamp) : 0;

  return (
    <AbsoluteFill>
      <Fundo orbita />
      <Revoada foco={focoFundo} />

      {/* A grade fica por baixo: o último slide encolhe por cima dela até a sua casa */}
      <Grade slides={SLIDES} f={f} saidaUltimo={saidaUltimo} recuo={RECUO_GRADE} />

      {/* Palco 3D: o anel da abertura e os slides dividem a mesma perspectiva */}
      <div style={{position: 'absolute', inset: 0, perspective: 1800, perspectiveOrigin: `${CAIXA.cx}px ${CAIXA.cy}px`, transformStyle: 'preserve-3d'}}>
        <Anel3D slides={SLIDES} f={f} inicio={ANEL_INICIO} parada={ANEL_PARADA} entrega={pousos[0] ?? 0} />
        {SLIDES.map((slide, i) => {
          const pouso = pousos[i];
          const ultimo = i === n - 1;
          const saida = ultimo ? saidaUltimo : pousos[i + 1];
          const entrada = i === 0 ? 'anel' : TROCAS[i - 1];
          const duracaoEntrada = i === 0 ? 15 : DURACAO_TROCA[TROCAS[i - 1]];
          if (f < pouso - duracaoEntrada || f > (ultimo ? saidaUltimo - 5 : saida + 1)) return null;
          const k = grade.findIndex((g) => g.i === i);
          return (
            <Cartao
              key={slide.arquivo}
              slide={slide}
              f={f}
              pouso={pouso}
              saida={saida}
              entrada={entrada}
              saidaTipo={ultimo ? 'grade' : TROCAS[i]}
              grade={ultimo && k >= 0 ? destinoNaGrade(slide, k, grade.length) : undefined}
            />
          );
        })}
      </div>

      {TROCAS.map((tipo, k) => (tipo === 'borboleta' ? <Travessia key={k} f={f} pouso={pousos[k + 1]} /> : null))}
      <Pontos n={n} posicao={posicao} opacidade={pontosOpacidade} y={CAIXA.cy + CAIXA.altura / 2 + 46} />
      <MarcaAbertura retorno={pousoAssinatura} />

      {/* Som: trilha, marca sonora da abertura e efeitos só onde a imagem pede (poucos e exatos) */}
      <Audio src={staticFile('trilha.wav')} />
      <SomAbertura />
      {n > 0 ? (
        <Sequence from={ANEL_INICIO} durationInFrames={60} layout="none">
          <Audio src={staticFile('sfx/whoosh-cinematic.mp3')} volume={(t) => interpolate(t, [0, 40, 60], [0.35, 0.35, 0], clamp)} />
        </Sequence>
      ) : null}
      {TROCAS.map((tipo, k) => {
        const T = pousos[k + 1];
        const giros = TROCAS.slice(0, k).filter((x) => x === 'giro').length;
        if (tipo === 'giro') return <Efeito key={k} som={giros % 2 ? 'whooshGrave' : 'whoosh'} rapido={T - 8} volume={0.5} />;
        if (tipo === 'pontos') return <Efeito key={k} som="brilho" rapido={T - 2} volume={0.4} />;
        if (tipo === 'borboleta')
          return (
            <Sequence key={k} layout="none">
              <Efeito som="whooshGrave" rapido={T - 11} volume={0.5} />
              <Efeito som="brilho" rapido={T - 9} volume={0.35} />
            </Sequence>
          );
        return null;
      })}
      {n > 1 ? <Efeito som="whooshGrave" rapido={saidaUltimo - 15} volume={0.4} /> : null}
    </AbsoluteFill>
  );
};
