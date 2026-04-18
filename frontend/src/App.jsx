import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import CartSidebar from './components/CartSidebar';
import ErrorBoundary from './components/ErrorBoundary';

import PublicLayout from './components/layout/PublicLayout';

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/landing/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Shop = lazy(() => import('./pages/user/Shop'));
const About = lazy(() => import('./pages/info/About'));
const Contact = lazy(() => import('./pages/info/Contact'));
const Terms = lazy(() => import('./pages/info/Terms'));
const RefundPolicy = lazy(() => import('./pages/info/RefundPolicy'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const ProductDetail = lazy(() => import('./pages/user/ProductDetail'));
const InventoryDashboard = lazy(() => import('./pages/admin/InventoryDashboard'));
const Profile = lazy(() => import('./pages/user/Profile'));
const MyOrders = lazy(() => import('./pages/user/MyOrders'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
  </div>
);


function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Auth & Setup Routes - No Layout needed */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Public Routes with Shared Layout */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/refund" element={<RefundPolicy />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-orders" element={
                      <ProtectedRoute>
                        <MyOrders />
                      </ProtectedRoute>
                    } />
                  </Route>
                  {/* Protected admin routes with Layout wrapper - Owners also have access */}
                  <Route path="/admin" element={
                    <ProtectedRoute requiredRole={['owner']}>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="inventory-dashboard" element={<InventoryDashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="customers" element={<AdminUsers />} />
                  </Route>
                </Routes>
              </Suspense>

              {/* Global Cart Sidebar */}
              <CartSidebar />
            </Router>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  );
}

export default App;
