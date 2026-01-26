
import { useEffect } from 'react';
import { useAuth, useProfile } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export function AuthProvider({ children }) {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
          if (profile?.role === 'admin') {
            navigate('/admin');
          } else if (profile?.role === 'trainer') {
            navigate('/dashboard');
          } else {
            navigate('/student');
          }
        }
      } else {
        // Not logged in - redirect to login if on a protected route
        const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
        if (!publicRoutes.includes(location.pathname)) {
          navigate('/login');
        }
      }
    }
  }, [user, loading, profile, navigate, location.pathname]);

  if (loading) return <div className="text-center">Loading...</div>;
  return <>{children}</>;
}
