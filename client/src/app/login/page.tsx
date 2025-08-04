'use client';
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaLock, FaArrowRight, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { login as loginAction, login, selectCurrentUser, selectAuthError, selectIsAuthenticated, selectAuthLoading } from '@/store/Auth/authSlice';
import { User, UserRole, LoginCredentials } from '@/types/auth';
import { useAppDispatch, useAppSelector, AppDispatch } from '@/store/store';

// Using LoginCredentials from auth types

const Login = () => {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const authStatus = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  
  // Handle auth state changes
  useEffect(() => {
    console.log('Auth state changed - user:', user, 'authError:', authError);
    
    // If there was an auth error, stop loading
    if (authError) {
      console.log('Auth error detected:', authError);
      setIsSubmitting(false);
      setError(authError);
      return;
    }
    
    // If user is authenticated, redirect
    if (user) {
      console.log('User is authenticated, user:', user);
      console.log('User role:', user.role);
      
      // Get the redirect path based on user role
      const redirectPath = getRedirectPath(user.role);
      console.log('Redirecting to:', redirectPath);
      
      // Stop loading and redirect
      setIsSubmitting(false);
      
      // Use setTimeout to ensure state updates are processed before navigation
      const timer = setTimeout(() => {
        if (redirectPath) {
          console.log('Executing navigation to:', redirectPath);
          router.push(redirectPath);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [user, user?.role, authError, router]);

  // This effect is now handled in the main auth state effect
  
  const getRedirectPath = (role: UserRole): string => {
    switch(role) {
      case 'admin':
        return '/dashboard/admin';
      case 'teacher':
        return '/dashboard/teacher';
      case 'student':
        return '/dashboard/student';
      case 'parent':
        return '/dashboard/parent';
      default:
        return '/';
    }
  };

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted');
    
    // Prevent double submission
    if (isSubmitting) {
      console.log('Already submitting, ignoring');
      return;
    }
    
    // Clear previous errors
    setError('');
    
    // Basic validation
    if (!formData.email.trim() || !formData.password) {
      console.log('Validation failed: Empty fields');
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.log('Validation failed: Invalid email format');
      setError('Please enter a valid email address');
      return;
    }
    
    console.log('Starting login process...');
    setIsSubmitting(true);

    try {
      const credentials: LoginCredentials = {
        email: formData.email.trim(),
        password: formData.password
      };
      
      console.log('Dispatching login action with credentials:', { email: credentials.email });
      const result = await dispatch(loginAction(credentials)).unwrap();
      console.log('Login successful, result:', result);
      
      // If we get here, login was successful
      const redirectPath = getRedirectPath(result.role);
      console.log('Login successful, redirecting to:', redirectPath);
      if (redirectPath) {
        router.push(redirectPath);
      }
      
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] to-[#e6e9ff] p-4">
      <motion.div 
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#000054] to-[#1a1a6e] p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-blue-100 mt-1">Sign in to access your account</p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#000054] focus:ring focus:ring-[#000054]/20 p-2.5 text-sm"
                placeholder="Enter your email"
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {/* Password Field */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-[#000054] hover:text-[#E32845] transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#000054] focus:ring focus:ring-[#000054]/20 p-2.5 text-sm"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {/* Remember Me & Submit */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#000054] focus:ring-[#000054] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#000054] to-[#1a1a6e] hover:from-[#1a1a6e] hover:to-[#000054] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#000054] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <FaArrowRight className="ml-2" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;