import React from 'react';
import { Trash2, Leaf, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import './PlantsList.css';

export const PlantsList = ({ plants, onDeletePlant, onClose }) => {
  const handleDelete = (id, plantName) => {
    onDeletePlant(id);
    toast.success(`${plantName} removed from garden!`);
  };

  return (
    <div className="plants-panel-overlay">
      <div className="plants-panel-drawer">
        <div className="plants-list-header">
          <div className="flex items-center gap-2">
            <Leaf size={20} className="plants-list-icon" />
            <h3>Placed Plants ({plants.length})</h3>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-0 h-6 w-6"
          >
            <X size={18} />
          </Button>
        </div>

        {plants.length === 0 ? (
          <div className="plants-list-empty">
            <p>No plants yet</p>
            <span>Start planting!</span>
          </div>
        ) : (
          <div className="plants-list-content">
            {plants.map((plant, index) => (
              <div key={plant.id} className="plant-item">
                <div className="plant-item-info">
                  <span className="plant-number">#{index + 1}</span>
                  <div className="plant-details">
                    <p className="plant-item-name">{plant.name}</p>
                    <span className="plant-item-icon">{plant.icon}</span>
                  </div>
                </div>
                <button
                  className="plant-delete-btn"
                  onClick={() => handleDelete(plant.id, plant.name)}
                  title="Delete plant"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {plants.length > 0 && (
          <div className="plants-list-footer">
            <p className="plants-count">Total: {plants.length} plants</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantsList;
