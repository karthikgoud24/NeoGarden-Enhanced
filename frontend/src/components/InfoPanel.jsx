import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Info, MapPin, Leaf } from 'lucide-react';

export const InfoPanel = ({ landShape, plants }) => {
  // Calculate land area
  const calculateArea = () => {
    if (landShape.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < landShape.length; i++) {
      const j = (i + 1) % landShape.length;
      area += landShape[i].x * landShape[j].y;
      area -= landShape[j].x * landShape[i].y;
    }
    area = Math.abs(area / 2);
    
    // Convert pixels to square feet (10 pixels = 1 foot)
    const pixelsPerFoot = 10;
    return (area / (pixelsPerFoot * pixelsPerFoot)).toFixed(0);
  };

  const landArea = calculateArea();
  const totalPlants = plants.length;
  const plantTypes = [...new Set(plants.map(p => p.type))].length;

  return (
    <Card className="fixed right-4 top-24 w-72 glass-panel">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          Garden Info
        </h2>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Land Details</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Area:</span>
              <Badge variant="secondary">{landArea} sq ft</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shape Points:</span>
              <Badge variant="secondary">{landShape.length}</Badge>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Plants</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Plants:</span>
              <Badge variant="secondary">{totalPlants}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plant Types:</span>
              <Badge variant="secondary">{plantTypes}</Badge>
            </div>
          </div>
        </div>

        {plants.length > 0 && (
          <>
            <div className="h-px bg-border" />
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">Placed Plants</h3>
              <ScrollArea className="h-48 custom-scrollbar">
                <div className="space-y-2">
                  {plants.map((plant, index) => (
                    <div 
                      key={plant.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                    >
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: plant.color }}
                      />
                      <span className="flex-1 text-foreground truncate">
                        {plant.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default InfoPanel;