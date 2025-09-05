'use client';
import React, { useRef, useState } from 'react';

interface FileUploadProps {
  label: string;
  id: string;
  name: string;
  accept?: string;
  required?: boolean;
  error?: string;
  onChange: (file: File | null) => void;
  value?: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  id, 
  name, 
  accept = "image/*",
  required = false,
  error = '',
  onChange,
  value
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onChange(file);

    // Create preview for images
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#000054] mb-1">
        {label}
      </label>
      
      <div className={`border-2 border-dashed ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded-lg p-6 text-center hover:border-[#000054] transition-colors duration-200`}>
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          name={name}
          accept={accept}
          required={required}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {preview ? (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="mx-auto max-h-32 rounded-lg"
            />
            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={handleClick}
                className="px-4 py-2 bg-[#000054] text-white rounded-md hover:bg-[#1a1a6e] transition-colors duration-200"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        ) : value ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">{value.name}</p>
            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={handleClick}
                className="px-4 py-2 bg-[#000054] text-white rounded-md hover:bg-[#1a1a6e] transition-colors duration-200"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <button
                type="button"
                onClick={handleClick}
                className="px-4 py-2 bg-[#000054] text-white rounded-md hover:bg-[#1a1a6e] transition-colors duration-200"
              >
                Choose File
              </button>
              <p className="mt-2 text-xs text-gray-500">
                {accept === "image/*" ? "PNG, JPG, GIF up to 10MB" : "PDF, DOC, DOCX up to 10MB"}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FileUpload;
