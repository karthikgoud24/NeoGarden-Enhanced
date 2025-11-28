import React, { useState } from 'react';
import { toast } from 'sonner';
import LandShapeSelector from './components/LandShapeSelector';
import GardenAreaInput from './components/GardenAreaInput';
import GardenScene from './components/GardenScene';
import ControlPanel from './components/ControlPanel';
import PlantLibrary from './components/PlantLibrary';
import InfoPanel from './components/InfoPanel';
import PlantsList from './components/PlantsList';
import LandingPage from './components/LandingPage';
import SavedDesignsModal from './components/SavedDesignsModal';
import aiPlanner from './lib/aiPlanner';
import { getPlantById } from './lib/plantLibrary';
import HowPage from './components/HowPage';
import FeaturesPage from './components/FeaturesPage';
import AIPreviewModal from './components/AIPreviewModal';
import { Toaster } from './components/ui/sonner';
import './App.css';

export default function App() {
  const [stage, setStage] = useState('landing'); // 'landing', 'area-input', 'land-selection', 'garden-design'
  const [areaConfig, setAreaConfig] = useState(null);
  const [landShape, setLandShape] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [placingMode, setPlacingMode] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState(null); // For replace mode
  const [showPlantsPanel, setShowPlantsPanel] = useState(false);

  const handleAreaConfirm = (config) => {
    setAreaConfig(config);
    setStage('land-selection');
  };

  const handleLandShapeComplete = (points, config) => {
    setLandShape(points);
    if (config) {
      setAreaConfig(config);
    }
    setStage('garden-design');
  };

  const handlePlantPlace = (plantData) => {
    if (editingPlantId) {
      // This shouldn't be called in reposition mode - use handlePlantMove instead
      return;
    }
    // New plant placement
    setPlants([...plants, { ...plantData, id: Date.now() }]);
  };

  const handlePlantRemove = (id) => {
    setPlants(plants.filter(p => p.id !== id));
  };

  const handlePlantMove = (id, newPosition) => {
    setPlants(plants.map(p => p.id === id ? { ...p, position: newPosition } : p));
  };

  const handlePlantReplace = (id, newPlant) => {
    setPlants(plants.map(p => p.id === id ? { ...newPlant, id, position: p.position, rotation: p.rotation } : p));
    setEditingPlantId(null);
    setPlacingMode(false);
  };

  const handlePlantReposition = (id) => {
    setEditingPlantId(id);
    setPlacingMode(true);
    const plantToReposition = plants.find(p => p.id === id);
    if (plantToReposition) {
      setSelectedPlant(plantToReposition);
    }
  };

  // Export garden design as JSON
  const handleExportGarden = () => {
    const gardenData = {
      name: `Garden-${new Date().toISOString().slice(0, 10)}`,
      timestamp: new Date().toISOString(),
      areaConfig,
      landShape,
      plants: plants.map(p => ({
        id: p.id,
        name: p.name,
        icon: p.icon,
        modelType: p.modelType,
        category: p.category,
        height: p.height,
        spread: p.spread,
        position: p.position,
        rotation: p.rotation,
        color: p.color,
        foliageColor: p.foliageColor
      }))
    };
    
    const dataStr = JSON.stringify(gardenData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${gardenData.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import garden design from JSON file
  const handleImportGarden = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gardenData = JSON.parse(e.target.result);
        if (gardenData.areaConfig && gardenData.landShape && gardenData.plants) {
          setAreaConfig(gardenData.areaConfig);
          setLandShape(gardenData.landShape);
          setPlants(gardenData.plants);
          setStage('garden-design');
          toast.success('Garden imported successfully!');
        } else {
          toast.error('Invalid garden file format');
        }
      } catch (err) {
        toast.error('Failed to parse garden file');
      }
    };
    reader.readAsText(file);
  };

  const handleSelectPlantType = (plantType) => {
    setSelectedPlant(plantType);
    if (editingPlantId) {
      // Replace mode - just apply immediately
      handlePlantReplace(editingPlantId, plantType);
    } else {
      // Normal placement mode
      setPlacingMode(true);
    }
  };

  const handleSaveGarden = () => {
    const gardenData = {
      landShape,
      plants,
      timestamp: new Date().toISOString()
    };
    try {
      const existing = JSON.parse(localStorage.getItem('gardenDesigns') || '[]');
      const name = `Garden-${new Date().toISOString().slice(0, 19).replace('T', '_')}`;
      const entry = { name, timestamp: gardenData.timestamp, landShape: gardenData.landShape, plants: gardenData.plants };
      existing.push(entry);
      localStorage.setItem('gardenDesigns', JSON.stringify(existing));
      toast.success('Garden saved locally');
    } catch (e) {
      localStorage.setItem('gardenDesign', JSON.stringify(gardenData));
      toast.success('Garden saved (fallback)');
    }
  };

  const handleLoadGarden = () => {
    try {
      const list = JSON.parse(localStorage.getItem('gardenDesigns') || '[]');
      if (!list || list.length === 0) {
        toast.error('No saved gardens found');
        return;
      }
      if (list.length === 1) {
        const data = list[0];
        setLandShape(data.landShape || []);
        setPlants(data.plants || []);
        setStage('garden-design');
        toast.success(`Loaded ${data.name}`);
        return;
      }

      // Multiple saved designs: prompt user to choose
      const promptList = list.map((g, idx) => `${idx + 1}. ${g.name} (${new Date(g.timestamp).toLocaleString()})`).join('\n');
      const choice = window.prompt(`Multiple saved gardens found. Enter number to load:\n\n${promptList}`);
      const idx = parseInt(choice, 10) - 1;
      if (!isNaN(idx) && idx >= 0 && idx < list.length) {
        const data = list[idx];
        setLandShape(data.landShape || []);
        setPlants(data.plants || []);
        setStage('garden-design');
        toast.success(`Loaded ${data.name}`);
      } else {
        toast.error('Load cancelled or invalid selection');
      }
    } catch (e) {
      // fallback to legacy single save
      const saved = localStorage.getItem('gardenDesign');
      if (saved) {
        const data = JSON.parse(saved);
        setLandShape(data.landShape);
        setPlants(data.plants);
        setStage('garden-design');
        toast.success('Loaded saved garden');
      } else {
        toast.error('No saved gardens found');
      }
    }
  };

  // Saved designs modal helpers
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [lastAIPlantsSnapshot, setLastAIPlantsSnapshot] = useState(null);
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushHistory = (snapshot) => {
    try {
      let stack = historyStack.slice(0, historyIndex + 1);
      stack.push(snapshot);
      // cap history to last 20
      if (stack.length > 20) stack = stack.slice(stack.length - 20);
      setHistoryStack(stack);
      setHistoryIndex(stack.length - 1);
    } catch (e) {
      console.warn('Failed to push history', e);
    }
  };

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < historyStack.length - 1;

  const undoHistory = () => {
    if (!canUndo) {
      toast.error('Nothing to undo');
      return;
    }
    const snapshot = historyStack[historyIndex];
    setPlants(snapshot || []);
    setHistoryIndex(historyIndex - 1);
    toast.success('Undid change');
  };

  const redoHistory = () => {
    if (!canRedo) {
      toast.error('Nothing to redo');
      return;
    }
    const nextIndex = historyIndex + 1;
    const snapshot = historyStack[nextIndex];
    setPlants(snapshot || []);
    setHistoryIndex(nextIndex);
    toast.success('Redid change');
  };
  const getSavedDesigns = () => {
    try {
      return JSON.parse(localStorage.getItem('gardenDesigns') || '[]');
    } catch (e) {
      return [];
    }
  };

  const handleOpenSavedModal = () => {
    setSavedModalOpen(true);
  };

  const handleCloseSavedModal = () => setSavedModalOpen(false);

  const handleSaveAs = (name) => {
    const existing = getSavedDesigns();
    const gardenData = { name: name || `Garden-${new Date().toISOString().slice(0,19).replace('T','_')}`, timestamp: new Date().toISOString(), landShape, plants };
    existing.push(gardenData);
    localStorage.setItem('gardenDesigns', JSON.stringify(existing));
    toast.success('Saved design');
    setSavedModalOpen(false);
  };

  const handleLoadFromModal = (index) => {
    const list = getSavedDesigns();
    const data = list[index];
    if (data) {
      setLandShape(data.landShape || []);
      setPlants(data.plants || []);
      setStage('garden-design');
      toast.success(`Loaded ${data.name || 'design'}`);
      setSavedModalOpen(false);
    }
  };

  const handleDeleteSaved = (index) => {
    const list = getSavedDesigns();
    if (index < 0 || index >= list.length) return;
    list.splice(index, 1);
    localStorage.setItem('gardenDesigns', JSON.stringify(list));
    toast.success('Deleted saved design');
    // keep modal open, UI will refresh due to new prop read
  };

  const handleRenameSaved = (index, newName) => {
    const list = getSavedDesigns();
    if (index < 0 || index >= list.length) return;
    list[index].name = newName;
    localStorage.setItem('gardenDesigns', JSON.stringify(list));
    toast.success('Renamed saved design');
  };

  const handleReset = () => {
    setStage('area-input');
    setAreaConfig(null);
    setLandShape([]);
    setPlants([]);
    setSelectedPlant(null);
    setPlacingMode(false);
    setEditingPlantId(null);
  };

  const handleAIEnhance = async () => {
    if (!landShape || landShape.length < 3) {
      toast.error('Define the land shape first to use AI Enhance');
      return;
    }
    try {
      const suggestion = aiPlanner.suggestLayout(landShape || []);
      if (!suggestion || !suggestion.items || suggestion.items.length === 0) {
        toast('AI could not generate a suggestion');
        return;
      }
      // Open preview modal instead of applying immediately
      setAiSuggestion(suggestion);
      setAiPreviewOpen(true);
    } catch (e) {
      console.error('AI enhance failed', e);
      toast.error('AI Enhance failed');
    }
  };

  const applyAISuggestion = () => {
    if (!aiSuggestion || !aiSuggestion.items) return;
    // snapshot for undo/history
    setLastAIPlantsSnapshot(plants.slice());
    pushHistory(plants.slice());
    const newPlants = aiSuggestion.items.map((it, idx) => {
      const base = getPlantById(it.plantId) || {};
      return {
        id: Date.now() + idx,
        plantId: it.plantId,
        name: it.name || base.name || 'Plant',
        icon: it.icon || base.icon,
        modelType: it.modelType || base.modelType,
        category: it.category || base.category,
        height: base?.height || 1,
        spread: base?.spread || 1,
        position: it.position || [0, 0, 0],
        rotation: it.rotation || 0,
        color: base?.color,
        foliageColor: base?.foliageColor
      };
    });
    setPlants(prev => [...prev, ...newPlants]);
    setAiPreviewOpen(false);
    setAiSuggestion(null);
    toast.success('AI layout applied — use Undo to revert');
  };

  const undoLastAI = () => {
    if (!lastAIPlantsSnapshot) {
      toast.error('Nothing to undo');
      return;
    }
    setPlants(lastAIPlantsSnapshot);
    setLastAIPlantsSnapshot(null);
    toast.success('Reverted last AI layout');
  };

  return (
    <div className={`App ${stage === 'landing' ? 'landing-mode' : ''}`}>
      {stage === 'landing' ? (
        <LandingPage onStart={() => setStage('area-input')} onOpenHow={() => setStage('how')} onOpenFeatures={() => setStage('features')} />
      ) : stage === 'how' ? (
        <HowPage onClose={() => setStage('landing')} />
      ) : stage === 'features' ? (
        <FeaturesPage onClose={() => setStage('landing')} />
      ) : stage === 'area-input' ? (
        <GardenAreaInput onConfirm={handleAreaConfirm} />
      ) : stage === 'land-selection' ? (
        <LandShapeSelector 
          onComplete={handleLandShapeComplete}
          onLoad={handleLoadGarden}
          areaConfig={areaConfig}
        />
      ) : (
        <>
          <GardenScene
            landShape={landShape}
            plants={plants}
            selectedPlant={selectedPlant}
            placingMode={placingMode}
            editingPlantId={editingPlantId}
            onPlantPlace={handlePlantPlace}
            onPlantMove={handlePlantMove}
            onPlantRemove={handlePlantRemove}
            onPlantReplace={handlePlantReplace}
            onPlantReposition={handlePlantReposition}
            onPlacingComplete={() => {
              setPlacingMode(false);
              setEditingPlantId(null);
            }}
            previewSuggestion={aiSuggestion}
            previewVisible={aiPreviewOpen}
          />
          
          <div className="ui-overlay">
            <ControlPanel
              onSave={handleSaveGarden}
              onReset={handleReset}
              onExport={handleExportGarden}
              onImport={handleImportGarden}
                onTogglePlants={() => setShowPlantsPanel(!showPlantsPanel)}
              onGoToIntro={() => setStage('landing')}
              onOpenWebsite={() => window.open('/', '_blank')}
              onLoad={handleLoadGarden}
              onOpenSavedModal={handleOpenSavedModal}
              plantsCount={plants.length}
              areaConfig={areaConfig}
              onAIEnhance={handleAIEnhance}
                onUndo={undoHistory}
                undoAvailable={canUndo}
                onRedo={redoHistory}
                redoAvailable={canRedo}
            />
            
            <PlantLibrary
              selectedPlant={selectedPlant}
              onSelectPlant={handleSelectPlantType}
              placingMode={placingMode}
              editingPlantId={editingPlantId}
            />
            
            {showPlantsPanel && (
              <PlantsList
                plants={plants}
                onDeletePlant={handlePlantRemove}
                onClose={() => setShowPlantsPanel(false)}
              />
            )}
          </div>
        </>
      )}
      
      <Toaster position="top-right" />
      <AIPreviewModal
        isOpen={aiPreviewOpen}
        suggestion={aiSuggestion}
        onApply={applyAISuggestion}
        onClose={() => { setAiPreviewOpen(false); setAiSuggestion(null); }}
      />
      <SavedDesignsModal
        isOpen={savedModalOpen}
        onClose={handleCloseSavedModal}
        designs={getSavedDesigns()}
        onLoad={handleLoadFromModal}
        onDelete={handleDeleteSaved}
        onSaveAs={handleSaveAs}
        onRename={handleRenameSaved}
      />
    </div>
  );
}