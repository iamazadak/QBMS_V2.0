
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Shield } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SignupForm() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await signUp(email, password, fullName, role);
      if (error) throw error;
      setMessage('Signup successful! Check your email for verification.');
    } catch (error) {
      setMessage('Signup failed. Try again.');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full p-6 bg-white"
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
          <SelectContent className="text-base">
            <SelectItem value="student" className="h-12">
              <div className="flex items-center">
                <User className="mr-2" size={20} />
                <span>Student</span>
              </div>
            </SelectItem>
            <SelectItem value="admin" className="h-12">
              <div className="flex items-center">
                <Shield className="mr-2" size={20} />
                <span>Admin</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full">Sign Up</Button>
      {message && <p className="text-sm text-red-500 mt-4">{message}</p>}
    </motion.form>
  );
}
