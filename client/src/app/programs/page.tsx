'use client';
import React, { useState } from 'react';
import { FaClock, FaUserGraduate, FaChalkboardTeacher, FaLaptopCode, FaMobileAlt, FaChartLine } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BsMicrosoft } from 'react-icons/bs';

const Programs = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);

  const programs = [
    {
      id: 1,
      title: "Digital Literacy Program",
      description: "Master essential computer skills including typing, internet usage, and basic software applications to thrive in today's digital world.",
      duration: "8 weeks",
      level: "Beginner",
      icon: <FaLaptopCode className="text-4xl text-[#000054]" />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      id: 2,
      title: "Web Development Bootcamp",
      description: "Build responsive, modern websites with comprehensive training in HTML, CSS, JavaScript, and popular frameworks like React and Node.js.",
      duration: "12 weeks",
      level: "Intermediate",
      icon: <FaLaptopCode className="text-4xl  text-[#000054]" />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      id: 3,
      title: "Graphic Design Essentials",
      description: "Learn the fundamentals of graphic design, including color theory, typography, layout, and visual communication using modern tools and techniques.",
      duration: "10 weeks",
      level: "Intermediate",
      icon: <FaMobileAlt className="text-4xl  text-[#000054]" />,
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-700"
    },
    {
      id: 4,
      title: "Microsoft Office Suite",
      description: "Master essential Microsoft Office tools like Word, Excel, and PowerPoint. Gain efficiency in document creation, data analysis, and presentations.",
      duration: "10 weeks",
      level: "Beginner",
      icon: <BsMicrosoft className="text-4xl  text-[#000054]" />,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    }
  ];

  const handleEnrollCourse = (courseId: number) => {
    if (!enrolledCourses.includes(courseId)) {
      setEnrolledCourses(prev => [...prev, courseId]);
      alert('Successfully enrolled in course!');
    } else {
      alert('You are already enrolled in this course');
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#000054] mb-4">Our Programs</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive technology education programs designed to equip Liberian youth with in-demand digital skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className={`h-full transition-all duration-300 border border-gray-100 hover:border-[#E32845]/30 hover:shadow-xl overflow-hidden ${program.bgColor}`}>
                <div className="p-2">
                  <div className="p-1 inline-flex items-center justify-center rounded-lg mb-4">
                    {program.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#000054] transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {program.description}
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/70 text-gray-700">
                      <FaClock className="mr-1.5" /> {program.duration}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${program.textColor} ${program.bgColor.replace('50', '100')}`}>
                      {program.level}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleEnrollCourse(program.id)}
                    disabled={enrolledCourses.includes(program.id)}
                    variant="outline"
                    className={`w-full group-hover:bg-[#E32845] group-hover:text-white group-hover:border-[#E32845] transition-colors ${
                      enrolledCourses.includes(program.id)
                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      {enrolledCourses.includes(program.id) ? (
                        'Enrolled'
                      ) : (
                        <>
                          Learn More <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#000054] to-[#1e1e8f] rounded-2xl p-10 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Why Choose Our Programs?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl">We&apos;re committed to providing high-quality, accessible technology education to empower the next generation of Liberian tech leaders.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { 
                  title: 'Free Education', 
                  description: 'All programs are completely free for eligible students with no hidden costs.',
                  icon: <FaUserGraduate className="text-2xl text-[#E32845]" />
                },
                { 
                  title: 'Industry Certification', 
                  description: 'Earn recognized certifications that boost your employability and career prospects.',
                  icon: <svg className="h-6 w-6 text-[#E32845]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                },
                { 
                  title: 'Career Support', 
                  description: 'Access to job placement assistance, resume reviews, and interview preparation.',
                  icon: <svg className="h-6 w-6 text-[#E32845]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M12 16h.01M7 16h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                },
                { 
                  title: 'Flexible Learning', 
                  description: 'Evening and weekend classes to accommodate students with various schedules.',
                  icon: <svg className="h-6 w-6 text-[#E32845]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              ].map((benefit, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-white/10 rounded-lg">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                      <p className="mt-1 text-blue-100">{benefit.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#E32845] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#0000ff] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default Programs;