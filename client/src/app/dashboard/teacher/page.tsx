'use client';

import TeacherAuthGuard from '@/components/auth/TeacherAuthGuard';
import TeacherDashboard from './TeacherDashboard';

export default function TeacherPage() {
  return (
    <TeacherAuthGuard>
      <TeacherDashboard />
    </TeacherAuthGuard>
  );
}
