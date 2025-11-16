import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ParticleEffect = ({ position }) => {
  const particlesRef = useRef();
  const timeRef = useRef(0);

  // Create particles
  const particles = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Random position around origin
      positions[i * 3] = (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 1] = Math.random() * 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

      // Random velocity
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: Math.random() * 0.03 + 0.02,
        z: (Math.random() - 0.5) * 0.02
      });

      // Green-ish colors
      colors[i * 3] = Math.random() * 0.3 + 0.2; // R
      colors[i * 3 + 1] = Math.random() * 0.3 + 0.6; // G
      colors[i * 3 + 2] = Math.random() * 0.3 + 0.2; // B
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return { geometry, velocities, count };
  }, []);

  // Animate particles
  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    timeRef.current += delta;
    
    if (timeRef.current > 2) {
      // Fade out after 2 seconds
      particlesRef.current.material.opacity = Math.max(0, 1 - (timeRef.current - 2));
    }

    const positions = particlesRef.current.geometry.attributes.position.array;

    for (let i = 0; i < particles.count; i++) {
      const velocity = particles.velocities[i];
      
      // Update positions
      positions[i * 3] += velocity.x;
      positions[i * 3 + 1] += velocity.y;
      positions[i * 3 + 2] += velocity.z;

      // Apply gravity
      velocity.y -= 0.001;

      // Reset if below ground
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 0;
        velocity.y *= -0.3; // Bounce
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} position={position} geometry={particles.geometry}>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleEffect;