
import { useState } from 'react';
import { useAuth, useProfile } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export function LoginForm() {
  const { signIn } = useAuth();
  const { profile, loading } = useProfile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      setMessage(`Login successful! Welcome, ${profile?.full_name} (${profile?.role}).`);
    } catch (error) {
      setMessage('Login failed. Check credentials or verify email.');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full p-6 bg-white"
      onSubmit={handleSubmit}
    >
      <h1 className="text-3xl font-bold mb-2">Sign In</h1>
      <p className="text-gray-500 mb-6">Use your email and password to sign in.</p>
      <div className="relative w-full mb-4">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 pl-10 border rounded bg-gray-100"
          required
        />
      </div>
      <div className="relative w-full mb-4">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 pl-10 border rounded bg-gray-100"
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full">
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      <div className="w-full flex justify-center mt-4">
        <ForgotPasswordModal />
      </div>
      {message && <p className="text-sm text-red-500 mt-4">{message}</p>}
    </motion.form>
  );
}
