
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Shield, Briefcase } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SignupForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage('');
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    try {
      const { data, error } = await signUp(trimmedEmail, password, trimmedFullName, role);
      if (error) throw error;

      setMessage('Signup successful! Redirecting...');

      // If email confirmation is strictly disabled in Supabase, session is created immediately.
      // Even if not, we can redirect or let the user login.
      // A small delay for user to read the success message
      setTimeout(() => {
        // Navigate to root to let HomeRedirect handle role-based routing
        navigate('/');
      }, 1500);

    } catch (error) {
      console.error('Signup error:', error);
      if (error.status === 429) {
        setMessage('Too many registration attempts. Please try again later.');
      } else if (error.message?.includes('Anonymous sign-ins')) {
        setMessage('Registration error. Please contact support.');
      } else {
        setMessage(error.message || 'Signup failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-start h-full p-6 pt-4 bg-white"
      onSubmit={handleSubmit}
    >
      <h1 className="text-3xl font-bold mb-2">Create Account</h1>
      <p className="text-gray-500 mb-6">Use your email for registration.</p>
      <div className="relative w-full mb-4">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          className="w-full p-2 pl-10 border rounded bg-gray-100"
          required
        />
      </div>
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
      <div className="relative w-full mb-4">
        <Select onValueChange={setRole} defaultValue={role}>
          <SelectTrigger className="w-full p-2 border rounded bg-gray-100 h-12 text-base">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent className="text-base bg-white border border-gray-200 shadow-xl overflow-hidden">
            <SelectItem value="student" className="h-12 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center text-gray-700">
                <User className="mr-2" size={20} />
                <span>Student</span>
              </div>
            </SelectItem>
            <SelectItem value="trainer" className="h-12 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center text-gray-700">
                <Briefcase className="mr-2" size={20} />
                <span>Trainer</span>
              </div>
            </SelectItem>
            <SelectItem value="admin" className="h-12 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center text-gray-700">
                <Shield className="mr-2" size={20} />
                <span>Admin</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading} className="w-full text-white font-bold py-2 px-4 rounded-full" style={{ backgroundColor: '#008080' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#006666'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#008080'}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </Button>
      {message && <p className="text-sm text-red-500 mt-4">{message}</p>}
    </motion.form>
  );
}
