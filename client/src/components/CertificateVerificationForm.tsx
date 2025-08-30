'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import Card from '@/components/ui/Card';
import { FiCheckCircle, FiXCircle, FiLoader, FiSearch } from 'react-icons/fi';

interface CertificateFormData {
  certificateNumber: string;
}

interface Certificate {
  certificateNumber: string;
  studentName: string;
  program: string;
  graduationYear: number;
  status: string;
  issuedDate: string;
  studentImageUrl?: string;
}

interface VerificationResult {
  success: boolean;
  certificate?: Certificate;
  error?: string;
}

const CertificateVerificationForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CertificateFormData>();

  const onSubmit = async (data: CertificateFormData) => {
    setIsLoading(true);
    setVerificationResult(null);

    try {
      const response = await fetch('/api/verify-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateNumber: data.certificateNumber.trim()
        }),
      });

      const result = await response.json();
      setVerificationResult(result);

    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        error: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setVerificationResult(null);
  };

  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="md:max-w-2xl sm:w-full px-2 sm:px-2 md:px-8 lg:px-0 max-w-7xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#000054] text-white rounded-full mb-4">
            <FiSearch size={24} />
          </div>
          <h2 className="text-2xl font-bold text-[#000054] mb-2">
            Certificate Verification
          </h2>
          <p className="text-gray-600">
            Enter your certificate number to verify its authenticity and view details.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label="Certificate Number"
            id="certificateNumber"
            placeholder="Enter your certificate number (e.g., TTECH-2025-001)"
            error={errors.certificateNumber?.message}
            {...register('certificateNumber', {
              required: 'Certificate number is required',
              minLength: {
                value: 3,
                message: 'Certificate number must be at least 3 characters'
              },
              pattern: {
                value: /^[A-Za-z0-9\-_]+$/,
                message: 'Certificate number can only contain letters, numbers, hyphens, and underscores'
              }
            })}
          />

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              variant="primary"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin mr-2" size={16} />
                  Verifying...
                </>
              ) : (
                <>
                  <FiSearch className="mr-2" size={16} />
                  Verify Certificate
                </>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={handleReset}
              variant="outline"
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>
        </form>

        {/* Verification Results */}
        {verificationResult && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            {verificationResult.success && verificationResult.certificate ? (
              // Success - Certificate Found
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FiCheckCircle className="text-green-600 mr-3" size={24} />
                  <h3 className="text-lg font-semibold text-green-800">
                     Certificate Verified
                  </h3>
                </div>
                
                <div className="space-y-6">
                  {/* Student Image */}
                  {verificationResult.certificate.studentImageUrl && (
                    <div className="flex justify-center">
                      <div className="text-center">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student Photo
                        </label>
                        <img
                          src={verificationResult.certificate.studentImageUrl}
                          alt={`${verificationResult.certificate.studentName} photo`}
                          className="w-32 h-32 object-cover rounded-lg border-2 border-green-200 shadow-md mx-auto"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Certificate Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student Name
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {verificationResult.certificate.studentName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate Number
                      </label>
                      <p className="text-gray-900 font-mono">
                        {verificationResult.certificate.certificateNumber}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Program
                      </label>
                      <p className="text-gray-900">
                        {verificationResult.certificate.program}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Graduation Year
                      </label>
                      <p className="text-gray-900">
                        {verificationResult.certificate.graduationYear}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        verificationResult.certificate.status === 'valid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {verificationResult.certificate.status.charAt(0).toUpperCase() + 
                         verificationResult.certificate.status.slice(1)}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issued Date
                      </label>
                      <p className="text-gray-900">
                        {formatDate(verificationResult.certificate.issuedDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Error - Certificate Not Found
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FiXCircle className="text-red-600 mr-3" size={24} />
                  <h3 className="text-lg font-semibold text-red-800">
                    ❌ Certificate Not Found
                  </h3>
                </div>
                
                <p className="text-red-700 mb-4">
                  {verificationResult.error || 'Certificate number not found. Please check and try again.'}
                </p>
                
                <div className="bg-red-100 border border-red-300 rounded-md p-4">
                  <h4 className="font-medium text-red-800 mb-2">What to do next:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Double-check the certificate number for typos</li>
                    <li>• Ensure you're using the complete certificate number</li>
                    <li>• Contact T-Tech Initiative support if you believe this is an error</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CertificateVerificationForm;