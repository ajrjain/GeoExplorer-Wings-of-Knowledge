import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export interface Obstacle {
    id: string;
    type: 'mountain' | 'plane';
    pos: THREE.Vector3;
    radius: number;
    height?: number;
    vel?: THREE.Vector3;
}

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
        
        // Add mountains if not ocean
        if (!isOcean) {
            for(let i=0; i<30; i++) {
                obs.push({
                    id: `mtn-${i}`,
                    type: 'mountain',
                    pos: new THREE.Vector3((Math.random()-0.5)*800, 0, (Math.random()-0.5)*800),
                    radius: 20 + Math.random()*15, // Large collision base
                    height: 50 + Math.random()*40
                });
            }
        }
        
        // Add flying planes
        for(let i=0; i<15; i++) {
            obs.push({
                id: `plane-${i}`,
                type: 'plane',
                pos: new THREE.Vector3((Math.random()-0.5)*800, 20 + Math.random()*50, (Math.random()-0.5)*800),
                radius: 6,
                vel: new THREE.Vector3((Math.random()-0.5), 0, (Math.random()-0.5)).normalize().multiplyScalar(0.4 + Math.random()*0.3)
            });
        }
        return obs;
    }, [region]);

    useEffect(() => {
        obstaclesRef.current = initialObstacles;
    }, [initialObstacles, obstaclesRef]);

    const mtnMesh = useRef<THREE.InstancedMesh>(null);
    const planeMesh = useRef<THREE.InstancedMesh>(null);
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

        if (planeMesh.current) {
            planes.forEach((p, i) => {
                // Update plane position
                p.pos.add(p.vel!);
                
                // Wrap around world
                if (p.pos.x > 400) p.pos.x = -400;
                if (p.pos.x < -400) p.pos.x = 400;
                if (p.pos.z > 400) p.pos.z = -400;
                if (p.pos.z < -400) p.pos.z = 400;

                dummy.position.copy(p.pos);
                // orient towards velocity
                dummy.rotation.set(Math.PI / 2, Math.atan2(p.vel!.x, p.vel!.z) + Math.PI, 0, 'YXZ');
                dummy.scale.set(2, 2, 2);
                dummy.updateMatrix();
                planeMesh.current!.setMatrixAt(i, dummy.matrix);
            });
            planeMesh.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <group>
            {mountains.length > 0 && (
                <instancedMesh ref={mtnMesh} args={[undefined, undefined, mountains.length]} castShadow>
                    <coneGeometry args={[1, 1, 8]} />
                    <meshStandardMaterial color="#0f766e" roughness={0.9} />
                </instancedMesh>
            )}
            
            {planes.length > 0 && (
                <instancedMesh ref={planeMesh} args={[undefined, undefined, planes.length]} castShadow>
                    <coneGeometry args={[1, 4, 4]} />
                    <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.2} />
                </instancedMesh>
            )}
        </group>
    );
}
