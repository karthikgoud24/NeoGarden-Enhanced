import React, { useState } from 'react';
import { Trash2, RefreshCw, Move, Redo } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

export const PlantContextMenu = ({ plant, onRemove, onReplace, onReposition }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRemove = () => {
    if (window.confirm(`Remove ${plant.name}?`)) {
      onRemove(plant.id);
      setIsOpen(false);
    }
  };

  const handleReplace = () => {
    onReplace(plant.id);
    setIsOpen(false);
  };

  const handleReposition = () => {
    onReposition(plant.id);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/10"
          onClick={(e) => e.stopPropagation()}
        >
          ⋯
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleReposition} className="gap-2">
          <Move className="w-4 h-4" />
          Reposition
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReplace} className="gap-2">
          <Redo className="w-4 h-4" />
          Replace
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRemove} className="gap-2 text-destructive">
          <Trash2 className="w-4 h-4" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PlantContextMenu;
