'use client';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormInput from '@/components/ui/FormInput';
import {
  addCertificate,
  getAllCertificates,
  updateCertificateStatus,
  updateCertificate,
  deleteCertificate,
  FirebaseCertificate,
  CertificateFormData
} from '@/services/firebaseCertificateService';
import { FiEye, FiEdit2, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface FormErrors {
  fullName?: string;
  certificateNumber?: string;
  program?: string;
  yearOfCompletion?: string;
  studentImage?: string;
  general?: string;
}

const Certificate = () => {
  // Form state
  const [formData, setFormData] = useState<CertificateFormData>({
    fullName: '',
    certificateNumber: '',
    program: '',
    yearOfCompletion: new Date().getFullYear(),
    status: 'Valid',
    studentImage: undefined
  });

  // UI state
  const [certificates, setCertificates] = useState<FirebaseCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Edit/View/Delete state
  const [editingCertificate, setEditingCertificate] = useState<FirebaseCertificate | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<FirebaseCertificate | null>(null);
  const [deletingCertificate, setDeletingCertificate] = useState<FirebaseCertificate | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load certificates on component mount
  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoadingList(true);
      const data = await getAllCertificates();
      setCertificates(data);
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoadingList(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Certificate Number validation
    if (!formData.certificateNumber.trim()) {
      newErrors.certificateNumber = 'Certificate number is required';
    } else if (formData.certificateNumber.length < 3) {
      newErrors.certificateNumber = 'Certificate number must be at least 3 characters';
    }

    // Program validation
    if (!formData.program.trim()) {
      newErrors.program = 'Program/Department is required';
    }

    // Year validation
    const currentYear = new Date().getFullYear();
    if (formData.yearOfCompletion < 1900 || formData.yearOfCompletion > currentYear + 10) {
      newErrors.yearOfCompletion = `Year must be between 1900 and ${currentYear + 10}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearOfCompletion' ? parseInt(value) || new Date().getFullYear() : value
    }));

    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          studentImage: 'Please select a valid image file'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          studentImage: 'Image size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        studentImage: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear image error
      setErrors(prev => ({
        ...prev,
        studentImage: undefined
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      certificateNumber: '',
      program: '',
      yearOfCompletion: new Date().getFullYear(),
      status: 'Valid',
      studentImage: undefined
    });
    setImagePreview('');
    setIsEditMode(false);
    setEditingCertificate(null);
    setErrors({});
    
    // Reset file input
    const fileInput = document.getElementById('studentImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleEdit = (certificate: FirebaseCertificate) => {
    setFormData({
      fullName: certificate.fullName || '',
      certificateNumber: certificate.certificateNumber || '',
      program: certificate.program || '',
      yearOfCompletion: certificate.yearOfCompletion || new Date().getFullYear(),
      status: certificate.status || 'Valid',
      studentImage: undefined
    });
    setImagePreview(certificate.studentImageUrl || '');
    setEditingCertificate(certificate);
    setIsEditMode(true);
    setErrors({});
    
    // Clear file input when editing
    const fileInput = document.getElementById('studentImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleView = (certificate: FirebaseCertificate) => {
    setViewingCertificate(certificate);
  };

  const handleDelete = (certificate: FirebaseCertificate) => {
    setDeletingCertificate(certificate);
  };

  const confirmDelete = async () => {
    if (!deletingCertificate) return;
    
    try {
      setLoading(true);
      await deleteCertificate(deletingCertificate.certificateNumber);
      toast.success('Certificate deleted successfully!');
      await loadCertificates();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete certificate');
    } finally {
      setLoading(false);
      setDeletingCertificate(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isEditMode && editingCertificate) {
        await updateCertificate(editingCertificate.certificateNumber, formData);
        toast.success('Certificate updated successfully!');
      } else {
        await addCertificate(formData);
        toast.success('Certificate added successfully!');
      }
      
      // Reset form
      resetForm();
      
      // Reload certificates list
      await loadCertificates();
      
    } catch (error: any) {
      console.error('Error saving certificate:', error);
      if (error.message === 'Certificate number already exists') {
        setErrors({ certificateNumber: 'Certificate number already exists' });
        toast.error('Certificate number already exists');
      } else {
        toast.error(error.message || 'Failed to save certificate');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (certificateNumber: string, newStatus: 'Valid' | 'Invalid') => {
    try {
      await updateCertificateStatus(certificateNumber, newStatus);
      
      // Update local state
      setCertificates(prev => 
        prev.map(cert => 
          cert.certificateNumber === certificateNumber 
            ? { ...cert, status: newStatus }
            : cert
        )
      );
    } catch (error) {
      console.error('Error updating certificate status:', error);
      toast.error('Failed to update certificate status');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      // Handle Firestore Timestamp objects
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString();
      }
      // Handle regular Date objects or timestamp numbers
      if (timestamp.seconds) {
        // Firestore timestamp with seconds property
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      // Handle other formats
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-0 md:px-4 py-4 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#000054] mb-2">
          Certificate Management
        </h1>
        <p className="text-gray-600">
          Add and manage student certificates
        </p>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Edit Certificate Form */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#000054]">
              {isEditMode ? 'Edit Certificate' : 'Add New Certificate'}
            </h2>
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
              >
                Cancel Edit
              </Button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Full Name"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter student's full name"
              required
              error={errors.fullName}
            />

            <FormInput
              label="Certificate Number"
              id="certificateNumber"
              name="certificateNumber"
              value={formData.certificateNumber}
              onChange={handleInputChange}
              placeholder="Enter unique certificate number"
              required
              error={errors.certificateNumber}
            />

            <FormInput
              label="Program / Department"
              id="program"
              name="program"
              value={formData.program}
              onChange={handleInputChange}
              placeholder="Enter program or department"
              required
              error={errors.program}
            />

            <FormInput
              label="Year of Completion"
              id="yearOfCompletion"
              name="yearOfCompletion"
              type="number"
              value={formData.yearOfCompletion?.toString() || new Date().getFullYear().toString()}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear() + 10}
              required
              error={errors.yearOfCompletion}
            />

            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-[#000054] mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000054] transition-colors duration-200"
                required
              >
                <option value="Valid">Valid</option>
                <option value="Invalid">Invalid</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="studentImage" className="block text-sm font-medium text-[#000054] mb-1">
                Student Image (Optional)
              </label>
              <input
                type="file"
                id="studentImage"
                name="studentImage"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000054] transition-colors duration-200"
              />
              {errors.studentImage && (
                <p className="mt-1 text-sm text-red-600">{errors.studentImage}</p>
              )}
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-md border border-gray-300"
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              className="mt-6"
            >
              {loading 
                ? (isEditMode ? 'Updating Certificate...' : 'Adding Certificate...') 
                : (isEditMode ? 'Update Certificate' : 'Add Certificate')
              }
            </Button>
          </form>
        </Card>

        {/* Certificates List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[#000054] mb-4">
            Existing Certificates ({certificates.length})
          </h2>
          
          {loadingList ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000054]"></div>
              <span className="ml-2 text-gray-600">Loading certificates...</span>
            </div>
          ) : certificates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No certificates found. Add your first certificate using the form.
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {certificates.map((certificate) => (
                <div
                  key={certificate.certificateNumber}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#E32845] transition-colors duration-200"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#000054]">
                          {certificate.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Certificate: {certificate.certificateNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          Program: {certificate.program}
                        </p>
                        <p className="text-sm text-gray-600">
                          Year: {certificate.yearOfCompletion}
                        </p>
                        <p className="text-sm text-gray-600">
                          Added: {formatDate(certificate.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-start gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            certificate.status === 'Valid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {certificate.status}
                        </span>
                        
                        {certificate.studentImageUrl && (
                          <img
                            src={certificate.studentImageUrl}
                            alt={`${certificate.fullName} photo`}
                            className="w-16 h-16 object-cover rounded-md border border-gray-300"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Action Icons */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                      {/* View Icon */}
                      <button
                        onClick={() => handleView(certificate)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                        title="View Certificate"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      
                      {/* Edit Icon */}
                      <button
                        onClick={() => handleEdit(certificate)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                        title="Edit Certificate"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      
                      {/* Toggle Status Icon */}
                      <button
                        onClick={() =>
                          handleStatusUpdate(
                            certificate.certificateNumber,
                            certificate.status === 'Valid' ? 'Invalid' : 'Valid'
                          )
                        }
                        className={`p-2 rounded-full transition-colors ${
                          certificate.status === 'Valid'
                            ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                            : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                        }`}
                        title={`Mark as ${certificate.status === 'Valid' ? 'Invalid' : 'Valid'}`}
                      >
                        {certificate.status === 'Valid' ? (
                          <FiXCircle className="w-5 h-5" />
                        ) : (
                          <FiCheckCircle className="w-5 h-5" />
                        )}
                      </button>
                      
                      {/* Delete Icon */}
                      <button
                        onClick={() => handleDelete(certificate)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Certificate"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* View Certificate Modal */}
      {viewingCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#000054]">
                  Certificate Details
                </h2>
                <button
                  onClick={() => setViewingCertificate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-900">{viewingCertificate.fullName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certificate Number
                    </label>
                    <p className="text-gray-900">{viewingCertificate.certificateNumber}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Program
                    </label>
                    <p className="text-gray-900">{viewingCertificate.program}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year of Completion
                    </label>
                    <p className="text-gray-900">{viewingCertificate.yearOfCompletion}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        viewingCertificate.status === 'Valid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {viewingCertificate.status}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created
                    </label>
                    <p className="text-gray-900">{formatDate(viewingCertificate.createdAt)}</p>
                  </div>
                </div>
                
                {viewingCertificate.studentImageUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Photo
                    </label>
                    <img
                      src={viewingCertificate.studentImageUrl}
                      alt={`${viewingCertificate.fullName} photo`}
                      className="w-32 h-32 object-cover rounded-md border border-gray-300"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setViewingCertificate(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#000054] mb-4">
                Confirm Delete
              </h2>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the certificate for{' '}
                <strong>{deletingCertificate.fullName}</strong>?
                <br />
                Certificate Number: <strong>{deletingCertificate.certificateNumber}</strong>
                <br /><br />
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingCertificate(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Certificate'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            style: {
              border: '1px solid #10B981',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              border: '1px solid #EF4444',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default Certificate;
