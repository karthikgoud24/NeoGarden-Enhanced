import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Leaf, TreeDeciduous, Flower, Sprout } from 'lucide-react';

const plantTypes = [
  { id: 'tree-oak', name: 'Oak Tree', type: 'tree', size: 15, spaceRequired: 200, color: '#2d5016', icon: TreeDeciduous, description: 'Large shade tree', height: 4 },
  { id: 'tree-maple', name: 'Maple Tree', type: 'tree', size: 12, spaceRequired: 150, color: '#3d6e1f', icon: TreeDeciduous, description: 'Beautiful autumn colors', height: 3.5 },
  { id: 'shrub-rose', name: 'Rose Bush', type: 'shrub', size: 3, spaceRequired: 9, color: '#c44569', icon: Flower, description: 'Ultra-realistic procedural rose bush', height: 1.6 },
  { id: 'shrub-hydrangea', name: 'Hydrangea', type: 'shrub', size: 4, spaceRequired: 16, color: '#5f84d1', icon: Flower, description: 'Large colorful blooms', height: 1.5 },
  { id: 'flower-tulip', name: 'Tulips', type: 'flower', size: 1, spaceRequired: 1, color: '#ff6b9d', icon: Flower, description: 'Spring bloomers', height: 0.5 },
  { id: 'flower-sunflower', name: 'Sunflower', type: 'flower', size: 2, spaceRequired: 4, color: '#ffa502', icon: Flower, description: 'Tall and cheerful', height: 2 },
  { id: 'grass-ornamental', name: 'Ornamental Grass', type: 'grass', size: 2, spaceRequired: 4, color: '#8fbc8f', icon: Sprout, description: 'Adds texture', height: 0.8 },
  { id: 'shrub-boxwood', name: 'Boxwood', type: 'shrub', size: 2, spaceRequired: 4, color: '#556b2f', icon: Leaf, description: 'Perfect for hedges', height: 1.0 }
];

export const PlantLibrary = ({ selectedPlant, onSelectPlant, placingMode }) => {
  return (
    <Card className="fixed left-4 top-1/2 -translate-y-1/2 w-72 glass-panel">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Leaf className="w-5 h-5 text-primary" />Plant Library</h2>
        {placingMode && <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">Placing Mode Active</Badge>}
      </div>

      <ScrollArea className="h-[calc(100vh-250px)] custom-scrollbar">
        <div className="p-4 space-y-3">
          {plantTypes.map((plant) => {
            const Icon = plant.icon;
            const isSelected = selectedPlant?.id === plant.id;
            return (
              <Button key={plant.id} onClick={() => onSelectPlant && onSelectPlant(plant)} variant={isSelected ? "default" : "outline"} className={`w-full justify-start h-auto p-4 transition-all overflow-hidden ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105' : 'hover:bg-accent hover:scale-102'}`}>
                <div className="flex items-start gap-3 w-full">
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.12)' : plant.color + '20', color: isSelected ? 'white' : plant.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm mb-1">{plant.name}</div>
                    <div className={`text-xs mb-1 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{plant.description}</div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{plant.spaceRequired} sq ft</Badge>
                      <Badge variant="secondary" className="text-xs">{plant.height}m tall</Badge>
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {selectedPlant && (
        <div className="p-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">Click anywhere on the garden to place {selectedPlant.name}</p>
        </div>
      )}
    </Card>
  );
};

export default PlantLibrary;
