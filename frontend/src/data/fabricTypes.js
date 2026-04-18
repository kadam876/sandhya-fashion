// Fabric types data for the Sandhya Fashion application
export const fabricTypes = {
  cotton: {
    id: 'cotton',
    name: 'Cotton',
    description: 'Soft, breathable, and comfortable fabric',
    properties: ['Breathable', 'Soft', 'Comfortable', 'All-season'],
    care: 'Machine washable, tumble dry low'
  },
  silk: {
    id: 'silk',
    name: 'Silk',
    description: 'Luxurious natural fiber with smooth texture',
    properties: ['Luxurious', 'Smooth', 'Lightweight', 'Natural'],
    care: 'Dry clean only, hand wash recommended'
  },
  linen: {
    id: 'linen',
    name: 'Linen',
    description: 'Lightweight and breathable fabric',
    properties: ['Breathable', 'Lightweight', 'Strong', 'Cool'],
    care: 'Machine wash cold, hang to dry'
  },
  wool: {
    id: 'wool',
    name: 'Wool',
    description: 'Warm and insulating natural fiber',
    properties: ['Warm', 'Insulating', 'Durable', 'Natural'],
    care: 'Hand wash cold, dry flat'
  },
  polyester: {
    id: 'polyester',
    name: 'Polyester',
    description: 'Durable synthetic fabric',
    properties: ['Durable', 'Wrinkle-resistant', 'Quick-drying', 'Affordable'],
    care: 'Machine wash, tumble dry low'
  },
  rayon: {
    id: 'rayon',
    name: 'Rayon',
    description: 'Semi-synthetic fabric with silk-like feel',
    properties: ['Soft', 'Drapes well', 'Breathable', 'Versatile'],
    care: 'Hand wash cold, hang to dry'
  },
  velvet: {
    id: 'velvet',
    name: 'Velvet',
    description: 'Luxurious fabric with soft pile',
    properties: ['Luxurious', 'Soft', 'Rich texture', 'Elegant'],
    care: 'Dry clean only, gentle handling'
  },
  denim: {
    id: 'denim',
    name: 'Denim',
    description: 'Sturdy cotton fabric with diagonal weave',
    properties: ['Durable', 'Strong', 'Casual', 'Versatile'],
    care: 'Machine wash cold, tumble dry low'
  }
};

export const getFabricTypeById = (id) => {
  return fabricTypes[id] || null;
};

export const getAllFabricTypes = () => {
  return Object.values(fabricTypes);
};
