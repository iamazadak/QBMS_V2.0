
import { Navigate } from 'react-router-dom';
import { useAuth, useProfile } from '../hooks/useAuth';

export function ProtectedRoute({ children, role = 'any' }) {
  const { user, loading } = useAuth();
  const { profile } = useProfile();

  if (loading) return <div className="text-center">Loading...</div>;
  if (!user || (role !== 'any' && profile?.role !== role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
