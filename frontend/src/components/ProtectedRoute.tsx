import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'artisan';
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requireAuth = true 
}) => {
  const { isAuthenticated, user } = useAuth();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific role is required but user doesn't have it
  if (requiredRole && user?.userType !== requiredRole) {
    // Redirect customers trying to access artist features to products page
    if (user?.userType === 'customer' && requiredRole === 'artisan') {
      return <Navigate to="/products" replace />;
    }
    // Redirect artists to their appropriate page or products
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;