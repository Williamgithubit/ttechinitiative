'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image, { StaticImageData } from 'next/image';

interface ImageItem {
  src: string | StaticImageData;
  alt: string;
}

interface ImageSliderProps {
  images: ImageItem[];
  interval?: number;
}

const ImageSlider = ({ images, interval = 30000 }: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => {
      clearInterval(timer);
      setIsMounted(false);
    };
  }, [images.length, interval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!isMounted || !images.length) {
    return (
      <div className="relative w-full h-full min-h-[350px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">Loading images...</div>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const isStaticImage = typeof currentImage.src !== 'string';

  return (
    <div className="relative w-full h-full min-h-[350px] overflow-hidden rounded-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {isStaticImage ? (
            <Image
              src={currentImage.src as StaticImageData}
              alt={currentImage.alt}
              fill
              className="object-cover rounded-lg"
              priority
            />
          ) : (
            <Image
              src={currentImage.src as string}
              alt={currentImage.alt}
              fill
              className="object-cover rounded-lg"
              priority
              unoptimized={true}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-[#E32845] w-6' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
