"use client";
import { Canvas } from "@react-three/fiber";
import Floor from "./floor";
import { Ref, Suspense, useCallback, useEffect, useRef } from "react";
import { Physics } from "@react-three/rapier";
import MainPlayer from "./main_player";
import Cube from "./cube";
import Sky from "./sky";
import { ACESFilmicToneMapping, PCFShadowMap } from "three";
import OtherPlayer from "./otherPlayer";

import { Client } from "@colyseus/sdk";
import { createRoomContext } from "@colyseus/react";
import { Position, UserData } from "./types/player_with_id";

const isDevelopmentEnv = process.env.ENV === "dev";

const client = new Client(process.env.COLYSEUS_URL);
const { RoomProvider, useRoom, useRoomState } = createRoomContext();

function Space() {
  const exposure = 0.7;

  const { room, error, isConnecting } = useRoom();
  const players: readonly UserData[] =
    useRoomState((state) => {
      const res: UserData[] = [];
      for (const [key, value] of state.players?.entries() ?? []) {
        if (key != room?.sessionId)
          res.push({
            id: key,
            x: value.x,
            y: value.y,
            z: value.z,
          });
      }
      return res;
    }) || [];

  const lastSentPosition: Ref<Position> = useRef({ x: 0, y: 0, z: 0 });

  const updatePlayerPosition = useCallback(
    (position: Position) => {
      const previous = lastSentPosition.current;
      if (previous == null) return;

      const distance = Math.hypot(
        position.x - previous.x,
        position.y - previous.y,
        position.z - previous.z,
      );

      if (distance < 0.01) return;

      room?.send("move", position);
      lastSentPosition.current = { ...position };
    },
    [room],
  );

  if (isConnecting) return <p className="mt-1 ml-1">Connecting...</p>;
  if (error) return <p className="mt-1 ml-1">Error: {error.message}</p>;
  if (players.length == 4)
    return <p className="mt-1 ml-1">The space already has 4 users in it</p>;

  return (
    <div className="relative h-screen w-screen">
      <Canvas
        className="absolute inset-0"
        shadows={{ type: PCFShadowMap }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: exposure * 0.2,
        }}
      >
        <scene backgroundIntensity={exposure} />
        <Suspense>
          <Sky />
          <Physics gravity={[0, -9.81, 0]} colliders={false}>
            <Floor></Floor>
            <MainPlayer
              position={{ x: 0, y: 5, z: 0 }}
              onPositionChange={updatePlayerPosition}
            />
            <Cube position={[0.2, 1.5, 0.2]}></Cube>
            <Cube position={[0, 0.5, 0]}></Cube>

            {players.map((user) => (
              <OtherPlayer key={user.id} user={user} />
            ))}
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function RoomSpace() {
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isMobileUA = /Android|iPhone|iPod|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  const likelyPhone = isCoarsePointer && isMobileUA;

  if (likelyPhone) {
    return <p className="mt-1 ml-1">The 3D space is not available on phones</p>;
  }

  return (
    <RoomProvider connect={() => client.joinOrCreate("world")}>
      <Space></Space>
    </RoomProvider>
  );
}
