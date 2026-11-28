import { useLoader } from "@react-three/fiber";
import { EquirectangularReflectionMapping, PCFShadowMap, Vector3 } from "three";
import { useMemo } from "react";
import { EXRLoader } from "three/examples/jsm/Addons.js";

export default function Sky() {
  const loadedTexture = useLoader(EXRLoader, "/hdri/sky.exr");
  const texture = useMemo(() => {
    const mappedTexture = loadedTexture.clone();
    mappedTexture.mapping = EquirectangularReflectionMapping;
    return mappedTexture;
  }, [loadedTexture]);

  return (
    <>
      <primitive object={texture} attach="background" />
      <primitive object={texture} attach="environment" />
    </>
  );
}
