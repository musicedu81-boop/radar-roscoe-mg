import {Composition} from 'remotion';
import {Vinheta} from './Vinheta';

export const Root = () => (
  <Composition id="Vinheta" component={Vinheta} durationInFrames={240} fps={30} width={1080} height={1920} />
);
