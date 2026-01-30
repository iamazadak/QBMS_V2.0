import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signIn: () => { },
  signUp: () => { },
  signOut: () => { },
});

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Initial Auth Check
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session fetch error:", error.message);
          if (error.message.includes("Refresh Token Not Found") || error.message.includes("invalid_grant")) {
            await supabase.auth.signOut();
          }
        }

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Unexpected auth error:", err);
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Auth State Change Listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth Provider Event: ${event}`);
        const currentUser = session?.user ?? null;

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (currentUser) {
          setUser(currentUser);
          await fetchProfile(currentUser.id);
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') { // Profile not found
        console.warn('Profile not found, creating default.');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: userId, role: 'student' }])
          .select('*')
          .single();

        if (createError) console.error('Error creating profile:', createError);
        setProfile(newProfile || null);
      } else if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const signUp = (email, password, fullName, role) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } }
    });

  // 3. Centralized Redirection Logic
  useEffect(() => {
    if (!loading) {
      const isPublicRoute = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);

      if (user && profile) {
        // Logged in: redirect away from auth pages or root
        if (isPublicRoute || location.pathname === '/') {
          const role = profile?.role?.toLowerCase();
          if (role === 'admin') navigate('/admin', { replace: true });
          else if (role === 'trainer') navigate('/dashboard', { replace: true });
          else navigate('/student', { replace: true });
        }
      } else if (!user) {
        // Not logged in: redirect to login if not on public route
        if (!isPublicRoute && location.pathname !== '/') {
          navigate('/login', { replace: true });
        }
      }
    }
  }, [user, profile, loading, location.pathname, navigate]);

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium tracking-wide">Initializing session...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
