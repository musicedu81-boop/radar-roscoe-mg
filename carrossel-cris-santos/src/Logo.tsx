import {fitText} from '@remotion/layout-utils';
import {useEffect, useState} from 'react';
import {AbsoluteFill, Sequence, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';
import {Borboleta, bater} from './Borboleta';
import {fontesCarregadas} from './fonte';
import {C, FAMILIA, FONTE, NOME, SLOGAN, chegada, clamp, textoMarca, vaiVem} from './tokens';

// Tamanho de fonte para o nome ocupar a largura pedida (espera a Montserrat carregar)
export const useTamanhoNome = (largura: number) => {
  const [fs, setFs] = useState<number | null>(null);
  const [espera] = useState(() => delayRender('Medindo o nome da marca'));
  useEffect(() => {
    fontesCarregadas.then(() => {
      setFs(fitText({text: NOME, withinWidth: largura, fontFamily: FAMILIA, fontWeight: '900', letterSpacing: '0.02em'}).fontSize);
      continueRender(espera);
    });
  }, [espera, largura]);
  return fs;
};

// Momentos da assinatura, em frames a partir do início da Sequence
export const ASSINATURA = {escritaIni: 10, escritaFim: 46, pouso: 56, slogan: 50, duracao: 135};

// Borboleta como lápis: posição pura em função do frame (permite desenhar o rastro).
// x em % da largura do nome mais um ajuste em px; y em px a partir do topo do nome.
const posBorboleta = (f: number, fs: number) => {
  const A = ASSINATURA;
  const p = interpolate(f, [A.escritaIni, A.escritaFim], [0, 1], {...clamp, easing: vaiVem});
  const bob = Math.sin(f / 4.5) * 0.12 * fs;
  let pct = p * 100;
  let dx = 0;
  let dy = -0.62 * fs + bob - Math.sin(p * Math.PI * 9) * 0.18 * fs;
  // Entrada: arco vindo de baixo, pela esquerda, até a ponta do lápis
  const e = interpolate(f, [0, A.escritaIni + 2], [0, 1], {...clamp, easing: chegada});
  const u = 1 - e;
  dx = u * u * -420 + 2 * u * e * -160 + e * e * dx;
  dy = u * u * (7 * fs) + 2 * u * e * (2.4 * fs) + e * e * dy;
  // Pousa sobre o S final
  const pouso = interpolate(f, [A.escritaFim, A.pouso], [0, 1], {...clamp, easing: vaiVem});
  pct = pct + (100 - pct) * pouso;
  dx = dx + (-0.36 * fs - dx) * pouso;
  dy = dy + (-0.5 * fs + Math.sin(f / 9) * 0.02 * fs - dy) * pouso;
  const tamanho = fs * interpolate(pouso, [0, 1], [1.9, 1.75]);
  return {pct, dx, dy, tamanho, p, pouso};
};

// Assinatura animada: a borboleta escreve o nome, risca a linha, pousa no S e o slogan entra.
// complementos: opacidade da linha e do slogan (a abertura os tira antes de levar o nome para o topo).
export const AssinaturaAnimada: React.FC<{largura?: number; centroY: number; complementos?: number}> = ({largura = 900, centroY, complementos = 1}) => {
  const f = useCurrentFrame();
  const fs = useTamanhoNome(largura);
  if (fs === null) return null;
  const A = ASSINATURA;
  const b = posBorboleta(f, fs);
  const suave = fs * 0.45 * (1 - b.p);
  const linha = interpolate(f, [A.escritaIni + 2, A.escritaFim + 6], [0, 1], {...clamp, easing: vaiVem});
  const sl = interpolate(f, [A.slogan, A.slogan + 6], [0, 1], clamp);
  const espaco = interpolate(f, [A.slogan, A.slogan + 14], [0.62, 0.42], {...clamp, easing: chegada});

  // Rastro de brilho: posições passadas da borboleta
  const rastro = Array.from({length: 16}, (_, k) => {
    const t = f - (k + 1) * 1.6;
    if (t < 0 || f > A.pouso + 20) return null;
    const q = posBorboleta(t, fs);
    const vida = 1 - k / 16;
    const fade = interpolate(f, [A.pouso, A.pouso + 20], [1, 0], clamp);
    const r = (2 + 2.5 * vida) * (fs / 60);
    return (
      <div
        key={k}
        style={{
          position: 'absolute',
          left: `calc(${q.pct}% + ${q.dx - r}px)`,
          top: q.dy + 0.25 * fs - r,
          width: 2 * r,
          height: 2 * r,
          borderRadius: '50%',
          background: C.creme,
          opacity: 0.8 * vida * fade,
          boxShadow: `0 0 ${r * 5}px ${C.lavanda}`,
        }}
      />
    );
  });

  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: centroY - fs * 0.65, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{position: 'relative'}}>
        {/* O halo fica no invólucro: se ficasse no texto mascarado, a máscara cortaria o brilho num retângulo */}
        <div style={{filter: `drop-shadow(0 0 ${0.3 * fs}px ${C.claro}88)`}}>
          <div
            style={{
              ...textoMarca(fs),
              WebkitMaskImage: `linear-gradient(90deg, #000 calc(${b.p * 100}% - ${suave}px), transparent ${b.p * 100}%)`,
              maskImage: `linear-gradient(90deg, #000 calc(${b.p * 100}% - ${suave}px), transparent ${b.p * 100}%)`,
            }}
          >
            {NOME}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: -0.5 * fs,
            top: 1.24 * fs,
            width: `calc((100% + ${fs}px) * ${linha})`,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${C.lavanda}, ${C.creme})`,
            boxShadow: `0 0 12px ${C.claro}`,
            opacity: complementos,
          }}
        />
        {rastro}
        <div style={{position: 'absolute', left: `calc(${b.pct}% + ${b.dx - b.tamanho / 2}px)`, top: b.dy + 0.25 * fs - b.tamanho / 2, rotate: `${(1 - b.pouso) * Math.sin(f / 6) * 8 + b.pouso * 14}deg`}}>
          <Borboleta tamanho={b.tamanho} abertura={bater(f, interpolate(f, [A.pouso - 4, A.pouso + 8], [0, 1], clamp))} />
        </div>
      </div>
      <div
        style={{
          marginTop: 0.42 * fs,
          paddingLeft: `${espaco}em`,
          fontFamily: FONTE,
          fontWeight: 500,
          fontSize: Math.max(30, 0.5 * fs),
          letterSpacing: `${espaco}em`,
          color: C.lavanda,
          whiteSpace: 'pre',
          opacity: sl * complementos,
          filter: `blur(${8 * (1 - sl * complementos)}px)`,
        }}
      >
        {SLOGAN}
      </div>
    </div>
  );
};

// Selo da marca para o canto das cenas: borboleta pousada e o nome
export const Selo: React.FC<{fs?: number; opacidade?: number}> = ({fs = 30, opacidade = 1}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: fs * 0.3, opacity: opacidade}}>
      <div style={{rotate: '-12deg', marginTop: -fs * 0.2}}>
        <Borboleta tamanho={fs * 1.6} abertura={bater(f, 1)} brilho={0.45} />
      </div>
      <div style={{filter: `drop-shadow(0 0 ${0.35 * fs}px ${C.claro}aa)`}}>
        <div style={textoMarca(fs)}>{NOME}</div>
      </div>
    </div>
  );
};

// Abertura do motion: a assinatura já começa em voo (o frame 0 nunca fica vazio), segura para leitura
// e depois encolhe até o topo, onde fica como selo durante as cenas (o resultado é levado para a cena seguinte).
export const MARCA = {atraso: 8, saida: 105, duracaoSaida: 18, centroY: 880, seloY: 238, seloEscala: 0.5};

// retorno: frame em que o selo volta ao centro como assinatura completa (fecho do vídeo)
export const MarcaAbertura: React.FC<{retorno?: number}> = ({retorno}) => {
  const f = useCurrentFrame();
  const M = MARCA;
  const ida = interpolate(f, [M.saida, M.saida + M.duracaoSaida], [0, 1], {...clamp, easing: vaiVem});
  const volta = retorno === undefined ? 0 : interpolate(f, [retorno - M.duracaoSaida, retorno], [0, 1], {...clamp, easing: vaiVem});
  const s = ida * (1 - volta);
  const borrao = 6 * (volta > 0 ? Math.sin(Math.PI * volta) : Math.sin(Math.PI * ida));
  // linha e slogan saem antes da subida e voltam com borrão depois do retorno
  const complementos = retorno !== undefined && f >= retorno ? interpolate(f, [retorno, retorno + 8], [0, 1], clamp) : interpolate(f, [M.saida, M.saida + 6], [1, 0], clamp);
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `540px ${M.centroY}px`,
        scale: `${1 + (M.seloEscala - 1) * s}`,
        translate: `0px ${(M.seloY - M.centroY) * s}px`,
        filter: borrao > 0.05 ? `blur(${borrao}px)` : undefined,
      }}
    >
      <Sequence from={-M.atraso} layout="none">
        <AssinaturaAnimada centroY={M.centroY} complementos={complementos} />
      </Sequence>
    </AbsoluteFill>
  );
};
