import { createEvent, CreateEventData } from '@/services/eventService';

const sampleEvents: CreateEventData[] = [
  {
    title: 'Web Development Workshop',
    description: 'Learn modern web development techniques with React, Next.js, and TypeScript. Perfect for beginners and intermediate developers.',
    startDate: new Date('2025-08-15T09:00:00'),
    endDate: new Date('2025-08-15T17:00:00'),
    location: 'Tech Hub Conference Room A',
    capacity: 30,
    status: 'upcoming',
    category: 'workshop',
    price: 99.99,
    isPublic: true,
  },
  {
    title: 'AI and Machine Learning Seminar',
    description: 'Explore the latest trends in artificial intelligence and machine learning. Industry experts will share insights and practical applications.',
    startDate: new Date('2025-08-20T14:00:00'),
    endDate: new Date('2025-08-20T18:00:00'),
    location: 'Innovation Center Auditorium',
    capacity: 100,
    status: 'upcoming',
    category: 'seminar',
    price: 149.99,
    isPublic: true,
  },
  {
    title: 'Tech Career Networking Event',
    description: 'Connect with fellow professionals, share experiences, and build valuable relationships in the tech industry.',
    startDate: new Date('2025-08-10T18:00:00'),
    endDate: new Date('2025-08-10T21:00:00'),
    location: 'Downtown Business Center',
    capacity: 75,
    status: 'upcoming',
    category: 'networking',
    price: 25.00,
    isPublic: true,
  },
  {
    title: 'Mobile App Development Training',
    description: 'Comprehensive training on iOS and Android app development using React Native and Flutter frameworks.',
    startDate: new Date('2025-07-25T09:00:00'),
    endDate: new Date('2025-07-27T17:00:00'),
    location: 'Training Center Room 101',
    capacity: 20,
    status: 'completed',
    category: 'training',
    price: 299.99,
    isPublic: true,
  },
  {
    title: 'Cybersecurity Conference 2025',
    description: 'Annual cybersecurity conference featuring keynote speakers, panel discussions, and hands-on security workshops.',
    startDate: new Date('2025-09-05T08:00:00'),
    endDate: new Date('2025-09-07T18:00:00'),
    location: 'Grand Convention Center',
    capacity: 500,
    status: 'upcoming',
    category: 'conference',
    price: 399.99,
    isPublic: true,
  },
  {
    title: 'UX/UI Design Workshop',
    description: 'Learn user experience and user interface design principles. Create stunning and functional designs using modern tools.',
    startDate: new Date('2025-08-12T10:00:00'),
    endDate: new Date('2025-08-12T16:00:00'),
    location: 'Design Studio',
    capacity: 25,
    status: 'upcoming',
    category: 'workshop',
    price: 79.99,
    isPublic: true,
  },
  {
    title: 'Cloud Computing Seminar',
    description: 'Discover cloud computing solutions, AWS, Azure, and Google Cloud platforms. Best practices for cloud migration.',
    startDate: new Date('2025-07-30T13:00:00'),
    endDate: new Date('2025-07-30T17:00:00'),
    location: 'Tech Park Meeting Room',
    capacity: 40,
    status: 'completed',
    category: 'seminar',
    price: 89.99,
    isPublic: true,
  },
  {
    title: 'Data Science Bootcamp',
    description: 'Intensive bootcamp covering data analysis, visualization, and machine learning with Python and R.',
    startDate: new Date('2025-08-25T09:00:00'),
    endDate: new Date('2025-08-29T17:00:00'),
    location: 'Data Science Lab',
    capacity: 15,
    status: 'upcoming',
    category: 'training',
    price: 599.99,
    isPublic: true,
  },
  {
    title: 'Startup Pitch Competition',
    description: 'Entrepreneurs present their innovative ideas to a panel of investors and industry experts.',
    startDate: new Date('2025-08-18T15:00:00'),
    endDate: new Date('2025-08-18T19:00:00'),
    location: 'Startup Incubator Hall',
    capacity: 150,
    status: 'upcoming',
    category: 'other',
    price: 0,
    isPublic: true,
  },
  {
    title: 'DevOps Best Practices Workshop',
    description: 'Learn DevOps methodologies, CI/CD pipelines, containerization with Docker, and orchestration with Kubernetes.',
    startDate: new Date('2025-08-22T09:00:00'),
    endDate: new Date('2025-08-22T17:00:00'),
    location: 'Tech Campus Lab 3',
    capacity: 35,
    status: 'upcoming',
    category: 'workshop',
    price: 129.99,
    isPublic: true,
  },
];

export const seedEventData = async (): Promise<void> => {
  try {
    console.log('Starting to seed event data...');
    
    const promises = sampleEvents.map(async (eventData, index) => {
      try {
        const eventId = await createEvent(eventData);
        console.log(`Created event ${index + 1}/${sampleEvents.length}: ${eventData.title} (ID: ${eventId})`);
        return eventId;
      } catch (error) {
        console.error(`Failed to create event: ${eventData.title}`, error);
        throw error;
      }
    });

    await Promise.all(promises);
    console.log(`Successfully seeded ${sampleEvents.length} events!`);
  } catch (error) {
    console.error('Error seeding event data:', error);
    throw new Error('Failed to seed event data');
  }
};
