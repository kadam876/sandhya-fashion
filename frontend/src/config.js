// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api');

/** Default catalogue cover image (Google gstatic CDN) when no custom image is set. */
export const DEFAULT_CATALOGUE_IMAGE_URL =
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,

  // Cart
  CART: `${API_BASE_URL}/cart`,


  // Products
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
  PRODUCTS_BY_CATEGORY: (category) => `${API_BASE_URL}/products/category/${encodeURIComponent(category)}`,
  PRODUCT_CATEGORIES: `${API_BASE_URL}/products/categories`,
  PRODUCT_FILTER: `${API_BASE_URL}/products/filter`,
  PRODUCTS_BY_CATALOGUE: (catalogueId) => `${API_BASE_URL}/products/catalogue/${catalogueId}`,
  LOW_STOCK_PRODUCTS: `${API_BASE_URL}/products/low-stock`,

  // Feedback
  FEEDBACK_BY_PRODUCT: (productId) => `${API_BASE_URL}/feedback/product/${productId}`,
  MY_FEEDBACK: (productId) => `${API_BASE_URL}/feedback/product/${productId}/mine`,
  SUBMIT_FEEDBACK: (productId) => `${API_BASE_URL}/feedback/product/${productId}`,

  // Orders
  ORDERS: `${API_BASE_URL}/orders`,
  ORDER_BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
  MY_ORDERS: `${API_BASE_URL}/orders/my-orders`,
  ORDERS_BY_STATUS: (status) => `${API_BASE_URL}/admin/orders/status/${status}`,
  UPDATE_ORDER_STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,

  // Analytics (Admin)
  ANALYTICS_DASHBOARD: `${API_BASE_URL}/analytics/dashboard`,
  ANALYTICS_DASHBOARD_FULL: `${API_BASE_URL}/analytics/dashboard-full`,
  ANALYTICS_SALES: `${API_BASE_URL}/analytics/sales`,
  ANALYTICS_CATEGORIES: `${API_BASE_URL}/analytics/categories`,
  ANALYTICS_GROWTH: `${API_BASE_URL}/analytics/growth`,
  ANALYTICS_ORDER_STATUS: `${API_BASE_URL}/analytics/order-status`,

  // Admin
  ADMIN_DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
  ADMIN_INVENTORY: `${API_BASE_URL}/admin/inventory`,
  ADMIN_ORDERS: `${API_BASE_URL}/admin/orders`,
  ADMIN_CREATE_PRODUCT: `${API_BASE_URL}/admin/products`,
  ADMIN_UPDATE_PRODUCT: (id) => `${API_BASE_URL}/admin/products/${id}`,
  ADMIN_DELETE_PRODUCT: (id) => `${API_BASE_URL}/admin/products/${id}`,
  ADMIN_UPDATE_ORDER_STATUS: (id) => `${API_BASE_URL}/admin/orders/${id}/status`,
  ADMIN_USERS: `${API_BASE_URL}/admin/my-users`,
  ADMIN_PLATFORM_GROWTH: `${API_BASE_URL}/admin/platform-sales-growth`,
  ADMIN_PLATFORM_STATS: `${API_BASE_URL}/admin/platform-stats`,
  ADMIN_PLATFORM_ONBOARDING: `${API_BASE_URL}/admin/platform-onboarding`,
  ADMIN_PLATFORM_ORDERS: `${API_BASE_URL}/admin/platform-orders`,
  ADMIN_PLATFORM_INVENTORY: `${API_BASE_URL}/admin/platform-inventory`,
  ADMIN_SHOPS: `${API_BASE_URL}/admin/shops`,
  ADMIN_TOP_PRODUCTS: `${API_BASE_URL}/analytics/top-products`,
  ADMIN_PREDICTIONS: `${API_BASE_URL}/analytics/predictions`,
  ADMIN_CATALOGUES: `${API_BASE_URL}/admin/catalogues`,

  ADMIN_CATALOGUE_BY_ID: (id) => `${API_BASE_URL}/admin/catalogues/${id}`,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_info',
  ROLE: 'user_role',
  CART: 'cart_items',
};

// Default headers for API requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
