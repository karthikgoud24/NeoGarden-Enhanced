import React, { useState, useEffect } from 'react';

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(2,6,23,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120
};

const boxStyle = {
  width: '720px', maxWidth: '94%', maxHeight: '80vh', overflow: 'auto', background: '#fff', borderRadius: 12, padding: 18
};

const darkBoxStyle = Object.assign({}, boxStyle, { background: '#0b1220', color: '#e6eef9' });

export default function SavedDesignsModal({ isOpen, onClose, designs = [], onLoad, onDelete, onSaveAs, onRename }) {
  const [name, setName] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editName, setEditName] = useState('');
  useEffect(() => { if (isOpen) { setName(''); setEditingIndex(-1); setEditName(''); } }, [isOpen]);

  if (!isOpen) return null;

  const rootDark = document.documentElement.classList.contains('dark');

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={rootDark ? darkBoxStyle : boxStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Manage Saved Designs</h3>
          <div>
            <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8 }}>Close</button>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <strong>Save current design as:</strong>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name (optional)" style={{ flex: 1, padding: 8, borderRadius: 8 }} />
            <button onClick={() => { onSaveAs?.(name); setName(''); }} style={{ padding: '8px 12px', borderRadius: 8 }}>Save As</button>
          </div>
        </div>

        <div>
          <strong>Existing saved designs ({designs.length})</strong>
          <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
            {designs.length === 0 && <div style={{ padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.03)' }}>No saved designs</div>}
            {designs.map((g, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 10, borderRadius: 8, background: rootDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{g.name || `Garden ${idx + 1}`}</div>
                  <div style={{ fontSize: 12, color: rootDark ? '#bcd' : '#556' }}>{new Date(g.timestamp || Date.now()).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {editingIndex === idx ? (
                    <>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: 6, borderRadius: 6 }} />
                      <button onClick={() => { onRename?.(idx, editName || g.name); setEditingIndex(-1); }} style={{ padding: '6px 8px' }}>Save</button>
                      <button onClick={() => { setEditingIndex(-1); setEditName(''); }} style={{ padding: '6px 8px' }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => onLoad?.(idx)} style={{ padding: '6px 8px' }}>Load</button>
                      <button onClick={() => { setEditingIndex(idx); setEditName(g.name || ''); }} style={{ padding: '6px 8px' }}>Rename</button>
                      <button onClick={() => onDelete?.(idx)} style={{ padding: '6px 8px' }}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
