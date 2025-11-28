import React from 'react';
import { Button } from './ui/button';
import { Sun, Moon } from 'lucide-react';

export default function SharedHeader({ isDark, onToggleTheme, onOpenHow, onOpenFeatures, onStart }) {
  return (
    <header className="nav sticky-nav" data-sr>
      <div className="nav-inner">
        <div className="logo">NeoGarden</div>
        <nav className="nav-right">
          <ul className="nav-links">
            <li><button className="nav-button" onClick={onOpenFeatures}>Features</button></li>
            <li><button className="nav-button secondary" onClick={onOpenHow}>How It Works</button></li>
          </ul>
          <div className="nav-actions">
            <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">{isDark ? <Moon size={16} /> : <Sun size={16} />}</button>
            <Button className="nav-cta" size="sm" onClick={onStart}>Start Designing</Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
