import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ProtectedRoute Component Explanation:
// This is a Higher-Order Component (HOC) that acts as a security guard.
// It checks if the user is authenticated and has the required role
// before allowing access to the protected route.

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, role, isInitialized } = useAuth();
  const location = useLocation();

  // Wait for AuthContext to check localStorage before deciding to redirect
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B67A]"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is needed, check if user has it
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole.map(r => r.toLowerCase()) : [requiredRole.toLowerCase()];
    const userRoleLower = role?.toLowerCase();
    
    if (!userRoleLower) {
      return <Navigate to="/login" replace />;
    }

    const canAccess = roles.includes(userRoleLower);
    
    if (!canAccess) {
      return <Navigate to="/" replace />;
    }
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
