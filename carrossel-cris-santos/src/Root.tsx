import {Composition} from 'remotion';
import {Abertura} from './Abertura';
import {Assinatura} from './Assinatura';
import {Carrossel} from './Carrossel';
import {LINHA} from './linha';
import {SlideCris} from './slides/SlidesCris';
import './fonte';
import {ASSINATURA} from './Logo';

export const Root = () => (
  <>
    <Composition id="Carrossel" component={Carrossel} durationInFrames={LINHA.duracao} fps={LINHA.fps} width={1080} height={1920} />
    <Composition id="SlideCris" component={SlideCris} durationInFrames={1} fps={30} width={1080} height={1350} defaultProps={{indice: 0}} />
    <Composition id="Abertura" component={Abertura} durationInFrames={135} fps={30} width={1080} height={1920} />
    <Composition id="Assinatura" component={Assinatura} durationInFrames={ASSINATURA.duracao} fps={30} width={1080} height={1920} />
  </>
);
