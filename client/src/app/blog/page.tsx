'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiSearch, FiArrowRight } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import Button from '@/components/ui/Button';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'updates', name: 'News & Updates' },
    { id: 'events', name: 'Events' },
    { id: 'stories', name: 'Success Stories' },
    { id: 'tech', name: 'Tech Tips' }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "Empowering Youth Through Digital Literacy in Monrovia",
      excerpt: "Last week, we successfully conducted an intensive digital literacy workshop in central Monrovia, equipping 50 young individuals with essential computer skills that will open doors to new opportunities.",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "events",
      tags: ["workshop", "digital literacy", "Monrovia"],
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
    },
    {
      id: 2,
      title: "New State-of-the-Art Computer Lab Launched in Ganta",
      excerpt: "Thanks to the incredible support from our community partners, we've established a cutting-edge computer lab in Ganta, now serving over 200 students monthly with access to modern technology.",
      date: "2024-01-10",
      readTime: "4 min read",
      category: "updates",
      tags: ["facilities", "expansion", "education"],
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 3,
      title: "Meet Our First Cohort of Tech Educator Volunteers",
      excerpt: "We're proud to announce the graduation of our first cohort of 15 passionate tech educators who completed our intensive training program and are now ready to make an impact in communities across Liberia.",
      date: "2024-01-05",
      readTime: "6 min read",
      category: "stories",
      tags: ["volunteers", "training", "community"],
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 4,
      title: "5 Essential Coding Skills for Beginners in 2024",
      excerpt: "In today's digital age, learning to code is more valuable than ever. Here are the top 5 programming languages and skills that will give beginners the best start in their tech journey.",
      date: "2023-12-20",
      readTime: "8 min read",
      category: "tech",
      tags: ["coding", "tutorial", "beginners"],
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80"
    },
    {
      id: 5,
      title: "How We're Bridging the Digital Divide in Rural Liberia",
      excerpt: "Discover how our mobile tech labs are bringing computer education to remote communities, providing access to technology for students who would otherwise be left behind in the digital revolution.",
      date: "2023-12-10",
      readTime: "7 min read",
      category: "stories",
      tags: ["rural", "impact", "education"],
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80"
    },
    {
      id: 6,
      title: "Announcing Our Partnership with Tech Giants for Liberia",
      excerpt: "We're thrilled to announce our new partnership with leading global tech companies to bring cutting-edge technology and training programs to Liberian youth, creating pathways to employment in the digital economy.",
      date: "2023-11-28",
      readTime: "5 min read",
      category: "updates",
      tags: ["partnerships", "announcement", "opportunities"],
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string | number | Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#000054] to-[#1e1e8f] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">TTI Blog</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Insights, stories, and updates from our journey to transform lives through technology education
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full px-6 py-4 pr-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E32845] bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-[#000054] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/2">
                  <div className="relative h-full w-full">
                    <Image 
                      src={filteredPosts[0].image} 
                      alt={filteredPosts[0].title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                </div>
                <div className="p-8 md:w-1/2 flex flex-col justify-center">
                  <div className="uppercase tracking-wide text-sm text-[#E32845] font-semibold mb-2">
                    Featured Post
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="mt-2 text-gray-600 mb-6">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <span className="flex items-center mr-4">
                      <FiCalendar className="mr-1" />
                      {formatDate(filteredPosts[0].date)}
                    </span>
                    <span className="flex items-center">
                      <FiClock className="mr-1" />
                      {filteredPosts[0].readTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button size="sm" className="group">
                      Read Full Story
                      <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <div className="flex space-x-3">
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <FaFacebook className="text-xl" />
                      </button>
                      <button className="text-gray-400 hover:text-blue-400 transition-colors">
                        <FaTwitter className="text-xl" />
                      </button>
                      <button className="text-gray-400 hover:text-blue-700 transition-colors">
                        <FaLinkedin className="text-xl" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {filteredPosts.slice(1).map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative w-full h-48">
                <Image 
                  src={post.image} 
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-[#E32845] bg-red-50 px-3 py-1 rounded-full">
                    {categories.find(cat => cat.id === post.category)?.name}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <FiCalendar className="mr-1" />
                    {formatDate(post.date)}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex justify-between items-center">
                  <span className="flex items-center text-sm text-gray-500">
                    <FiClock className="mr-1" />
                    {post.readTime}
                  </span>
                  <button className="text-[#000054] font-medium hover:text-[#1e1e8f] transition-colors flex items-center">
                    Read More
                    <FiArrowRight className="ml-1" />
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="bg-gradient-to-r from-[#000054] to-[#1e1e8f] rounded-2xl p-8 md:p-12 text-white overflow-hidden relative mb-16">
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter to receive the latest news, updates, and exclusive content directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-6 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E32845] bg-white"
              />
              <Button variant="secondary" className="whitespace-nowrap rounded-full">
                Subscribe
              </Button>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#E32845] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#0000ff] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        {/* Pagination */}
        {filteredPosts.length > 0 && (
          <div className="flex justify-center">
            <nav className="flex items-center space-x-2">
              <button className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition-colors">
                Previous
              </button>
              {[1, 2, 3].map((page) => (
                <button 
                  key={page}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    page === 1 
                      ? 'bg-[#000054] text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                >
                  {page}
                </button>
              ))}
              <button className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition-colors">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;