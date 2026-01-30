
import { useEffect } from 'react';
import { useAuth, useProfile } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export function AuthProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoading = authLoading || profileLoading;

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirection logic for logged-in users on auth pages or root
        if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
          if (profile?.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (profile?.role === 'trainer') {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/student', { replace: true });
          }
        }
      } else {
        // Not logged in - redirect to login if on a protected route
        const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
        if (!publicRoutes.includes(location.pathname)) {
          navigate('/login', { replace: true });
        }
      }
    }
  }, [user, isLoading, profile, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium tracking-wide">Initializing session...</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
