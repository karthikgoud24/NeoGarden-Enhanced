import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import LandTerrain from './LandTerrain';
import Plant3D from './Plant3D';
import PlantGhost from './PlantGhost';
import ParticleEffect from './ParticleEffect';

// Helper function to calculate garden scale factor for height normalization
// Scale ensures trees are proportional to land so 20+ trees fit without crowding
const calculateScaleFactor = (landShape, areaConfig) => {
  if (!landShape || landShape.length < 3) return 1;
  
  // Calculate land area in canvas units using Shoelace formula
  let landArea = 0;
  for (let i = 0; i < landShape.length; i++) {
    const j = (i + 1) % landShape.length;
    landArea += landShape[i].x * landShape[j].y;
    landArea -= landShape[j].x * landShape[i].y;
  }
  landArea = Math.abs(landArea) / 2;
  
  // Reference: 150 canvas pixels = 50 sqm of land
  // Smaller trees relative to land = can fit 20+ trees
  const referencePixelArea = 150;
  const referenceSqm = 50;
  
  // Actual sqm / reference sqm ratio
  const areaRatio = (areaConfig?.areaSqm || 100) / referenceSqm;
  // Pixel area / reference pixel area ratio
  const pixelRatio = landArea / referencePixelArea;
  
  // Combine ratios for final scale
  const scaleFactor = (areaRatio * pixelRatio) * 0.25; // 0.25 makes trees much smaller
  return Math.max(0.15, Math.min(1.0, scaleFactor)); // Clamp aggressively
};

export const Garden3D = ({
  landShape,
  plants,
  selectedPlant,
  placingMode,
  editingPlantId,
  onPlantPlace,
  onPlantMove,
  onPlantRemove,
  onPlantReplace,
  onPlantReposition,
  setHoveredPosition,
  onPlantGhostEnterValidPosition,
  onPlantGhostLeaveValidPosition,
  areaConfig,
  previewSuggestion,
  previewVisible
}) => {
  const groupRef = useRef();
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [justPlanted, setJustPlanted] = useState(null);
  
  // Calculate height scale factor once
  const heightScaleFactor = useMemo(() => calculateScaleFactor(landShape, areaConfig), [landShape, areaConfig]);

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

    // Pass complete plant data with position to the parent
    onPlantPlace({
      ...selectedPlant,
      position: [point.x, 0, point.z],
      rotation: Math.random() * Math.PI * 2 // Random rotation
    });
    
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
          plant={{...plant, heightScale: heightScaleFactor}}
          onMove={onPlantMove}
          onRemove={onPlantRemove}
          onReplace={onPlantReplace}
          onReposition={onPlantReposition}
        />
      ))}

      {/* Ghost plant preview when placing */}
      {placingMode && selectedPlant && hoveredPoint && (
        <PlantGhost
          plant={selectedPlant}
          position={[hoveredPoint.x, 0, hoveredPoint.z]}
          onEnterValidPosition={onPlantGhostEnterValidPosition}
          onLeaveValidPosition={onPlantGhostLeaveValidPosition}
        />
      )}

      {/* AI suggestion preview ghosts (non-destructive) */}
      {previewVisible && previewSuggestion && Array.isArray(previewSuggestion.items) && (
        previewSuggestion.items.map((it, idx) => {
          // Build a minimal plant object for ghost rendering
          const plantObj = {
            id: it.plantId || `ai-${idx}`,
            name: it.name || it.plantId,
            color: it.color || '#9dd3a8',
            height: (it.height && typeof it.height === 'number') ? it.height : 1,
            size: (it.spread && typeof it.spread === 'number') ? it.spread : 1
          };
          const pos = it.position || [0,0,0];
          return (
            <PlantGhost key={`ai-ghost-${it.tempId || idx}`} plant={plantObj} position={[pos[0], 0, pos[2]]} />
          );
        })
      )}

      {/* Particle effect when planting */}
      {justPlanted && (
        <ParticleEffect position={justPlanted.position} />
      )}
    </group>
  );
};

export default Garden3D;