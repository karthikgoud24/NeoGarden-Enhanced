import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import LandTerrain from './LandTerrain';
import Plant3D from './Plant3D';
import PlantGhost from './PlantGhost';
import ParticleEffect from './ParticleEffect';

export const Garden3D = ({
  landShape,
  plants,
  selectedPlant,
  placingMode,
  onPlantPlace,
  onPlantMove,
  onPlantRemove,
  setHoveredPosition
}) => {
  const groupRef = useRef();
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [justPlanted, setJustPlanted] = useState(null);

  // Convert 2D land shape to 3D coordinates
  const land3DShape = useMemo(() => {
    if (!landShape || landShape.length < 3) return [];

    // Center the shape and scale it
    const centerX = landShape.reduce((sum, p) => sum + p.x, 0) / landShape.length;
    const centerY = landShape.reduce((sum, p) => sum + p.y, 0) / landShape.length;

    return landShape.map(point => ({
      x: (point.x - centerX) / 30, // Scale down
      z: (point.y - centerY) / 30,
      y: 0
    }));
  }, [landShape]);

  const handleTerrainClick = (event) => {
    if (!placingMode || !selectedPlant) return;

    const point = event.point;
    
    // Check if within land boundaries
    const isInside = isPointInPolygon(
      { x: point.x, z: point.z },
      land3DShape.map(p => ({ x: p.x, z: p.z }))
    );

    if (!isInside) {
      return; // Don't place outside boundaries
    }

    onPlantPlace([point.x, 0, point.z]);
    
    // Show particle effect
    setJustPlanted({ position: [point.x, 0, point.z], timestamp: Date.now() });
    setTimeout(() => setJustPlanted(null), 2000);
  };

  const handlePointerMove = (event) => {
    if (placingMode && event.point) {
      setHoveredPoint(event.point);
      setHoveredPosition(event.point);
    }
  };

  // Point in polygon check (ray casting algorithm)
  const isPointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const zi = polygon[i].z;
      const xj = polygon[j].x;
      const zj = polygon[j].z;

      const intersect =
        zi > point.z !== zj > point.z &&
        point.x < ((xj - xi) * (point.z - zi)) / (zj - zi) + xi;

      if (intersect) inside = !inside;
    }
    return inside;
  };

  return (
    <group ref={groupRef}>
      {/* Land Terrain */}
      <LandTerrain
        shape={land3DShape}
        onClick={handleTerrainClick}
        onPointerMove={handlePointerMove}
      />

      {/* Placed Plants */}
      {plants.map((plant) => (
        <Plant3D
          key={plant.id}
          plant={plant}
          onMove={onPlantMove}
          onRemove={onPlantRemove}
        />
      ))}

      {/* Ghost plant preview when placing */}
      {placingMode && selectedPlant && hoveredPoint && (
        <PlantGhost
          plant={selectedPlant}
          position={[hoveredPoint.x, 0, hoveredPoint.z]}
        />
      )}

      {/* Particle effect when planting */}
      {justPlanted && (
        <ParticleEffect position={justPlanted.position} />
      )}
    </group>
  );
};

export default Garden3D;