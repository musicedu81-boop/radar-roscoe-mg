import {useMemo} from 'react';
import * as THREE from 'three';
import {texturaAsa, texturaCorpo} from './texturas';

// Borboleta 3D: asas articuladas no eixo do corpo, dobram de verdade no espaço.
// abertura: 1 aberta, 0 fechada. brilho > 1 alimenta o bloom.
export const Borboleta3D: React.FC<{abertura: number; opacidade: number; brilho: number}> = ({abertura, opacidade, brilho}) => {
  const asa = useMemo(() => texturaAsa(), []);
  const corpo = useMemo(() => texturaCorpo(), []);
  const geoAsa = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.2, 1.8);
    g.translate(0.56, 0, 0);
    return g;
  }, []);
  const geoCorpo = useMemo(() => new THREE.PlaneGeometry(0.64, 1.28), []);
  const cor = useMemo(() => new THREE.Color(brilho, brilho, brilho), [brilho]);
  const theta = 0.08 + (1 - abertura) * 1.25;

  const material = (map: THREE.Texture) => (
    <meshBasicMaterial map={map} color={cor} transparent opacity={opacidade} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
  );

  return (
    <group>
      <mesh geometry={geoAsa} rotation={[0, -theta, 0]}>
        {material(asa)}
      </mesh>
      <group rotation={[0, theta, 0]} scale={[-1, 1, 1]}>
        <mesh geometry={geoAsa}>{material(asa)}</mesh>
      </group>
      <mesh geometry={geoCorpo} position={[0, 0, 0.02]}>
        {material(corpo)}
      </mesh>
    </group>
  );
};
