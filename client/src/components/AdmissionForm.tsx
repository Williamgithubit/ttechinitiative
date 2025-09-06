'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Card from './ui/Card';
import Button from './ui/Button';
import PersonalInfoStep from './steps/PersonalInfoStep';
import EducationInfoStep from './steps/EducationInfoStep';
import ContactInfoStep from './steps/ContactInfoStep';
import { AdmissionFormData, submitAdmissionApplication } from '../services/firebaseAdmissionService';
import emailService, { sendAdmissionIdEmail } from '../services/emailService';

interface FormErrors {
  [key: string]: string;
}

const AdmissionForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<AdmissionFormData>({
    // Step 1: Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    identificationType: '',
    identificationNumber: '',
    nationality: '',
    personalComputer: false,
    desiredProgram: '',

    // Step 2: Educational Background
    highestEducation: '',
    lastSchoolName: '',
    graduationYear: new Date().getFullYear(),
    basicComputerKnowledge: false,
    personalStatement: '',
    communityImpact: '',

    // Step 3: Contact Information
    email: '',
    phoneNumber: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactAddress: '',
    emergencyContactRelationship: '',
    declarationAccepted: false,
  });

  const steps = [
    { number: 1, title: 'Personal Information', description: 'Basic personal details' },
    { number: 2, title: 'Educational Background', description: 'Education and experience' },
    { number: 3, title: 'Contact Information', description: 'Contact details and submission' }
  ];

  const handleInputChange = (field: keyof AdmissionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.identificationType) newErrors.identificationType = 'Identification type is required';
      if (!formData.identificationNumber.trim()) newErrors.identificationNumber = 'Identification number is required';
      if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
      if (!formData.desiredProgram) newErrors.desiredProgram = 'Desired program is required';
    }

    if (step === 2) {
      if (!formData.highestEducation) newErrors.highestEducation = 'Highest education is required';
      if (!formData.lastSchoolName.trim()) newErrors.lastSchoolName = 'School name is required';
      if (!formData.graduationYear || formData.graduationYear < 1950 || formData.graduationYear > new Date().getFullYear() + 10) {
        newErrors.graduationYear = 'Valid graduation year is required';
      }
      if (!formData.personalStatement.trim()) newErrors.personalStatement = 'Personal statement is required';
      if (!formData.communityImpact.trim()) newErrors.communityImpact = 'Community impact statement is required';
    }

    if (step === 3) {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
      if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
      if (!formData.emergencyContactAddress.trim()) newErrors.emergencyContactAddress = 'Emergency contact address is required';
      if (!formData.emergencyContactRelationship) newErrors.emergencyContactRelationship = 'Emergency contact relationship is required';
      if (!formData.declarationAccepted) newErrors.declarationAccepted = 'You must accept the declaration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please fill in all required fields correctly.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting your application...');
    
    try {
      const result = await submitAdmissionApplication(formData);
      toast.dismiss(loadingToast);
      
      // Send admission ID email - use fallback method for production compatibility
      let emailSent = false;
      try {
        emailSent = await sendAdmissionIdEmail({
          applicantName: `${formData.firstName} ${formData.lastName}`,
          applicantEmail: formData.email,
          applicantId: result.applicantId,
          program: formData.desiredProgram,
        });
      } catch (emailError) {
        console.error('Email service error, trying fallback:', emailError);
        // Fallback to direct service call
        try {
          emailSent = await emailService.sendAdmissionIdEmail({
            applicantName: `${formData.firstName} ${formData.lastName}`,
            applicantEmail: formData.email,
            applicantId: result.applicantId,
            program: formData.desiredProgram,
          });
        } catch (fallbackError) {
          console.error('Fallback email service also failed:', fallbackError);
          emailSent = false;
        }
      }

      if (emailSent) {
        toast.success(
          `Application submitted successfully! Your admission ID (${result.applicantId}) has been sent to your email.`,
          {
            duration: 8000,
            style: {
              background: '#10B981',
              color: 'white',
            },
          }
        );
      } else {
        toast.success(
          `Application submitted successfully! Your application ID is: ${result.applicantId}. Please save this ID for your records.`,
          {
            duration: 8000,
            style: {
              background: '#10B981',
              color: 'white',
            },
          }
        );
        toast.error('Email notification failed, but your application was submitted successfully.', {
          duration: 5000,
        });
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error submitting application:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to submit application. Please try again.';
      
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#EF4444',
          color: 'white',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#000054] mb-2">Admission Application</h1>
        <p className="text-gray-600">Complete all steps to submit your application</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const getStepIcon = (stepNumber: number) => {
              if (currentStep > stepNumber) {
                return (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                );
              }
              
              switch (stepNumber) {
                case 1:
                  return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  );
                case 2:
                  return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  );
                case 3:
                  return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  );
                default:
                  return stepNumber;
              }
            };

            return (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-[#000054] border-[#000054] text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {getStepIcon(step.number)}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-[#000054]' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-[#000054]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Card className="p-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div>
            <PersonalInfoStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />
            <div className="flex justify-end mt-6">
              <Button onClick={handleNext}>
                Next →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Educational Background */}
        {currentStep === 2 && (
          <div>
            <EducationInfoStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePrevious}>
                ← Previous
              </Button>
              <Button onClick={handleNext}>
                Next →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Information */}
        {currentStep === 3 && (
          <div>
            <ContactInfoStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePrevious}>
                ← Previous
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                variant="secondary"
                className="relative"
              >
                {isSubmitting && (
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdmissionForm;
