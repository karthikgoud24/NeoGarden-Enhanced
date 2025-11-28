import React, { useState, useRef, useEffect } from 'react';
import './LandingPage.css';

// Props:
// - plants: array of { id, x, y, radius?, width?, height? } in screen coordinates
// - onSelect: (selectedIds, rect, items) => void
// - onMove: (deltas: {dx,dy}, items) => void
// - outputOnChange: (data) => void  // called with structural data object
export default function GroupSelection({ plants = [], onSelect = () => {}, onMove = () => {}, outputOnChange = () => {} }) {
  const overlayRef = useRef(null);
  const [rect, setRect] = useState(null); // {x,y,w,h}
  const [mode, setMode] = useState('idle');
  const startRef = useRef(null);
  const selectedRef = useRef([]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setRect(null); setMode('idle'); selectedRef.current = []; onSelect([], null, []);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSelect]);

  const getRelative = (clientX, clientY) => {
    const r = overlayRef.current.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    return { x, y };
  };

  const pointerDown = (e) => {
    // only left button
    if (e.button && e.button !== 0) return;
    const p = getRelative(e.clientX, e.clientY);
    startRef.current = p;
    setMode('drawing');
    setRect({ x: p.x, y: p.y, w: 0, h: 0 });
    selectedRef.current = [];
    e.preventDefault();
  };

  const pointerMove = (e) => {
    if (!startRef.current) return;
    const p = getRelative(e.clientX, e.clientY);
    if (mode === 'drawing') {
      const sx = startRef.current.x;
      const sy = startRef.current.y;
      const nx = Math.min(sx, p.x);
      const ny = Math.min(sy, p.y);
      const w = Math.abs(p.x - sx);
      const h = Math.abs(p.y - sy);
      const r = { x: nx, y: ny, w, h };
      setRect(r);
    }
  };

  const pointerUp = (e) => {
    if (mode === 'drawing' && rect) {
      // determine selected plants
      const sel = []; const items = [];
      plants.forEach(p => {
        // support circle (radius) or rect (width/height)
        const cx = p.x; const cy = p.y;
        const radius = p.radius != null ? p.radius : Math.max((p.width||0)/2, (p.height||0)/2);
        const inside = cx >= rect.x && cx <= rect.x + rect.w && cy >= rect.y && cy <= rect.y + rect.h;
        // also accept if bounding circle intersects rect
        const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
        const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
        const dx = cx - nearestX; const dy = cy - nearestY;
        const intersects = (dx*dx + dy*dy) <= (radius*radius);
        if (inside || intersects) {
          sel.push(p.id);
          items.push(p);
        }
      });
      selectedRef.current = sel;
      onSelect(sel, rect, items);
      // output structural data
      outputOnChange({ rect, items: items.map(it => ({ id: it.id, x: it.x, y: it.y, width: it.width || null, height: it.height || null, radius: it.radius || null })) });
    }
    startRef.current = null;
    setMode('idle');
  };

  // moving the group
  const [moving, setMoving] = useState(false);
  const moveStartRef = useRef(null);

  const startMove = (e) => {
    // only start move when clicking inside an existing rect
    if (!rect) return;
    const p = getRelative(e.clientX, e.clientY);
    if (p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h) {
      setMoving(true);
      moveStartRef.current = p;
      setMode('moving');
    }
  };

  const movePointer = (e) => {
    if (!moving || !moveStartRef.current) return;
    const p = getRelative(e.clientX, e.clientY);
    const dx = p.x - moveStartRef.current.x;
    const dy = p.y - moveStartRef.current.y;
    moveStartRef.current = p;
    const newRect = { ...rect, x: rect.x + dx, y: rect.y + dy };
    setRect(newRect);
    // move all selected items logically
    if (selectedRef.current.length) {
      const movedItems = plants.filter(pl => selectedRef.current.includes(pl.id)).map(it => ({ ...it, x: it.x + dx, y: it.y + dy }));
      onMove({ dx, dy }, movedItems);
      outputOnChange({ rect: newRect, items: movedItems.map(it=>({ id: it.id, x: it.x, y: it.y, width: it.width||null, height: it.height||null, radius: it.radius||null })) });
    }
  };

  const endMove = (e) => {
    setMoving(false); moveStartRef.current = null; setMode('idle');
  };

  return (
    <div
      ref={overlayRef}
      className="group-select-overlay"
      onMouseDown={(e) => { pointerDown(e); startMove(e); }}
      onMouseMove={(e) => { pointerMove(e); movePointer(e); }}
      onMouseUp={(e) => { pointerUp(e); endMove(e); }}
      onMouseLeave={(e) => { if (moving) endMove(e); }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
    >
      {rect && (
        <div className="selection-box" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
          <div className="selection-label">{selectedRef.current.length} selected</div>
          <div className="handle top-left" />
          <div className="handle top-right" />
          <div className="handle bottom-left" />
          <div className="handle bottom-right" />
        </div>
      )}
    </div>
  );
}
