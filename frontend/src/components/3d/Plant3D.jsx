import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { Trash2 } from "lucide-react";

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
        <pointsMaterial size={0.018 * size} transparent opacity={0.95} color={"#ffc0d9"} depthWrite={false} />
      </points>
      <points ref={pollenRef} geometry={pollenPoints}>
        <pointsMaterial size={0.012 * size} transparent opacity={0.9} color={"#ffec9a"} depthWrite={false} />
      </points>
    </group>
  );
}

/* --------------------------------------------------------------------------
   Main exported Plant3D wrapper used by your scene
   - Renders procedural rose for any plant.type === 'shrub'
   - Keeps other types as nicer procedural shapes (trees, flowers, grass)
   -------------------------------------------------------------------------- */

export const Plant3D = ({ plant, onMove, onRemove }) => {
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

  // Procedural shrub detection: all type === 'shrub' will be procedural rose bush
  if (plant.type === "shrub") {
    return (
      <group ref={groupRef} position={pos} rotation={[0, plant.rotation || 0, 0]}>
        <ProceduralRose size={plant.size ?? 1} color={plant.color || "#c44569"} height={plant.height ?? 1.6} />
        {hovered && (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <ringGeometry args={[ (plant.size ?? 1) * 0.18, (plant.size ?? 1) * 0.24, 48 ]} />
              <meshBasicMaterial color="#4ade80" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
            <Html distanceFactor={10} position={[0, (plant.height ?? 1.2) + 0.45, 0]}>
              <button onClick={(e) => { e.stopPropagation(); onRemove && onRemove(plant.id); }}
                className="glass-panel p-2 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                style={{ pointerEvents: "auto" }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </Html>
          </>
        )}
        <group onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} />
      </group>
    );
  }

  // NON-shrub items: render improved procedural shapes with subtle animations
  const color = new THREE.Color(plant.color || "#77aa66");
  return (
    <group ref={groupRef} position={pos} rotation={[0, plant.rotation || 0, 0]}>
      {/* Tree */}
      {plant.type === "tree" && (
        <group>
          <mesh position={[0, (plant.height ?? 2) * 0.25, 0]}>
            <cylinderGeometry args={[plant.size * 0.05, plant.size * 0.08, (plant.height ?? 2) * 0.5, 10]} />
            <meshStandardMaterial color="#5a3825" roughness={0.95} />
          </mesh>
          <group position={[0, (plant.height ?? 2) * 0.6, 0]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[plant.size * 0.18, 16, 16]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          </group>
        </group>
      )}

      {/* Flower */}
      {plant.type === "flower" && (
        <group>
          <mesh position={[0, (plant.height ?? 0.8) * 0.5, 0]}>
            <cylinderGeometry args={[plant.size * 0.01, plant.size * 0.015, (plant.height ?? 0.8), 6]} />
            <meshStandardMaterial color="#3f7a3b" roughness={0.75} />
          </mesh>
          {[0,1,2,3,4].map((i)=>(
            <mesh key={i} position={[Math.cos((i/5)*Math.PI*2)* (plant.size*0.07), plant.height ?? 0.8, Math.sin((i/5)*Math.PI*2) * (plant.size*0.07)]}>
              <sphereGeometry args={[plant.size*0.05,8,8]} />
              <meshStandardMaterial color={color} roughness={0.35} />
            </mesh>
          ))}
        </group>
      )}

      {/* Grass */}
      {plant.type === "grass" && (
        <group>
          {[...Array(8)].map((_,i)=>(
            <mesh key={i} position={[Math.cos((i/8)*Math.PI*2)*plant.size*0.04, (plant.height??0.6)/2, Math.sin((i/8)*Math.PI*2)*plant.size*0.04]} rotation={[0, (i/8)*Math.PI*2, Math.PI*0.08]}>
              <boxGeometry args={[plant.size*0.02, plant.height ?? 0.8, plant.size*0.01]} />
              <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
          ))}
        </group>
      )}

      {/* Selection ring + delete */}
      {hovered && (
        <>
          <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}>
            <ringGeometry args={[ (plant.size ?? 1) * 0.18, (plant.size ?? 1) * 0.22, 48 ]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
          <Html distanceFactor={10} position={[0, (plant.height ?? 1) + 0.45, 0]}>
            <button onClick={(e)=>{e.stopPropagation(); onRemove && onRemove(plant.id);}} className="glass-panel p-2 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer" style={{pointerEvents:'auto'}}>
              <Trash2 className="w-4 h-4" />
            </button>
          </Html>
        </>
      )}
      <group onPointerEnter={()=>setHovered(true)} onPointerLeave={()=>setHovered(false)} />
    </group>
  );
};

export default Plant3D;
