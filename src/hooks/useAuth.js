
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth Event: ${event}`);

        if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          setSession(null);
          setUser(null);
        } else if (session) {
          setSession(session);
          setUser(session.user);
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }

        setLoading(false);
      }
    );

    // Initial fetch with error handling
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session fetch error:", error.message);
          if (error.message.includes("Refresh Token Not Found") || error.message.includes("invalid_grant")) {
            await supabase.auth.signOut();
          }
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Unexpected auth error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = async (email, password, fullName, role) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    console.log("Attempting signup with:", { cleanEmail, role, cleanName });

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          role: role,
        },
      },
    });

    if (error) {
      return { data, error };
    }

    // If signup is successful, the PROFILE will be created automatically by a Database Trigger.
    // We do NOT need to manually insert it here anymore.
    /* 
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { id: data.user.id, full_name: fullName, role: role }
        ]);

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return { data: null, error: profileError };
      }
    }
    */

    return { data, error: null };
  };

  const signOut = () => supabase.auth.signOut();

  return { user, session, loading, signIn, signUp, signOut };
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchOrCreateProfile = async () => {
        setLoading(true); // Set loading to true before fetching
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') { // Profile not found
          console.warn('Profile not found for user, creating a default one.');
          // Attempt to create a default profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              { id: user.id, full_name: user.email.split('@')[0], role: 'student' } // Default values
            ])
            .select('*') // Select the newly created profile
            .single();

          if (createError) {
            console.error('Error creating default profile:', createError);
            setProfile(null);
          } else {
            setProfile(newProfile);
          }
        } else if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else {
          setProfile(data);
        }
        setLoading(false);
      };
      fetchOrCreateProfile();
    } else {
      setProfile(null); // Clear profile if user logs out
      setLoading(false);
    }
  }, [user]);

  return { profile, loading };
}
