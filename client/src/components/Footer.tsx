'use client';
import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#000054] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-[#E32845] mb-4">T-Tech Initiatives</h2>
            <p className="text-gray-300 mb-6">
              Empowering Liberian youth through free digital education. We&apos;re committed to bridging the digital divide and creating opportunities for all.
            </p>
            <div className="flex space-x-6 mt-4">
              <a href="#" className="text-gray-300 hover:text-[#E32845] transition-colors duration-200 text-2xl" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#E32845] transition-colors duration-200 text-2xl" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#E32845] transition-colors duration-200 text-2xl" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-[#E32845] transition-colors duration-200">Home</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-200">About Us</Link></li>
              <li><Link href="/programs" className="text-gray-300 hover:text-white transition-colors duration-200">Programs</Link></li>
              <li><Link href="/events" className="text-gray-300 hover:text-white transition-colors duration-200">Events</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><Link href="/volunteer" className="text-gray-300 hover:text-white transition-colors duration-200">Volunteer</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors duration-200">News</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-2 text-[#E32845] flex-shrink-0" />
                <span className="text-gray-300">ELWA Rehab Community, Paynesville City, Liberia</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-2 text-[#E32845]" />
                <a href="tel:+231123456789" className="text-gray-300 hover:text-white transition-colors duration-200">+231 778 711 864 / 555 760 690</a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2 text-[#E32845]" />
                <a href="mailto:info@ttechinitiatives.org" className="text-gray-300 hover:text-white transition-colors duration-200">info@ttechinitiatives.org</a>
              </li>
              <li className="flex items-center">
                <FaClock className="mr-2 text-[#E32845]" />
                <span className="text-gray-300">Mon - Fri: 9:00 AM - 5:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#E32845] mt-8 pt-8 text-center">
          <p className="text-gray-400">
            {currentYear} T-Tech Initiatives. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;