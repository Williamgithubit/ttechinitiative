'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role !== 'teacher') {
      router.push('/unauthorized');
    }
  }, [session, router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#000054] mb-6">Teacher Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700">Welcome, Teacher {session?.user?.name}!</p>
        <p className="text-gray-600 mt-2">Access your teaching materials and student information here.</p>
      </div>
    </div>
  );
}
