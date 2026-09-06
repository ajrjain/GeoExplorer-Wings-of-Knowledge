import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// --- Textures ---
// Using reliable textures from Three.js examples or safe generic ones
const EARTH_DAY_MAP = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg';
const EARTH_SPECULAR_MAP = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg';
const EARTH_CLOUDS_MAP = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png';

interface EarthIntroProps {
    targetLat: number;
    targetLon: number;
    onComplete: () => void;
}

const Earth: React.FC<{ targetLat: number; targetLon: number; onComplete: () => void }> = ({ targetLat, targetLon, onComplete }) => {
    const earthRef = useRef<THREE.Group>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();

    // State for texture handling
    const [textures, setTextures] = useState<{map: THREE.Texture | null, specular: THREE.Texture | null, clouds: THREE.Texture | null}>({ map: null, specular: null, clouds: null });

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

        Promise.all([
            loadSafe(EARTH_DAY_MAP),
            loadSafe(EARTH_SPECULAR_MAP),
            loadSafe(EARTH_CLOUDS_MAP)
        ]).then(([map, specular, clouds]) => {
            setTextures({ map, specular, clouds });
        });
    }, []);

    // Calculate target rotation to bring coordinates to front (0,0,1 direction)
    const targetRotationX = targetLat * (Math.PI / 180);
    const targetRotationY = -targetLon * (Math.PI / 180) - Math.PI / 2;
    
    useFrame((state, delta) => {
        if (!earthRef.current) return;

        // Animate Earth Rotation
        earthRef.current.rotation.x = THREE.MathUtils.lerp(earthRef.current.rotation.x, targetRotationX, delta * 0.8);
        earthRef.current.rotation.y = THREE.MathUtils.lerp(earthRef.current.rotation.y, targetRotationY, delta * 0.8);

        // Animate Clouds
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.05;
        }

        // Animate Zoom
        if (camera.position.z > 3.5) {
            camera.position.z = THREE.MathUtils.lerp(camera.position.z, 3, delta * 0.5);
        } else {
            setTimeout(onComplete, 1200);
        }
    });

    return (
        <group ref={earthRef}>
            {/* Main Earth Sphere */}
            <mesh>
                <sphereGeometry args={[2, 64, 64]} />
                {textures.map ? (
                    <meshPhongMaterial 
                        map={textures.map} 
                        specularMap={textures.specular} 
                        specular={new THREE.Color('grey')} 
                        shininess={5}
                    />
                ) : (
                    <meshStandardMaterial color="#1e40af" roughness={0.7} /> 
                )}
            </mesh>

            {/* Cloud Layer */}
            {textures.clouds && (
                <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
                    <sphereGeometry args={[2, 64, 64]} />
                    <meshLambertMaterial 
                        map={textures.clouds} 
                        transparent={true} 
                        opacity={0.8} 
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            )}

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
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
            
            <Earth {...props} />
        </Canvas>
    );
};