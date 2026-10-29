import {Easing, interpolate, random} from 'remotion';
import {Borboleta3D} from '../efeitos/Borboletas3D';
import {C, FONTE, chegada, clamp} from '../tokens';
import {useAjuste} from './ajuste';
import {Medalhao, type NomeIcone} from './Icones';
import {ANEL_PALAVRAS, AnelPalavras, OrbeInflamacao, posicaoNoAnel} from './Orbitas';
import {Palavra3D} from './Palavra3D';
import {TextoAnimado, contar} from './Texto';

// Mensagens do carrossel "Sabe o que é névoa lúpica?", reescritas para tela de vídeo (frases curtas),
// na identidade da Cris Santos & Lúpus. Trechos entre asteriscos ficam em lavanda.
export type Camera = 'zoom' | 'orbita';
// adianta: frames que o conteúdo começa antes do início da cena (para já aparecer durante a troca)
export type PropsCena = {f: number; inicio: number; fim: number; camera: Camera; adianta: number};

// Pontos de entrega do crossover: a palavra sai de uma cena e pousa na seguinte
export const NEVOA_GANCHO = {y: 760, largura: 900, maximo: 240};
export const NEVOA_DEFINICAO = {y: 330, largura: 640, maximo: 128};
export const FADIGA_ANEL = {y: posicaoNoAnel(0, 5, 0).y, tamanho: ANEL_PALAVRAS.tamanho};
export const FADIGA_CENA = {y: 650, largura: 820, maximo: 190};
export const VIAGEM = 20; // frames da travessia da palavra

const Linha: React.FC<{y: number; children: React.ReactNode; opacidade?: number}> = ({y, children, opacidade = 1}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: opacidade}}>{children}</div>
);

// Palavra 3D centrada num ponto, saindo do desfoque (foco que chega através da névoa)
const Titulo3D: React.FC<{texto: string; y: number; largura: number; maximo: number; t: number; giroY: number; giroX?: number; visivel?: number}> = ({texto, y, largura, maximo, t, giroY, giroX = 0, visivel = 1}) => {
  const fs = useAjuste(texto, largura, maximo);
  if (fs === null) return null;
  const e = interpolate(t, [0, 16], [0, 1], {...clamp, easing: chegada});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y - fs / 2, display: 'flex', justifyContent: 'center', opacity: e * visivel, filter: e < 1 ? `blur(${16 * (1 - e)}px)` : undefined, scale: `${0.93 + 0.07 * e}`}}>
      <Palavra3D texto={texto} tamanho={fs} giroY={giroY} giroX={giroX} />
    </div>
  );
};

const progresso = (p: PropsCena) => interpolate(p.f, [p.inicio, p.fim], [0, 1], clamp);
// Giro do bloco 3D: maior nas cenas em órbita
const giro = (p: PropsCena, amplitude = 1) => (p.camera === 'orbita' ? -16 + 32 * progresso(p) : -6 + 12 * progresso(p)) * amplitude;

export const CenaGancho: React.FC<PropsCena> = (p) => {
  const t = p.f - p.inicio + p.adianta;
  // a palavra NÉVOA passa para a próxima cena (crossover): some aqui enquanto a viajante aparece
  const entrega = interpolate(p.f, [p.fim - VIAGEM, p.fim - VIAGEM + 4], [1, 0], clamp);
  const letras = 'LÚPICA?'.split('');
  return (
    <>
      <Linha y={560}>
        <TextoAnimado texto="Sabe o que é" t={t - 8} tamanho={64} peso={700} />
      </Linha>
      <Titulo3D texto="NÉVOA" y={NEVOA_GANCHO.y} largura={NEVOA_GANCHO.largura} maximo={NEVOA_GANCHO.maximo} t={t - 16} giroY={giro(p, 0.8)} giroX={6 - 4 * progresso(p)} visivel={entrega} />
      <Linha y={900}>
        <div style={{display: 'flex', fontFamily: FONTE, fontWeight: 900, fontSize: 150, lineHeight: 1, color: C.lavanda, textShadow: `0 0 60px ${C.claro}aa`}}>
          {letras.map((l, i) => {
            const e = interpolate(t - 32 - i * 3, [0, 6], [0, 1], clamp);
            return (
              <span key={i} style={{opacity: 0.3 * (e > 0 ? 1 : 0) + 0.7 * e, filter: e < 1 ? `blur(${6 * (1 - e)}px)` : undefined, visibility: e > 0 ? 'visible' : 'hidden'}}>
                {l}
              </span>
            );
          })}
        </div>
      </Linha>
    </>
  );
};

const SINTOMAS = ['confusão mental', 'dificuldade de concentração', 'perda de memória', 'raciocínio mais lento'];

export const CenaDefinicao: React.FC<PropsCena> = (p) => {
  const t = p.f - p.inicio + p.adianta;
  const chega = interpolate(t, [2, 6], [0, 1], clamp); // a NÉVOA viajante pousa aqui
  const lupica = interpolate(t, [4, 14], [0, 1], {...clamp, easing: chegada});
  return (
    <>
      <Titulo3D texto="NÉVOA" y={NEVOA_DEFINICAO.y} largura={NEVOA_DEFINICAO.largura} maximo={NEVOA_DEFINICAO.maximo} t={99} giroY={giro(p, 0.6)} visivel={chega} />
      <Linha y={398} opacidade={lupica}>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 84, lineHeight: 1, letterSpacing: '0.04em', color: C.lavanda, textShadow: `0 0 40px ${C.claro}aa`, filter: lupica < 1 ? `blur(${8 * (1 - lupica)}px)` : undefined}}>LÚPICA</div>
      </Linha>
      <Linha y={530}>
        <TextoAnimado texto="é uma condição em que a pessoa sente:" t={t - 16} tamanho={42} largura={980} />
      </Linha>
      {SINTOMAS.map((s, k) => {
        const e = interpolate(t - 40 - k * 12, [0, 12], [0, 1], {...clamp, easing: chegada});
        return (
          <Linha key={s} y={640 + k * 96} opacidade={e}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '14px 40px',
                borderRadius: 44,
                background: `${C.lavanda}1c`,
                border: `2px solid ${C.lavanda}99`,
                boxShadow: `0 0 30px ${C.claro}44`,
                fontFamily: FONTE,
                fontWeight: 700,
                fontSize: 42,
                color: C.creme,
                scale: `${0.86 + 0.14 * e}`,
                filter: e < 1 ? `blur(${8 * (1 - e)}px)` : undefined,
              }}
            >
              <div style={{width: 14, height: 14, borderRadius: 7, background: C.lavanda, boxShadow: `0 0 12px ${C.lavanda}`}} />
              {s}
            </div>
          </Linha>
        );
      })}
      <Linha y={1060}>
        <TextoAnimado texto="É comum entre pessoas com lúpus e *pode variar em intensidade*." t={t - 104} tamanho={44} largura={860} />
      </Linha>
    </>
  );
};

export const CenaQuando: React.FC<PropsCena> = (p) => {
  const t = p.f - p.inicio + p.adianta;
  const texto1 = 'Ela aparece em diferentes momentos, especialmente nas *crises (flares)* ou quando o *sistema imunológico* está mais ativo.';
  return (
    <>
      <OrbeInflamacao t={t} cx={540} cy={470} raio={118} />
      <Linha y={710}>
        <TextoAnimado texto={texto1} t={t - 14} tamanho={50} largura={900} />
      </Linha>
      <Linha y={1040}>
        <TextoAnimado texto="É uma *resposta do corpo à inflamação* causada pela doença." t={t - 14 - contar(texto1) * 2 - 40} tamanho={52} peso={700} largura={880} />
      </Linha>
    </>
  );
};

export const PALAVRAS_FATORES = ['FADIGA', 'MEDICAMENTOS', 'ESTRESSE', 'SONO', 'ANSIEDADE'];

export const CenaFatores: React.FC<PropsCena> = (p) => {
  const t = p.f - p.inicio + p.adianta;
  const parada = p.fim - p.inicio - VIAGEM - 2;
  // FADIGA sai do anel no crossover
  const esconde = p.f >= p.fim - VIAGEM + 4 ? 0 : -1;
  return (
    <>
      <Linha y={300}>
        <TextoAnimado texto="Outros fatores que podem contribuir para a *névoa lúpica*" t={t - 4} tamanho={56} peso={700} largura={900} />
      </Linha>
      <AnelPalavras palavras={PALAVRAS_FATORES} t={t} parada={parada} esconder={esconde} />
    </>
  );
};

// Cena de um fator: medalhão com o ícone, a palavra em 3D e duas frases que entram palavra por palavra
const CenaFator: React.FC<PropsCena & {palavra: string; antes?: string; icone: NomeIcone; frase1: string; frase2: string; deViagem?: boolean; maximo?: number}> = (p) => {
  const t = p.f - p.inicio + p.adianta;
  const chega = p.deViagem ? interpolate(t, [2, 6], [0, 1], clamp) : 1;
  const inicio2 = 30 + contar(p.frase1) * 2 + 34;
  return (
    <>
      <Linha y={300}>
        <Medalhao nome={p.icone} t={t} tamanho={210} giro={giro(p, 1.4)} />
      </Linha>
      {p.antes ? (
        <Linha y={470}>
          <TextoAnimado texto={p.antes} t={t - 6} tamanho={46} peso={700} cor={C.lavanda} />
        </Linha>
      ) : null}
      <Titulo3D texto={p.palavra} y={FADIGA_CENA.y} largura={FADIGA_CENA.largura} maximo={p.maximo ?? FADIGA_CENA.maximo} t={p.deViagem ? 99 : t - 10} giroY={giro(p)} giroX={3} visivel={chega} />
      <Linha y={770}>
        <TextoAnimado texto={p.frase1} t={t - 30} tamanho={48} largura={880} />
      </Linha>
      <Linha y={990}>
        <TextoAnimado texto={p.frase2} t={t - inicio2} tamanho={48} largura={880} />
      </Linha>
    </>
  );
};

export const CenaFadiga: React.FC<PropsCena> = (p) => (
  <CenaFator {...p} palavra="FADIGA" icone="bateria" deViagem frase1="A *fadiga extrema* associada ao lúpus é um dos maiores contribuintes." frase2="Quanto mais cansado o corpo, maior a *dificuldade de pensar com clareza*." />
);
export const CenaMedicamentos: React.FC<PropsCena> = (p) => (
  <CenaFator {...p} palavra="MEDICAMENTOS" icone="capsula" frase1="Alguns remédios do tratamento, como os *corticosteroides em altas doses*," frase2="podem causar *lapsos de memória e falta de foco*." />
);
export const CenaEstresse: React.FC<PropsCena> = (p) => (
  <CenaFator {...p} palavra="ESTRESSE" icone="raio" frase1="Físico ou emocional, o estresse pode *agravar os sintomas*." frase2="Com o corpo sob tensão, fica *mais difícil manter a concentração*." />
);
export const CenaSono: React.FC<PropsCena> = (p) => (
  <CenaFator {...p} palavra="SONO" antes="Problemas com o" icone="lua" maximo={170} frase1="A falta de sono, por dores ou desconforto, *piora a névoa mental*." frase2="Sem descanso, a mente fica *mais lenta e menos eficiente*." />
);
export const CenaAnsiedade: React.FC<PropsCena> = (p) => (
  <CenaFator {...p} palavra="ANSIEDADE" antes="Depressão e" icone="nuvem" frase1="Comuns em doenças crônicas como o lúpus," frase2="também *contribuem para a névoa mental* e trazem *desafios emocionais*." />
);

const ICONES: NomeIcone[] = ['bateria', 'capsula', 'raio', 'lua', 'nuvem'];

export const CenaReconhecer: React.FC<PropsCena> = (p) => {
  const t = p.f - p.inicio + p.adianta;
  const texto1 = 'é essencial para *manejar a névoa lúpica* de forma eficaz.';
  return (
    <>
      {ICONES.map((nome, i) => {
        const e = interpolate(t - 4 - i * 5, [0, 18], [0, 1], {...clamp, easing: chegada});
        const x = 180 + i * 180;
        const y = 330 + Math.abs(i - 2) * 34;
        const dx = (random(`rx${i}`) - 0.5) * 500 * (1 - e);
        const dy = (random(`ry${i}`) - 0.3) * 400 * (1 - e);
        return (
          <div key={nome} style={{position: 'absolute', left: x - 62 + dx, top: y - 62 + dy, opacity: e}}>
            <Medalhao nome={nome} t={t - 4 - i * 5} tamanho={124} giro={giro(p, 1.2) + (i - 2) * 8} />
          </div>
        );
      })}
      <Titulo3D texto="RECONHECER" y={590} largura={900} maximo={140} t={t - 18} giroY={giro(p)} giroX={3} />
      <Linha y={670}>
        <TextoAnimado texto="esses fatores" t={t - 26} tamanho={60} peso={800} cor={C.lavanda} />
      </Linha>
      <Linha y={790}>
        <TextoAnimado texto={texto1} t={t - 36} tamanho={48} largura={880} />
      </Linha>
      <Linha y={1000}>
        <TextoAnimado texto="Um acompanhamento cuidadoso ajuda a *melhorar a qualidade de vida*." t={t - 36 - contar(texto1) * 2 - 30} tamanho={48} largura={880} />
      </Linha>
    </>
  );
};

// Fecho: a névoa se dissipa e borboletas sobem
export const CenaFecho: React.FC<PropsCena> = (p) => {
  const t = p.f - p.inicio + p.adianta;
  const texto2 = 'Vamos juntas lidar com a *névoa mental*, a *ansiedade* e o *estresse*.';
  const dur = p.fim - p.inicio;
  return (
    <>
      <Linha y={380}>
        <TextoAnimado texto="Você não precisa enfrentar o lúpus" t={t - 10} tamanho={64} peso={900} largura={900} />
      </Linha>
      <Titulo3D texto="SOZINHA." y={640} largura={820} maximo={170} t={t - 32} giroY={giro(p)} giroX={4} />
      <Linha y={790}>
        <TextoAnimado texto={texto2} t={t - 52} tamanho={48} largura={880} />
      </Linha>
      <Linha y={1010}>
        <TextoAnimado texto="Cuidar da mente também é *parte do tratamento*." t={t - 52 - contar(texto2) * 2 - 36} tamanho={50} peso={700} largura={880} />
      </Linha>
      {Array.from({length: 5}, (_, i) => {
        const s = interpolate(t, [dur * 0.45 + i * 10, dur + 30 + i * 6], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
        if (s <= 0 || s >= 1) return null;
        const x = 140 + i * 200 + Math.sin(s * 6 + i) * 60;
        const y = 1750 - s * 1900;
        return (
          <div key={i} style={{position: 'absolute', left: x - 110, top: y - 100, transform: 'rotateX(48deg)', filter: `drop-shadow(0 0 12px ${C.lavanda})`, opacity: interpolate(s, [0, 0.1, 0.85, 1], [0, 0.9, 0.9, 0])}}>
            <Borboleta3D tamanho={120 + 30 * (i % 2)} batida={Math.abs(Math.sin(t * 0.35 + i))} />
          </div>
        );
      })}
    </>
  );
};

export const CENAS: Record<string, React.FC<PropsCena>> = {
  gancho: CenaGancho,
  definicao: CenaDefinicao,
  quando: CenaQuando,
  fatores: CenaFatores,
  fadiga: CenaFadiga,
  medicamentos: CenaMedicamentos,
  estresse: CenaEstresse,
  sono: CenaSono,
  ansiedade: CenaAnsiedade,
  reconhecer: CenaReconhecer,
  fecho: CenaFecho,
};
