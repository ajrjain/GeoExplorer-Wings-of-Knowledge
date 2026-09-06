import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface Obstacle {
    id: string;
    type: 'mountain' | 'plane';
    pos: THREE.Vector3;
    radius: number;
    height?: number;
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
        const isOcean = ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean'].includes(region);
        
        // Add mountains if not ocean - REDUCED COUNT & SIZE
        if (!isOcean) {
            for(let i=0; i<12; i++) {
                obs.push({
                    id: `mtn-${i}`,
                    type: 'mountain',
                    pos: new THREE.Vector3((Math.random()-0.5)*800, 0, (Math.random()-0.5)*800),
                    radius: 12 + Math.random()*10, // Smaller collision base
                    height: 30 + Math.random()*30 // Lower mountains
                });
            }
        }
        
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

    const mtnMesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const mountains = initialObstacles.filter(o => o.type === 'mountain');
    const planes = initialObstacles.filter(o => o.type === 'plane');

    useFrame(() => {
        if (mtnMesh.current) {
            mountains.forEach((m, i) => {
                dummy.position.copy(m.pos);
                dummy.position.y = (m.height || 0) / 2; // center of cone
                dummy.scale.set(m.radius, m.height || 0, m.radius);
                dummy.updateMatrix();
                mtnMesh.current!.setMatrixAt(i, dummy.matrix);
            });
            mtnMesh.current.instanceMatrix.needsUpdate = true;
        }

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
            {mountains.length > 0 && (
                <instancedMesh ref={mtnMesh} args={[undefined, undefined, mountains.length]} castShadow>
                    <coneGeometry args={[1, 1, 8]} />
                    <meshStandardMaterial color="#0f766e" roughness={0.9} />
                </instancedMesh>
            )}
            
            {planes.map(p => (
                <AIPlane key={p.id} data={p} />
            ))}
        </group>
    );
}
