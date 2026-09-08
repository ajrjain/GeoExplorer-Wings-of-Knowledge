import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// --- Textures ---
// Keep the intro self-contained: remote textures can fail during a flight launch.
const EARTH_DAY_MAP = '/assets/satellite_base.jpg';

interface EarthIntroProps {
    targetLat: number;
    targetLon: number;
    onComplete: () => void;
}

const Earth: React.FC<{ targetLat: number; targetLon: number; onComplete: () => void }> = ({ targetLat, targetLon, onComplete }) => {
    const earthRef = useRef<THREE.Group>(null);
    const completionScheduled = useRef(false);
    const { camera } = useThree();

    // State for texture handling
    const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);

    // Safely load textures without Suspense to prevent crashes
    useEffect(() => {
        const loader = new THREE.TextureLoader();

        // Helper to load texture safely
        const loadSafe = (url: string) => {
            return new Promise<THREE.Texture | null>((resolve) => {
                loader.load(url,
                    (tex) => resolve(tex),
                    undefined,
                    () => resolve(null) // Resolve null on error
                );
            });
        };

        loadSafe(EARTH_DAY_MAP).then(setEarthTexture);
    }, []);

    // Calculate target rotation to bring coordinates to front (0,0,1 direction)
    const targetRotationX = targetLat * (Math.PI / 180);
    const targetRotationY = -targetLon * (Math.PI / 180) - Math.PI / 2;

    useFrame((state, delta) => {
        if (!earthRef.current) return;

        // Animate Earth Rotation
        earthRef.current.rotation.x = THREE.MathUtils.lerp(earthRef.current.rotation.x, targetRotationX, delta * 0.8);
        earthRef.current.rotation.y = THREE.MathUtils.lerp(earthRef.current.rotation.y, targetRotationY, delta * 0.8);

        // Animate Zoom
        if (camera.position.z > 3.5) {
            camera.position.z = THREE.MathUtils.lerp(camera.position.z, 3, delta * 0.5);
        } else if (!completionScheduled.current) {
            completionScheduled.current = true;
            setTimeout(onComplete, 1200);
        }
    });

    return (
        <group ref={earthRef}>
            {/* Main Earth Sphere */}
            <mesh>
                <sphereGeometry args={[2, 64, 64]} />
                {earthTexture ? (
                    <meshPhongMaterial
                        map={earthTexture}
                        specular={new THREE.Color('grey')}
                        shininess={5}
                    />
                ) : (
                    <meshStandardMaterial color="#1e40af" roughness={0.7} />
                )}
            </mesh>

            {/* Lightweight procedural cloud veil; it avoids a second network texture. */}
            <mesh scale={[1.018, 1.018, 1.018]} rotation={[0.25, 0.5, 0]}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshLambertMaterial color="#dbeafe" transparent opacity={0.12} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* Atmosphere Glow */}
            <mesh scale={[1.1, 1.1, 1.1]}>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial
                    color="#60a5fa"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
};

export const EarthIntro: React.FC<EarthIntroProps> = (props) => {
    return (
        <Canvas camera={{ position: [0, 0, 40], fov: 45 }}>
            <color attach="background" args={['#000']} />
            <ambientLight intensity={0.1} />
            <directionalLight position={[50, 20, 30]} intensity={1.5} />

            <Earth {...props} />
        </Canvas>
    );
};
