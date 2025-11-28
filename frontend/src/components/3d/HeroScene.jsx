import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

function LowPolyTree() {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) ref.current.rotation.y = Math.sin(t * 0.2) * 0.12;
  });
  return (
    <group ref={ref} position={[0, -0.6, 0]}>
      {/* trunk */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.6, 8]} />
        <meshStandardMaterial color="#8b5a2b" metalness={0.05} roughness={0.6} />
      </mesh>

      {/* layered foliage as cones */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.46, 0.5, 8]} />
        <meshStandardMaterial color="#2eb86b" metalness={0.06} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.74, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.34, 0.42, 8]} />
        <meshStandardMaterial color="#2ad17a" metalness={0.06} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0.96, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.22, 0.34, 8]} />
        <meshStandardMaterial color="#20b86a" metalness={0.05} roughness={0.46} />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[6, 6, 1, 1]} />
      <meshStandardMaterial color="#071026" metalness={0.1} roughness={0.8} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: [0, 1.8, 2.6], fov: 40 }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <spotLight intensity={0.4} position={[-5, 5, -3]} angle={0.4} penumbra={0.5} />

        <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.9}>
          <LowPolyTree />
        </Float>

        <Ground />

        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} maxPolarAngle={Math.PI / 2.2} minPolarAngle={Math.PI / 3.6} />
      </Canvas>
    </div>
  );
}
