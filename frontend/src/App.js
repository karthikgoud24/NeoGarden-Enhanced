import React, { useState } from 'react';
import LandShapeSelector from './components/LandShapeSelector';
import GardenScene from './components/GardenScene';
import ControlPanel from './components/ControlPanel';
import PlantLibrary from './components/PlantLibrary';
import InfoPanel from './components/InfoPanel';
import { Toaster } from './components/ui/sonner';
import './App.css';

export default function App() {
  const [stage, setStage] = useState('land-selection'); // 'land-selection', 'garden-design'
  const [landShape, setLandShape] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [placingMode, setPlacingMode] = useState(false);

  const handleLandShapeComplete = (points) => {
    setLandShape(points);
    setStage('garden-design');
  };

  const handlePlantPlace = (plantData) => {
    setPlants([...plants, { ...plantData, id: Date.now() }]);
  };

  const handlePlantRemove = (id) => {
    setPlants(plants.filter(p => p.id !== id));
  };

  const handlePlantMove = (id, newPosition) => {
    setPlants(plants.map(p => p.id === id ? { ...p, position: newPosition } : p));
  };

  const handleSelectPlantType = (plantType) => {
    setSelectedPlant(plantType);
    setPlacingMode(true);
  };

  const handleSaveGarden = () => {
    const gardenData = {
      landShape,
      plants,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('gardenDesign', JSON.stringify(gardenData));
  };

  const handleLoadGarden = () => {
    const saved = localStorage.getItem('gardenDesign');
    if (saved) {
      const data = JSON.parse(saved);
      setLandShape(data.landShape);
      setPlants(data.plants);
      setStage('garden-design');
    }
  };

  const handleReset = () => {
    setStage('land-selection');
    setLandShape([]);
    setPlants([]);
    setSelectedPlant(null);
    setPlacingMode(false);
  };

  return (
    <div className="App">
      {stage === 'land-selection' ? (
        <LandShapeSelector 
          onComplete={handleLandShapeComplete}
          onLoad={handleLoadGarden}
        />
      ) : (
        <>
          <GardenScene
            landShape={landShape}
            plants={plants}
            selectedPlant={selectedPlant}
            placingMode={placingMode}
            onPlantPlace={handlePlantPlace}
            onPlantMove={handlePlantMove}
            onPlantRemove={handlePlantRemove}
            onPlacingComplete={() => setPlacingMode(false)}
          />
          
          <div className="ui-overlay">
            <ControlPanel
              onSave={handleSaveGarden}
              onReset={handleReset}
            />
            
            <PlantLibrary
              selectedPlant={selectedPlant}
              onSelectPlant={handleSelectPlantType}
              placingMode={placingMode}
            />
            
            <InfoPanel
              landShape={landShape}
              plants={plants}
            />
          </div>
        </>
      )}
      
      <Toaster position="top-right" />
    </div>
  );
}