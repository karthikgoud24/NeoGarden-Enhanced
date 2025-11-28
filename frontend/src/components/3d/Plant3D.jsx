import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { Trash2 } from "lucide-react";
import PlantContextMenu from "../PlantContextMenu";

/* --------------------------------------------------------------------------
   Helper geometry builders and shader strings (kept local to this file)
   -------------------------------------------------------------------------- */

// Build a soft curved stem spline
function buildStemCurve(length = 1.2, segments = 24, bend = 0.5, twist = 0.4) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = Math.sin(t * Math.PI * 2 * twist) * bend * (0.2 * (1 - t));
    const y = t * length;
    const z = Math.cos(t * Math.PI * 2 * (twist * 0.5)) * bend * 0.06 * (1 - t);
    points.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(points);
}

// Parametric petal geometry (curled plane)
function buildPetalGeometry(rad = 0.06, length = 0.14, radialSegs = 10, lengthSegs = 6) {
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= lengthSegs; i++) {
    const v = i / lengthSegs;
    const y = v * length;
    const width = rad * (1 - v * 0.9);
    const curl = Math.sin(v * Math.PI) * 0.04 * (1 - v);
    for (let j = 0; j <= radialSegs; j++) {
      const u = j / radialSegs;
      const angle = (u - 0.5) * Math.PI;
      const x = Math.sin(angle) * width;
      const z = Math.cos(angle) * width * 0.35 + curl * Math.cos(u * Math.PI);
      pos.push(x, y, z);
      uv.push(u, v);
    }
  }
  for (let i = 0; i < lengthSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * (radialSegs + 1) + j;
      const b = a + radialSegs + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geom.setIndex(idx);
  geom.computeVertexNormals();
  return geom;
}

// Simple leaf plane geometry
function buildLeafGeometry(length = 0.18, width = 0.06, segments = 6) {
  const pos = [];
  const idx = [];
  const uv = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * length;
    const w = Math.sin(t * Math.PI) * width;
    pos.push(-w, y, 0, w, y, 0);
    uv.push(0, t, 1, t);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    idx.push(a, c, b, b, c, d);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geom.setIndex(idx);
  geom.computeVertexNormals();
  return geom;
}

/* ---------- Simple vertex shaders for natural sway ---------- */

const leafVertexShader = `
  uniform float time;
  uniform float swayStrength;
  attribute vec3 instanceOffset;
  attribute float instanceRotation;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float ang = instanceRotation;
    float cs = cos(ang);
    float sn = sin(ang);
    mat3 rot = mat3(cs,0.0,-sn,0.0,1.0,0.0,sn,0.0,cs);
    p = rot * p;
    float wind = sin(time * 1.5 + instanceOffset.x * 4.0 + position.y * 6.0) * swayStrength * (vUv.y);
    p.x += wind * 0.12;
    vec4 worldPosition = modelMatrix * vec4(p + instanceOffset, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const leafFragmentShader = `
  varying vec2 vUv;
  uniform vec3 leafColor;
  void main() {
    float alpha = smoothstep(0.05, 0.0, abs(vUv.x - 0.5));
    gl_FragColor = vec4(leafColor, alpha);
  }
`;

const petalVertexShader = `
  uniform float time;
  uniform float swayStrength;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float flutter = sin(time * 2.5 + position.y * 12.0) * swayStrength * 0.06;
    p.x += flutter * (1.0 - uv.y);
    p.z += cos(time * 1.8 + position.x * 35.0) * swayStrength * 0.02 * (uv.y);
    vec4 worldPosition = modelMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const petalFragmentShader = `
  varying vec2 vUv;
  uniform vec3 petalColor;
  void main() {
    float edge = smoothstep(0.0, 0.9, 1.0 - length(vUv - vec2(0.5,0.25)) * 1.4);
    float a = clamp(edge, 0.0, 1.0);
    gl_FragColor = vec4(petalColor, a);
  }
`;

/* --------------------------------------------------------------------------
   InstancedLeaves - creates an instanced mesh of leaves and attaches per-instance attributes
   -------------------------------------------------------------------------- */
function InstancedLeaves({ leafGeom, leafMat, stems, leavesData }) {
  const instRef = useRef();
  const count = leavesData.length;

  // create attributes for instanceOffset and instanceRotation
  useEffect(() => {
    if (!instRef.current) return;
    const mesh = instRef.current;
    const offsets = new Float32Array(count * 3);
    const rots = new Float32Array(count);
    const temp = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const d = leavesData[i];
      const stem = stems[d.stemIdx];
      const pt = stem.curve.getPoint(d.t);
      offsets[i * 3] = pt.x + (Math.random() - 0.5) * 0.02;
      offsets[i * 3 + 1] = pt.y;
      offsets[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.02;
      rots[i] = d.rot;

      temp.position.set(offsets[i * 3], offsets[i * 3 + 1], offsets[i * 3 + 2]);
      temp.rotation.set(0.2 + (Math.random() - 0.5) * 0.4, d.rot, Math.random() * 0.3 - 0.15);
      temp.scale.setScalar(0.7 + Math.random() * 0.7);
      temp.updateMatrix();
      mesh.setMatrixAt(i, temp.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.geometry.setAttribute("instanceOffset", new THREE.InstancedBufferAttribute(offsets, 3));
    mesh.geometry.setAttribute("instanceRotation", new THREE.InstancedBufferAttribute(rots, 1));
  }, [leafGeom, leavesData, stems, count]);

  return <instancedMesh ref={instRef} args={[leafGeom, leafMat, count]} castShadow receiveShadow />;
}

/* --------------------------------------------------------------------------
   ProceduralRose component: creates stems, leaves, flowers, particles
   -------------------------------------------------------------------------- */
function ProceduralRose({
  flowerCount = 6,
  stemCount = 4,
  leafCount = 28,
  size = 1,
  color = "#c44569",
  leafColor = "#2d6b3a",
  height = 1.6
}) {
  const petalGeom = useMemo(() => buildPetalGeometry(0.06 * size, 0.14 * size, 12, 8), [size]);
  const leafGeom = useMemo(() => buildLeafGeometry(0.18 * size, 0.06 * size, 8), [size]);

  const petalMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: petalVertexShader,
    fragmentShader: petalFragmentShader,
    uniforms: { time: { value: 0 }, swayStrength: { value: 0.9 }, petalColor: { value: new THREE.Color(color).multiplyScalar(1.02) } },
    transparent: true, side: THREE.DoubleSide, depthWrite: false
  }), [color]);

  const leafMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: leafVertexShader,
    fragmentShader: leafFragmentShader,
    uniforms: { time: { value: 0 }, swayStrength: { value: 0.9 }, leafColor: { value: new THREE.Color(leafColor) } },
    transparent: true, side: THREE.DoubleSide, depthWrite: false
  }), [leafColor]);

  const stems = useMemo(() => {
    const arr = [];
    for (let s = 0; s < stemCount; s++) {
      const length = height * (0.85 + Math.random() * 0.5);
      const curve = buildStemCurve(length, 28, 0.3 + Math.random() * 0.5, 0.4 + Math.random() * 0.7);
      const geom = new THREE.TubeGeometry(curve, 64, 0.016 * size * (0.9 + Math.random() * 0.5), 8, false);
      const mat = new THREE.MeshStandardMaterial({ color: "#5b3a2a", roughness: 0.95 });
      arr.push({ geom, mat, curve, length });
    }
    return arr;
  }, [stemCount, height, size]);

  const leavesData = useMemo(() => {
    const list = [];
    for (let i = 0; i < leafCount; i++) {
      const stemIdx = Math.floor(Math.random() * stems.length);
      list.push({ stemIdx, t: Math.random() * 0.85 + 0.05, rot: (Math.random() * 0.6 + 0.3) * (Math.random() > 0.5 ? 1 : -1), off: (Math.random() - 0.5) * 0.06 });
    }
    return list;
  }, [leafCount, stems.length]);

  const flowers = useMemo(() => {
    const arr = [];
    for (let f = 0; f < flowerCount; f++) {
      const stemIdx = Math.floor(Math.random() * stems.length);
      arr.push({ stemIdx, t: 0.9 + Math.random() * 0.08, petalCount: 14 + Math.floor(Math.random() * 6), petalScale: 0.9 + Math.random() * 0.4, angleOffset: Math.random() * Math.PI * 2 });
    }
    return arr;
  }, [flowerCount, stems.length]);

  // particle buffers
  const petalsRef = useRef();
  const pollenRef = useRef();
  const petalParticles = useMemo(() => {
    const count = 80;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.6 * size;
      positions[i * 3 + 1] = 0.6 + Math.random() * 0.9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6 * size;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [size]);

  const pollenPoints = useMemo(() => {
    const count = 110;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.0 * size;
      positions[i * 3 + 1] = Math.random() * 1.1 * size;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.0 * size;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [size]);

  // animation loop: update shader time & particle falling
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    petalMat.uniforms.time.value = t;
    leafMat.uniforms.time.value = t;
    // petals falling
    if (petalsRef.current) {
      const g = petalsRef.current.geometry.attributes.position;
      for (let i = 0; i < g.count; i++) {
        let y = g.array[i * 3 + 1];
        y -= 0.006 + Math.sin(t + i) * 0.0008;
        if (y < 0.02) {
          y = 0.8 + Math.random() * 0.6;
          g.array[i * 3] = (Math.random() - 0.5) * 0.6 * size;
          g.array[i * 3 + 2] = (Math.random() - 0.5) * 0.6 * size;
        }
        g.array[i * 3 + 1] = y;
      }
      petalsRef.current.geometry.attributes.position.needsUpdate = true;
      petalsRef.current.rotation.y = t * 0.08;
    }
    if (pollenRef.current) pollenRef.current.rotation.y = t * 0.2;
  });

  return (
    <group>
      {/* stems */}
      {stems.map((s, i) => <mesh key={`stem-${i}`} geometry={s.geom} material={s.mat} castShadow receiveShadow />)}

      {/* leaves */}
      <InstancedLeaves leafGeom={leafGeom} leafMat={leafMat} stems={stems} leavesData={leavesData} />

      {/* flowers */}
      <group>
        {flowers.map((fl, fi) => {
          const stem = stems[fl.stemIdx];
          const pt = stem.curve.getPoint(fl.t);
          const tangent = stem.curve.getTangent(fl.t);
          const up = new THREE.Vector3(0, 1, 0);
          const normal = new THREE.Vector3().crossVectors(up, tangent).normalize();
          const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
          const petals = [];
          for (let p = 0; p < fl.petalCount; p++) {
            const a = (p / fl.petalCount) * Math.PI * 2 + fl.angleOffset;
            const pos = new THREE.Vector3().copy(pt);
            pos.add(normal.clone().multiplyScalar(Math.cos(a) * 0.04 * size));
            pos.add(binormal.clone().multiplyScalar(Math.sin(a) * 0.04 * size));
            const q = new THREE.Quaternion().setFromAxisAngle(tangent, a);
            const sMat = new THREE.Matrix4().makeScale(fl.petalScale, 1, fl.petalScale * 0.9);
            const m = new THREE.Matrix4().compose(pos, q, new THREE.Vector3(1, 1, 1)).multiply(sMat);
            petals.push({ key: `p-${fi}-${p}`, matrix: m });
          }
          return (
            <group key={`flower-${fi}`}>
              {petals.map((pet) => (
                <mesh key={pet.key} geometry={petalGeom} material={petalMat} matrix={pet.matrix} matrixAutoUpdate={false}
                      onUpdate={(self) => { self.matrix.copy(pet.matrix); }} />
              ))}
              <mesh position={[pt.x, pt.y, pt.z]}>
                <sphereGeometry args={[0.02 * size, 8, 8]} />
                <meshStandardMaterial color="#ffd56a" roughness={0.45} emissive="#ffeed6" emissiveIntensity={0.12} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* falling petals & pollen */}
      <points ref={petalsRef} geometry={petalParticles}>
        <pointsMaterial size={0.018 * size} transparent opacity={0.95} color={new THREE.Color(color).multiplyScalar(1.06)} depthWrite={false} />
      </points>
      <points ref={pollenRef} geometry={pollenPoints}>
        <pointsMaterial size={0.012 * size} transparent opacity={0.9} color={new THREE.Color(color).multiplyScalar(0.9)} depthWrite={false} />
      </points>
    </group>
  );
}

/* --------------------------------------------------------------------------
   Main exported Plant3D wrapper used by your scene
   - Renders procedural rose for any plant.type === 'shrub'
   - Keeps other types as nicer procedural shapes (trees, flowers, grass)
   -------------------------------------------------------------------------- */

/**
 * Realistic 3D tree generator for GTA-5-like quality with advanced canopy
 */
function RealisticTree({ height = 3, spread = 2, trunkRadius = 0.12, color = '#2d5016', foliageColor = '#4a7c2e', modelType = 'tree-large', realism = {} }) {
  // Bark material - high quality with variations
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: '#3a2f24',
    roughness: 0.95,
    metalness: 0.05,
    map: undefined,
  });

  // Foliage material - two-tone for depth
  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: foliageColor,
    roughness: 0.65,
    metalness: 0.0,
    flatShading: false,
    side: THREE.DoubleSide,
  });

  const darkFoliageMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(foliageColor).multiplyScalar(0.75),
    roughness: 0.7,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  // Trunk with realistic taper and segments
  const trunkGeometry = new THREE.ConeGeometry(trunkRadius * 1.5, height * 0.4, 16);
  const trunk = <mesh geometry={trunkGeometry} material={trunkMaterial} castShadow receiveShadow position={[0, height * 0.2, 0]} />;

  // Add trunk roots for larger trees
  const roots = [];
  if (modelType === 'tree-xlarge' || modelType === 'tree-large') {
    for (let r = 0; r < 3; r++) {
      const angle = (r / 3) * Math.PI * 2;
      const x = Math.cos(angle) * trunkRadius * 0.8;
      const z = Math.sin(angle) * trunkRadius * 0.8;
      roots.push(
        <mesh key={`root-${r}`} position={[x, -0.1, z]} castShadow>
          <coneGeometry args={[trunkRadius * 0.4, height * 0.15, 8]} />
          <meshStandardMaterial color="#2a1f14" roughness={0.9} />
        </mesh>
      );
    }
  }

  // Multi-layered dense foliage using overlapping spheres for GTA-5-like canopy
  const foliageElements = [];
  // Map realism hints to numeric multipliers
  const sizeMap = { tiny: 0.6, small: 0.85, medium: 1.0, large: 1.25, xlarge: 1.6 };
  const densityMap = { low: 0.6, medium: 1.0, high: 1.45, 'very-high': 1.9 };
  const leafSizeMul = sizeMap[realism.leafSize] || 1.0;
  const densityMul = densityMap[realism.leafDensity] || 1.0;

  let baseFoliageCount = modelType === 'tree-xlarge' ? 16 : modelType === 'tree-large' ? 12 : modelType === 'tree-medium' ? 8 : 5;
  const foliageCount = Math.max(4, Math.round(baseFoliageCount * densityMul));
  const foliageRadius = spread * 0.3 * leafSizeMul;

  // If this is a conifer, render layered cones instead of spherical canopy
  if (modelType === 'tree-conifer') {
    const cones = [];
    const levels = Math.max(3, Math.round(3 + 2 * densityMul));
    for (let L = 0; L < levels; L++) {
      const t = L / Math.max(1, levels - 1);
      const coneRadius = foliageRadius * (1 - t * 0.6);
      const coneHeight = height * (0.25 + t * 0.35);
      const y = height * (0.45 + t * 0.18);
      cones.push(
        <mesh key={`conifer-${L}`} position={[0, y, 0]} castShadow receiveShadow>
          <coneGeometry args={[coneRadius, coneHeight, 20]} />
          <meshStandardMaterial {...foliageMaterial} />
        </mesh>
      );
    }

    // Add a grounding shadow and return conifer group
    cones.push(
      <mesh key="conifer-shadow" position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0, spread * 0.28, 32]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.12} emissive="#000000" emissiveIntensity={0.18} />
      </mesh>
    );

    return (
      <group>
        {trunk}
        {roots}
        {cones}
      </group>
    );
  }

  // Layer 1: Bottom foliage (darker)
  for (let i = 0; i < foliageCount; i++) {
    const angle = (i / foliageCount) * Math.PI * 2;
    const radialDist = foliageRadius * (0.7 + Math.random() * 0.5);
    const x = Math.cos(angle) * radialDist;
    const z = Math.sin(angle) * radialDist;
    const y = height * (0.45 + Math.random() * 0.15);
    const scale = 0.7 + Math.random() * 0.6;

    foliageElements.push(
      <mesh key={`foliage-bottom-${i}`} position={[x, y, z]} castShadow receiveShadow scale={scale}>
        <sphereGeometry args={[spread * 0.25, 18, 18]} />
        <meshStandardMaterial {...darkFoliageMaterial} />
      </mesh>
    );
  }

  // Layer 2: Middle foliage (standard)
  for (let i = 0; i < Math.ceil(foliageCount * 0.8); i++) {
    const angle = (i / foliageCount) * Math.PI * 2 + 0.3;
    const radialDist = foliageRadius * (0.5 + Math.random() * 0.6);
    const x = Math.cos(angle) * radialDist;
    const z = Math.sin(angle) * radialDist;
    const y = height * (0.55 + Math.random() * 0.2);
    const scale = (0.8 + Math.random() * 0.5) * (0.95 + (leafSizeMul - 1) * 0.5);

    foliageElements.push(
      <mesh key={`foliage-mid-${i}`} position={[x, y, z]} castShadow receiveShadow scale={scale}>
        <sphereGeometry args={[spread * 0.3, 18, 18]} />
        <meshStandardMaterial {...foliageMaterial} />
      </mesh>
    );
  }

  // Layer 3: Top canopy (bright, multiple spheres for density)
  for (let i = 0; i < 3; i++) {
    const offsetX = (Math.random() - 0.5) * spread * 0.2;
    const offsetZ = (Math.random() - 0.5) * spread * 0.2;
    const topScale = (0.8 + Math.random() * 0.4) * (0.95 + (leafSizeMul - 1) * 0.45);

    foliageElements.push(
      <mesh
        key={`foliage-top-${i}`}
        position={[offsetX, height * (0.68 + i * 0.08), offsetZ]}
        castShadow
        receiveShadow
        scale={topScale}
      >
        <sphereGeometry args={[spread * 0.35 * leafSizeMul, 20, 20]} />
        <meshStandardMaterial {...foliageMaterial} />
      </mesh>
    );
  }

  // Add some ambient occlusion shadow under canopy
  foliageElements.push(
    <mesh key="shadow-ring" position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[0, spread * 0.4, 32]} />
      <meshStandardMaterial
        color="#000000"
        transparent
        opacity={0.15}
        emissive="#000000"
        emissiveIntensity={0.2}
      />
    </mesh>
  );

  return (
    <group>
      {trunk}
      {roots}
      {foliageElements}
    </group>
  );
}

/**
 * Palm tree for tropical plants - GTA-5 quality with realistic fronds
 */
function PalmTree({ height = 6, color = '#8b7355', foliageColor = '#2d5016' }) {
  // Enhanced trunk material with texture detail
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: '#8b6f47',
    roughness: 0.95,
    metalness: 0.01,
    normalScale: new THREE.Vector2(1, 1),
  });

  // Advanced frond material with better light interaction
  const frondMaterial = new THREE.MeshStandardMaterial({
    color: foliageColor,
    roughness: 0.55,
    metalness: 0.05,
    flatShading: false,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(foliageColor).multiplyScalar(0.15),
  });

  // Segmented trunk with taper for realistic tapering effect
  const trunkSegments = [];
  for (let i = 0; i < 8; i++) {
    const segmentHeight = (height * 0.8) / 8;
    const radiusTop = 0.14 - (i / 8) * 0.06;
    const radiusBottom = 0.14 - ((i + 1) / 8) * 0.06;
    
    trunkSegments.push(
      <mesh
        key={`trunk-seg-${i}`}
        position={[0, height * 0.375 - segmentHeight * i, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[radiusTop, radiusBottom, segmentHeight, 20]} />
        <meshStandardMaterial {...trunkMaterial} />
      </mesh>
    );
  }

  // Trunk base for stability and realism
  const trunkBase = (
    <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.18, 0.22, 0.15, 24]} />
      <meshStandardMaterial
        color="#6a4c32"
        roughness={0.92}
        metalness={0.01}
      />
    </mesh>
  );

  // Enhanced fronds with more realistic shape and animation capability
  const fronds = [];
  const frondCount = 18; // More fronds for density
  
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2;
    const tilt = Math.PI * 0.38 + Math.sin(i * 0.5) * 0.12;
    const curve = Math.sin((i / frondCount) * Math.PI) * 0.25;
    const frondRotation = Math.random() * 0.3 - 0.15;

    // Main frond blade - larger and better proportioned
    fronds.push(
      <mesh
        key={`frond-main-${i}`}
        position={[0, height * 0.72, 0]}
        rotation={[tilt, angle, curve]}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[0.22, 1.4]} />
        <meshStandardMaterial
          {...frondMaterial}
          color={new THREE.Color(foliageColor)}
        />
      </mesh>
    );

    // Secondary frond for more complexity
    fronds.push(
      <mesh
        key={`frond-secondary-${i}`}
        position={[0, height * 0.7, 0]}
        rotation={[tilt + 0.15, angle + 0.3, curve - 0.1]}
        castShadow
      >
        <planeGeometry args={[0.18, 1.1]} />
        <meshStandardMaterial
          color={new THREE.Color(foliageColor).multiplyScalar(0.88)}
          roughness={0.58}
          side={THREE.DoubleSide}
          emissive={new THREE.Color(foliageColor).multiplyScalar(0.1)}
        />
      </mesh>
    );
  }

  // Inner layer fronds for extra density
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2 + 0.5;
    const tilt = Math.PI * 0.42;
    fronds.push(
      <mesh
        key={`frond-inner-${i}`}
        position={[0, height * 0.68, 0]}
        rotation={[tilt, angle, 0.15]}
        castShadow
      >
        <planeGeometry args={[0.16, 0.95]} />
        <meshStandardMaterial
          color={new THREE.Color(foliageColor).multiplyScalar(0.82)}
          roughness={0.6}
          side={THREE.DoubleSide}
          emissive={new THREE.Color(foliageColor).multiplyScalar(0.08)}
        />
      </mesh>
    );
  }

  // Frond crown (top layer) for fuller appearance
  fronds.push(
    <mesh
      key="frond-crown"
      position={[0, height * 0.82, 0]}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[0.32, 10, 10]} />
      <meshStandardMaterial
        color={foliageColor}
        roughness={0.52}
        emissive={new THREE.Color(foliageColor).multiplyScalar(0.12)}
      />
    </mesh>
  );

  // Add coconut clusters on trunk for realism
  const coconutClusters = [];
  for (let c = 0; c < 3; c++) {
    const clusterHeight = height * (0.55 - c * 0.15);
    const clusterAngle = (c / 3) * Math.PI * 2;
    
    for (let i = 0; i < 3; i++) {
      const angle = clusterAngle + (i - 1) * 0.3;
      const radius = 0.15;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      coconutClusters.push(
        <mesh
          key={`coconut-${c}-${i}`}
          position={[x, clusterHeight, z]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial
            color="#d4a574"
            roughness={0.75}
            metalness={0.02}
            emissive="#8b6f47"
            emissiveIntensity={0.1}
          />
        </mesh>
      );
    }
  }

  // Shadow ring for grounding effect
  const shadowRing = (
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[0, 0.6, 32]} />
      <meshStandardMaterial
        color="#000000"
        transparent
        opacity={0.15}
        emissive="#000000"
        emissiveIntensity={0.18}
      />
    </mesh>
  );

  return (
    <group>
      {trunkBase}
      {trunkSegments}
      {fronds}
      {coconutClusters}
      {shadowRing}
    </group>
  );
}

export const Plant3D = ({ plant, onMove, onRemove, onReplace, onReposition }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [growing, setGrowing] = useState(true);
  const growth = useRef(0);

  useFrame((state, delta) => {
    if (growing && growth.current < 1) {
      growth.current += delta * 0.45;
      if (growth.current >= 1) { growth.current = 1; setGrowing(false); }
    }
    if (!groupRef.current) return;
    const ease = 1 - Math.pow(1 - growth.current, 3);
    groupRef.current.scale.setScalar(ease);
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.z = Math.sin(t * 0.35 + (plant?.id?.length || 0)) * 0.03;
  });

  const pos = plant.position || [0, 0, 0];
  // Extract height from plant data - handle both min/max range and scalar values
  // Apply height scale factor to normalize based on garden size
  const baseHeight = (plant.height?.max || plant.height) ?? 2;
  const heightScale = plant.heightScale ?? 1;
  const height = baseHeight * heightScale; // Direct scale, no additional multiplier
  const spread = (plant.spread ?? (plant.width?.max || 2)) * heightScale;
  const color = plant.color || '#2d5016';
  const foliageColor = plant.foliageColor || '#4a7c2e';
  const modelType = plant.modelType || 'tree-large';
  const category = plant.category || '';

  // Determine render type based on modelType and category
  const isTree = modelType?.includes('tree');
  const isShrub = modelType?.includes('shrub') || category?.includes('shrub');
  const isFlower = modelType?.includes('flower') || category?.includes('flower');
  const isPalm = modelType === 'tree-palm';

  // Render shrub with procedural rose
  if (isShrub) {
    return (
      <group ref={groupRef} position={pos} rotation={[0, plant.rotation || 0, 0]}>
        <ProceduralRose size={plant.size ?? 1} color={plant.flowerColor || color} leafColor={foliageColor} height={height} />
        {hovered && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <ringGeometry args={[(spread * 0.5) * 0.18, (spread * 0.5) * 0.24, 48]} />
              <meshBasicMaterial color="#4ade80" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
            <Html distanceFactor={10} position={[0, height + 0.45, 0]}>
              <PlantContextMenu
                plant={plant}
                onRemove={onRemove}
                onReplace={onReplace}
                onReposition={onReposition}
              />
            </Html>
          </>
        )}
        <group onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} />
      </group>
    );
  }

  // Render realistic trees
  if (isTree) {
    const isPalm = modelType === 'tree-palm';
    return (
      <group ref={groupRef} position={pos} rotation={[0, plant.rotation || 0, 0]}>
        {isPalm ? (
          <PalmTree height={height} color={color} foliageColor={foliageColor} />
        ) : (
          <RealisticTree height={height} spread={spread} color={color} foliageColor={foliageColor} modelType={modelType} realism={plant.realism || {}} />
        )}
        {hovered && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <ringGeometry args={[(spread * 0.5) * 0.18, (spread * 0.5) * 0.22, 48]} />
              <meshBasicMaterial color="#4ade80" transparent opacity={0.65} side={THREE.DoubleSide} />
            </mesh>
            <Html distanceFactor={10} position={[0, height + 0.45, 0]}>
              <PlantContextMenu
                plant={plant}
                onRemove={onRemove}
                onReplace={onReplace}
                onReposition={onReposition}
              />
            </Html>
          </>
        )}
        <group onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} />
      </group>
    );
  }

  // Render flowers with realistic petals
  if (isFlower) {
    const stemColor = foliageColor || '#3f7a3b';
    const petalColor = plant.flowerColor || color;
    // species-specific petal counts for more realistic shapes
    let petalCount = Math.ceil((spread * 10) % 8) + 5; // default 5-12 based on spread
    if (plant.id === 'sunflower' || plant.modelType === 'flower-tall') petalCount = 20;
    if (plant.id === 'rose') petalCount = 14;
    if (plant.id === 'hibiscus') petalCount = 6;
    const outerPetalSize = plant.id === 'sunflower' ? spread * 0.28 : spread * 0.2;
    const innerPetalSize = plant.id === 'sunflower' ? spread * 0.12 : spread * 0.15;
    
    return (
      <group ref={groupRef} position={pos} rotation={[0, plant.rotation || 0, 0]}>
        {/* Main stem */}
        <mesh position={[0, height * 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.022, height * 0.8, 12]} />
          <meshStandardMaterial color={stemColor} roughness={0.85} metalness={0.0} />
        </mesh>

        {/* Stem leaves */}
        {[0, 1].map((i) => (
          <mesh
            key={`leaf-${i}`}
            position={[Math.cos(i * Math.PI) * 0.08, height * (0.3 + i * 0.2), Math.sin(i * Math.PI) * 0.04]}
            rotation={[0.3, i * Math.PI, -0.2]}
            castShadow
          >
            <boxGeometry args={[0.08, 0.25, 0.02]} />
            <meshStandardMaterial color={new THREE.Color(stemColor).multiplyScalar(0.9)} roughness={0.7} />
          </mesh>
        ))}

        {/* Flower head - multiple petal layers for realism */}
        {/* Outer petal circle */}
        {Array.from({ length: petalCount }).map((_, i) => {
          const angle = (i / petalCount) * Math.PI * 2;
          const radius = spread * 0.35;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <mesh
              key={`petal-outer-${i}`}
              position={[x, height * 0.95, z]}
              rotation={[0.2, angle, Math.sin(angle) * 0.3]}
              castShadow
              receiveShadow
            >
              <sphereGeometry args={[outerPetalSize, 14, 14]} />
              <meshStandardMaterial
                color={petalColor}
                roughness={0.38}
                metalness={0.0}
                emissive={new THREE.Color(petalColor).multiplyScalar(0.04)}
                emissiveIntensity={0.05}
              />
            </mesh>
          );
        })}

        {/* Inner petal circle for depth */}
        {Array.from({ length: Math.max(3, Math.floor(petalCount * 0.6)) }).map((_, i) => {
          const angle = (i / Math.max(3, Math.floor(petalCount * 0.6))) * Math.PI * 2 + Math.PI / petalCount;
          const radius = spread * 0.2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const brightColor = new THREE.Color(petalColor).multiplyScalar(1.15);
          return (
            <mesh
              key={`petal-inner-${i}`}
              position={[x, height * 0.97, z]}
              rotation={[0.1, angle, 0]}
              castShadow
            >
              <sphereGeometry args={[innerPetalSize, 12, 12]} />
              <meshStandardMaterial
                color={brightColor}
                roughness={0.33}
                emissive={brightColor}
                emissiveIntensity={0.1}
              />
            </mesh>
          );
        })}

        {/* Center flower head - stamen */}
        <mesh position={[0, height * 0.99, 0]} castShadow>
          <sphereGeometry args={[spread * 0.12, 12, 12]} />
          <meshStandardMaterial
            color={plant.id === 'sunflower' ? '#6b3e1d' : '#ffd56a'}
            roughness={0.45}
            emissive={plant.id === 'sunflower' ? '#3f2a1a' : '#ffeed6'}
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Shadow under flower */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0, spread * 0.5, 32]} />
          <meshStandardMaterial
            color="#000000"
            transparent
            opacity={0.1}
            emissive="#000000"
            emissiveIntensity={0.12}
          />
        </mesh>

        {hovered && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <ringGeometry args={[(spread * 0.5) * 0.18, (spread * 0.5) * 0.22, 48]} />
              <meshBasicMaterial color="#4ade80" transparent opacity={0.65} side={THREE.DoubleSide} />
            </mesh>
            <Html distanceFactor={10} position={[0, height + 0.45, 0]}>
              <PlantContextMenu
                plant={plant}
                onRemove={onRemove}
                onReplace={onReplace}
                onReposition={onReposition}
              />
            </Html>
          </>
        )}
        <group onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} />
      </group>
    );
  }

  // Default render for unknown types
  const color3d = new THREE.Color(color);
  return (
    <group ref={groupRef} position={pos} rotation={[0, plant.rotation || 0, 0]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[spread * 0.4, 16, 16]} />
        <meshStandardMaterial color={color3d} roughness={0.7} />
      </mesh>
      {hovered && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[(spread * 0.5) * 0.18, (spread * 0.5) * 0.22, 48]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
          <Html distanceFactor={10} position={[0, height + 0.45, 0]}>
            <PlantContextMenu
              plant={plant}
              onRemove={onRemove}
              onReplace={onReplace}
              onReposition={onReposition}
            />
          </Html>
        </>
      )}
      <group onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} />
    </group>
  );
};

export default Plant3D;
