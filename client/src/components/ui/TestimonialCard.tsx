'use client';
import React from 'react';
import Image from 'next/image';
import { FaQuoteLeft } from 'react-icons/fa';
 
interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  image: string;  // Required prop for the image URL
  icon?: React.ReactNode;  // Optional icon in the bottom-right corner
}

const TestimonialCard = ({ name, role, content, image, icon }: TestimonialCardProps) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
      {/* Quote icon */}
      <div className="text-[#E32845] text-4xl mb-4 opacity-20 group-hover:opacity-30 transition-opacity">
        <FaQuoteLeft />
      </div>
      
      {/* Testimonial content */}
      <p className="text-gray-700 text-lg mb-6 flex-1 relative pl-6">
        <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#E32845] to-[#000054] rounded-full"></span>
        {content}
      </p>
      
      {/* Author info */}
      <div className="flex items-center pt-4 border-t border-gray-100">
        <div className="relative">
          <div className="relative w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          {icon && (
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
              {icon}
            </div>
          )}
        </div>
        <div className="ml-4">
          <h4 className="font-semibold text-[#000054] text-lg">{name}</h4>
          <p className="text-sm text-[#E32845] font-medium">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;