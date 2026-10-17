import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import * as THREE from "three";
import { useVideoConfig } from "remotion";
import { COR } from "../marca";

// Palco 3D padrão (three.js) com a luz da marca: chave branca, contra-luz verde-neon e
// preenchimento azul. A câmera é controlada pela cena via props (sempre por useCurrentFrame).
export const Palco3D: React.FC<{
  children: React.ReactNode;
  camera?: { posicao: [number, number, number]; alvo?: [number, number, number]; fov?: number };
}> = ({ children, camera = { posicao: [0, 2, 12], alvo: [0, 0, 0], fov: 40 } }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ position: camera.posicao, fov: camera.fov ?? 40, near: 0.1, far: 200 }}
      onCreated={({ camera: cam }) => {
        const alvo = camera.alvo ?? [0, 0, 0];
        cam.lookAt(alvo[0], alvo[1], alvo[2]);
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <CameraControlada posicao={camera.posicao} alvo={camera.alvo ?? [0, 0, 0]} fov={camera.fov ?? 40} />
      <ambientLight intensity={0.9} color={COR.branco} />
      <directionalLight position={[6, 10, 8]} intensity={3.2} color={COR.branco} />
      <directionalLight position={[-8, 4, -6]} intensity={2.2} color={COR.neon} />
      <pointLight position={[0, -3, 6]} intensity={60} distance={30} color={COR.vivo} />
      {children}
    </ThreeCanvas>
  );
};

// Atualiza a câmera a cada render (a posição vem do quadro atual, nunca de useFrame)
const CameraControlada: React.FC<{ posicao: [number, number, number]; alvo: [number, number, number]; fov: number }> = ({
  posicao,
  alvo,
  fov,
}) => {
  const { camera } = useThree();
  camera.position.set(posicao[0], posicao[1], posicao[2]);
  if (camera instanceof THREE.PerspectiveCamera && camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  camera.lookAt(alvo[0], alvo[1], alvo[2]);
  return null;
};
