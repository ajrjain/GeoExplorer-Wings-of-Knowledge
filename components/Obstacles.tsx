import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface Obstacle {
    id: string;
    type: 'plane';
    pos: THREE.Vector3;
    radius: number;
    vel?: THREE.Vector3;
}

const AIPlane = ({ data }: { data: Obstacle }) => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.position.copy(data.pos);
        groupRef.current.rotation.y = Math.atan2(data.vel!.x, data.vel!.z) + Math.PI;
        // add slight bank based on velocity
        groupRef.current.rotation.z = Math.sin(Date.now() / 1000 + data.pos.x) * 0.2; 
    });

    return (
        <group ref={groupRef}>
            {/* Fuselage */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.5, 0.3, 4]} />
                <meshStandardMaterial color="#f43f5e" metalness={0.6} roughness={0.2} />
            </mesh>
            {/* Wings */}
            <mesh position={[0, 0.1, 0.5]} castShadow>
                <boxGeometry args={[4.5, 0.1, 1.2]} />
                <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.2} />
            </mesh>
            {/* Tail */}
            <mesh position={[0, 0.5, -1.5]} castShadow>
                <boxGeometry args={[0.2, 1, 1]} />
                <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.2} />
            </mesh>
        </group>
    );
};

export const ObstaclesManager = ({ 
    region, 
    obstaclesRef 
}: { 
    region: string;
    obstaclesRef: React.MutableRefObject<Obstacle[]>
}) => {
    
    // Generate initial obstacles
    const initialObstacles = useMemo(() => {
        const obs: Obstacle[] = [];
        
        // Add flying planes - REDUCED COUNT & HITBOX
        for(let i=0; i<6; i++) {
            obs.push({
                id: `plane-${i}`,
                type: 'plane',
                pos: new THREE.Vector3((Math.random()-0.5)*800, 20 + Math.random()*50, (Math.random()-0.5)*800),
                radius: 3.5, // Reduced from 6
                vel: new THREE.Vector3((Math.random()-0.5), 0, (Math.random()-0.5)).normalize().multiplyScalar(0.4 + Math.random()*0.3)
            });
        }
        return obs;
    }, [region]);

    useEffect(() => {
        obstaclesRef.current = initialObstacles;
    }, [initialObstacles, obstaclesRef]);

    const planes = initialObstacles.filter(o => o.type === 'plane');

    useFrame(() => {
        // Update plane logic
        planes.forEach((p) => {
            p.pos.add(p.vel!);
            
            // Wrap around world
            if (p.pos.x > 400) p.pos.x = -400;
            if (p.pos.x < -400) p.pos.x = 400;
            if (p.pos.z > 400) p.pos.z = -400;
            if (p.pos.z < -400) p.pos.z = 400;
        });
    });

    return (
        <group>
            {planes.map(p => (
                <AIPlane key={p.id} data={p} />
            ))}
        </group>
    );
}
