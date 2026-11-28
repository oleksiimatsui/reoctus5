import { memo } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import {
  ClampToEdgeWrapping,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  WebGLProgramParametersWithUniforms,
} from "three";

function Floor() {
  const tileSize = 4;
  const scale = 1000;
  const path = "/textures/ground/";
  const loader = new TextureLoader();

  const baseColorTexture = loader.load(path + "base.jpg");
  baseColorTexture.colorSpace = SRGBColorSpace;
  const normalMapTexture = loader.load(path + "normal.jpg");
  const aoTexture = loader.load(path + "ao.jpg");
  aoTexture.colorSpace = NoColorSpace;

  const repeat = scale / tileSize;
  const textures = [baseColorTexture, normalMapTexture, aoTexture];

  for (const texture of textures) {
    texture.repeat.set(repeat, repeat);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
  }

  const onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
    #ifdef USE_MAP
      // Sample 1: Standard UV
      vec4 tex1 = texture2D( map, vMapUv );
      
      // Sample 2: Scaled down (0.37x) and rotated to avoid alignment
      float angle = 0.785; // 45 degrees
      mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
      vec2 uv2 = rot * (vMapUv * 0.37);
      vec4 tex2 = texture2D( map, uv2 );
      
      // Blend smoothly based on a large sine wave (or noise texture)
      float blend = sin(vMapUv.x * 1.5) * cos(vMapUv.y * 1.5) * 0.5 + 0.5;
      diffuseColor *= mix(tex1, tex2, blend);
    #endif
    `,
    );
  };

  return (
    <RigidBody type="fixed">
      <CuboidCollider
        args={[scale / 2, 0.1, scale / 2]}
        position={[0, -0.1, 0]}
      />

      <mesh castShadow receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[scale, scale]} />
        <meshStandardMaterial
          map={baseColorTexture}
          normalMap={normalMapTexture}
          normalScale={0.4}
          aoMap={aoTexture}
          // roughnessMap={glossinessTexture}
          roughness={-1}
          onBeforeCompile={onBeforeCompile}
        />
      </mesh>
    </RigidBody>
  );
}

export default memo(Floor);
