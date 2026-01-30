
import { Navigate } from 'react-router-dom';
import { useAuth, useProfile } from '../hooks/useAuth';

export function ProtectedRoute({ children, role = 'any' }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium tracking-wide">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || (role !== 'any' && profile?.role !== role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
