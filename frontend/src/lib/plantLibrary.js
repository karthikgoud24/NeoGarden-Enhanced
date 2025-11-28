/**
 * Comprehensive Plant Library with Categories, Indian Trees, and Realistic Graphics
 */

export const plantCategories = {
  TREES: 'trees',
  SHRUBS: 'shrubs',
  FLOWERS: 'flowers',
  FRUITS: 'fruits',
  INDIAN_TREES: 'indian_trees',
  ORNAMENTAL: 'ornamental',
  HERBS: 'herbs',
};

export const plants = {
  // ========== INDIAN TREES ==========
  [plantCategories.INDIAN_TREES]: [
    {
      id: 'mango',
      name: 'Mango Tree',
      scientificName: 'Mangifera indica',
      description: 'King of fruits. Deciduous tree with spreading crown. Fruit-bearing.',
      height: { min: 1.2, max: 2 },
      width: { min: 1, max: 1.5 },
      category: plantCategories.INDIAN_TREES,
      color: '#2d5016',
      foliageColor: '#4f7f2a',
      flowerColor: '#ffd27a',
      icon: '🥭',
      season: ['spring', 'summer'],
      waterNeeds: 'medium',
      sunlight: 'full',
      spread: 1.2,
      modelType: 'tree-large',
      realism: {
        trunkTexture: 'bark-brown',
        foliageType: 'dense-deciduous',
        shadowIntensity: 0.8,
        leafSize: 'large',
        leafDensity: 'high',
      },
    },
    {
      id: 'coconut',
      name: 'Coconut Palm',
      scientificName: 'Cocos nucifera',
      description: 'Tropical palm tree. Produces coconuts. Distinctive fronds.',
      height: { min: 1.2, max: 2.0 },
      width: { min: 0.7, max: 1.1 },
      category: plantCategories.INDIAN_TREES,
      color: '#8b6f47',
      foliageColor: '#2f7a2f',
      flowerColor: '#fff2d1',
      icon: '🥥',
      season: ['year-round'],
      waterNeeds: 'high',
      sunlight: 'full',
      spread: 0.9,
      modelType: 'tree-palm',
      realism: {
        trunkTexture: 'bark-rough',
        foliageType: 'tropical-fronds',
        shadowIntensity: 0.7,
        leafSize: 'xlarge',
        leafDensity: 'high',
        coconutClusters: true,
      },
    },
    {
      id: 'neem',
      name: 'Neem Tree',
      scientificName: 'Azadirachta indica',
      description: 'Sacred medicinal tree. Dense foliage. Used in traditional medicine.',
      height: { min: 0.8, max: 1.5 },
      width: { min: 0.7, max: 1.2 },
      category: plantCategories.INDIAN_TREES,
      color: '#2d5016',
      foliageColor: '#3b6a22',
      flowerColor: '#fff9d6',
      icon: '🌿',
      season: ['spring', 'summer', 'fall'],
      waterNeeds: 'low',
      sunlight: 'full',
      spread: 0.9,
      modelType: 'tree-large',
      realism: {
        trunkTexture: 'bark-grey',
        foliageType: 'dense-deciduous',
        shadowIntensity: 0.85,
        leafSize: 'small',
        leafDensity: 'very-high',
      },
    },
    {
      id: 'banyan',
      name: 'Banyan Tree',
      scientificName: 'Ficus benghalensis',
      description: 'Massive, long-lived fig tree. Aerial roots. Sacred in Indian culture.',
      height: { min: 1.3, max: 2.2 },
      width: { min: 1.2, max: 1.8 },
      category: plantCategories.INDIAN_TREES,
      color: '#3d3d3d',
      foliageColor: '#2f5f1f',
      flowerColor: '#cfa67a',
      icon: '🌳',
      season: ['year-round'],
      waterNeeds: 'medium',
      sunlight: 'full',
      spread: 1.5,
      modelType: 'tree-xlarge',
      realism: {
        trunkTexture: 'bark-brown',
        foliageType: 'dense-spreading',
        shadowIntensity: 0.9,
        leafSize: 'medium',
        leafDensity: 'very-high',
        aerialRoots: true,
      },
    },
    {
      id: 'teak',
      name: 'Teak Tree',
      scientificName: 'Tectona grandis',
      description: 'Hardwood tree. Valuable timber. Strong, durable wood.',
      height: { min: 1, max: 1.8 },
      width: { min: 0.8, max: 1.3 },
      category: plantCategories.INDIAN_TREES,
      color: '#4a3c28',
      foliageColor: '#4c6e2d',
      flowerColor: '#e6cf9a',
      icon: '🪵',
      season: ['spring', 'summer'],
      waterNeeds: 'medium',
      sunlight: 'full',
      spread: 14,
      modelType: 'tree-large',
      realism: {
        trunkTexture: 'bark-dark',
        foliageType: 'dense-deciduous',
        shadowIntensity: 0.8,
        leafSize: 'xlarge',
        leafDensity: 'high',
      },
    },
    {
      id: 'peepal',
      name: 'Peepal Tree',
      scientificName: 'Ficus religiosa',
      description: 'Sacred fig tree. Heart-shaped leaves. Important in religion.',
      height: { min: 1, max: 1.8 },
      width: { min: 2, max: 4 },
      category: plantCategories.INDIAN_TREES,
      color: '#3d3d3d',
      foliageColor: '#3c6b1f',
      flowerColor: '#e0d4b0',
      icon: '☸️',
      season: ['year-round'],
      waterNeeds: 'medium',
      sunlight: 'full',
      spread: 1.3,
      modelType: 'tree-large',
      realism: {
        trunkTexture: 'bark-smooth-grey',
        foliageType: 'dense-rounded',
        shadowIntensity: 0.8,
        leafSize: 'medium',
        leafDensity: 'very-high',
      },
    },
  ],

  // ========== GENERAL TREES ==========
  [plantCategories.TREES]: [
    {
      id: 'oak',
      name: 'Oak Tree',
      scientificName: 'Quercus robur',
      description: 'Large deciduous tree. Strong wood. Provides good shade.',
      height: { min: 1, max: 1.7 },
      width: { min: 2, max: 4 },
      category: plantCategories.TREES,
      color: '#3d3d3d',
      foliageColor: '#3f7a2b',
      flowerColor: '#cfa77a',
      icon: '🌲',
      season: ['spring', 'fall'],
      waterNeeds: 'medium',
      sunlight: 'full',
      spread: 1.1,
      modelType: 'tree-large',
      realism: {
        trunkTexture: 'bark-brown',
        foliageType: 'dense-deciduous',
        shadowIntensity: 0.85,
        leafSize: 'medium',
        leafDensity: 'very-high',
      },
    },
    {
      id: 'pine',
      name: 'Pine Tree',
      scientificName: 'Pinus sylvestris',
      description: 'Evergreen conifer. Needle-like leaves. Tall and straight.',
      height: { min: 0.9, max: 1.6 },
      width: { min: 1.5, max: 2 },
      category: plantCategories.TREES,
      color: '#2d2d2d',
      foliageColor: '#123d10',
      flowerColor: '#9e7f5f',
      icon: '🌲',
      season: ['year-round'],
      waterNeeds: 'low',
      sunlight: 'full',
      spread: 0.8,
      modelType: 'tree-conifer',
      realism: {
        trunkTexture: 'bark-rough',
        foliageType: 'conifer-dense',
        shadowIntensity: 0.75,
        leafSize: 'small',
        leafDensity: 'very-high',
      },
    },
    {
      id: 'birch',
      name: 'Birch Tree',
      scientificName: 'Betula alba',
      description: 'Deciduous tree with white bark. Elegant appearance.',
      height: { min: 2, max: 3.5 },
      width: { min: 1.5, max: 2.5 },
      category: plantCategories.TREES,
      color: '#e8e4d0',
      foliageColor: '#6aa153',
      flowerColor: '#d9c8b0',
      icon: '🌳',
      season: ['spring', 'summer', 'fall'],
      waterNeeds: 'medium',
      sunlight: 'full',
      spread: 10,
      modelType: 'tree-medium',
      realism: {
        trunkTexture: 'bark-white',
        foliageType: 'delicate-deciduous',
        shadowIntensity: 0.65,
        leafSize: 'small',
        leafDensity: 'high',
      },
    },
  ],

  // ========== SHRUBS ==========
  [plantCategories.SHRUBS]: [
    {
      id: 'hibiscus',
      name: 'Hibiscus Shrub',
      scientificName: 'Hibiscus rosa-sinensis',
      description: 'Tropical flowering shrub. Vibrant flowers. Low maintenance.',
      height: { min: 1, max: 3 },
      width: { min: 1, max: 2.5 },
      category: plantCategories.SHRUBS,
      color: '#2d5016',
      foliageColor: '#3f7a2e',
      flowerColor: '#e9426a',
      icon: '🌺',
      season: ['summer', 'fall'],
      waterNeeds: 'medium',
      sunlight: 'full',
      spread: 2,
      modelType: 'shrub-medium',
      realism: {
        trunkTexture: 'bark-small',
        foliageType: 'dense-shrub',
        shadowIntensity: 0.5,
        leafSize: 'small',
        leafDensity: 'medium',
      },
    },
    {
      id: 'jasmine',
      name: 'Jasmine Plant',
      scientificName: 'Jasminum sambac',
      description: 'Climbing or trailing shrub. Fragrant white flowers.',
      height: { min: 0.8, max: 2 },
      width: { min: 0.5, max: 1.5 },
      category: plantCategories.SHRUBS,
      color: '#3d5a1f',
      foliageColor: '#3d6b2e',
      flowerColor: '#ffffff',
      icon: '🌼',
      season: ['summer', 'spring'],
      waterNeeds: 'medium',
      sunlight: 'partial',
      spread: 1.2,
      modelType: 'shrub-small',
      realism: {
        trunkTexture: 'bark-small',
        foliageType: 'climbing-shrub',
        shadowIntensity: 0.4,
        leafSize: 'small',
        leafDensity: 'medium',
      },
    },
  ],

  // ========== FLOWERS ==========
  [plantCategories.FLOWERS]: [
    {
      id: 'rose',
      name: 'Rose',
      scientificName: 'Rosa spp.',
      description: 'Classic flowering plant. Fragrant blooms. Multiple colors.',
      height: { min: 0.5, max: 1.5 },
      width: { min: 0.4, max: 1 },
      category: plantCategories.FLOWERS,
      color: '#2d5016',
      foliageColor: '#3d6b1f',
      flowerColor: '#d81b4b',
      icon: '🌹',
      season: ['spring', 'summer', 'fall'],
      waterNeeds: 'medium',
      sunlight: 'full',
      spread: 0.8,
      modelType: 'flower-bush',
      realism: {
        trunkTexture: 'none',
        foliageType: 'compact-bush',
        shadowIntensity: 0.3,
        leafSize: 'tiny',
        leafDensity: 'medium',
      },
    },
    {
      id: 'sunflower',
      name: 'Sunflower',
      scientificName: 'Helianthus annuus',
      description: 'Tall annual. Large yellow blooms. Follows the sun.',
      height: { min: 1, max: 2.5 },
      width: { min: 0.3, max: 0.6 },
      category: plantCategories.FLOWERS,
      color: '#2d5016',
      foliageColor: '#4a7c2e',
      flowerColor: '#ffc400',
      icon: '🌻',
      season: ['summer'],
      waterNeeds: 'medium',
      sunlight: 'full',
      spread: 0.5,
      modelType: 'flower-tall',
      realism: {
        trunkTexture: 'bark-green',
        foliageType: 'sparse-tall',
        shadowIntensity: 0.35,
        leafSize: 'medium',
        leafDensity: 'low',
      },
    },
  ],

  // ========== FRUITS ==========
  [plantCategories.FRUITS]: [
    {
      id: 'apple',
      name: 'Apple Tree',
      scientificName: 'Malus domestica',
      description: 'Deciduous fruit tree. Small to medium size. Spring blooms.',
      height: { min: 5, max: 12 },
      width: { min: 4, max: 10 },
      category: plantCategories.FRUITS,
      color: '#3d3d3d',
      foliageColor: '#4e7c2e',
      flowerColor: '#f6e7d4',
      icon: '🍎',
      season: ['spring', 'summer', 'fall'],
      waterNeeds: 'medium',
      sunlight: 'full',
      spread: 8,
      modelType: 'tree-medium',
      realism: {
        trunkTexture: 'bark-brown',
        foliageType: 'dense-deciduous',
        shadowIntensity: 0.7,
        leafSize: 'small',
        leafDensity: 'very-high',
      },
    },
  ],

  // ========== ORNAMENTAL ==========
  [plantCategories.ORNAMENTAL]: [
    {
      id: 'cherry-blossom',
      name: 'Cherry Blossom',
      scientificName: 'Prunus serrulata',
      description: 'Spring blooming ornamental. Pink/white flowers. Iconic beauty.',
      height: { min: 5, max: 15 },
      width: { min: 4, max: 12 },
      category: plantCategories.ORNAMENTAL,
      color: '#3d3d3d',
      foliageColor: '#4a7c2e',
      flowerColor: '#ffc0d6',
      icon: '🌸',
      season: ['spring'],
      waterNeeds: 'medium',
      sunlight: 'full',
      spread: 10,
      modelType: 'tree-medium',
      realism: {
        trunkTexture: 'bark-brown',
        foliageType: 'weeping-ornamental',
        shadowIntensity: 0.6,
        leafSize: 'small',
        leafDensity: 'high',
      },
    },
  ],

  // ========== HERBS ==========
  [plantCategories.HERBS]: [
    {
      id: 'mint',
      name: 'Mint Plant',
      scientificName: 'Mentha spp.',
      description: 'Herbaceous perennial. Aromatic leaves. Easy to grow.',
      height: { min: 0.3, max: 0.8 },
      width: { min: 0.3, max: 0.6 },
      category: plantCategories.HERBS,
      color: '#2d5016',
      foliageColor: '#66c24a',
      flowerColor: '#d6f0e8',
      icon: '🌿',
      season: ['spring', 'summer'],
      waterNeeds: 'high',
      sunlight: 'partial',
      spread: 0.5,
      modelType: 'herb-ground',
      realism: {
        trunkTexture: 'none',
        foliageType: 'ground-cover',
        shadowIntensity: 0.2,
        leafSize: 'tiny',
        leafDensity: 'high',
      },
    },
  ],
};

/**
 * Get all plants in a category
 */
export const getPlantsInCategory = (category) => {
  return plants[category] || [];
};

/**
 * Get a single plant by ID
 */
export const getPlantById = (id) => {
  for (const category in plants) {
    const plant = plants[category].find((p) => p.id === id);
    if (plant) return plant;
  }
  return null;
};

/**
 * Get all categories with count
 */
export const getCategoriesWithCount = () => {
  return Object.entries(plantCategories).map(([key, value]) => ({
    key,
    value,
    name: key
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    count: plants[value]?.length || 0,
  }));
};

/**
 * Search plants by name or scientific name
 */
export const searchPlants = (query) => {
  const lower = query.toLowerCase();
  const results = [];
  for (const category in plants) {
    plants[category].forEach((plant) => {
      if (
        plant.name.toLowerCase().includes(lower) ||
        plant.scientificName.toLowerCase().includes(lower)
      ) {
        results.push(plant);
      }
    });
  }
  return results;
};

export default plants;
