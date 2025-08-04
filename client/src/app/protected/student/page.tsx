'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StudentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role !== 'student') {
      router.push('/unauthorized');
    }
  }, [session, router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#000054] mb-6">Student Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700">Welcome back, {session?.user?.name}!</p>
        <p className="text-gray-600 mt-2">Check your courses, assignments, and grades here.</p>
      </div>
    </div>
  );
}
