'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG } from '@/config/api';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = API_CONFIG.API_BASE_URL;

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams?.get('mode') === 'signup' ? 'signup' : 'signin';
  
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { login } = useAuth();
  
  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleMode = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsSignUp(!isSignUp);
      setIsAnimating(false);
      setError(null);
    }, 300);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email.trim() || !loginData.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await login({ 
        email: loginData.email, 
        password: loginData.password 
      });

      if (result.success && result.user) {
        // Check role and redirect accordingly
        const role = result.user.role;
        if (role === 'admin' || role === 'superadmin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!signupData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          role: 'user',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          toggleMode();
          setSuccess(false);
        }, 2000);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success && isSignUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden" style={{ minHeight: '600px' }}>
        
        {/* Forms Container */}
        <div className="relative w-full h-full flex" style={{ minHeight: '600px' }}>
          
          {/* Sign In Form */}
          <div className={`absolute inset-0 w-full md:w-1/2 flex items-center justify-center transition-all duration-500 ease-in-out ${isSignUp ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
            <div className="max-w-sm w-full px-6 md:px-10 py-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-500 mb-8">or use your email password</p>
              
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="Email"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    required
                  />
                </div>
                
                <div className="relative">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>

                <Link href="#" className="block text-sm text-gray-500 hover:text-gray-700">
                  Forget Your Password?
                </Link>

                {error && !isSignUp && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'SIGN IN'}
                </button>
              </form>

              <Link href="/" className="block text-center text-sm text-gray-500 mt-6 hover:text-gray-700">
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className={`absolute inset-0 left-auto right-0 w-full md:w-1/2 flex items-center justify-center transition-all duration-500 ease-in-out ${isSignUp ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
            <div className="max-w-sm w-full px-6 md:px-10 py-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-500 mb-6">or use your email for register</p>
              
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="Name"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    required
                  />
                </div>
                
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="Email"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    required
                  />
                </div>
                
                <div className="relative">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="Confirm Password"
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>

                {error && isSignUp && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'SIGN UP'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sliding Overlay Panel */}
        <div className={`absolute top-0 h-full w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col items-center justify-center p-8 md:p-12 transition-all duration-500 ease-in-out ${isSignUp ? 'translate-x-0 rounded-r-[80px] md:rounded-r-[150px]' : 'translate-x-full md:translate-x-full rounded-l-[80px] md:rounded-l-[150px]'}`}>
          
          {/* Sign In Overlay Content (shown when in sign up mode) */}
          <div className={`text-center transition-all duration-500 ${isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20 pointer-events-none absolute'}`}>
            <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-blue-100 mb-8 max-w-xs">
              Enter your personal details to use all of site features
            </p>
            <button
              onClick={toggleMode}
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              SIGN IN
            </button>
          </div>

          {/* Sign Up Overlay Content (shown when in sign in mode) */}
          <div className={`text-center transition-all duration-500 ${!isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20 pointer-events-none absolute'}`}>
            <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
            <p className="text-blue-100 mb-8 max-w-xs">
              Register with your personal details to use all of site features
            </p>
            <button
              onClick={toggleMode}
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              SIGN UP
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
