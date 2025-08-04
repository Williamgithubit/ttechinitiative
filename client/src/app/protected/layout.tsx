'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppSelector } from '@/store/store';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, user, role } = useAppSelector((state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading,
    user: state.auth.user,
    role: state.auth.role
  }));
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedLayout - Auth state:', { isAuthenticated, loading, user: user ? 'User exists' : 'No user', role });
    
    if (loading) {
      console.log('ProtectedLayout - Auth loading...');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('ProtectedLayout - Not authenticated, redirecting to login');
      router.push('/login');
    } else {
      console.log('ProtectedLayout - User is authenticated, allowing access');
    }
  }, [isAuthenticated, loading, router, user, role]);

  if (loading) {
    console.log('ProtectedLayout - Rendering loading state');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedLayout - Not authenticated, rendering nothing');
    return null;
  }

  return <>{children}</>;
}
