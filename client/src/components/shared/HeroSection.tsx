'use client';
import Button from '@/components/ui/Button';
import ImageSlider from '@/components/ui/ImageSlider';
import Counter from '@/components/ui/Counter';

// Image paths relative to the public directory
const images = [
  { src: '/assets/group-diverse-teens-young-people-doing-activities-together-celebrating-world-youth-skills-day-wmbRq30m.jpg', 
    alt: "Diverse group of young people celebrating together" },
  { src: '/assets/father-helping-supporting-his-daughter-with-online-school-while-staying-home-DG-lKnR2.jpg', 
    alt: "Father helping his daughter with online school" },
  { src: '/assets/full-shot-african-kids-with-laptop-C0TtGqZY.jpg', 
    alt: "African kids with laptop" },
  { src: '/assets/group-african-kids-classroom-CQQIx3rK.jpg', 
    alt: "Group of African kids in classroom" },
  { src: '/assets/small-black-boy-elearning-computer-home-fFTAaOTd.jpg', 
    alt: "Young boy learning on computer" },
  { src: '/assets/study-group-african-people-CriGJJJA.jpg', 
    alt: "Study group of African students" },
  { src: '/assets/young-woman-studying-library-CR08Kqmq.jpg', 
    alt: "Young woman studying in library" }
];

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-[#000054] to-[#1a1a6e] text-white h-[100vh] w-full pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="mt-0 lg:mt-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Empowering Liberian Youth Through Digital Education
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Free and affordable technology training for underserved communities across Liberia.
              Join us in bridging the digital divide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                as="link" 
                href="/programs"
                variant="secondary"
                size="lg"
                className="rounded-md"
              >
                Explore Programs
              </Button>
              <Button 
                as="link" 
                href="/volunteer"
                variant="custom"
                size="lg"
                className="rounded-md"
              >
                Volunteer With Us
              </Button>
            </div>
          </div>
          <div className="relative h-96 w-full">
            <ImageSlider images={images} interval={4000} />

            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg z-10">
              <div className="text-3xl font-bold text-[#E32845]">
                <Counter end={8} duration={2000} />+
              </div>
              <div className="text-gray-600">Students Trained</div>
            </div>
            <div className="absolute -top-6 -right-6 bg-white p-6 rounded-lg shadow-lg z-10">
              <div className="text-3xl font-bold text-[#E32845]">
                <Counter end={3} duration={2000} />+
              </div>
              <div className="text-gray-600">Volunteers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
