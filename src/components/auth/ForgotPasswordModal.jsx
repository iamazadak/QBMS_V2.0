
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export function ForgotPasswordModal() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password

  const handleSendOtp = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setMessage('Password reset email sent!');
      setStep(2);
    } catch (error) {
      setMessage('Error sending password reset email.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
      setMessage('OTP verified. Set new password.');
      setStep(3);
    } catch (error) {
      setMessage('Invalid OTP.');
    }
  };

  const handleResetPassword = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage('Password reset successful!');
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
    } catch (error) {
      setMessage('Error resetting password.');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-teal-500 underline">Forgot Password?</button>
      </DialogTrigger>
      <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Reset Password</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 border rounded"
              required
            />
            <Button onClick={handleSendOtp}>Send OTP</Button>
            {message && <p className="text-sm text-red-500">{message}</p>}
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Verify OTP</h3>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full p-2 border rounded"
              maxLength={6}
              required
            />
            <Button onClick={handleVerifyOtp}>Verify OTP</Button>
            {message && <p className="text-sm text-red-500">{message}</p>}
          </motion.div>
        )}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Set New Password</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-2 border rounded"
              required
            />
            <Button onClick={handleResetPassword}>Reset Password</Button>
            {message && <p className="text-sm text-red-500">{message}</p>}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
