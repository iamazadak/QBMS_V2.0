import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useProfile } from '../hooks/useAuth';

export function HomeRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (user) {
        if (profile?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/student', { replace: true }); // Assuming /dashboard is the student's default
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [user, authLoading, profile, profileLoading, navigate]);

  return <div className="text-center">Loading...</div>; // Or a spinner
}
