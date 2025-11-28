import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, Grid } from '@react-three/drei';
import { toast } from 'sonner';
import Garden3D from './3d/Garden3D';
import LoadingScreen from './LoadingScreen';

export const GardenScene = ({
  landShape,
  plants,
  selectedPlant,
  placingMode,
  editingPlantId,
  onPlantPlace,
  onPlantMove,
  onPlantRemove,
  onPlacingComplete
  ,previewSuggestion, previewVisible
}) => {
  const [hoveredPosition, setHoveredPosition] = useState(null);

  // This handler is called from Garden3D when terrain is clicked
  // It receives the full plant data with position already set
  const handlePlantPlacement = (plantData) => {
    if (!plantData) return;

    if (editingPlantId) {
      // Repositioning existing plant
      onPlantMove(editingPlantId, plantData.position);
      toast.success(`${plantData.name} repositioned!`);
    } else {
      // New plant placement
      onPlantPlace(plantData);
      toast.success(`${plantData.name} planted!`);
    }
    
    onPlacingComplete();
  };

  // Handler for when a plant ghost enters a valid position (hover over valid terrain)
  const handlePlantGhostEnterValidPosition = (position, isValid) => {
    if (isValid) {
      setHoveredPosition(position);
    }
  };

  // Handler for when a plant ghost leaves the valid position area
  const handlePlantGhostLeaveValidPosition = () => {
    setHoveredPosition(null);
  };

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 20, 20], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.3} color="#ffa502" />

          {/* Environment */}
          <Sky
            distance={450000}
            sunPosition={[5, 1, 8]}
            inclination={0.6}
            azimuth={0.25}
          />
          <Environment preset="park" />
          <fog attach="fog" args={['#d4e4f7', 30, 100]} />

          {/* 3D Garden */}
          <Garden3D
            landShape={landShape}
            plants={plants}
            selectedPlant={selectedPlant}
            placingMode={placingMode}
            onPlantPlace={handlePlantPlacement}
            onPlantMove={onPlantMove}
            onPlantRemove={onPlantRemove}
            setHoveredPosition={setHoveredPosition}
            onPlantGhostEnterValidPosition={handlePlantGhostEnterValidPosition}
            onPlantGhostLeaveValidPosition={handlePlantGhostLeaveValidPosition}
            previewSuggestion={previewSuggestion}
            previewVisible={previewVisible}
          />

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2.2}
          />

          {/* Grid Helper (optional) */}
          <Grid
            args={[50, 50]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#a8c5a8"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#6b946b"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={false}
            position={[0, -0.01, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      <Suspense fallback={<LoadingScreen />}>
        <div />
      </Suspense>

      {/* Hover indicator */}
      {placingMode && hoveredPosition && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-full shadow-lg border border-primary/30">
          <p className="text-sm font-medium text-foreground text-center">
            {editingPlantId ? (
              <>✓ Click to reposition {selectedPlant?.name}</>
            ) : (
              <>✓ Click to place {selectedPlant?.name}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default GardenScene;