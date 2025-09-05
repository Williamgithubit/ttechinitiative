'use client';
import React from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ 
  label, 
  name, 
  options, 
  value, 
  onChange, 
  required = false,
  error = ''
}) => {
  return (
    <div className="mb-4">
      <fieldset>
        <legend className="block text-sm font-medium text-[#000054] mb-2">
          {label}
        </legend>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="radio"
                id={`${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="h-4 w-4 text-[#000054] focus:ring-[#000054] border-gray-300"
              />
              <label 
                htmlFor={`${name}-${option.value}`} 
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default RadioGroup;
