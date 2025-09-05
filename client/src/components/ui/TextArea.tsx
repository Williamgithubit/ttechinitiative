'use client';
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  id, 
  name, 
  value, 
  onChange, 
  required = false,
  placeholder = '',
  error = '',
  rows = 4,
  ...props 
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-[#000054] mb-1">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md focus:outline-none focus:ring-2 focus:ring-[#000054] focus:border-transparent transition-colors duration-200 resize-vertical`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default TextArea;
