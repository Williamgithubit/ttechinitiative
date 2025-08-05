'use client';

import dynamic from 'next/dynamic';
import AdminAuthGuard from '@/components/auth/AdminAuthGuard';

// Dynamically import the AdminDashboard component with SSR disabled
const AdminDashboard = dynamic(
  () => import('./AdminDashboard'),
  { ssr: false }
);

// This is a client component that will render the AdminDashboard
export default function AdminPage() {
  return (
    <AdminAuthGuard>
      <AdminDashboard />
    </AdminAuthGuard>
  );
}
