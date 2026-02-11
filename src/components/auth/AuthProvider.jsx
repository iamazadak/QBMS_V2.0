import { createContext, useContext, useState, useEffect, useRef } from 'react';
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

// Utility to wrap a promise with a timeout
const withTimeout = (promise, ms, label) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      console.warn(`[Auth] Timeout reached for: ${label} (${ms}ms)`);
      reject(new Error(`Timeout: ${label}`));
    }, ms);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timeoutId);
      return res;
    }),
    timeoutPromise
  ]);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isInitializing = useRef(false);
  const initializedUser = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 0. Safety Timeout (Global Fallback)
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("[Auth] Global safety timeout triggered. Forcing loading to false.");
        setLoading(false);
      }
    }, 8000);

    // 1. Initial Auth Check
    const initializeAuth = async () => {
      if (isInitializing.current) return;
      isInitializing.current = true;
      console.log("[Auth] Initializing session...");

      try {
        const { data: { session }, error } = await withTimeout(
          supabase.auth.getSession(),
          4000,
          "getSession"
        );

        console.log("[Auth] Session check complete", { hasSession: !!session });

        if (error) {
          console.error("[Auth] Session fetch error:", error.message);
          if (error.message.includes("Refresh Token Not Found") || error.message.includes("invalid_grant")) {
            await supabase.auth.signOut();
          }
        }

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        initializedUser.current = currentUser?.id ?? null;

        if (currentUser) {
          console.log("[Auth] User found, fetching profile for:", currentUser.id);
          await fetchProfile(currentUser.id);
        } else {
          console.log("[Auth] No user found, stopping loader.");
          setLoading(false);
        }
      } catch (err) {
        console.error("[Auth] Unexpected auth error during init:", err.message);
        setLoading(false);
      } finally {
        isInitializing.current = false;
      }
    };

    initializeAuth();

    // 2. Auth State Change Listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[Auth] State Change Event: ${event}`);
        const currentUser = session?.user ?? null;

        if (event === 'SIGNED_OUT') {
          console.log("[Auth] Signed out, clearing state.");
          setUser(null);
          setProfile(null);
          initializedUser.current = null;
          setLoading(false);
        } else if (currentUser) {
          // If this user was already handled by initializeAuth, skip
          if (currentUser.id === initializedUser.current && !loading) {
            console.log("[Auth] User already initialized, skipping state change fetch.");
            return;
          }

          console.log("[Auth] User detected in state change, fetching profile...");
          setUser(currentUser);
          initializedUser.current = currentUser.id;
          setLoading(true);
          await fetchProfile(currentUser.id);
        } else if (event === 'INITIAL_SESSION' && !currentUser) {
          // Skip, handled by initializeAuth
        } else {
          console.log("[Auth] Auth state change ending loader.");
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(safetyTimeout);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    console.log("[Auth] fetchProfile called for:", userId);
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        5000,
        "fetchProfile"
      );

      if (error && error.code === 'PGRST116') { // Profile not found
        console.warn('[Auth] Profile not found, creating default.');
        const { data: newProfile, error: createError } = await withTimeout(
          supabase
            .from('profiles')
            .insert([{ id: userId, role: 'student' }])
            .select('*')
            .single(),
          4000,
          "createProfile"
        );

        if (createError) console.error('[Auth] Error creating profile:', createError);
        setProfile(newProfile || null);
      } else if (error) {
        console.error('[Auth] Error fetching profile:', error);
        setProfile(null);
      } else {
        console.log("[Auth] Profile fetched successfully:", data?.role);
        setProfile(data);
      }
    } catch (err) {
      console.error('[Auth] Profile fetch unexpected error:', err.message);
    } finally {
      console.log("[Auth] Profile fetch final step, stopping loader.");
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
      console.log(`[Auth] Redirection check: user=${!!user}, profile=${!!profile}, path=${location.pathname}, role=${profile?.role}`);

      if (user && profile) {
        // Logged in: redirect away from auth pages or root
        if (isPublicRoute || location.pathname === '/') {
          const role = profile?.role?.toLowerCase();
          console.log(`[Auth] Redirecting to ${role} dashboard...`);
          if (role === 'admin') navigate('/admin', { replace: true });
          else if (role === 'trainer') navigate('/dashboard', { replace: true });
          else navigate('/student', { replace: true });
        }
      } else if (!user) {
        // Not logged in: redirect to login if not on public route
        if (!isPublicRoute && location.pathname !== '/') {
          console.log("[Auth] No user session found, redirecting to login.");
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
          <div className="flex flex-col items-center">
            <p className="text-slate-600 font-medium tracking-wide">Initializing session...</p>
            <p className="text-slate-400 text-xs mt-1">Checking database connectivity</p>
          </div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
