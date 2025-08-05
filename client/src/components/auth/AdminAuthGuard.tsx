'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { selectAuthState, initializeAuth } from '@/store/Auth/authSlice';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * AdminAuthGuard component that protects admin routes
 * Redirects to login if not authenticated or not an admin
 */
export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, isAuthenticated, loading } = useAppSelector(selectAuthState);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    // Initialize auth if not already done
    if (!isAuthenticated && !loading && !user) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isAuthenticated, loading, user]);

  useEffect(() => {
    // Only redirect after auth has been initialized and we're sure the user is not authenticated
    if (!loading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Check if user has admin role
    if (!loading && isAuthenticated && user && user.role !== 'admin') {
      router.push('/dashboard'); // Redirect to general dashboard or unauthorized page
      return;
    }
  }, [loading, isAuthenticated, user, router]);

  // Show loading spinner while auth is being initialized
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Redirecting to login...
        </Typography>
      </Box>
    );
  }

  // Show loading if user doesn't have admin role (will redirect)
  if (user.role !== 'admin') {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Checking permissions...
        </Typography>
      </Box>
    );
  }

  // User is authenticated and has admin role, render children
  return <>{children}</>;
}
