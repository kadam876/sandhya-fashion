// Centralized product data for the entire application
// This ensures both Admin and User panels use the same data source
// Single Source of Truth principle
import { fabricTypes } from '../data/fabricTypes';

export const products = [
  {
    id: 1,
    name: 'Premium Cotton Fabric',
    price: 299,
    category: 'cotton',
    fabricType: fabricTypes.cotton,
    description: 'High-quality cotton fabric perfect for summer wear',
    inStock: true,
    image: 'https://picsum.photos/seed/cotton1/250/300.jpg',
  },
  {
    id: 2,
    name: 'Silk Blend Fabric',
    price: 899,
    category: 'silk',
    fabricType: fabricTypes.silk,
    description: 'Luxurious silk blend for special occasions',
    inStock: true,
    image: 'https://picsum.photos/seed/silk1/250/300.jpg',
  },
  {
    id: 3,
    name: 'Linen Fabric',
    price: 449,
    category: 'linen',
    fabricType: fabricTypes.linen,
    description: 'Breathable linen fabric for casual wear',
    inStock: true,
    image: 'https://picsum.photos/seed/linen1/250/300.jpg',
  },
  {
    id: 4,
    name: 'Wool Fabric',
    price: 699,
    category: 'wool',
    fabricType: fabricTypes.wool,
    description: 'Warm wool fabric for winter clothing',
    inStock: true,
    image: 'https://picsum.photos/seed/wool1/250/300.jpg',
  },
  {
    id: 5,
    name: 'Polyester Blend',
    price: 199,
    category: 'synthetic',
    fabricType: fabricTypes.polyester,
    description: 'Durable polyester blend for everyday use',
    inStock: true,
    image: 'https://picsum.photos/seed/polyester1/250/300.jpg',
  },
  {
    id: 6,
    name: 'Rayon Fabric',
    price: 349,
    category: 'synthetic',
    fabricType: fabricTypes.rayon,
    description: 'Soft rayon fabric with excellent drape',
    inStock: true,
    image: 'https://picsum.photos/seed/rayon1/250/300.jpg',
  },
  {
    id: 7,
    name: 'Velvet Fabric',
    price: 799,
    category: 'luxury',
    fabricType: fabricTypes.velvet,
    description: 'Premium velvet fabric for upholstery and clothing',
    inStock: true,
    image: 'https://picsum.photos/seed/velvet1/250/300.jpg',
  },
  {
    id: 8,
    name: 'Denim Fabric',
    price: 399,
    category: 'cotton',
    fabricType: fabricTypes.denim,
    description: 'Classic denim fabric for jeans and jackets',
    inStock: true,
    image: 'https://picsum.photos/seed/denim1/250/300.jpg',
  },
  {
    id: 9,
    name: 'Elegant Two Piece Set',
    category: 'Two Piece Dress',
    price: 2499,
    originalPrice: 3999,
    image: 'https://picsum.photos/seed/threepiece1/250/300.jpg',
    rating: 4.5,
    badge: 'Best Seller',
    badgeColor: 'bg-red-500',
    stock: 45,
    description: 'Premium quality two-piece set with intricate embroidery work'
  },
  {
    id: 10,
    name: 'Stylish Three Piece Dress',
    category: 'Three Piece Dress',
    price: 899,
    originalPrice: 1499,
    image: 'https://picsum.photos/seed/threepiece1/250/300.jpg',
    rating: 4.3,
    badge: 'New Arrival',
    badgeColor: 'bg-green-500',
    stock: 32,
    description: 'Modern three-piece dress with contemporary design elements'
  },
  {
    id: 11,
    name: 'Chic Midi Dress',
    category: 'Midi Dress',
    price: 1899,
    originalPrice: 2899,
    image: 'https://picsum.photos/seed/mididress1/250/300.jpg',
    rating: 4.7,
    badge: 'Trending',
    badgeColor: 'bg-orange-500',
    stock: 18,
    description: 'Elegant midi dress perfect for semi-formal occasions'
  },
  {
    id: 12,
    name: 'Fashion Co-ord Set',
    category: 'Two Piece Dress',
    price: 699,
    originalPrice: 1199,
    image: 'https://picsum.photos/seed/coordset1/250/300.jpg',
    rating: 4.4,
    badge: 'Sale',
    badgeColor: 'bg-purple-500',
    stock: 67,
    description: 'Comfortable co-ord set with modern fashion appeal'
  },
  {
    id: 13,
    name: 'Classic Two Piece Set',
    category: 'Two Piece Dress',
    price: 3299,
    originalPrice: 9999,
    image: 'https://picsum.photos/seed/classictwopiece1/250/300.jpg',
    rating: 4.6,
    badge: 'Premium',
    badgeColor: 'bg-yellow-500',
    stock: 23,
    description: 'Timeless two-piece set with traditional craftsmanship'
  },
  {
    id: 14,
    name: 'Premium Cotton Saree',
    category: 'Saree',
    price: 1599,
    originalPrice: 2999,
    image: 'https://picsum.photos/seed/saree1/250/300.jpg',
    rating: 4.8,
    badge: 'Exclusive',
    badgeColor: 'bg-indigo-500',
    stock: 12,
    description: 'Handcrafted cotton saree with intricate border work'
  },
  {
    id: 15,
    name: 'Western Denim Jacket',
    category: 'Western',
    price: 2799,
    originalPrice: 4999,
    image: 'https://picsum.photos/seed/jacket1/250/300.jpg',
    rating: 4.2,
    badge: 'New',
    badgeColor: 'bg-blue-500',
    stock: 8,
    description: 'Stylish denim jacket for modern casual wear'
  },
  {
    id: 16,
    name: 'Embroidered Kurti',
    category: 'Traditional',
    price: 1299,
    originalPrice: 2199,
    image: 'https://picsum.photos/seed/kurti1/250/300.jpg',
    rating: 4.9,
    badge: 'Popular',
    badgeColor: 'bg-pink-500',
    stock: 34,
    description: 'Traditional kurti with beautiful embroidery patterns'
  }
];

// Get unique categories from products
export const getCategories = () => {
  const categories = [...new Set(products.map(product => product.category))];
  return ['All', ...categories];
};

// Calculate dashboard statistics
export const getDashboardStats = () => {
  const totalItems = products.length;
  const lowStockItems = products.filter(item => item.stock < 20).length;
  const totalValue = products.reduce((sum, item) => sum + (item.price * item.stock), 0);
  
  return {
    totalItems,
    lowStockItems,
    totalValue
  };
};
