import { useAuthContext } from '../components/auth/AuthProvider';

export function useAuth() {
  const context = useAuthContext();
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useProfile() {
  const context = useAuthContext();
  if (context === undefined) {
    throw new Error('useProfile must be used within an AuthProvider');
  }
  return {
    profile: context.profile,
    loading: context.loading
  };
}
