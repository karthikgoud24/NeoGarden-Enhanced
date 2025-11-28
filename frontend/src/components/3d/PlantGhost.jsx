import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * PlantGhost.jsx - simplified translucent preview for shrubs/flowers/trees.
 */

export const PlantGhost = ({ 
  plant, 
  position = [0, 0.02, 0],
  onEnterValidPosition,
  onLeaveValidPosition
}) => {
  const ref = useRef();
  const lastValidStateRef = useRef(false);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + 0.12 + Math.sin(state.clock.elapsedTime * 1.9) * 0.05;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.25;
    
    // For now, assume the position is valid (the ghost is visible)
    // In a real implementation, you might check terrain collision or other constraints
    const isCurrentlyValid = true;
    
    // Call handlers when state changes
    if (isCurrentlyValid && !lastValidStateRef.current) {
      // Entering valid position
      if (onEnterValidPosition) {
        onEnterValidPosition(position, true);
      }
      lastValidStateRef.current = true;
    } else if (!isCurrentlyValid && lastValidStateRef.current) {
      // Leaving valid position
      if (onLeaveValidPosition) {
        onLeaveValidPosition();
      }
      lastValidStateRef.current = false;
    }
  });

  const ghost = useMemo(() => {
    const g = new THREE.Group();
    const baseMat = new THREE.MeshBasicMaterial({ color: plant.color || "#c44569", transparent: true, opacity: 0.28 });
    const ringMat = new THREE.MeshBasicMaterial({ color: "#4ade80", transparent: true, opacity: 0.55, side: THREE.DoubleSide });

    const base = new THREE.Mesh(new THREE.CylinderGeometry((plant.size ?? 1) * 0.18, (plant.size ?? 1) * 0.22, 0.02, 16), baseMat);
    base.rotation.x = -Math.PI / 2;
    g.add(base);

    const foliage = new THREE.Mesh(new THREE.SphereGeometry((plant.size ?? 1) * 0.16, 12, 12),
      new THREE.MeshPhongMaterial({ color: plant.color || "#c44569", transparent: true, opacity: 0.42, emissive: new THREE.Color(plant.color || "#c44569").multiplyScalar(0.05) })
    );
    foliage.position.set(0, (plant.height || 1.0) * 0.55, 0);
    g.add(foliage);

    const pts = new Float32Array(30 * 3);
    for (let i = 0; i < 30; i++) {
      pts[i * 3] = (Math.random() - 0.5) * 0.4;
      pts[i * 3 + 1] = 0.4 + Math.random() * 0.6;
      pts[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    const points = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.02, color: "#ffc0d9", transparent: true, opacity: 0.8 }));
    g.add(points);

    const ring = new THREE.Mesh(new THREE.RingGeometry((plant.size ?? 1) * 0.15, (plant.size ?? 1) * 0.18, 32), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = - (plant.height ?? 1) * 0.12;
    g.add(ring);

    return g;
  }, [plant]);

  return (
    <group ref={ref} position={position}>
      <primitive object={ghost} />
    </group>
  );
};

export default PlantGhost;
