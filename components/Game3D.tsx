import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Text, Billboard, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Landmark, Direction, Weather, ControlState } from '../types';
import { ObstaclesManager, Obstacle } from './Obstacles';
import { getQualityTier, QualityTier, WorldEnvironment } from './WorldEnvironment';

// --- Assets & Constants ---
const PLANE_SPEED = 0.5;
const MAP_SIZE = 800;

// --- Plane Component ---
const Plane = ({ position, rotation, type }: { position: THREE.Vector3; rotation: THREE.Euler, type: import('../types').PlaneType }) => {
  const isJet = type === 'jet';
  const isGlider = type === 'glider';
  const mainColor = isJet ? '#10b981' : (isGlider ? '#f43f5e' : '#fbbf24');
  const wingColor = isJet ? '#334155' : (isGlider ? '#e2e8f0' : '#ef4444');

  return (
    <group position={position} rotation={rotation}>
      <group rotation={[0, Math.PI, 0]}>
          {/* Fuselage */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            {isGlider ? (
                <cylinderGeometry args={[0.2, 0.1, 5]} />
            ) : isJet ? (
                <cylinderGeometry args={[0.6, 0.4, 5]} />
            ) : (
                <cylinderGeometry args={[0.5, 0.2, 4]} />
            )}
            <meshStandardMaterial color={mainColor} metalness={isJet ? 0.9 : 0.6} roughness={isJet ? 0.1 : 0.2} />
          </mesh>
          {/* Cockpit */}
          <mesh position={[0, isGlider ? 0.3 : 0.8, -0.5]}>
            <boxGeometry args={isJet ? [0.8, 0.4, 1.5] : [0.6, 0.6, 1.2]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} metalness={0.9} roughness={0} />
          </mesh>
          {/* Wings */}
          <mesh position={[0, 0.2, isJet ? 0.5 : (isGlider ? -0.5 : -0.5)]}>
            {isGlider ? (
                <boxGeometry args={[10, 0.05, 1]} />
            ) : isJet ? (
                <boxGeometry args={[5, 0.1, 2]} />
            ) : (
                <boxGeometry args={[6, 0.1, 1.5]} />
            )}
            <meshStandardMaterial color={wingColor} />
          </mesh>
          {/* Tail Vertical */}
          <mesh position={[0, 0.8, 1.5]}>
            <boxGeometry args={isJet ? [0.1, 1.2, 1.5] : [0.1, 1.5, 1]} />
            <meshStandardMaterial color={wingColor} />
          </mesh>
          {/* Tail Horizontal */}
          {!isJet && (
              <mesh position={[0, 0.3, 1.5]}>
                <boxGeometry args={[2.5, 0.1, 0.8]} />
                <meshStandardMaterial color={wingColor} />
              </mesh>
          )}
          {/* Propeller */}
          {!isJet && !isGlider && (
              <group position={[0, 0, -2.1]}>
                 <mesh rotation={[0, 0, 0]}>
                    <boxGeometry args={[3.5, 0.1, 0.1]} />
                    <meshStandardMaterial color="#333" />
                 </mesh>
                 <mesh rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[3.5, 0.1, 0.1]} />
                    <meshStandardMaterial color="#333" />
                 </mesh>
                 <mesh>
                     <sphereGeometry args={[0.3]} />
                     <meshStandardMaterial color="#ef4444" />
                 </mesh>
              </group>
          )}
      </group>
      <spotLight position={[0, 0, -2]} intensity={1} angle={0.6} penumbra={1} distance={50} color="white" />
    </group>
  );
};

// --- Rain Component ---
const Rain = ({ count = 1000 }) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { camera } = useThree();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                x: (Math.random() - 0.5) * 120,
                y: (Math.random() - 0.5) * 80,
                z: (Math.random() - 0.5) * 120,
                velocity: 0.8 + Math.random() * 0.8
            });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;

        particles.forEach((p, i) => {
            p.y -= p.velocity;
            if (p.y < -40) {
                p.y = 40;
                p.x = (Math.random() - 0.5) * 120;
                p.z = (Math.random() - 0.5) * 120;
            }
            dummy.position.set(
                camera.position.x + p.x,
                camera.position.y + p.y,
                camera.position.z + p.z
            );
            dummy.scale.set(0.05, 2, 0.05);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <boxGeometry />
            <meshBasicMaterial color="#a0c0ff" transparent opacity={0.6} />
        </instancedMesh>
    );
};

// --- Snow Component ---
const Snow = ({ count = 1500 }) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { camera } = useThree();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                x: (Math.random() - 0.5) * 120,
                y: (Math.random() - 0.5) * 80,
                z: (Math.random() - 0.5) * 120,
                velocity: 0.2 + Math.random() * 0.2, // slower than rain
                swaySpeed: 0.5 + Math.random() * 1.5,
                swayOffset: Math.random() * Math.PI * 2
            });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.elapsedTime;

        particles.forEach((p, i) => {
            p.y -= p.velocity;
            if (p.y < -40) {
                p.y = 40;
                p.x = (Math.random() - 0.5) * 120;
                p.z = (Math.random() - 0.5) * 120;
            }
            // sway effect for snow
            const swayX = Math.sin(time * p.swaySpeed + p.swayOffset) * 0.5;

            dummy.position.set(
                camera.position.x + p.x + swayX,
                camera.position.y + p.y,
                camera.position.z + p.z
            );
            dummy.scale.set(0.2, 0.2, 0.2); // larger, circular flakes
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </instancedMesh>
    );
};

// --- Flight Network Paths ---
const FlightNetwork = ({ landmarks }: { landmarks: Landmark[] }) => {
    if (landmarks.length < 2) return null;

    // Create a path through all landmarks (closed loop flight path)
    const points = landmarks.map(lm => new THREE.Vector3(lm.position[0], 9, lm.position[2]));
    points.push(new THREE.Vector3(landmarks[0].position[0], 9, landmarks[0].position[2]));

    return (
        <Line
            points={points}
            color="white"
            lineWidth={4}
            dashed={true}
            dashScale={20}
            dashSize={5}
            dashOffset={0}
            transparent
            opacity={0.8}
        />
    );
};

// --- Confetti Particles ---
const Confetti = ({ position }: { position: THREE.Vector3 }) => {
    const groupRef = useRef<THREE.Group>(null);
    const [particles] = useState(() => {
        return Array.from({ length: 30 }).map(() => ({
            pos: new THREE.Vector3(0, 0, 0),
            vel: new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 4 + 2, (Math.random() - 0.5) * 4),
            color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
            rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
            rotSpeed: new THREE.Euler(Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2)
        }));
    });

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.children.forEach((child, i) => {
            const p = particles[i];
            p.pos.add(p.vel);
            p.vel.y -= 0.1; // gravity
            p.rot.x += p.rotSpeed.x;
            p.rot.y += p.rotSpeed.y;
            p.rot.z += p.rotSpeed.z;
            child.position.copy(p.pos);
            child.rotation.copy(p.rot);
        });
    });

    return (
        <group position={position} ref={groupRef}>
            {particles.map((p, i) => (
                <mesh key={i}>
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial color={p.color} side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    );
};

// --- Landmark Billboard Marker ---
const LandmarkMarker: React.FC<{ landmark: Landmark; isTarget: boolean; region: string }> = ({ landmark, isTarget }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const billboardRef = useRef<THREE.Group>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCollected = useRef(landmark.collected);

  useEffect(() => {
      const loader = new THREE.TextureLoader();
      // Load the locally cached Wikipedia image
      loader.load(`/assets/landmarks/${landmark.id}.jpg`, (tex) => {
          setTexture(tex);
      }, undefined, () => {
          // generic fallback if Wikipedia fetch failed
          loader.load('/assets/monument.jpg', (fallbackTex) => {
              setTexture(fallbackTex);
          });
      });
  }, [landmark.id]);

  useEffect(() => {
      if (landmark.collected && !prevCollected.current) {
          setShowConfetti(true);
          // Play a celebration speech
          if (window.speechSynthesis) {
              const msg = new SpeechSynthesisUtterance(`Hurray! You found ${landmark.name}!`);
              msg.volume = 1;
              window.speechSynthesis.speak(msg);
          }
          setTimeout(() => setShowConfetti(false), 3000);
      }
      prevCollected.current = landmark.collected;
  }, [landmark.collected, landmark.name]);

  useFrame((state) => {
      if (ringRef.current) {
          ringRef.current.rotation.y += 0.02; // Rotate the 3D ring continuously
          ringRef.current.position.y = 8 + Math.sin(state.clock.elapsedTime * 2) * 1.5; // Hover effect
      }
      if (billboardRef.current) {
          billboardRef.current.position.y = 8 + Math.sin(state.clock.elapsedTime * 2) * 1.5;
      }
  });

  return (
    <group position={landmark.position}>
        {showConfetti && <Confetti position={new THREE.Vector3(0, 10, 0)} />}

        {/* Animated 3D target indicator ring */}
        {!landmark.collected && (
            <mesh ref={ringRef} castShadow position={[0, 8, 0]}>
                <torusGeometry args={[12, 0.4, 16, 64]} />
                <meshStandardMaterial
                    color={isTarget ? "#ef4444" : "#fcd34d"}
                    emissive={isTarget ? "#ef4444" : "#fcd34d"}
                    emissiveIntensity={1}
                    transparent
                    opacity={0.8}
                />
            </mesh>
        )}

        {/* Billboard makes the object always face the camera */}
        <Billboard follow={true}>
            <group ref={billboardRef}>
                <mesh castShadow>
                    <planeGeometry args={[16, 16]} />
                    {texture ? (
                        <meshBasicMaterial map={texture} transparent opacity={landmark.collected ? 0.6 : 1} side={THREE.DoubleSide} />
                    ) : (
                         <meshStandardMaterial color={landmark.collected ? "#22c55e" : "#3b82f6"} />
                    )}
                </mesh>

                {/* Frame/Border */}
                <mesh position={[0, 0, -0.1]}>
                     <planeGeometry args={[17, 17]} />
                     <meshBasicMaterial color={landmark.collected ? "#22c55e" : "white"} />
                </mesh>

                {/* Status Indicator Cone */}
                {!landmark.collected && isTarget && (
                    <mesh position={[0, 12, 0]} rotation={[Math.PI, 0, 0]}>
                         <coneGeometry args={[1.5, 3, 8]} />
                         <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
                    </mesh>
                )}

                {/* Text Label */}
                <Text
                    position={[0, -11, 0]}
                    fontSize={3}
                    color="white"
                    anchorX="center"
                    anchorY="top"
                    outlineWidth={0.4}
                    outlineColor="black"
                    fontWeight="bold"
                >
                    {landmark.collected ? "✅ VISITED" : landmark.name}
                </Text>
            </group>
        </Billboard>

        {/* Ground Shadow Blob */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
            <circleGeometry args={[6, 32]} />
            <meshBasicMaterial color="black" transparent opacity={0.3} />
        </mesh>

        {/* Distance Light Beacon */}
        {!landmark.collected && isTarget && (
             <pointLight position={[0, 20, 0]} intensity={5} color="#ef4444" distance={100} decay={2} />
        )}
    </group>
  );
};

// --- Game Logic Controller ---
const GameController = ({
    onUpdatePosition,
    onCheckCollisions,
    onCrash,
    isFlying,
    weather,
    planeType,
    region,
    controlsRef,
    planePosRef,
    obstaclesRef
}: {
    onUpdatePosition: (pos: THREE.Vector3, rot: number) => void,
    onCheckCollisions: (pos: THREE.Vector3) => void,
    onCrash: (reason: string) => void,
    isFlying: boolean,
    weather: Weather,
    planeType: import('../types').PlaneType,
    region: string,
    controlsRef: React.MutableRefObject<ControlState>,
    planePosRef: React.MutableRefObject<{x: number, z: number, rot: number}>,
    obstaclesRef: React.MutableRefObject<Obstacle[]>
}) => {
    const { camera } = useThree();
    const planePos = useRef(new THREE.Vector3(0, 30, 0));
    const planeRot = useRef(new THREE.Euler(0, 0, 0));
    const speed = useRef(PLANE_SPEED);
    const rotationSpeed = 0.03;

    // Local keyboard state (fallback for desktop)
    const keys = useRef<{ [key: string]: boolean }>({});

    const windOffset = useRef(new THREE.Vector2(0, 0));

    useEffect(() => {
        const handleDown = (e: KeyboardEvent) => keys.current[e.code] = true;
        const handleUp = (e: KeyboardEvent) => keys.current[e.code] = false;
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
        };
    }, []);

    useFrame((state, delta) => {
        if (!isFlying) return;

        // Apply Weather Turbulence
        if (weather === 'stormy' || weather === 'rainy') {
            const time = state.clock.elapsedTime;
            const turbulenceAmount = weather === 'stormy' ? 0.008 : 0.002;

            planeRot.current.z += (Math.random() - 0.5) * turbulenceAmount * 10;
            planeRot.current.x += (Math.random() - 0.5) * turbulenceAmount * 5;

            windOffset.current.x = Math.sin(time * 0.5) * (weather === 'stormy' ? 0.1 : 0.02);
            windOffset.current.y = Math.cos(time * 0.3) * (weather === 'stormy' ? 0.1 : 0.02);

            planePos.current.x += windOffset.current.x;
            planePos.current.z += windOffset.current.y;
        }

        // Turning (Yaw) - Mix Keyboard and Touch Controls
        let targetBank = 0;
        const isLeft = keys.current['ArrowLeft'] || controlsRef.current.left;
        const isRight = keys.current['ArrowRight'] || controlsRef.current.right;
        const isUp = keys.current['ArrowUp'] || controlsRef.current.up;
        const isDown = keys.current['ArrowDown'] || controlsRef.current.down;

        if (isLeft) {
            planeRot.current.y += rotationSpeed;
            targetBank = Math.PI / 4;
        } else if (isRight) {
            planeRot.current.y -= rotationSpeed;
            targetBank = -Math.PI / 4;
        }

        planeRot.current.z = THREE.MathUtils.lerp(planeRot.current.z, targetBank, delta * 2);

        // Pitch & Speed
        let targetPitch = 0;
        if (isUp) {
             planePos.current.y += 0.2;
             speed.current = PLANE_SPEED * 1.5;
             targetPitch = -Math.PI / 6;
        } else if (isDown) {
             planePos.current.y -= 0.2;
             speed.current = PLANE_SPEED * 0.8;
             targetPitch = Math.PI / 6;
        } else {
             speed.current = PLANE_SPEED;
        }

        planePos.current.y = Math.max(-5, Math.min(80, planePos.current.y));
        planeRot.current.x = THREE.MathUtils.lerp(planeRot.current.x, targetPitch, delta * 2);

        // Forward Movement (Along -Z axis)
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, planeRot.current.y, 0));
        planePos.current.add(forward.multiplyScalar(speed.current));

        // Loop world
        const limit = MAP_SIZE / 2;
        if (planePos.current.x > limit) planePos.current.x = -limit;
        if (planePos.current.x < -limit) planePos.current.x = limit;
        if (planePos.current.z > limit) planePos.current.z = -limit;
        if (planePos.current.z < -limit) planePos.current.z = limit;

        // Camera Follow
        const cameraOffset = new THREE.Vector3(0, 10, 25).applyEuler(new THREE.Euler(0, planeRot.current.y, 0));
        const cameraTargetPos = planePos.current.clone().add(cameraOffset);
        camera.position.lerp(cameraTargetPos, 0.1);

        const lookAtOffset = new THREE.Vector3(0, 0, -20).applyEuler(new THREE.Euler(0, planeRot.current.y, 0));
        camera.lookAt(planePos.current.clone().add(lookAtOffset));

        planePosRef.current.x = planePos.current.x;
        planePosRef.current.z = planePos.current.z;
        planePosRef.current.rot = planeRot.current.y;

        // Collision Checks
        const currentPos = planePos.current.clone();

        // 1. Check natural terrain crash
        // The terrain displacement goes up to y=35 on land and y=2 on ocean.
        // We do a hard baseline collision.
        const isOcean = ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean'].includes(region);
        const crashAltitude = isOcean ? 3 : 15;
        if (currentPos.y <= crashAltitude) {
            onCrash(isOcean ? "Crashed into the ocean!" : "Crashed into the terrain!");
            return;
        }

        // 2. Check AI plane collision
        for (const obs of obstaclesRef.current) {
            if (obs.type === 'plane') {
                const dist = currentPos.distanceTo(obs.pos);
                if (dist < obs.radius + 2) {
                    onCrash("Mid-air collision with another aircraft!");
                    return;
                }
            }
        }

        onUpdatePosition(currentPos, planeRot.current.y);
        onCheckCollisions(currentPos);
    });

    return (
        <Plane position={planePos.current} rotation={planeRot.current} type={planeType} />
    );
};

// --- Main 3D Scene ---

interface Game3DProps {
    landmarks: Landmark[];
    onCollect: (id: string) => void;
    onUpdateStats: (direction: Direction, speed: number) => void;
    onCrash: (reason: string) => void;
    region: string;
    weather: Weather;
    planeType: import('../types').PlaneType;
    controlsRef: React.MutableRefObject<ControlState>;
    planePosRef: React.MutableRefObject<{x: number, z: number, rot: number}>;
    isPaused: boolean;
}

export const Game3D: React.FC<Game3DProps> = ({ landmarks, onCollect, onUpdateStats, onCrash, region, weather, planeType, controlsRef, planePosRef, isPaused }) => {

    const isStorm = weather === 'stormy';
    const isRain = weather === 'rainy';
    const isClear = weather === 'sunny';

    const obstaclesRef = useRef<Obstacle[]>([]);
    const [quality] = useState<QualityTier>(() => getQualityTier());

    const fogColor = isStorm ? '#0f172a' : (isRain ? '#475569' : '#bae6fd');
    const fogNear = isStorm ? 50 : (isRain ? 100 : 200);
    const fogFar = isStorm ? 400 : (isRain ? 600 : 1500);

    const sunPos = isClear ? new THREE.Vector3(100, 40, 100) : new THREE.Vector3(100, 5, -100);

    const handleUpdatePosition = (pos: THREE.Vector3, rotY: number) => {
        const deg = (rotY * 180 / Math.PI) % 360;
        let compassDeg = deg;
        if (compassDeg < 0) compassDeg += 360;

        let dir: Direction = 'N';
        if (compassDeg >= 337.5 || compassDeg < 22.5) dir = 'N';
        else if (compassDeg >= 22.5 && compassDeg < 67.5) dir = 'NW';
        else if (compassDeg >= 67.5 && compassDeg < 112.5) dir = 'W';
        else if (compassDeg >= 112.5 && compassDeg < 157.5) dir = 'SW';
        else if (compassDeg >= 157.5 && compassDeg < 202.5) dir = 'S';
        else if (compassDeg >= 202.5 && compassDeg < 247.5) dir = 'SE';
        else if (compassDeg >= 247.5 && compassDeg < 292.5) dir = 'E';
        else if (compassDeg >= 292.5 && compassDeg < 337.5) dir = 'NE';

        onUpdateStats(dir, 100);
    };

    const handleCheckCollisions = (pos: THREE.Vector3) => {
        landmarks.forEach(lm => {
            if (lm.collected) return;
            const lmPos = new THREE.Vector3(...lm.position);
            const dist2D = new THREE.Vector2(pos.x, pos.z).distanceTo(new THREE.Vector2(lmPos.x, lmPos.z));
            const heightDiff = Math.abs(pos.y - lmPos.y);

            if (dist2D < 12 && heightDiff < 25) {
                onCollect(lm.id);
            }
        });
    };

    const nextTarget = landmarks.find(l => !l.collected);

    return (
        <Canvas shadows={quality !== 'low'} dpr={quality === 'high' ? [1, 2] : [1, 1.5]} gl={{ antialias: quality !== 'low', powerPreference: 'high-performance' }} camera={{ fov: 60, far: quality === 'low' ? 1100 : 1600 }}>
            <color attach="background" args={[fogColor]} />
            <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

            {!isStorm && <Sky sunPosition={sunPos} turbidity={isRain ? 8 : 0.5} rayleigh={isRain ? 0.2 : 0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />}

            <ambientLight intensity={isStorm ? 0.2 : (isRain ? 0.5 : 0.8)} />
            <directionalLight
                position={[100, 100, 50]}
                intensity={isStorm ? 0.1 : (isRain ? 0.5 : 1.5)}
                castShadow
                shadow-mapSize={[quality === 'high' ? 1024 : 512, quality === 'high' ? 1024 : 512]}
            />

            {isStorm && (
                 <pointLight position={[0, 100, 0]} intensity={Math.random() > 0.95 ? 20 : 0} color="white" distance={600} />
            )}

            {(isRain || isStorm) && <Rain count={quality === 'low' ? 500 : (isStorm ? 2200 : 1100)} />}
            {weather === 'snowy' && <Snow count={quality === 'low' ? 600 : 1500} />}

            <WorldEnvironment region={region} weather={weather} quality={quality} />
            <FlightNetwork landmarks={landmarks} />

            <ObstaclesManager region={region} obstaclesRef={obstaclesRef} />

            <GameController
                onUpdatePosition={handleUpdatePosition}
                onCheckCollisions={handleCheckCollisions}
                onCrash={onCrash}
                isFlying={!isPaused}
                weather={weather}
                planeType={planeType}
                region={region}
                controlsRef={controlsRef}
                planePosRef={planePosRef}
                obstaclesRef={obstaclesRef}
            />

            {landmarks.map(lm => (
                <LandmarkMarker
                    key={lm.id}
                    landmark={lm}
                    isTarget={nextTarget?.id === lm.id}
                    region={region}
                />
            ))}
        </Canvas>
    );
};
