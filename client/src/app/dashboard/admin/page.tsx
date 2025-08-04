'use client';

import dynamic from 'next/dynamic';

// Dynamically import the AdminDashboard component with SSR disabled
const AdminDashboard = dynamic(
  () => import('./AdminDashboard'),
  { ssr: false }
);

// This is a client component that will render the AdminDashboard
export default function AdminPage() {
  return <AdminDashboard />;
}
