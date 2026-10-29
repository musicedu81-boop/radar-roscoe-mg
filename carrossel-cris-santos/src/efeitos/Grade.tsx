import {Img, interpolate, staticFile} from 'remotion';
import {CAIXA, medida} from '../Cartao';
import type {Slide} from '../linha';
import {C, chegada, clamp} from '../tokens';

// Grade do fim (place-in-grid da skill de efeitos): até 9 slides em 3 colunas, o último encolhe para a sua casa.
// Com mais de 9 slides, a nona casa fica com o último.
export const CASA = {largura: 250, altura: 312, vao: 26};

export const slidesDaGrade = (slides: Slide[]) => (slides.length <= 9 ? slides.map((s, i) => ({s, i})) : [...slides.slice(0, 8).map((s, i) => ({s, i})), {s: slides[slides.length - 1], i: slides.length - 1}]);

export const posicaoNaGrade = (k: number, total: number) => {
  const colunas = Math.min(3, total);
  const linhas = Math.ceil(total / colunas);
  const linha = Math.floor(k / colunas);
  const naLinha = Math.min(colunas, total - linha * colunas);
  const col = k % colunas;
  const x = (col - (naLinha - 1) / 2) * (CASA.largura + CASA.vao);
  const y = (linha - (linhas - 1) / 2) * (CASA.altura + CASA.vao);
  return {x, y};
};

// Deslocamento e escala que levam o slide de leitura até a sua casa
export const destinoNaGrade = (s: Slide, k: number, total: number) => {
  const {w, h} = medida(s);
  const {x, y} = posicaoNaGrade(k, total);
  return {x, y, escala: Math.min(CASA.largura / w, CASA.altura / h)};
};

// As outras casas chegam em cascata enquanto o último encolhe; no fim, a grade recua e desfoca (o foco passa para a logo)
export const Grade: React.FC<{slides: Slide[]; f: number; saidaUltimo: number; recuo: number}> = ({slides, f, saidaUltimo, recuo}) => {
  const casas = slidesDaGrade(slides);
  if (f < saidaUltimo - 25 || casas.length < 2) return null;
  const r = interpolate(f, [recuo, recuo + 18], [0, 1], {...clamp, easing: chegada});
  return (
    <div style={{position: 'absolute', inset: 0, scale: `${1 - 0.1 * r}`, filter: r > 0.01 ? `blur(${10 * r}px) brightness(${1 - 0.55 * r})` : undefined, opacity: 1 - 0.45 * r}}>
      {casas.map(({s, i}, k) => {
        const ultimo = i === slides.length - 1;
        // o último é desenhado pelo cartão até chegar na casa; daí em diante, a grade assume
        if (ultimo && f < saidaUltimo - 5) return null;
        const {w, h} = medida(s);
        const d = destinoNaGrade(s, k, casas.length);
        const chega = ultimo ? 1 : interpolate(f, [saidaUltimo - 22 + k * 2, saidaUltimo - 8 + k * 2], [0, 1], {...clamp, easing: chegada});
        return (
          <div
            key={s.arquivo}
            style={{
              position: 'absolute',
              left: CAIXA.cx - w / 2,
              top: CAIXA.cy - h / 2,
              width: w,
              height: h,
              translate: `${d.x}px ${d.y + (1 - chega) * 60}px`,
              scale: `${d.escala * (0.85 + 0.15 * chega)}`,
              opacity: chega,
            }}
          >
            <div style={{width: w, height: h, borderRadius: 26, overflow: 'hidden', boxShadow: `0 30px 70px rgba(13,2,21,0.6), 0 0 0 3px ${C.lavanda}66`}}>
              <Img src={staticFile(s.arquivo)} style={{width: w, height: h, display: 'block'}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
