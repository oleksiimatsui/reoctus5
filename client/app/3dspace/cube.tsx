import { CuboidCollider, RigidBody } from "@react-three/rapier";

type CubeProps = {
  position?: [number, number, number];
};

export default function Cube({ position = [0, 0.5, 0] }: CubeProps) {
  return (
    <RigidBody position={position} type="fixed">
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </RigidBody>
  );
}
