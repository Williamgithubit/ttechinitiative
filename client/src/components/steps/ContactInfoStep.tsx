'use client';
import React from 'react';
import FormInput from '../ui/FormInput';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';
import FileUpload from '../ui/FileUpload';
import { AdmissionFormData } from '../../services/firebaseAdmissionService';

interface FormErrors {
  [key: string]: string;
}

interface ContactInfoStepProps {
  formData: AdmissionFormData;
  errors: FormErrors;
  onInputChange: (field: keyof AdmissionFormData, value: any) => void;
}

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({ 
  formData, 
  errors, 
  onInputChange 
}) => {
  const relationshipOptions = [
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'friend', label: 'Friend' },
    { value: 'relative', label: 'Relative' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#000054] mb-6">Contact Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Email"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          required
          error={errors.email}
        />
        
        <FormInput
          label="Phone Number"
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => onInputChange('phoneNumber', e.target.value)}
          required
          error={errors.phoneNumber}
        />
      </div>

      <TextArea
        label="Address"
        id="address"
        name="address"
        placeholder="Your full address..."
        rows={3}
        value={formData.address}
        onChange={(e) => onInputChange('address', e.target.value)}
        required
        error={errors.address}
      />

      <div className="mt-6">
        <h3 className="text-lg font-medium text-[#000054] mb-4">Emergency Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Emergency Contact Name"
            id="emergencyContactName"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={(e) => onInputChange('emergencyContactName', e.target.value)}
            required
            error={errors.emergencyContactName}
          />
          
          <FormInput
            label="Emergency Contact Phone"
            id="emergencyContactPhone"
            name="emergencyContactPhone"
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={(e) => onInputChange('emergencyContactPhone', e.target.value)}
            required
            error={errors.emergencyContactPhone}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextArea
            label="Emergency Contact Address"
            id="emergencyContactAddress"
            name="emergencyContactAddress"
            placeholder="Emergency contact's address..."
            rows={3}
            value={formData.emergencyContactAddress}
            onChange={(e) => onInputChange('emergencyContactAddress', e.target.value)}
            required
            error={errors.emergencyContactAddress}
          />
          
          <Select
            label="Relationship Type"
            id="emergencyContactRelationship"
            name="emergencyContactRelationship"
            options={relationshipOptions}
            value={formData.emergencyContactRelationship}
            onChange={(e) => onInputChange('emergencyContactRelationship', e.target.value)}
            required
            error={errors.emergencyContactRelationship}
          />
        </div>
      </div>

      <FileUpload
        label="Community Recommendation (Optional)"
        id="communityRecommendation"
        name="communityRecommendation"
        accept=".pdf,.doc,.docx"
        onChange={(file) => onInputChange('communityRecommendation', file)}
        value={formData.communityRecommendation}
      />

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="declarationAccepted"
            name="declarationAccepted"
            checked={formData.declarationAccepted}
            onChange={(e) => onInputChange('declarationAccepted', e.target.checked)}
            className="h-4 w-4 text-[#000054] focus:ring-[#000054] border-gray-300 rounded mt-1"
          />
          <label htmlFor="declarationAccepted" className="ml-2 text-sm text-gray-700">
            I hereby declare that the information provided in this application is accurate and complete to the best of my knowledge. 
            I understand that any false information may result in the rejection of my application or dismissal from the program.
          </label>
        </div>
        {errors.declarationAccepted && (
          <p className="mt-1 text-sm text-red-600">{errors.declarationAccepted}</p>
        )}
      </div>
    </div>
  );
};

export default ContactInfoStep;
