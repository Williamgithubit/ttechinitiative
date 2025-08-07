'use client';
import Button from '@/components/ui/Button';
import ImageSlider from '@/components/ui/ImageSlider';
import Counter from '@/components/ui/Counter';

const images = [
  { src: '/assets/group-diverse-teens-young-people-doing-activities-together-celebrating-world-youth-skills-day-wmbRq30m.jpg', alt: "Diverse group of young people celebrating together" },
  { src: '/assets/father-helping-supporting-his-daughter-with-online-school-while-staying-home-DG-lKnR2.jpg', alt: "Father helping his daughter with online school" },
  { src: '/assets/full-shot-african-kids-with-laptop-C0TtGqZY.jpg', alt: "African kids with laptop" },
  { src: '/assets/group-african-kids-classroom-CQQIx3rK.jpg', alt: "Group of African kids in classroom" },
  { src: '/assets/small-black-boy-elearning-computer-home-fFTAaOTd.jpg', alt: "Young boy learning on computer" },
  { src: '/assets/study-group-african-people-CriGJJJA.jpg', alt: "Study group of African students" },
  { src: '/assets/young-woman-studying-library-CR08Kqmq.jpg', alt: "Young woman studying in library" }
];

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-[#000054] to-[#1a1a6e] text-white w-full pt-6 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Section */}
          <div className="mt-0 lg:mt-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Empowering Liberian Youth Through Digital Education
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-8 text-gray-200">
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

          {/* Image Slider Section */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[5/3] xl:aspect-[21/9]">
            <ImageSlider images={images} interval={30000} />

            {/* Counters - repositioned responsively */}
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white p-4 sm:p-6 rounded-lg shadow-lg z-10">
              <div className="text-2xl sm:text-3xl font-bold text-[#E32845]">
                <Counter end={8} duration={2000} />+
              </div>
              <div className="text-gray-600 text-sm sm:text-base">Students Trained</div>
            </div>

            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white p-4 sm:p-6 rounded-lg shadow-lg z-10">
              <div className="text-2xl sm:text-3xl font-bold text-[#E32845]">
                <Counter end={3} duration={2000} />+
              </div>
              <div className="text-gray-600 text-sm sm:text-base">Volunteers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
