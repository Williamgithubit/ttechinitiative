'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/store';
import { initializeAuth } from '@/store/Auth/authSlice';

/**
 * AuthInitializer component that initializes Firebase auth state listener
 * This component should be mounted at the root level of the app
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log('Initializing Firebase auth state listener...');
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitializer;
