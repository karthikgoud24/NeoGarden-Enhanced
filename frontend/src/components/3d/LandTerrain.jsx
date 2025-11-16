import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const LandTerrain = ({ shape, onClick, onPointerMove }) => {
  const meshRef = useRef();
  const grassRef = useRef();

  // Helper function to get bounds - defined before useMemo
  const getBounds = (shape) => {
    const xs = shape.map(p => p.x);
    const zs = shape.map(p => p.z);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs)
    };
  };

  // Create terrain geometry from shape
  const geometry = useMemo(() => {
    if (!shape || shape.length < 3) return null;

    // Create shape for extrusion
    const shapeGeometry = new THREE.Shape();
    shapeGeometry.moveTo(shape[0].x, shape[0].z);
    
    for (let i = 1; i < shape.length; i++) {
      shapeGeometry.lineTo(shape[i].x, shape[i].z);
    }
    shapeGeometry.closePath();

    // Extrude to create terrain with depth
    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3
    };

    return new THREE.ExtrudeGeometry(shapeGeometry, extrudeSettings);
  }, [shape]);

  // Create grass blade geometry for surface details
  const grassGeometry = useMemo(() => {
    if (!shape || shape.length < 3) return null;

    const positions = [];
    const colors = [];
    
    // Generate random grass blades on the surface
    for (let i = 0; i < 1000; i++) {
      // Get random point within bounds
      const bounds = getBounds(shape);
      const x = THREE.MathUtils.randFloat(bounds.minX, bounds.maxX);
      const z = THREE.MathUtils.randFloat(bounds.minZ, bounds.maxZ);
      
      // Check if point is inside polygon (simplified)
      if (Math.random() > 0.3) {
        positions.push(x, 0.31, z);
        
        // Vary green color slightly
        const green = THREE.MathUtils.randFloat(0.4, 0.7);
        colors.push(0.2, green, 0.2);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geom;
  }, [shape]);

  // Animate grass slightly
  useFrame((state) => {
    if (grassRef.current) {
      grassRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  if (!geometry) return null;

  return (
    <group>
      {/* Main terrain */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.3, 0]}
        onClick={onClick}
        onPointerMove={onPointerMove}
        receiveShadow
      >
        <meshStandardMaterial
          color="#8B7355"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Grass layer on top */}
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={onClick}
        onPointerMove={onPointerMove}
        receiveShadow
      >
        <meshStandardMaterial
          color="#5a8f3d"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Grass details */}
      {grassGeometry && (
        <points ref={grassRef} geometry={grassGeometry}>
          <pointsMaterial
            size={0.15}
            vertexColors
            sizeAttenuation
            transparent
            opacity={0.6}
          />
        </points>
      )}
    </group>
  );
};

export default LandTerrain;