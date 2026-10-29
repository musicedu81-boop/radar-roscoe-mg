import {interpolate} from 'remotion';
import {C, FONTE, clamp} from '../tokens';

// Palavras de um texto; trechos entre asteriscos (*assim*) são destaque em lavanda
export const palavras = (texto: string) => {
  const saida: {p: string; destaque: boolean}[] = [];
  let destaque = false;
  for (const bruto of texto.split(/\s+/).filter(Boolean)) {
    let p = bruto;
    const abre = p.startsWith('*');
    if (abre) p = p.slice(1);
    const fecha = p.endsWith('*') || /\*[.,:;!?)]*$/.test(p);
    p = p.replace(/\*/g, '');
    saida.push({p, destaque: destaque || abre});
    if (abre) destaque = true;
    if (fecha) destaque = false;
  }
  return saida;
};

// Quantas palavras o texto tem (para encadear os próximos blocos)
export const contar = (texto: string) => palavras(texto).length;

// Texto que entra palavra por palavra: cada uma sai do desfoque em 4 frames, 2 frames depois da anterior
// (regras de título do HyperFrames: sem deslizar, a palavra pousa e fica parada)
export const TextoAnimado: React.FC<{
  texto: string;
  t: number; // frames desde o início do bloco
  tamanho: number;
  peso?: number;
  cor?: string;
  corDestaque?: string;
  alinhar?: 'left' | 'center';
  largura?: number;
  altura?: number; // entrelinha
  passo?: number;
  maiusculas?: boolean;
}> = ({texto, t, tamanho, peso = 500, cor = C.creme, corDestaque = C.lavanda, alinhar = 'center', largura = 900, altura = 1.3, passo = 2, maiusculas = false}) => {
  const lista = palavras(texto);
  return (
    <div
      style={{
        width: largura,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: alinhar === 'center' ? 'center' : 'flex-start',
        columnGap: tamanho * 0.26,
        fontFamily: FONTE,
        fontWeight: peso,
        fontSize: tamanho,
        lineHeight: altura,
        textTransform: maiusculas ? 'uppercase' : 'none',
      }}
    >
      {lista.map((w, i) => {
        const e = interpolate(t - i * passo, [0, 4], [0, 1], clamp);
        return (
          <span
            key={i}
            style={{
              color: w.destaque ? corDestaque : cor,
              fontWeight: w.destaque ? Math.max(peso, 700) : peso,
              opacity: e,
              filter: e < 1 ? `blur(${6 * (1 - e)}px)` : undefined,
              textShadow: w.destaque ? `0 0 ${tamanho * 0.45}px ${C.claro}aa` : undefined,
            }}
          >
            {w.p}
          </span>
        );
      })}
    </div>
  );
};
