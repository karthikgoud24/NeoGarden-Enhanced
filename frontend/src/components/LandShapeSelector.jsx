import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { Undo, Check, FileUp, Ruler } from 'lucide-react';

export const LandShapeSelector = ({ onComplete, onLoad, areaConfig }) => {
  const [points, setPoints] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Scale factor based on garden area - MUST be defined before useMemo
  const getScaleFactor = () => {
    if (!areaConfig) return 1;
    // Base scale: ~50 pixels per 10 sqm
    return Math.sqrt(areaConfig.areaSqm) / 10;
  };

  // Calculate area and perimeter of the drawn shape
  const shapeMetrics = useMemo(() => {
    if (points.length < 3) return null;
    
    // Calculate area using Shoelace formula
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    area = Math.abs(area) / 2;
    
    // Calculate perimeter
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    
    // Calculate grid spacing (from canvas grid size)
    const gridPixelSize = 50;
    const scaleFactor = areaConfig ? Math.sqrt(areaConfig.areaSqm) / getScaleFactor() : 1;
    const metersPerPixel = scaleFactor / gridPixelSize * 10;
    
    return {
      pixelArea: area,
      pixelPerimeter: perimeter,
      actualArea: area * (metersPerPixel ** 2),
      actualPerimeter: perimeter * metersPerPixel
    };
  }, [points, areaConfig]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    
    // Set canvas size
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 0.5;
    const gridSize = 50;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw shape
    if (points.length > 0) {
      ctx.fillStyle = 'hsl(var(--primary) / 0.2)';
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      if (points.length > 2) {
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.stroke();

      // Draw points
      points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(var(--primary))';
        ctx.fill();
        ctx.strokeStyle = 'hsl(var(--background))';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw point number
        ctx.fillStyle = 'hsl(var(--foreground))';
        ctx.font = '12px Inter';
        ctx.fillText(`${index + 1}`, point.x + 10, point.y - 10);
      });
    }
  }, [points]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking near first point to close shape
    if (points.length >= 3) {
      const firstPoint = points[0];
      const distance = Math.sqrt(
        Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2)
      );
      
      if (distance < 20) {
        handleComplete();
        return;
      }
    }

    setPoints([...points, { x, y }]);
  };

  const handleUndo = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };

  const handleComplete = () => {
    if (points.length < 3) {
      toast.error('Please select at least 3 points to create a land shape');
      return;
    }

    toast.success(`Land shape created! Ready to plant.`);
    onComplete(points, areaConfig);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-sky-50 via-green-50 to-amber-50 dark:from-slate-900 dark:via-green-950 dark:to-amber-950 flex items-center justify-center p-8">
      <Card className="glass-panel w-full max-w-5xl p-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Design Your Garden</h1>
          <p className="text-muted-foreground text-lg">
            Click on the canvas to define your land shape. 
            {areaConfig && <span> Garden area: {areaConfig.area} {areaConfig.unit}</span>}
          </p>
        </div>

        <div 
          ref={containerRef}
          className="relative bg-background rounded-lg border-2 border-border mb-6 overflow-hidden"
          style={{ height: 'calc(100vh - 320px)' }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="cursor-crosshair w-full h-full"
          />
          
          {points.length > 0 && (
            <>
              <div className="absolute top-4 right-4 glass-panel px-4 py-3 rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Points: {points.length}
                  {points.length >= 3 && (
                    <span className="ml-2 text-primary text-xs">• Click first point to close</span>
                  )}
                </p>
                
                {shapeMetrics && (
                  <div className="pt-2 border-t border-border space-y-1">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Perimeter: ~{shapeMetrics.actualPerimeter.toFixed(1)}m
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Area: ~{shapeMetrics.actualArea.toFixed(1)} sqm
                    </div>
                    {areaConfig && (
                      <div className="text-xs text-primary font-medium">
                        Target: {areaConfig.areaSqm.toFixed(1)} sqm
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 justify-between">
          <Button
            onClick={onLoad}
            variant="outline"
            className="gap-2"
          >
            <FileUp className="w-4 h-4" />
            Load Saved Design
          </Button>
          
          <div className="flex gap-3">
            <Button
              onClick={handleUndo}
              variant="outline"
              disabled={points.length === 0}
              className="gap-2"
            >
              <Undo className="w-4 h-4" />
              Undo
            </Button>
            
            <Button
              onClick={handleComplete}
              disabled={points.length < 3}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Check className="w-4 h-4" />
              Complete Shape
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LandShapeSelector;