import { getPlantById, plants as plantsByCategory } from './plantLibrary';

// Simple heuristic AI planner — returns array of plant placements in 3D scene coordinates
// Input: landShape (array of {x,y}) in canvas coordinates (same as Garden3D expects)
// Output: { items: [{ id, plantId, name, icon, modelType, category, position: [x,y,z], rotation }] }

function computeLand3DShape(landShape) {
  if (!landShape || landShape.length < 3) return [];
  const centerX = landShape.reduce((s, p) => s + p.x, 0) / landShape.length;
  const centerY = landShape.reduce((s, p) => s + p.y, 0) / landShape.length;
  return landShape.map(point => ({ x: (point.x - centerX) / 30, z: (point.y - centerY) / 30 }));
}

function bboxFromLand(landShape) {
  if (!landShape || landShape.length === 0) return { x:0,y:0,w:1,h:1 };
  const xs = landShape.map(p => p.x);
  const ys = landShape.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function pickCentralTree() {
  // prefer fruit or indian trees: apple, mango, banyan if available
  const preferred = ['apple','mango','banyan','oak','peepal','coconut'];
  for (const id of preferred) {
    const p = getPlantById(id);
    if (p) return p;
  }
  // fallback: first tree in library
  const treeCats = Object.keys(plantsByCategory).filter(k => Array.isArray(plantsByCategory[k]));
  for (const cat of treeCats) {
    const found = plantsByCategory[cat].find(p => p.modelType && p.modelType.includes('tree'));
    if (found) return found;
  }
  return null;
}

export function suggestLayout(landShape, options = {}) {
  // output items in 3D scene coords used by Garden3D: scaled by center/30
  const bbox = bboxFromLand(landShape);
  const w = Math.max(1, bbox.w);
  const h = Math.max(1, bbox.h);
  const centerX = bbox.x + w / 2;
  const centerY = bbox.y + h / 2;

  const centerTree = pickCentralTree();
  const items = [];
  const now = Date.now();

  // Place a central tree
  if (centerTree) {
    const cx = centerX;
    const cy = centerY;
    const sceneX = (cx - centerX) / 30; // will be 0
    const sceneZ = (cy - centerY) / 30; // 0
    items.push({
      tempId: `ai-${centerTree.id}-${now}-0`,
      plantId: centerTree.id,
      name: centerTree.name,
      icon: centerTree.icon,
      modelType: centerTree.modelType,
      category: centerTree.category,
      position: [sceneX, 0, sceneZ],
      rotation: Math.random() * Math.PI * 2
    });
  }

  // Ring of shrubs/flowers around central tree
  const ringCount = Math.max(4, Math.min(12, Math.floor((w * h) / 3000)));
  const radiusPixels = Math.min(w, h) * 0.18;
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const px = centerX + Math.cos(angle) * radiusPixels * (0.8 + Math.random() * 0.4);
    const py = centerY + Math.sin(angle) * radiusPixels * (0.8 + Math.random() * 0.4);
    const sceneX = (px - centerX) / 30;
    const sceneZ = (py - centerY) / 30;

    // pick a flower or shrub
    const flowers = plantsByCategory['flowers'] || [];
    const shrubs = plantsByCategory['shrubs'] || [];
    const pool = [...flowers, ...shrubs];
    const plant = pool[Math.floor(Math.random() * pool.length)] || (flowers[0] || shrubs[0] || null);
    if (!plant) continue;
    items.push({
      tempId: `ai-${plant.id}-${now}-${i+1}`,
      plantId: plant.id,
      name: plant.name,
      icon: plant.icon,
      modelType: plant.modelType,
      category: plant.category,
      position: [sceneX, 0, sceneZ],
      rotation: Math.random() * Math.PI * 2
    });
  }

  // Scatter some groundcover near edges
  const scatterCount = Math.max(3, Math.floor((w * h) / 8000));
  const ground = plantsByCategory['herbs'] || [];
  for (let s = 0; s < scatterCount; s++) {
    const rx = centerX + (Math.random() - 0.5) * w * 0.8;
    const ry = centerY + (Math.random() - 0.5) * h * 0.8;
    const plant = ground[Math.floor(Math.random() * (ground.length || 1))] || null;
    if (!plant) continue;
    items.push({
      tempId: `ai-${plant.id}-${now}-g${s}`,
      plantId: plant.id,
      name: plant.name,
      icon: plant.icon,
      modelType: plant.modelType,
      category: plant.category,
      position: [(rx - centerX) / 30, 0, (ry - centerY) / 30],
      rotation: Math.random() * Math.PI * 2
    });
  }

  return { rect: bbox, items };
}

export default { suggestLayout };
