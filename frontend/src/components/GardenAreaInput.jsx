import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { ArrowRight, Ruler, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

export const GardenAreaInput = ({ onConfirm }) => {
  const [area, setArea] = useState('100');
  const [unit, setUnit] = useState('sqm'); // sqm or sqft

  // Calculate dimensions based on area
  const dimensions = useMemo(() => {
    const areaNum = parseFloat(area) || 0;
    const areaSqm = unit === 'sqft' ? areaNum * 0.092903 : areaNum;
    const sideSqrt = Math.sqrt(areaSqm);
    
    // Generate common dimension combinations
    return {
      square: { x: sideSqrt, z: sideSqrt },
      rectangle1: { x: sideSqrt * 1.5, z: areaSqm / (sideSqrt * 1.5) },
      rectangle2: { x: sideSqrt * 2, z: areaSqm / (sideSqrt * 2) },
      areaSqm,
      sideSqrt
    };
  }, [area, unit]);

  const handleConfirm = () => {
    const areaNum = parseFloat(area);
    
    if (!areaNum || areaNum <= 0) {
      toast.error('Please enter a valid area size');
      return;
    }

    if (areaNum > 100000) {
      toast.error('Area too large. Maximum 100,000 square meters');
      return;
    }

    // Convert to square meters if needed
    const areaSqm = unit === 'sqft' ? areaNum * 0.092903 : areaNum;
    
    onConfirm({
      area: areaNum,
      unit,
      areaSqm,
      baseDimension: Math.sqrt(areaSqm), // For scaling
      dimensions: {
        square: dimensions.square,
        landscape: dimensions.rectangle1,
        wide: dimensions.rectangle2
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  // Quick size suggestions
  const suggestions = [
    { label: 'Small (100 sqm)', value: '100', unit: 'sqm' },
    { label: 'Medium (500 sqm)', value: '500', unit: 'sqm' },
    { label: 'Large (1000 sqm)', value: '1000', unit: 'sqm' },
    { label: 'Huge (5000 sqm)', value: '5000', unit: 'sqm' },
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-sky-50 via-green-50 to-amber-50 dark:from-slate-900 dark:via-green-950 dark:to-amber-950 flex items-center justify-center p-8">
      <Card className="glass-panel w-full max-w-2xl p-12">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ruler className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Garden Size</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Enter your garden area. This helps scale the design accurately.
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-3">
            Garden Area
          </label>
          
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <Input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter area"
                className="text-lg h-12"
                min="1"
                max="100000"
              />
            </div>
            
            <div className="w-32">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground font-medium"
              >
                <option value="sqm">sq meters</option>
                <option value="sqft">sq feet</option>
              </select>
            </div>
          </div>

          {/* Conversion Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground mb-3">
              <span className="font-medium">{area} {unit}</span>
              <span className="text-muted-foreground"> ≈ </span>
              <span className="font-medium">
                {unit === 'sqm' 
                  ? (parseFloat(area) * 10.764).toFixed(0)
                  : (parseFloat(area) * 0.092903).toFixed(0)
                } {unit === 'sqm' ? 'sq feet' : 'sq meters'}
              </span>
            </p>
            
            {/* Dimension Options */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Maximize2 className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Possible Dimensions:</span>
              </div>
              <div className="grid grid-cols-3 gap-2 ml-6">
                <div className="bg-background/50 rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">Square</p>
                  <p className="font-mono text-xs font-semibold">
                    {dimensions.square.x.toFixed(1)}m × {dimensions.square.z.toFixed(1)}m
                  </p>
                </div>
                <div className="bg-background/50 rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">Landscape</p>
                  <p className="font-mono text-xs font-semibold">
                    {dimensions.rectangle1.x.toFixed(1)}m × {dimensions.rectangle1.z.toFixed(1)}m
                  </p>
                </div>
                <div className="bg-background/50 rounded p-2 text-center">
                  <p className="text-xs text-muted-foreground">Wide</p>
                  <p className="font-mono text-xs font-semibold">
                    {dimensions.rectangle2.x.toFixed(1)}m × {dimensions.rectangle2.z.toFixed(1)}m
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-3">
            Quick Select
          </label>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.label}
                onClick={() => {
                  setArea(suggestion.value);
                  setUnit(suggestion.unit);
                }}
                variant={area === suggestion.value ? 'default' : 'outline'}
                className="text-left justify-start h-auto py-2 px-3"
              >
                <span className="text-sm">{suggestion.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Reference Info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-8 text-xs text-muted-foreground">
          <p className="font-medium mb-2">📏 Size Reference:</p>
          <ul className="space-y-1">
            <li>• Small garden: 50-200 sqm</li>
            <li>• Medium garden: 200-1,000 sqm</li>
            <li>• Large garden: 1,000-5,000 sqm</li>
          </ul>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleConfirm}
          className="w-full h-12 text-base gap-2 bg-primary hover:bg-primary/90"
        >
          Continue to Design
          <ArrowRight className="w-5 h-5" />
        </Button>
      </Card>
    </div>
  );
};

export default GardenAreaInput;
