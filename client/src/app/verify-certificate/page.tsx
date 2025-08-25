import React from 'react';
import { Metadata } from 'next';
import CertificateVerificationForm from '@/components/CertificateVerificationForm';

export const metadata: Metadata = {
  title: 'Certificate Verification | T-Tech Initiative',
  description: 'Verify the authenticity of T-Tech Initiative certificates by entering the certificate number.',
  keywords: ['certificate verification', 'T-Tech Initiative', 'digital certificates', 'authentication'],
};

export default function VerifyCertificatePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#000054] mb-4">
            Certificate Verification
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Verify the authenticity of T-Tech Initiative certificates. 
            Enter your certificate number below to view official certification details.
          </p>
        </div>

        {/* Verification Form */}
        <CertificateVerificationForm />

        {/* Additional Information */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-[#000054] mb-6">
              About Certificate Verification
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What is Certificate Verification?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our certificate verification system allows employers, institutions, and individuals 
                  to confirm the authenticity of T-Tech Initiative certificates. Each certificate 
                  contains a unique number that can be verified through this secure system.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  How to Find Your Certificate Number
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Look for the certificate number on your physical or digital certificate</li>
                  <li>• It typically starts with "TTECH" followed by the year and sequence number</li>
                  <li>• Example format: TTECH-2024-001</li>
                  <li>• Contact us if you cannot locate your certificate number</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Certificate Status Types
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-gray-600"><strong>Valid:</strong> Certificate is authentic and active</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-gray-600"><strong>Revoked:</strong> Certificate has been revoked</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="text-gray-600"><strong>Expired:</strong> Certificate has expired</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Need Help?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  If you're having trouble verifying your certificate or have questions 
                  about the verification process, please contact our support team. 
                  We're here to help ensure your achievements are properly recognized.
                </p>
                <div className="mt-3">
                  <a 
                    href="/contact" 
                    className="text-[#E32845] hover:text-[#c41e38] font-medium transition-colors"
                  >
                    Contact Support →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
