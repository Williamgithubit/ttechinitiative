'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import Card from '../ui/Card';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import Select from '../ui/Select';
import ConfirmationModal from '../ui/ConfirmationModal';
import { FirebaseAdmissionApplication } from '../../services/firebaseAdmissionService';
import {
  getAllAdmissionApplications,
  updateApplicationStatus,
  addAdminResponse,
  deleteAdmissionApplication,
  testFirebaseConnection
} from '../../services/firebaseAdmissionAdminService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AdmissionManagementProps {
  isAdmin?: boolean;
}

type Status = 'pending' | 'under_review' | 'accepted' | 'rejected';

const AdmissionManagement: React.FC<AdmissionManagementProps> = ({ isAdmin = false }) => {
  const [user] = useAuthState(auth);
  const [applications, setApplications] = useState<FirebaseAdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<FirebaseAdmissionApplication | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [error, setError] = useState('');
  const [showStatistics, setShowStatistics] = useState(true);
  const [deletingApplicationId, setDeletingApplicationId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<FirebaseAdmissionApplication | null>(null);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    }
  }, [isAdmin]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching applications from admin component...');
      
      // First test Firebase connection
      await testFirebaseConnection();
      
      const apps = await getAllAdmissionApplications();
      console.log('Successfully fetched applications:', apps);
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications in component:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch applications';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicantId: string, newStatus: Status) => {
    try {
      await updateApplicationStatus(applicantId, newStatus);
      setApplications(prev => 
        prev.map(app => 
          app.applicantId === applicantId 
            ? { ...app, status: newStatus }
            : app
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update application status');
    }
  };

  const handleSubmitResponse = async (applicantId: string) => {
    if (!adminResponse.trim() || !user?.email) return;

    try {
      setIsSubmittingResponse(true);
      await addAdminResponse(applicantId, adminResponse.trim(), user.email);
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.applicantId === applicantId 
            ? { 
                ...app, 
                adminResponse: adminResponse.trim(),
                adminResponseBy: user.email!
              }
            : app
        )
      );
      
      setAdminResponse('');
      setError('');
    } catch (error) {
      console.error('Error submitting response:', error);
      setError('Failed to submit response');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    try {
      setDeletingApplicationId(applicationToDelete.applicantId);
      await deleteAdmissionApplication(applicationToDelete.applicantId);
      
      // Remove from local state
      setApplications(prev => 
        prev.filter(app => app.applicantId !== applicationToDelete.applicantId)
      );
      
      // Close details if this application was selected
      if (selectedApplication?.applicantId === applicationToDelete.applicantId) {
        setSelectedApplication(null);
      }
      
      setDeleteModalOpen(false);
      setApplicationToDelete(null);
      setError('');
      
      // Show success toast
      toast.success('Application deleted successfully!', {
        duration: 4000,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      setError('Failed to delete application');
      
      // Show error toast
      toast.error('Failed to delete application. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setDeletingApplicationId(null);
    }
  };

  const openDeleteModal = (application: FirebaseAdmissionApplication) => {
    setApplicationToDelete(application);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setApplicationToDelete(null);
  };

  const exportToCSV = () => {
    if (applications.length === 0) {
      toast.error('No applications to export');
      return;
    }

    // Define CSV headers
    const headers = [
      'Applicant ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone Number',
      'Date of Birth',
      'Gender',
      'Nationality',
      'Desired Program',
      'Highest Education',
      'Last School Name',
      'Graduation Year',
      'Personal Computer',
      'Basic Computer Knowledge',
      'Personal Statement',
      'Community Impact',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Emergency Contact Relationship',
      'Status',
      'Date Submitted',
      'Admin Response',
      'Admin Response By',
      'Admin Response Date'
    ];

    // Convert applications to CSV rows
    const csvData = applications.map(app => [
      app.applicantId || '',
      app.firstName || '',
      app.lastName || '',
      app.email || '',
      app.phoneNumber || '',
      app.dateOfBirth || '',
      app.gender || '',
      app.nationality || '',
      app.desiredProgram || '',
      app.highestEducation || '',
      app.lastSchoolName || '',
      app.graduationYear || '',
      app.personalComputer ? 'Yes' : 'No',
      app.basicComputerKnowledge ? 'Yes' : 'No',
      app.personalStatement ? `"${app.personalStatement.replace(/"/g, '""')}"` : '',
      app.communityImpact ? `"${app.communityImpact.replace(/"/g, '""')}"` : '',
      app.emergencyContactName || '',
      app.emergencyContactPhone || '',
      app.emergencyContactRelationship || '',
      app.status || '',
      app.createdAt ? formatDate(app.createdAt) : '',
      app.adminResponse ? `"${app.adminResponse.replace(/"/g, '""')}"` : '',
      app.adminResponseBy || '',
      app.adminResponseAt ? formatDate(app.adminResponseAt) : ''
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admission_applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${applications.length} applications to CSV`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = applications.length;
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const programCounts = applications.reduce((acc, app) => {
      acc[app.desiredProgram] = (acc[app.desiredProgram] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const genderCounts = applications.reduce((acc, app) => {
      acc[app.gender] = (acc[app.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly applications (last 6 months)
    const getMonthKey = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const monthlyData = applications.reduce((acc, app) => {
      if (app.createdAt) {
        const date = app.createdAt.toDate ? app.createdAt.toDate() : new Date(app.createdAt.seconds * 1000);
        const monthYear = getMonthKey(date);
        acc[monthYear] = (acc[monthYear] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Generate last 6 months labels (oldest to newest)
    const last6Months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push(getMonthKey(d));
    }

    return {
      total,
      statusCounts,
      programCounts,
      genderCounts,
      monthlyData,
      last6Months,
      acceptanceRate: total > 0 ? ((statusCounts.accepted || 0) / total * 100).toFixed(1) : '0',
      pendingApplications: statusCounts.pending || 0,
      underReviewApplications: statusCounts.under_review || 0,
    };
  }, [applications]);

  // Chart configurations
  const statuses: Status[] = ['pending', 'under_review', 'accepted', 'rejected'];
  const statusChartData = {
    labels: statuses.map(status => 
      status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        label: 'Applications by Status',
        data: statuses.map(status => statistics.statusCounts[status] || 0),
        backgroundColor: [
          '#FCD34D', // Pending - Yellow
          '#60A5FA', // Under Review - Blue
          '#34D399', // Accepted - Green
          '#F87171', // Rejected - Red
        ],
        borderColor: [
          '#F59E0B',
          '#3B82F6',
          '#10B981',
          '#EF4444',
        ],
        borderWidth: 2,
      },
    ],
  };

  const programChartData = {
    labels: Object.keys(statistics.programCounts),
    datasets: [
      {
        label: 'Applications by Program',
        data: Object.values(statistics.programCounts),
        backgroundColor: '#000054',
        borderColor: '#E32845',
        borderWidth: 1,
      },
    ],
  };

  const monthlyChartData = {
    labels: statistics.last6Months,
    datasets: [
      {
        label: 'Monthly Applications',
        data: statistics.last6Months.map(month => statistics.monthlyData[month] || 0),
        borderColor: '#E32845',
        backgroundColor: 'rgba(227, 40, 69, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  if (!isAdmin) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000054] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading applications...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#000054]">Admission Applications</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowStatistics(!showStatistics)} 
            variant="outline"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {showStatistics ? 'Hide' : 'Show'} Statistics
          </Button>
          <Button 
            onClick={exportToCSV} 
            variant="outline"
            disabled={applications.length === 0}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </Button>
          <Button onClick={fetchApplications} variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {showStatistics && applications.length > 0 && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-[#000054] mb-2">{statistics.total}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{statistics.pendingApplications}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{statistics.underReviewApplications}</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{statistics.acceptanceRate}%</div>
              <div className="text-sm text-gray-600">Acceptance Rate</div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#000054] mb-4">Application Status Distribution</h3>
              <div className="h-64">
                <Pie data={statusChartData} options={pieOptions} />
              </div>
            </Card>

            {/* Program Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#000054] mb-4">Applications by Program</h3>
              <div className="h-64">
                <Bar data={programChartData} options={chartOptions} />
              </div>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#000054] mb-4">Application Trends (Last 6 Months)</h3>
            <div className="h-64">
              <Line data={monthlyChartData} options={chartOptions} />
            </div>
          </Card>

          {/* Gender Distribution */}
          {Object.keys(statistics.genderCounts).length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#000054] mb-4">Gender Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statistics.genderCounts).map(([gender, count]) => (
                  <div key={gender} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#000054]">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{gender}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {applications.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-600">No applications found.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <React.Fragment key={application.applicantId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {application.firstName} {application.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {application.applicantId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.desiredProgram}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(application.status)}`}>
                          {application.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedApplication(
                              selectedApplication?.applicantId === application.applicantId ? null : application
                            )}
                            className="flex items-center border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:outline-none focus:ring-0"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {selectedApplication?.applicantId === application.applicantId ? 'Hide' : 'View'}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteModal(application)}
                            className="flex items-center border-gray-300 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 focus:outline-none focus:ring-0"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                    
                    {selectedApplication?.applicantId === application.applicantId && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-6">
                            {/* Application Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-semibold text-[#000054] mb-2">Personal Information</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">DOB:</span> {application.dateOfBirth}</p>
                                  <p><span className="font-medium">Gender:</span> {application.gender}</p>
                                  <p><span className="font-medium">Nationality:</span> {application.nationality}</p>
                                  <p><span className="font-medium">ID Type:</span> {application.identificationType || 'Not provided'}</p>
                                  <p><span className="font-medium">ID Number:</span> {application.identificationNumber || 'Not provided'}</p>
                                  <p><span className="font-medium">Phone:</span> {application.phoneNumber}</p>
                                  <p><span className="font-medium">Computer Access:</span> {application.personalComputer ? 'Yes' : 'No'}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-[#000054] mb-2">Education</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">Level:</span> {application.highestEducation}</p>
                                  <p><span className="font-medium">School:</span> {application.lastSchoolName}</p>
                                  <p><span className="font-medium">Graduation:</span> {application.graduationYear}</p>
                                  <p><span className="font-medium">Computer Knowledge:</span> {application.basicComputerKnowledge ? 'Yes' : 'No'}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-[#000054] mb-2">Emergency Contact</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">Name:</span> {application.emergencyContactName}</p>
                                  <p><span className="font-medium">Phone:</span> {application.emergencyContactPhone}</p>
                                  <p><span className="font-medium">Relationship:</span> {application.emergencyContactRelationship}</p>
                                </div>
                              </div>
                            </div>

                            {/* Personal Statement */}
                            <div>
                              <h4 className="font-semibold text-[#000054] mb-2">Personal Statement</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                                {application.personalStatement}
                              </p>
                            </div>

                            {/* Community Impact */}
                            <div>
                              <h4 className="font-semibold text-[#000054] mb-2">Community Impact</h4>
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                                {application.communityImpact}
                              </p>
                            </div>

                            {/* Files */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {application.applicationImageUrl && (
                                <div>
                                  <h4 className="font-semibold text-[#000054] mb-2">Application Image</h4>
                                  <img 
                                    src={application.applicationImageUrl} 
                                    alt="Application" 
                                    className="max-w-full h-32 object-cover rounded border"
                                  />
                                </div>
                              )}
                              
                              {application.communityRecommendationUrl && (
                                <div>
                                  <h4 className="font-semibold text-[#000054] mb-2">Community Recommendation</h4>
                                  <a 
                                    href={application.communityRecommendationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download File
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Admin Actions */}
                            <div className="border-t pt-4 space-y-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                  <Select
                                    label="Update Status"
                                    id={`status-${application.applicantId}`}
                                    name="status"
                                    options={statusOptions}
                                    value={application.status}
                                    onChange={(e) => handleStatusChange(application.applicantId, e.target.value as Status)}
                                  />
                                </div>
                              </div>

                              {/* Existing Admin Response */}
                              {application.adminResponse && (
                                <div>
                                  <h4 className="font-semibold text-[#000054] mb-2">Previous Admin Response</h4>
                                  <div className="bg-blue-50 p-3 rounded border">
                                    <p className="text-sm text-gray-700 mb-2">{application.adminResponse}</p>
                                    <p className="text-xs text-gray-500">
                                      By: {application.adminResponseBy} | {formatDate(application.adminResponseAt)}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Add New Response */}
                              <div>
                                <TextArea
                                  label="Admin Response"
                                  id={`response-${application.applicantId}`}
                                  name="adminResponse"
                                  placeholder="Write your response to the applicant..."
                                  rows={4}
                                  value={adminResponse}
                                  onChange={(e) => setAdminResponse(e.target.value)}
                                />
                                <div className="mt-2">
                                  <Button
                                    onClick={() => handleSubmitResponse(application.applicantId)}
                                    disabled={!adminResponse.trim() || isSubmittingResponse}
                                    variant="secondary"
                                    size="sm"
                                  >
                                    {isSubmittingResponse ? 'Submitting...' : 'Submit Response'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteApplication}
        title="Delete Application"
        message={
          applicationToDelete && applicationToDelete.firstName && applicationToDelete.lastName
            ? `Are you sure you want to delete the application for ${applicationToDelete.firstName} ${applicationToDelete.lastName}? This action cannot be undone and will permanently remove all associated data including uploaded files.`
            : 'Are you sure you want to delete this application?'
        }
        confirmText="Delete Application"
        cancelText="Cancel"
        isLoading={deletingApplicationId === applicationToDelete?.applicantId}
        type="danger"
      />
    </div>
  );
};

export default AdmissionManagement;