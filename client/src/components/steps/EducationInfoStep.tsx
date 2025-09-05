'use client';
import React from 'react';
import FormInput from '../ui/FormInput';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';
import RadioGroup from '../ui/RadioGroup';
import { AdmissionFormData } from '../../services/firebaseAdmissionService';

interface FormErrors {
  [key: string]: string;
}

interface EducationInfoStepProps {
  formData: AdmissionFormData;
  errors: FormErrors;
  onInputChange: (field: keyof AdmissionFormData, value: any) => void;
}

const EducationInfoStep: React.FC<EducationInfoStepProps> = ({ 
  formData, 
  errors, 
  onInputChange 
}) => {
  const educationOptions = [
    { value: 'primary', label: 'Primary School' },
    { value: 'secondary', label: 'Secondary School' },
    { value: 'high-school', label: 'High School' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelor', label: 'Bachelor\'s Degree' },
    { value: 'master', label: 'Master\'s Degree' },
    { value: 'phd', label: 'PhD' },
    { value: 'other', label: 'Other' }
  ];

  const yesNoOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#000054] mb-6">Educational Background</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Highest Level of Education Completed"
          id="highestEducation"
          name="highestEducation"
          options={educationOptions}
          value={formData.highestEducation}
          onChange={(e) => onInputChange('highestEducation', e.target.value)}
          required
          error={errors.highestEducation}
        />
        
        <FormInput
          label="Graduation Year"
          id="graduationYear"
          name="graduationYear"
          type="number"
          min="1950"
          max={new Date().getFullYear() + 10}
          value={formData.graduationYear.toString()}
          onChange={(e) => onInputChange('graduationYear', parseInt(e.target.value))}
          required
          error={errors.graduationYear}
        />
      </div>

      <FormInput
        label="Name of Last Attended School/College/University"
        id="lastSchoolName"
        name="lastSchoolName"
        value={formData.lastSchoolName}
        onChange={(e) => onInputChange('lastSchoolName', e.target.value)}
        required
        error={errors.lastSchoolName}
      />

      <RadioGroup
        label="Do you have basic computer knowledge?"
        name="basicComputerKnowledge"
        options={yesNoOptions}
        value={formData.basicComputerKnowledge.toString()}
        onChange={(value) => onInputChange('basicComputerKnowledge', value === 'true')}
        required
      />

      <TextArea
        label="Personal Statement"
        id="personalStatement"
        name="personalStatement"
        placeholder="Tell us about yourself, your goals, and why you want to join this program..."
        rows={6}
        value={formData.personalStatement}
        onChange={(e) => onInputChange('personalStatement', e.target.value)}
        required
        error={errors.personalStatement}
      />

      <TextArea
        label="Community Impact"
        id="communityImpact"
        name="communityImpact"
        placeholder="Describe how you plan to use the skills gained from this program to impact your community..."
        rows={6}
        value={formData.communityImpact}
        onChange={(e) => onInputChange('communityImpact', e.target.value)}
        required
        error={errors.communityImpact}
      />
    </div>
  );
};

export default EducationInfoStep;
