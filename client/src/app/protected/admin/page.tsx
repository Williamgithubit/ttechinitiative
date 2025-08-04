'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Additional protection in case middleware fails
    if (session?.user?.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [session, router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#000054] mb-6">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700">Welcome, {session?.user?.name}!</p>
        <p className="text-gray-600 mt-2">You have administrator privileges.</p>
      </div>
    </div>
  );
}
