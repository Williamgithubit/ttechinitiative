'use client';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Counter from '@/components/ui/Counter';
import { motion } from 'framer-motion';
import { UserType } from '@/store/types';

interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Events = ({ searchParams }: PageProps) => {
  // Get user from session or context instead of props in Next.js 13+
  const { data: session } = useSession();
  const user = session?.user || null;
  const events = [
    {
      id: 1,
      title: "Free Coding Workshop",
      date: "2024-02-15",
      time: "10:00 AM - 4:00 PM",
      location: "TTI Central Office, Monrovia",
      spots: 30,
      enrolled: 12,
      description: "Hands-on introduction to programming with Python for absolute beginners."
    },
    {
      id: 2,
      title: "Tech Career Day",
      date: "2024-02-20",
      time: "9:00 AM - 3:00 PM",
      location: "National Youth Center, Monrovia",
      spots: 50,
      enrolled: 8,
      description: "Networking event with tech professionals and career guidance session."
    },
    {
      id: 3,
      title: "Women in Tech Summit",
      date: "2024-03-08",
      time: "8:00 AM - 5:00 PM",
      location: "University of Liberia",
      spots: 100,
      enrolled: 45,
      description: "Annual summit celebrating women in technology with workshops and panel discussions."
    }
  ];

  const handleEventRegister = (eventId: number) => {
    if (!user) {
      alert('Please log in to register for events');
      return;
    }
    const event = events.find(e => e.id === eventId);
    if (!event) {
      alert('Event not found');
      return;
    }
    if (event.enrolled >= event.spots) {
      alert('Sorry, this event is full');
      return;
    }
    alert(`Successfully registered for ${event.title}!`);
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events & Workshops</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our community events, workshops, and training sessions to enhance your skills and network with peers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event) => (
            <Card key={event.id}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <div className="flex items-center text-gray-600 mb-1">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date} • {event.time}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#000054]">{event.spots - event.enrolled}</div>
                    <div className="text-sm text-gray-600">spots left</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-6">{event.description}</p>
                <Button
                  onClick={() => handleEventRegister(event.id)}
                  fullWidth
                >
                  Register Now
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-[#000054] to-[#1e1e8f] rounded-2xl p-10 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2 text-center">Past Events Highlights</h2>
            <p className="text-blue-100 mb-8 text-center max-w-2xl mx-auto">
              Our impact in numbers - transforming lives through technology education
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { number: 15, label: 'Workshops Conducted', suffix: '+', duration: 2000 },
                { number: 300, label: 'Participants', suffix: '+', duration: 2500 },
                { number: 95, label: 'Satisfaction Rate', suffix: '%', duration: 3000 }
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-3">
                    <Counter 
                      end={stat.number} 
                      suffix={stat.suffix}
                      duration={stat.duration}
                    />
                  </div>
                  <div className="text-blue-100 text-lg">{stat.label}</div>
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

export default Events;