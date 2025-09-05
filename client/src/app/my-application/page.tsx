'use client';
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../services/firebase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  FirebaseAdmissionApplication,
  getApplicationByEmail,
  getAdmissionApplication
} from '../../services/firebaseAdmissionService';
import FormInput from '../../components/ui/FormInput';

const MyApplicationPage: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);
  const [application, setApplication] = useState<FirebaseAdmissionApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [admissionId, setAdmissionId] = useState('');
  const [searchMethod, setSearchMethod] = useState<'email' | 'id'>('id');
  const [email, setEmail] = useState('');

  // Remove automatic fetching on login - let users choose their search method

  const fetchApplicationByEmail = async () => {
    if (!email.trim()) {
      setFetchError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setFetchError('');
      const app = await getApplicationByEmail(email.trim());
      setApplication(app);
      if (!app) {
        setFetchError('No application found with this email address');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      setFetchError('Failed to fetch application. Please check your email and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplicationById = async () => {
    if (!admissionId.trim()) {
      setFetchError('Please enter a valid Admission ID');
      return;
    }

    try {
      setIsLoading(true);
      setFetchError('');
      const app = await getAdmissionApplication(admissionId.trim());
      setApplication(app);
      if (!app) {
        setFetchError('No application found with this Admission ID');
      }
    } catch (error) {
      console.error('Error fetching application by ID:', error);
      setFetchError('Failed to fetch application. Please check your Admission ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000054] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your application...</p>
          </Card>
        </div>
      </div>
    );
  }

  // Remove authentication error block - no longer needed

  // Remove login requirement - allow all users to check status

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#000054] mb-2">My Application Status</h1>
          <p className="text-gray-600">View the status and details of your admission application</p>
        </div>

        {/* Search Method Selection */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#000054] mb-4">How would you like to check your application?</h2>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchMethod"
                  value="email"
                  checked={searchMethod === 'email'}
                  onChange={(e) => setSearchMethod(e.target.value as 'email' | 'id')}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Using my logged-in email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchMethod"
                  value="id"
                  checked={searchMethod === 'id'}
                  onChange={(e) => setSearchMethod(e.target.value as 'email' | 'id')}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Using my Admission ID</span>
              </label>
            </div>

            {searchMethod === 'id' && (
              <div className="space-y-4">
                <FormInput
                  label="Admission ID"
                  id="admissionId"
                  name="admissionId"
                  type="text"
                  placeholder="Enter your Admission ID (e.g., ADM-2024-001)"
                  value={admissionId}
                  onChange={(e) => setAdmissionId(e.target.value)}
                  required
                />
                <Button 
                  onClick={fetchApplicationById}
                  disabled={isLoading || !admissionId.trim()}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? 'Searching...' : 'Check Application Status'}
                </Button>
              </div>
            )}

            {searchMethod === 'email' && (
              <div className="space-y-4">
                <FormInput
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter the email used for your application"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button 
                  onClick={fetchApplicationByEmail}
                  disabled={isLoading || !email.trim()}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? 'Searching...' : 'Check Application Status'}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {fetchError && (
          <Card className="p-4 bg-red-50 border-red-200 mb-6">
            <p className="text-red-600">{fetchError}</p>
            <Button 
              onClick={searchMethod === 'email' ? fetchApplicationByEmail : fetchApplicationById} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Try Again
            </Button>
          </Card>
        )}

        {!application && !isLoading ? (
          <Card className="p-6 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">No Application Found</h2>
            <p className="text-gray-600 mb-6">
              {searchMethod === 'email' 
                ? 'We couldn\'t find an admission application with the provided email address. Please check your email and try again.'
                : 'Please enter your Admission ID above to check your application status, or try using your email method.'
              }
            </p>
            <Button as="link" href="/admission">
              Submit New Application
            </Button>
          </Card>
        ) : application ? (
          <div className="space-y-6">
            {/* Application Status Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#000054]">Application Overview</h2>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadgeColor(application.status)}`}>
                  {application.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Applicant Photo */}
                {application.applicationImageUrl && (
                  <div className="flex flex-col items-center">
                    <h3 className="font-medium text-gray-700 mb-2">Applicant Photo</h3>
                    <img 
                      src={application.applicationImageUrl} 
                      alt={`${application.firstName} ${application.lastName}`}
                      className="w-24 h-24 object-cover rounded-full border-2 border-gray-200 shadow-sm"
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Applicant Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {application.firstName} {application.lastName}</p>
                    <p><span className="font-medium">Email:</span> {application.email}</p>
                    <p><span className="font-medium">Application ID:</span> {application.applicantId}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Program Details</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Desired Program:</span> {application.desiredProgram}</p>
                    <p><span className="font-medium">Education Level:</span> {application.highestEducation}</p>
                    <p><span className="font-medium">Computer Access:</span> {application.personalComputer ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Application Timeline</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Submitted:</span> {formatDate(application.createdAt)}</p>
                    <p><span className="font-medium">Last Updated:</span> {formatDate(application.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Status Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-[#000054] mb-4">Application Status Details</h2>
              
              <div className="space-y-4">
                {application.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="font-medium text-yellow-800">Application Pending Review</h3>
                    </div>
                    <p className="text-yellow-700 mt-2">
                      Your application has been successfully submitted and is waiting to be reviewed by our admissions team. 
                      We will update your status as soon as we begin the review process.
                    </p>
                  </div>
                )}

                {application.status === 'under_review' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="font-medium text-blue-800">Application Under Review</h3>
                    </div>
                    <p className="text-blue-700 mt-2">
                      Great news! Our admissions team is currently reviewing your application. 
                      This process typically takes 5-7 business days. We'll notify you once a decision has been made.
                    </p>
                  </div>
                )}

                {application.status === 'accepted' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="font-medium text-green-800">Congratulations! Application Accepted</h3>
                    </div>
                    <p className="text-green-700 mt-2">
                      We're excited to inform you that your application has been accepted! 
                      Please check your email for next steps and enrollment information.
                    </p>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="font-medium text-red-800">Application Not Accepted</h3>
                    </div>
                    <p className="text-red-700 mt-2">
                      Unfortunately, we are unable to accept your application at this time. 
                      Please see the admin response below for more details and consider reapplying in the future.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Admin Response */}
            {application.adminResponse && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-[#000054] mb-4">Message from Admissions Team</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{application.adminResponse}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">From:</span> {application.adminResponseBy}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {formatDate(application.adminResponseAt)}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-[#000054] mb-4">Need Help?</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about your application or need assistance, please don't hesitate to contact us.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button as="link" href="/contact" variant="outline">
                  Contact Support
                </Button>
                <Button 
                  onClick={searchMethod === 'email' ? fetchApplicationByEmail : fetchApplicationById} 
                  variant="outline"
                >
                  Refresh Status
                </Button>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MyApplicationPage;
