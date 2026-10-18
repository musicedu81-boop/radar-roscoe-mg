import {Composition, Folder} from 'remotion';
import {Vinheta2D} from './Vinheta2D';
import {Vinheta3D} from './3d/Vinheta3D';

export const Root = () => (
  <Folder name="Cris-Santos-e-Lupus">
    <Composition id="Vinheta2D" component={Vinheta2D} durationInFrames={240} fps={30} width={1080} height={1920} />
    <Composition id="Vinheta3D" component={Vinheta3D} durationInFrames={240} fps={30} width={1080} height={1920} />
  </Folder>
);
