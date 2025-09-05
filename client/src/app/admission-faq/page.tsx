"use client";
import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const AdmissionFAQPage = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqData: FAQItem[] = [
    // General Information
    {
      id: 'general-1',
      category: 'general',
      question: 'What is T-Tech Initiative?',
      answer: 'T-Tech Initiative is a leading technology education institution dedicated to providing comprehensive training in computer science, programming, and digital skills. We focus on practical, hands-on learning to prepare students for successful careers in the technology industry.'
    },
    {
      id: 'general-2',
      category: 'general',
      question: 'What programs do you offer?',
      answer: 'We offer various programs including Web Development, Mobile App Development, Data Science, Cybersecurity, Digital Marketing, and Computer Fundamentals. Each program is designed to provide both theoretical knowledge and practical skills needed in today\'s tech industry.'
    },
    {
      id: 'general-3',
      category: 'general',
      question: 'Are your programs accredited?',
      answer: 'Yes, T-Tech Initiative is fully accredited and recognized by relevant educational authorities. Our certificates and diplomas are widely accepted by employers and educational institutions.'
    },

    // Eligibility Requirements
    {
      id: 'eligibility-1',
      category: 'eligibility',
      question: 'What are the minimum eligibility requirements?',
      answer: 'Applicants must have completed at least secondary education (high school diploma or equivalent). For advanced programs, we may require specific prerequisites. Basic computer literacy is recommended but not mandatory as we provide foundational training.'
    },
    {
      id: 'eligibility-2',
      category: 'eligibility',
      question: 'Do I need prior programming experience?',
      answer: 'No prior programming experience is required for our foundational programs. We welcome complete beginners and provide comprehensive training from basics to advanced levels. However, some specialized programs may have prerequisites.'
    },
    {
      id: 'eligibility-3',
      category: 'eligibility',
      question: 'Is there an age limit for admission?',
      answer: 'We accept students aged 16 and above. There is no upper age limit - we welcome learners of all ages who are passionate about technology and committed to learning.'
    },
    {
      id: 'eligibility-4',
      category: 'eligibility',
      question: 'Do you accept international students?',
      answer: 'Yes, we welcome international students. However, all courses are conducted in English, so proficiency in English is required. International students may need to provide additional documentation for visa purposes.'
    },

    // Application Process
    {
      id: 'application-1',
      category: 'application',
      question: 'How do I apply for admission?',
      answer: 'You can apply online through our admission portal. Complete the application form, upload required documents (ID, educational certificates, passport photo), and submit. You\'ll receive a confirmation email with your application ID for tracking.'
    },
    {
      id: 'application-2',
      category: 'application',
      question: 'What documents do I need to submit?',
      answer: 'Required documents include: Valid ID (passport/national ID), educational certificates, passport-size photograph, proof of address, emergency contact information, and a community recommendation letter (if available).'
    },
    {
      id: 'application-3',
      category: 'application',
      question: 'Is there an application fee?',
      answer: 'The online application is free of charge. However, there may be processing fees for document verification and assessment, which will be communicated during the application process.'
    },
    {
      id: 'application-4',
      category: 'application',
      question: 'How long does the application process take?',
      answer: 'Applications are typically processed within 5-10 business days. You\'ll receive email updates on your application status. Complex cases or incomplete applications may take longer to process.'
    },
    {
      id: 'application-5',
      category: 'application',
      question: 'Can I track my application status?',
      answer: 'Yes, you can track your application status using the "My Application Status" link in the header menu. You\'ll need to log in with the email address used during application to view your current status and any updates.'
    },

    // Admission Requirements
    {
      id: 'requirements-1',
      category: 'requirements',
      question: 'Do I need to take an entrance exam?',
      answer: 'Most programs don\'t require formal entrance exams. However, we may conduct a brief assessment interview to understand your background and help place you in the most suitable program level.'
    },
    {
      id: 'requirements-2',
      category: 'requirements',
      question: 'What if I don\'t have access to a computer?',
      answer: 'We provide computer lab access during class hours. However, having personal access to a computer is highly recommended for practice and assignments. We can provide guidance on affordable computer options if needed.'
    },
    {
      id: 'requirements-3',
      category: 'requirements',
      question: 'Do I need specific software or equipment?',
      answer: 'We\'ll provide a list of required software (mostly free/open-source) after admission. Basic requirements include a computer with internet access. Specialized programs may have additional requirements which will be communicated in advance.'
    },

    // Fees and Financial Aid
    {
      id: 'fees-1',
      category: 'fees',
      question: 'What are the tuition fees?',
      answer: 'Tuition fees vary by program duration and complexity. We offer competitive rates with flexible payment plans. Contact our admissions office for detailed fee structure and payment options for your chosen program.'
    },
    {
      id: 'fees-2',
      category: 'fees',
      question: 'Do you offer scholarships or financial aid?',
      answer: 'Yes, we offer merit-based scholarships and need-based financial assistance. Scholarship applications are reviewed separately. We also have partnerships with organizations that sponsor deserving students.'
    },
    {
      id: 'fees-3',
      category: 'fees',
      question: 'Can I pay in installments?',
      answer: 'Yes, we offer flexible payment plans including monthly installments. Payment schedules can be arranged during the admission process based on your financial situation and program duration.'
    },

    // Program Details
    {
      id: 'program-1',
      category: 'program',
      question: 'How long are the programs?',
      answer: 'Program duration varies: Certificate programs (3-6 months), Diploma programs (6-12 months), and Advanced programs (12-18 months). Part-time and weekend options are available for working professionals.'
    },
    {
      id: 'program-2',
      category: 'program',
      question: 'Are classes held online or in-person?',
      answer: 'We offer both online and in-person classes. Hybrid options are also available. Online classes include live sessions, recorded lectures, and interactive labs. In-person classes provide hands-on experience in our modern computer labs.'
    },
    {
      id: 'program-3',
      category: 'program',
      question: 'What is the class schedule?',
      answer: 'We offer flexible schedules: Morning classes (8 AM - 12 PM), Afternoon classes (1 PM - 5 PM), Evening classes (6 PM - 9 PM), and Weekend classes (Saturday & Sunday). Choose the schedule that fits your availability.'
    },
    {
      id: 'program-4',
      category: 'program',
      question: 'Will I receive a certificate upon completion?',
      answer: 'Yes, successful students receive official certificates or diplomas upon program completion. Our certificates are industry-recognized and include detailed curriculum coverage, making them valuable for employment and further education.'
    },

    // Support and Services
    {
      id: 'support-1',
      category: 'support',
      question: 'What support services do you provide?',
      answer: 'We provide comprehensive support including academic counseling, career guidance, job placement assistance, technical support, library access, and peer mentoring programs. Our student success team is always available to help.'
    },
    {
      id: 'support-2',
      category: 'support',
      question: 'Do you provide job placement assistance?',
      answer: 'Yes, we have a dedicated career services team that helps with resume building, interview preparation, and connecting students with potential employers. We maintain partnerships with tech companies for internship and job opportunities.'
    },
    {
      id: 'support-3',
      category: 'support',
      question: 'Can I get academic support if I\'m struggling?',
      answer: 'Absolutely! We offer tutoring services, study groups, one-on-one mentoring, and additional practice sessions. Our instructors are available during office hours, and we have peer support programs to ensure every student succeeds.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', count: faqData.length },
    { id: 'general', name: 'General Information', count: faqData.filter(item => item.category === 'general').length },
    { id: 'eligibility', name: 'Eligibility', count: faqData.filter(item => item.category === 'eligibility').length },
    { id: 'application', name: 'Application Process', count: faqData.filter(item => item.category === 'application').length },
    { id: 'requirements', name: 'Requirements', count: faqData.filter(item => item.category === 'requirements').length },
    { id: 'fees', name: 'Fees & Financial Aid', count: faqData.filter(item => item.category === 'fees').length },
    { id: 'program', name: 'Program Details', count: faqData.filter(item => item.category === 'program').length },
    { id: 'support', name: 'Support & Services', count: faqData.filter(item => item.category === 'support').length }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 mt-[-4rem]">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#000054] to-[#1a1a6e] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Admission FAQ
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Find answers to frequently asked questions about our admission process, programs, and requirements.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-[#000054] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedCategory === category.id
                          ? 'bg-white text-[#000054]'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {category.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {categories.find(cat => cat.id === selectedCategory)?.name || 'All Questions'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="p-6">
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full text-left flex justify-between items-start focus:outline-none group"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#E32845] transition-colors duration-200 pr-4">
                        {faq.question}
                      </h3>
                      <div className="flex-shrink-0 ml-2">
                        {openItems.includes(faq.id) ? (
                          <FiChevronUp className="h-5 w-5 text-gray-500 group-hover:text-[#E32845] transition-colors duration-200" />
                        ) : (
                          <FiChevronDown className="h-5 w-5 text-gray-500 group-hover:text-[#E32845] transition-colors duration-200" />
                        )}
                      </div>
                    </button>
                    
                    {openItems.includes(faq.id) && (
                      <div className="mt-4 text-gray-700 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-8 bg-gradient-to-r from-[#000054] to-[#1a1a6e] rounded-lg shadow-md p-8 text-white">
              <h3 className="text-2xl font-bold mb-6 text-center">Still Have Questions?</h3>
              <p className="text-center text-blue-100 mb-8">
                Can't find the answer you're looking for? Our admissions team is here to help!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <FiMail className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <p className="text-blue-100 text-sm">admissions@ttechinitiative.org</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <FiPhone className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold mb-1">Phone</h4>
                  <p className="text-blue-100 text-sm">+1 (555) 123-4567</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <FiMapPin className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold mb-1">Visit Us</h4>
                  <p className="text-blue-100 text-sm">123 Tech Street, Innovation City</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <FiClock className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold mb-1">Office Hours</h4>
                  <p className="text-blue-100 text-sm">Mon-Fri: 9AM-5PM</p>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <a
                  href="/contact"
                  className="inline-block bg-[#E32845] hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Contact Admissions Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionFAQPage;
