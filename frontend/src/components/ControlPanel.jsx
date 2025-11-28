import React, { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Save, RotateCcw, Download, Upload, Leaf, X, Sun, Moon, Home, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const ControlPanel = ({ onSave, onReset, onExport, onImport, onTogglePlants, plantsCount = 0, onGoToIntro, onOpenWebsite, onLoad, onOpenSavedModal, onAIEnhance, onUndo, undoAvailable = false, onRedo, redoAvailable = false }) => {
  const [isDark, setIsDark] = React.useState(() => document.documentElement.classList.contains('dark'));
  const fileInputRef = useRef(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+R or Cmd+R to reset
      if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.shiftKey) {
        e.preventDefault();
        handleReset();
      }
      // T to toggle theme
      if (e.key === 't' && e.shiftKey) {
        e.preventDefault();
        handleToggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDark]);

  const handleToggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    const root = document.documentElement;
    if (newDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // initialize theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const handleSave = () => {
    onSave?.();
    toast.success('Garden saved!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the garden?')) {
      onReset?.();
      toast.success('Garden reset!');
    }
  };

  const handleExport = () => {
    onExport?.();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport?.(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="top-bar">
      <Card className="glass-panel px-4 py-2 shadow-lg w-full">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Save Button */}
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={() => onOpenSavedModal?.()} className="bg-yellow-500 hover:bg-yellow-600 ml-2" size="sm">
            Manage Saves
          </Button>

          {/* Center: Export/Import Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={handleImportClick}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button
              onClick={() => onAIEnhance?.()}
              className="bg-indigo-600 hover:bg-indigo-700"
              size="sm"
            >
              <Leaf className="w-4 h-4 mr-2" />
              AI Enhance
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* Right: Theme, Intro, Website, Plants Panel Button + Reset */}
          <div className="flex gap-2 ml-auto items-center">
            <button className="theme-toggle-btn" onClick={handleToggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button onClick={() => onUndo?.()} className="bg-slate-600 hover:bg-slate-700" size="sm" disabled={!undoAvailable}>
              Undo
            </Button>
            <Button onClick={() => onRedo?.()} className="bg-slate-400 hover:bg-slate-500" size="sm" disabled={!redoAvailable}>
              Redo
            </Button>
            <Button onClick={onGoToIntro} className="bg-transparent hover:bg-slate-100" size="sm">
              <Home className="w-4 h-4 mr-2" /> Intro
            </Button>
            <Button onClick={() => onOpenWebsite?.() } className="bg-transparent hover:bg-slate-100" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" /> Website
            </Button>
            <div className="flex gap-2 items-center">
            <Button
              onClick={onTogglePlants}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Leaf className="w-4 h-4 mr-2" />
              Plants ({plantsCount})
            </Button>
            <Button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
      </Card>
    </div>
  );
};

export default ControlPanel;