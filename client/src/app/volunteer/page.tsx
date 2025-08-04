import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaChalkboardTeacher, FaUserGraduate, FaLaptopCode, FaHandsHelping, FaNetworkWired, FaGlobeAfrica } from 'react-icons/fa';
import { GiTeacher, GiGraduateCap, GiNetworkBars, GiOfficeChair } from 'react-icons/gi';
import { MdOutlineEventNote, MdOutlineSocialDistance, MdBusinessCenter, MdSchool } from 'react-icons/md';
import Image from 'next/image';

// Image paths relative to the public directory
const image1 = "/assets/group-diverse-teens-young-people-doing-activities-together-celebrating-world-youth-skills-day-wmbRq30m.jpg";
const image2 = "/assets/father-helping-supporting-his-daughter-with-online-school-while-staying-home-DG-lKnR2.jpg";

const Volunteer = () => {
  const volunteerOpportunities = [
    {
      title: "Teach a Course",
      description: "Share your expertise by teaching one of our technology programs. No formal teaching experience required—just passion for technology and helping others learn.",
      items: ["Web Development", "Mobile App Development", "Data Science", "Digital Literacy"],
      icon: <FaChalkboardTeacher className="text-4xl text-[#000054] mb-4" />
    },
    {
      title: "Mentor Students",
      description: "Guide and support our students as they navigate their technology journey. Help them with projects, career advice, and personal development.",
      items: ["One-on-one mentoring", "Career guidance", "Project feedback", "Portfolio reviews"],
      icon: <GiTeacher className="text-4xl text-[#000054] mb-4" />
    },
    {
      title: "Support Operations",
      description: "Help keep our organization running smoothly with administrative, marketing, or technical support.",
      items: ["Event planning", "Social media management", "Website development", "Fundraising coordination"],
      icon: <FaHandsHelping className="text-4xl text-[#000054] mb-4" />
    }
  ];

  const whyVolunteer = [
    { text: "Make a direct impact on Liberian youth's lives", icon: <FaUserGraduate className="text-[#E32845] mr-3 mt-1 flex-shrink-0" /> },
    { text: "Develop leadership and teaching skills", icon: <FaChalkboardTeacher className="text-[#E32845] mr-3 mt-1 flex-shrink-0" /> },
    { text: "Expand your professional network", icon: <FaNetworkWired className="text-[#E32845] mr-3 mt-1 flex-shrink-0" /> },
    { text: "Gain valuable experience in education and nonprofit work", icon: <GiGraduateCap className="text-[#E32845] mr-3 mt-1 flex-shrink-0" /> },
    { text: "Contribute to national development through technology education", icon: <FaGlobeAfrica className="text-[#E32845] mr-3 mt-1 flex-shrink-0" /> }
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get Involved</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our mission to empower Liberian youth through digital education. Whether you&apos;re a tech professional, educator, or passionate supporter, there are many ways to contribute.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Volunteer Opportunities</h2>
            <div className="space-y-6">
              {volunteerOpportunities.map((opportunity, index) => (
                <Card key={index}>
                  <div className="p-6">
                    <div className="flex justify-center">
                      {opportunity.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-[#000054] mb-3 text-center">{opportunity.title}</h3>
                    <p className="text-gray-700 mb-4 text-center">{opportunity.description}</p>
                    <ul className="text-gray-600 space-y-2">
                      {opportunity.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <span className="text-[#E32845] mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <div className="bg-[#000054] text-white rounded-lg p-8 mb-6">
              <h2 className="text-2xl font-bold mb-4">Why Volunteer?</h2>
              <ul className="space-y-4">
                {whyVolunteer.map((reason, index) => (
                  <li key={index} className="flex items-start">
                    {reason.icon}
                    <span>{reason.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Image
              src={image1}
              alt="Diverse group of young people engaged in activities together"
              width={600}
              height={400}
              className="rounded-lg shadow-lg w-full h-auto object-cover"
              priority
            />
            <Image
              src={image2}
              alt="Father helping his daughter with online school"
              width={600}
              height={400}
              className="rounded-lg shadow-lg w-full h-auto object-cover mt-10 hidden lg:block"
            />

          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Partner With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Corporate Partners', 
                description: 'Provide funding, equipment, or employee volunteers to support our mission.',
                icon: <MdBusinessCenter className="text-4xl text-[#000054] mb-4 mx-auto" />
              },
              { 
                title: 'Educational Institutions', 
                description: 'Collaborate on curriculum development, student exchanges, and joint programs.',
                icon: <MdSchool className="text-4xl text-[#000054] mb-4 mx-auto" />
              },
              { 
                title: 'Community Organizations', 
                description: 'Work together to reach more communities and expand our impact.',
                icon: <MdOutlineSocialDistance className="text-4xl text-[#000054] mb-4 mx-auto" />
              }
            ].map((partner, index) => (
              <div key={index} className="text-center bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                {partner.icon}
                <h3 className="text-xl font-semibold text-[#000054] mb-3">{partner.title}</h3>
                <p className="text-gray-600">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;