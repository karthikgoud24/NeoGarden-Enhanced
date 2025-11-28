import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const AIPreviewModal = ({ isOpen, suggestion, onApply, onClose }) => {
  if (!isOpen || !suggestion) return null;

  const items = suggestion.items || [];

  return (
    <div className="ai-preview-modal fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal-backdrop absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <Card className="relative z-10 max-w-3xl w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">AI Layout Preview</h3>
          <div className="text-sm text-slate-500">Items: {items.length}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-auto">
          <div className="p-2 border rounded">
            <h4 className="font-medium">Summary</h4>
            <p className="text-sm text-slate-600">This suggestion places a focal tree, a ring of shrubs/flowers around it, and scattered groundcover. You can accept to add these plants to your design (they will load their 3D models into the scene), or cancel to keep your current layout untouched.</p>
            <div className="mt-3">
              <dl className="text-sm">
                <div className="flex justify-between"><dt>Bounding box</dt><dd>{Math.round(suggestion.rect?.w||0)}×{Math.round(suggestion.rect?.h||0)}</dd></div>
                <div className="flex justify-between"><dt>Suggested items</dt><dd>{items.length}</dd></div>
              </dl>
            </div>
          </div>

          <div className="p-2 border rounded">
            <h4 className="font-medium">Preview Items</h4>
            <ul className="mt-2 space-y-2 text-sm">
              {items.map((it, i) => (
                <li key={it.tempId || `${it.plantId}-${i}`} className="flex items-center gap-2">
                  <span className="text-xl">{it.icon || '🌱'}</span>
                  <div>
                    <div className="font-medium">{it.name || it.plantId}</div>
                    <div className="text-xs text-slate-500">pos: {it.position?.map(v => v.toFixed(2)).join(', ')}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button onClick={onClose} className="bg-gray-200 hover:bg-gray-300">Cancel</Button>
          <Button onClick={onApply} className="bg-indigo-600 hover:bg-indigo-700">Apply Suggestion</Button>
        </div>
      </Card>
    </div>
  );
};

export default AIPreviewModal;
