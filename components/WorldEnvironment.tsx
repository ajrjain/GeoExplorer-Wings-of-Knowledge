import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Weather } from '../types';

export type QualityTier = 'low' | 'medium' | 'high';

const OCEAN_REGIONS = ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean'];
const DESERT_REGIONS = ['Dubai', 'Egypt'];
const ALPINE_REGIONS = ['Russia', 'Canada'];

export const getQualityTier = (): QualityTier => {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  if (memory <= 2 || cores <= 2) return 'low';
  if (memory >= 8 && cores >= 8) return 'high';
  return 'medium';
};

const seededRandom = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const biomeFor = (region: string, weather: Weather) => {
  if (OCEAN_REGIONS.includes(region)) return 'ocean';
  if (DESERT_REGIONS.includes(region)) return 'desert';
  if (weather === 'snowy' || ALPINE_REGIONS.includes(region)) return 'alpine';
  return 'forest';
};

const textureFor = (biome: string) => ({
  forest: '/assets/terrain_forest.jpg',
  desert: '/assets/terrain_desert.jpg',
  alpine: '/assets/terrain_snow.jpg',
  ocean: '/assets/terrain_ocean.jpg',
}[biome] || '/assets/terrain_forest.jpg');

const GroundProps = ({ biome, quality }: { biome: string; quality: QualityTier }) => {
  const trees = useRef<THREE.InstancedMesh>(null);
  const rocks = useRef<THREE.InstancedMesh>(null);
  const density = quality === 'high' ? 170 : quality === 'medium' ? 100 : 45;
  const seed = biome.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

  useEffect(() => {
    const tree = trees.current;
    const rock = rocks.current;
    if (!tree || !rock || biome === 'ocean') return;
    const random = seededRandom(seed);
    const object = new THREE.Object3D();
    for (let index = 0; index < density; index++) {
      const x = (random() - 0.5) * 720;
      const z = (random() - 0.5) * 720;
      const scale = 0.55 + random() * 1.6;
      object.position.set(x, biome === 'alpine' ? -2.5 : -1.5, z);
      object.rotation.set(0, random() * Math.PI, 0);
      object.scale.set(scale, scale * (biome === 'forest' ? 2.5 : 1), scale);
      object.updateMatrix();
      tree.setMatrixAt(index, object.matrix);

      object.position.set(x + (random() - 0.5) * 18, -2, z + (random() - 0.5) * 18);
      object.rotation.set(random(), random(), random());
      object.scale.setScalar(0.5 + random() * 2.5);
      object.updateMatrix();
      rock.setMatrixAt(index, object.matrix);
    }
    tree.instanceMatrix.needsUpdate = true;
    rock.instanceMatrix.needsUpdate = true;
  }, [biome, density, seed]);

  if (biome === 'ocean') return null;
  const foliage = biome === 'desert' ? '#b98235' : biome === 'alpine' ? '#315a58' : '#174c31';
  return <group>
    <instancedMesh ref={trees} args={[undefined, undefined, density]} castShadow>
      {biome === 'forest' ? <coneGeometry args={[2, 6, 6]} /> : <coneGeometry args={[2.5, 3.5, 5]} />}
      <meshStandardMaterial color={foliage} roughness={0.9} />
    </instancedMesh>
    <instancedMesh ref={rocks} args={[undefined, undefined, density]} receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={biome === 'desert' ? '#875b32' : '#6b7781'} roughness={1} />
    </instancedMesh>
  </group>;
};

const AnimatedWater = ({ snowy }: { snowy: boolean }) => {
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const waterTexture = useLoader(THREE.TextureLoader, '/assets/terrain_ocean.jpg');
  useEffect(() => {
    waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;
    waterTexture.repeat.set(10, 10);
    waterTexture.colorSpace = THREE.SRGBColorSpace;
  }, [waterTexture]);
  useFrame((_, delta) => {
    waterTexture.offset.x += delta * 0.008;
    waterTexture.offset.y += delta * 0.004;
    if (material.current) material.current.emissiveIntensity = 0.08 + Math.sin(performance.now() * 0.001) * 0.025;
  });
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -7.5, 0]} receiveShadow>
    <planeGeometry args={[2400, 2400, 1, 1]} />
    <meshStandardMaterial ref={material} map={waterTexture} color={snowy ? '#a8c9dc' : '#1677a8'} emissive="#07557d" metalness={0.65} roughness={0.23} />
  </mesh>;
};

export const WorldEnvironment = ({ region, weather, quality }: { region: string; weather: Weather; quality: QualityTier }) => {
  const biome = biomeFor(region, weather);
  const [heightMap, terrainMap] = useLoader(THREE.TextureLoader, ['/assets/earth-topology.png', textureFor(biome)]);
  const segments = quality === 'high' ? 96 : quality === 'medium' ? 64 : 32;
  const displacement = biome === 'ocean' ? 3 : biome === 'desert' ? 18 : biome === 'alpine' ? 38 : 28;

  useEffect(() => {
    heightMap.wrapS = heightMap.wrapT = THREE.MirroredRepeatWrapping;
    heightMap.repeat.set(3, 3);
    terrainMap.wrapS = terrainMap.wrapT = THREE.MirroredRepeatWrapping;
    terrainMap.repeat.set(5, 5);
    terrainMap.colorSpace = THREE.SRGBColorSpace;
  }, [heightMap, terrainMap]);

  const tiles = useMemo(() => [-1, 0, 1].flatMap(x => [-1, 0, 1].map(z => [x, z] as const)), []);
  return <group>
    {tiles.map(([x, z]) => <mesh key={`${x}-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[x * 400, -5, z * 400]} receiveShadow>
      <planeGeometry args={[402, 402, segments, segments]} />
      <meshStandardMaterial map={terrainMap} displacementMap={heightMap} displacementScale={displacement} roughness={weather === 'rainy' ? 0.45 : 0.82} metalness={biome === 'ocean' ? 0.55 : 0.04} />
    </mesh>)}
    <AnimatedWater snowy={weather === 'snowy'} />
    <GroundProps biome={biome} quality={quality} />
  </group>;
};
