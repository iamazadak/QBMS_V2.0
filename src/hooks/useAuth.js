
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Initial fetch
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    })();


    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = async (email, password, fullName, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role, // Default role
        },
      },
    });

    if (error) {
      return { data, error };
    }

    // If signup is successful, create a profile entry
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
