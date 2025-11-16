import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Save, RotateCcw, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

export const ControlPanel = ({ onSave, onReset }) => {
  const [isDark, setIsDark] = React.useState(false);

  const handleToggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleSave = () => {
    onSave();
    toast.success('Garden design saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset? All unsaved changes will be lost.')) {
      onReset();
      toast.info('Garden reset to land selection');
    }
  };

  return (
    <Card className="fixed top-4 right-4 glass-panel p-4">
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          className="gap-2 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
        
        <Button
          onClick={handleToggleTheme}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </Card>
  );
};

export default ControlPanel;