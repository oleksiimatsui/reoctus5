import { useFrame, useThree } from "@react-three/fiber";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  useRapier,
} from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Position } from "./types/player_with_id";

type PlayerProps = {
  onPositionChange: (position: Position) => void;
  position: Position;
};

export default function Player({ position, onPositionChange }: PlayerProps) {
  const { camera, gl } = useThree();
  const { rapier, world } = useRapier();

  const body = useRef<RapierRigidBody>(null);
  const keys = useRef(new Set<string>());
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    const canvas = gl.domElement;
    const pressedKeys = keys.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        pressedKeys.add("space");
        return;
      }

      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        event.preventDefault();
        pressedKeys.add(key);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        pressedKeys.delete("space");
        return;
      }
      pressedKeys.delete(event.key.toLowerCase());
    };
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;

      yaw.current -= event.movementX * 0.002;
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - event.movementY * 0.002,
        -Math.PI / 2 + 0.01,
        Math.PI / 2 - 0.01,
      );
    };
    const requestPointerLock = () => {
      void canvas.requestPointerLock();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", requestPointerLock);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", requestPointerLock);
      pressedKeys.clear();
    };
  }, [gl]);

  const elapsed = useRef(0);
  useFrame((_, delta) => {
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");

    const rigidBody = body.current;
    if (!rigidBody) return;

    const position = rigidBody.translation();
    const grounded =
      world.castRay(
        new rapier.Ray(position, { x: 0, y: -1, z: 0 }),
        1.05,
        true,
        undefined,
        undefined,
        undefined,
        rigidBody,
      ) !== null;
    const velocity = rigidBody.linvel();
    if (grounded && keys.current.has("space") && velocity.y <= 0) {
      velocity.y = 7;
    }

    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yaw.current,
    );
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yaw.current,
    );

    if (keys.current.has("w")) direction.add(forward);
    if (keys.current.has("s")) direction.sub(forward);
    if (keys.current.has("d")) direction.add(right);
    if (keys.current.has("a")) direction.sub(right);
    direction.normalize().multiplyScalar(5);

    rigidBody.setLinvel(
      { x: direction.x, y: velocity.y, z: direction.z },
      true,
    );

    const currentPosition = rigidBody.translation();
    camera.position.set(
      currentPosition.x,
      currentPosition.y + 0.5,
      currentPosition.z,
    );

    elapsed.current += delta;
    if (elapsed.current < 0.05) return;
    elapsed.current -= 0.05;
    onPositionChange(currentPosition);
  });

  return (
    <RigidBody
      ref={body}
      position={[position.x, position.y, position.z]}
      enabledRotations={[false, false, false]}
      mass={1}
      linearDamping={0}
    >
      <CapsuleCollider args={[0.6, 0.4]} />
    </RigidBody>
  );
}
