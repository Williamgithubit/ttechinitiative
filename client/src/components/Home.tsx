'use client';
import HeroSection from "@/components/shared/HeroSection";
import StatsSection from "@/components/shared/StatsSection";
import Card from "@/components/ui/Card";
import TestimonialCard from "@/components/ui/TestimonialCard";
import {
  FaLaptopCode,
  FaMobileAlt,
  FaLaptopHouse,
  FaChartLine,
  FaCalendarAlt,
  FaUserGraduate,
} from "react-icons/fa";
import { GiGraduateCap } from "react-icons/gi";
import { BsMicrosoft } from "react-icons/bs";

const Home = () => {
  const programs = [
    {
      id: 1,
      title: "Digital Literacy Program",
      description:
        "Foundational computer skills for beginners including typing, internet usage, and basic software applications.",
      duration: "8 weeks",
      level: "Beginner",
      icon: <FaLaptopHouse className="text-4xl mb-4 text-[#000054]" />,
      image:
        " https://placehold.co/300x200/3b82f6/ffffff?text=Digital+Literacy",
    },
    {
      id: 2,
      title: "Web Development Bootcamp",
      description:
        "Comprehensive training in HTML, CSS, JavaScript, and modern web frameworks for aspiring developers.",
      duration: "12 weeks",
      level: "Intermediate",
      icon: <FaLaptopCode className="text-4xl mb-4 text-[#000054]" />,
      image: " https://placehold.co/300x200/8b5cf6/ffffff?text=Web+Dev",
    },
    {
      id: 3,
      title: "Graphic Design Essentials",
      description:
        "Learn the fundamentals of graphic design, including color theory, typography, layout, and visual communication using modern tools and techniques.",
      duration: "10 weeks",
      level: "Intermediate",
      icon: <FaMobileAlt className="text-4xl mb-4 text-[#000054]" />,
      image: " https://placehold.co/300x200/06b6d4/ffffff?text=Mobile+Apps",
    },
    {
      id: 4,
      title: "Microsoft Office SuiteGraphic Design Essentials",
      description:
        "Master essential Microsoft Office tools like Word, Excel, and PowerPoint. Gain efficiency in document creation, data analysis, and presentations.",
      duration: "10 weeks",
      level: "Beginner",
      icon: <BsMicrosoft className="text-4xl mb-4 text-[#000054]" />,
      image: " https://placehold.co/300x200/06b6d4/ffffff?text=Mobile+Apps",
    },
  ];

  const testimonials = [
    {
      name: "Mary Johnson",
      role: "Student",
      content:
        "TTI changed my life. I went from never touching a computer to building my own website in just 3 months.",
      image: " https://placehold.co/80x80/f59e0b/ffffff?text=MJ",
      icon: <FaUserGraduate className="text-2xl text-[#E32845]" />,
    },
    {
      name: "James Kollie",
      role: "Web Developer",
      content:
        "The web development program gave me the skills I needed to start my own freelance business. Highly recommended!",
      image: " https://placehold.co/80x80/3b82f6/ffffff?text=JK",
      icon: <FaLaptopCode className="text-2xl text-[#E32845]" />,
    },
    {
      name: "Patricia Doe",
      role: "Mobile Developer",
      content:
        "The instructors are knowledgeable and supportive. I got my first developer job after completing the mobile app course.",
      image: " https://placehold.co/80x80/10b981/ffffff?text=PD",
      icon: <FaMobileAlt className="text-2xl text-[#E32845]" />,
    },
  ];

  return (
    <>
      <HeroSection />
      <StatsSection />

      {/* Featured Programs */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#000054] mb-4">
              Featured Programs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive curriculum prepares students for careers in
              technology with practical, hands-on learning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-auto max-w-6xl">
            {programs.map((program) => (
              <Card
                key={program.id}
                className="h-full flex flex-col w-full max-w-sm"
              >
                <div className="bg-gray-100 p-6 flex justify-center">
                  {program.icon}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-[#000054] mb-3">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 mb-4 flex-1">
                    {program.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1 text-[#E32845]" />
                      <span>{program.duration}</span>
                    </div>
                    <span className="bg-[#E32845] text-white px-3 py-1 rounded-full text-xs font-medium">
                      {program.level}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-[#f8f9fa] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#000054] mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our students and volunteers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
