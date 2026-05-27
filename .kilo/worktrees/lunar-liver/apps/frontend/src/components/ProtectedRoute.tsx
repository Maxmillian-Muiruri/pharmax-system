import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const userJson = localStorage.getItem('pharmacie_user');
  const user = userJson ? JSON.parse(userJson) : null;
  
  if (!user || !user.userId) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}