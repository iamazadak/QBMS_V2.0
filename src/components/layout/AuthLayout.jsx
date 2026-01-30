import { useState } from 'react';
import { motion } from 'framer-motion';
import { LoginForm } from '../auth/LoginForm';
import { SignupForm } from '../auth/SignupForm';
import { ForgotPasswordModal } from '../auth/ForgotPasswordModal';
import lernernLogo from '@/assets/lernern_logo.jpeg';

export function AuthLayout() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className={`container relative w-full max-w-4xl min-h-[600px] rounded-lg shadow-lg overflow-hidden ${isSignUp ? 'right-panel-active' : ''}`}>
        <div className="form-container sign-up-container absolute top-0 h-full left-0 w-1/2 opacity-0">
          <div className="flex flex-col items-center pt-4 bg-white">
            <img src={lernernLogo} alt="Lernern Logo" className="h-24 w-auto mb-2" />
          </div>
          <SignupForm />
        </div>
        <div className="form-container sign-in-container absolute top-0 h-full left-0 w-1/2">
          <div className="flex flex-col items-center pt-4 bg-white">
            <img src={lernernLogo} alt="Lernern Logo" className="h-24 w-auto mb-2" />
          </div>
          <LoginForm />
        </div>
        <div className="overlay-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden">
          <div className="overlay relative -left-full h-full w-[200%]" style={{ background: 'linear-gradient(to right, #008080, #00a0a0)' }}>
            <div className="overlay-panel overlay-left absolute flex items-center justify-center flex-col px-10 text-center top-0 h-full w-1/2">
              <h1 className="text-white text-2xl font-bold">Welcome Back!</h1>
              <p className="text-white mt-2">Access your account and continue your journey.</p>
              <button className="ghost mt-4 bg-transparent border border-white text-white py-2 px-8 rounded-full" onClick={() => setIsSignUp(false)}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right absolute flex items-center justify-center flex-col px-10 text-center top-0 h-full w-1/2 right-0">
              <h1 className="text-white text-2xl font-bold">Join Us!</h1>
              <p className="text-white mt-2">Register to unlock full access and exclusive features.</p>
              <button className="ghost mt-4 bg-transparent border border-white text-white py-2 px-8 rounded-full" onClick={() => setIsSignUp(true)}>Sign Up</button>
            </div>
          </div>
        </div>
        <style jsx>{`
          .container.right-panel-active .sign-in-container {
            transform: translateX(100%);
          }
          .container.right-panel-active .sign-up-container {
            transform: translateX(100%);
            opacity: 1;
            z-index: 5;
            animation: show 0.6s;
          }
          @keyframes show {
            0%, 49.99% {
              opacity: 0;
              z-index: 1;
            }
            50%, 100% {
              opacity: 1;
              z-index: 5;
            }
          }
          .container.right-panel-active .overlay-container{
            transform: translateX(-100%);
          }
          .container.right-panel-active .overlay {
            transform: translateX(50%);
          }
          .overlay-left {
            transform: translateX(-20%);
          }
          .container.right-panel-active .overlay-left {
            transform: translateX(0);
          }
          .overlay-right {
            right: 0;
            transform: translateX(0);
          }
          .container.right-panel-active .overlay-right {
            transform: translateX(20%);
          }
        `}</style>      </div>
    </div>
  );
}