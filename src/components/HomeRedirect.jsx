import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useProfile } from '../hooks/useAuth';

export function HomeRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (user && profile) {
        console.log("Redirecting based on role:", profile.role);
        const role = profile.role?.toLowerCase();

        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'trainer') {
          navigate('/dashboard', { replace: true });
        } else {
          // Default to student if role is student or unrecognized
          navigate('/student', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [user, authLoading, profile, profileLoading, navigate]);

  return <div className="text-center">Loading...</div>; // Or a spinner
}
