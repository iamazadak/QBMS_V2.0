
import { useEffect } from 'react';
import { useAuth, useProfile } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export function AuthProvider({ children }) {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && location.pathname === '/login') {
      if (profile?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    }
  }, [user, loading, profile, navigate, location.pathname]);

  if (loading) return <div className="text-center">Loading...</div>;
  return <>{children}</>;
}
