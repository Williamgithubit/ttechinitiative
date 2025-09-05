'use client';
import React from 'react';
import FormInput from '../ui/FormInput';
import Select from '../ui/Select';
import FileUpload from '../ui/FileUpload';
import RadioGroup from '../ui/RadioGroup';
import { AdmissionFormData } from '../../services/firebaseAdmissionService';

interface FormErrors {
  [key: string]: string;
}

interface PersonalInfoStepProps {
  formData: AdmissionFormData;
  errors: FormErrors;
  onInputChange: (field: keyof AdmissionFormData, value: any) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ 
  formData, 
  errors, 
  onInputChange 
}) => {
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const identificationOptions = [
    { value: 'national-id', label: 'National ID' },
    { value: 'passport', label: 'Passport' },
    { value: 'drivers-license', label: 'Driver\'s License' },
    { value: 'other', label: 'Other' }
  ];

  const programOptions = [
    { value: 'computer-literacy', label: 'Computer Literacy Program' },
    { value: 'digital-skills', label: 'Digital Skills Training' },
    { value: 'coding-bootcamp', label: 'Coding Bootcamp' },
    { value: 'entrepreneurship', label: 'Entrepreneurship Program' },
    { value: 'other', label: 'Other' }
  ];

  const yesNoOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#000054] mb-6">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={(e) => onInputChange('firstName', e.target.value)}
          required
          error={errors.firstName}
        />
        
        <FormInput
          label="Last Name"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={(e) => onInputChange('lastName', e.target.value)}
          required
          error={errors.lastName}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Date of Birth"
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
          required
          error={errors.dateOfBirth}
        />
        
        <Select
          label="Gender"
          id="gender"
          name="gender"
          options={genderOptions}
          value={formData.gender}
          onChange={(e) => onInputChange('gender', e.target.value)}
          required
          error={errors.gender}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Identification Type"
          id="identificationType"
          name="identificationType"
          options={identificationOptions}
          value={formData.identificationType}
          onChange={(e) => onInputChange('identificationType', e.target.value)}
          required
          error={errors.identificationType}
        />
        
        <FormInput
          label="Identification Number"
          id="identificationNumber"
          name="identificationNumber"
          value={formData.identificationNumber}
          onChange={(e) => onInputChange('identificationNumber', e.target.value)}
          required
          error={errors.identificationNumber}
        />
      </div>

      <FileUpload
        label="Application Image"
        id="applicationImage"
        name="applicationImage"
        accept="image/*"
        onChange={(file) => onInputChange('applicationImage', file)}
        value={formData.applicationImage}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Nationality"
          id="nationality"
          name="nationality"
          value={formData.nationality}
          onChange={(e) => onInputChange('nationality', e.target.value)}
          required
          error={errors.nationality}
        />
        
        <Select
          label="Desired Program"
          id="desiredProgram"
          name="desiredProgram"
          options={programOptions}
          value={formData.desiredProgram}
          onChange={(e) => onInputChange('desiredProgram', e.target.value)}
          required
          error={errors.desiredProgram}
        />
      </div>

      <RadioGroup
        label="Do you have access to a personal computer?"
        name="personalComputer"
        options={yesNoOptions}
        value={formData.personalComputer.toString()}
        onChange={(value) => onInputChange('personalComputer', value === 'true')}
        required
      />
    </div>
  );
};

export default PersonalInfoStep;
