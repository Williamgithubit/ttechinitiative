import AdminProtectedRoute from '../../../../components/auth/AdminProtectedRoute';
import AdmissionManagement from '../../../../components/admin/AdmissionManagement';

export default function AdminAdmissionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminProtectedRoute>
          <AdmissionManagement isAdmin={true} />
        </AdminProtectedRoute>
      </div>
    </div>
  );
}
