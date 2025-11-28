import React, { useState, useMemo } from 'react';
import { Search, Leaf, RotateCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { plants, plantCategories, getCategoriesWithCount, searchPlants } from '@/lib/plantLibrary';
import './PlantLibrary.css';

const PlantCard = ({ plant, isSelected, onSelect, isReplaceMode }) => {
  const isIndian = plant.category === plantCategories.INDIAN_TREES;
  
  return (
    <Card
      onClick={() => onSelect(plant)}
      className={`plant-card ${isSelected ? 'selected' : ''} ${isIndian ? 'indian-badge' : ''} ${isReplaceMode ? 'replace-mode' : ''}`}
    >
      <div className="plant-card-icon">{plant.icon}</div>
      <div className="plant-card-content">
        <h4 className="plant-name">{plant.name}</h4>
        {isIndian && <span className="badge-indian">🇮🇳 Indian</span>}
        <p className="plant-sci">{plant.scientificName}</p>
        <div className="plant-meta">
          <span className="meta-item">
            <span className="meta-label">Height:</span>
            {plant.height.min}-{plant.height.max}m
          </span>
          <span className="meta-item">
            <span className="meta-label">Spread:</span>
            {plant.spread}m
          </span>
        </div>
        <div className="plant-tags">
          {plant.waterNeeds && (
            <span className="tag water">{plant.waterNeeds === 'high' ? '💧' : plant.waterNeeds === 'medium' ? '🌧️' : '☀️'}</span>
          )}
          {plant.sunlight && (
            <span className="tag sun">{plant.sunlight === 'full' ? '☀️' : '🌤️'}</span>
          )}
          {plant.season && plant.season[0] && (
            <span className="tag season">{plant.season[0]}</span>
          )}
        </div>
        <p className="plant-desc">{plant.description}</p>
      </div>
    </Card>
  );
};

const CategoryTab = ({ category, count, icon }) => (
  <div className="category-tab">
    <span className="tab-icon">{icon}</span>
    <span className="tab-label">{category.replace(/_/g, ' ')}</span>
    <span className="tab-count">{count}</span>
  </div>
);

export const PlantLibrary = ({
  selectedPlant,
  onSelectPlant,
  placingMode,
  editingPlantId
}) => {
  const [activeCategory, setActiveCategory] = useState(plantCategories.INDIAN_TREES);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const isReplaceMode = !!editingPlantId && placingMode;

  // Get plants for current category
  const categoryPlants = useMemo(() => {
    if (searchQuery.trim()) {
      return searchPlants(searchQuery);
    }
    return plants[activeCategory] || [];
  }, [activeCategory, searchQuery]);

  // Sort plants
  const sortedPlants = useMemo(() => {
    let sorted = [...categoryPlants];
    switch (sortBy) {
      case 'height':
        sorted.sort((a, b) => b.height.max - a.height.max);
        break;
      case 'spread':
        sorted.sort((a, b) => b.spread - a.spread);
        break;
      case 'name':
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [categoryPlants, sortBy]);

  const categories = getCategoriesWithCount();

  const categoryIcons = {
    [plantCategories.INDIAN_TREES]: '🇮🇳',
    [plantCategories.TREES]: '🌲',
    [plantCategories.SHRUBS]: '🌳',
    [plantCategories.FLOWERS]: '🌺',
    [plantCategories.FRUITS]: '🍎',
    [plantCategories.ORNAMENTAL]: '🌸',
    [plantCategories.HERBS]: '🌿',
  };

  return (
    <div className="plant-library">
      <div className="library-header">
        <h3 className="library-title">
          {isReplaceMode ? (
            <span className="flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-amber-500" />
              Replace Plant
            </span>
          ) : (
            'Plant Library'
          )}
        </h3>
        <p className="library-subtitle">
          {isReplaceMode 
            ? '👉 Select a new plant to replace' 
            : placingMode 
            ? '👇 Select and click on scene to place' 
            : 'Browse and select plants'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <Search className="search-icon" size={16} />
        <Input
          placeholder="Search plants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="library-tabs">
        <TabsList className="tabs-list">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="tabs-trigger">
              <CategoryTab
                category={cat.name}
                count={cat.count}
                icon={categoryIcons[cat.value] || '🌱'}
              />
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Sort Controls */}
        <div className="sort-controls">
          <span className="sort-label">Sort by:</span>
          <button
            onClick={() => setSortBy('name')}
            className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
          >
            Name
          </button>
          <button
            onClick={() => setSortBy('height')}
            className={`sort-btn ${sortBy === 'height' ? 'active' : ''}`}
          >
            Height
          </button>
          <button
            onClick={() => setSortBy('spread')}
            className={`sort-btn ${sortBy === 'spread' ? 'active' : ''}`}
          >
            Spread
          </button>
        </div>

        {/* Plants Grid */}
        {sortedPlants.length > 0 ? (
          <div className="plants-grid">
            {sortedPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                isSelected={selectedPlant?.id === plant.id}
                onSelect={onSelectPlant}
                isReplaceMode={isReplaceMode}
              />
            ))}
          </div>
        ) : (
          <div className="no-plants">
            <Leaf className="no-plants-icon" size={32} />
            <p>No plants found</p>
          </div>
        )}
      </Tabs>

      {selectedPlant && (
        <div className="selected-info">
          <div className="selected-inner">
            <span className="selected-icon">{selectedPlant.icon}</span>
            <div className="selected-text">
              <strong>{selectedPlant.name}</strong>
              <small>{selectedPlant.description}</small>
            </div>
            {!isReplaceMode && (
              <Button
                onClick={() => onSelectPlant(null)}
                variant="outline"
                size="sm"
                className="deselect-btn"
              >
                Clear
              </Button>
            )}
          </div>
          {isReplaceMode && (
            <div className="text-xs text-muted-foreground mt-2 px-4 py-2 bg-amber-500/10 rounded">
              ✓ Ready to replace. {selectedPlant.name} will replace the selected plant.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlantLibrary;
