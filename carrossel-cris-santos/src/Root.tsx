import {Composition} from 'remotion';
import {Assinatura} from './Assinatura';
import './fonte';
import {ASSINATURA} from './Logo';

export const Root = () => (
  <>
    <Composition id="Assinatura" component={Assinatura} durationInFrames={ASSINATURA.duracao} fps={30} width={1080} height={1920} />
  </>
);
