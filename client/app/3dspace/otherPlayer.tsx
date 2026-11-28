import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { Vector3 } from "three";
import { UserData } from "./types/player_with_id";

export default function OtherPlayer({ user }: { user: UserData }) {
  const body = useRef<RapierRigidBody>(null);
  const targetPosition = useRef(new Vector3(user.x, user.y, user.z));
  const smoothedPosition = useRef(new Vector3(user.x, user.y, user.z));
  const [initialPosition] = useState(() => [user.x, user.y, user.z] as const);

  useFrame((_, delta) => {
    if (!body.current) return;

    targetPosition.current.set(user.x, user.y, user.z);
    smoothedPosition.current.lerp(
      targetPosition.current,
      1 - Math.exp(-delta * 12),
    );
    body.current.setNextKinematicTranslation(smoothedPosition.current);
  });

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      position={initialPosition}
      colliders={false}
    >
      <CapsuleCollider args={[0.6, 0.4]} />
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.4, 1.2, 4, 8]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </RigidBody>
  );
}
