'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

// Extend the session type to include the role property
type CustomSession = Session & {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
};

export default function Unauthorized() {
  const router = useRouter();
  const { data: session } = useSession() as { data: CustomSession | null };

  useEffect(() => {
    // If not logged in, redirect to login
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page with your current role.
          </p>
          <button
            onClick={() => {
              // Redirect to the appropriate dashboard based on role
              const userRole = session?.user?.role;
              if (userRole && typeof userRole === 'string') {
                router.push(`/${userRole}`);
              } else {
                router.push('/');
              }
            }}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#000054] hover:bg-[#0000aa] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#000054]"
          >
            Go to {session?.user?.role ? `${session.user.role} dashboard` : 'Home'}
          </button>
        </div>
      </div>
    </div>
  );
}
