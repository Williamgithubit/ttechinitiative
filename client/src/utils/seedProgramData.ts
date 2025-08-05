import { createProgram, CreateProgramData } from '@/services/programService';

export const seedProgramData = async (): Promise<void> => {
  const samplePrograms: CreateProgramData[] = [
    {
      name: 'Summer Coding Bootcamp',
      description: 'Intensive 12-week coding bootcamp covering full-stack web development with React, Node.js, and databases. Perfect for beginners looking to start a career in tech.',
      status: 'active',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
    },
    {
      name: 'AI & Machine Learning Workshop',
      description: 'Advanced workshop series exploring artificial intelligence, machine learning algorithms, and practical applications using Python and TensorFlow.',
      status: 'upcoming',
      startDate: '2024-09-15',
      endDate: '2024-12-15',
    },
    {
      name: 'Mobile App Development Course',
      description: 'Learn to build native mobile applications for iOS and Android using React Native. Includes deployment to app stores.',
      status: 'active',
      startDate: '2024-05-01',
      endDate: '2024-07-31',
    },
    {
      name: 'Data Science Fundamentals',
      description: 'Introduction to data science concepts, statistical analysis, data visualization, and working with big data using Python and R.',
      status: 'draft',
      startDate: '2024-10-01',
      endDate: '2024-12-31',
    },
    {
      name: 'Cybersecurity Essentials',
      description: 'Comprehensive cybersecurity training covering network security, ethical hacking, and security best practices for modern organizations.',
      status: 'upcoming',
      startDate: '2024-08-01',
      endDate: '2024-10-31',
    },
    {
      name: 'Cloud Computing with AWS',
      description: 'Hands-on training with Amazon Web Services, covering EC2, S3, Lambda, and other cloud services. Prepare for AWS certification.',
      status: 'active',
      startDate: '2024-04-15',
      endDate: '2024-06-30',
    },
    {
      name: 'DevOps and CI/CD Pipeline',
      description: 'Learn modern DevOps practices, containerization with Docker, Kubernetes orchestration, and setting up continuous integration/deployment pipelines.',
      status: 'inactive',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
    },
    {
      name: 'Blockchain Development',
      description: 'Explore blockchain technology, smart contract development with Solidity, and building decentralized applications (DApps).',
      status: 'draft',
      startDate: '2024-11-01',
      endDate: '2025-01-31',
    },
    {
      name: 'UI/UX Design Masterclass',
      description: 'Complete design course covering user research, wireframing, prototyping, and modern design tools like Figma and Adobe Creative Suite.',
      status: 'upcoming',
      startDate: '2024-07-15',
      endDate: '2024-09-30',
    },
    {
      name: 'Game Development with Unity',
      description: 'Create 2D and 3D games using Unity engine and C#. Learn game mechanics, physics, animation, and publishing to multiple platforms.',
      status: 'active',
      startDate: '2024-03-01',
      endDate: '2024-05-31',
    },
  ];

  try {
    console.log('Seeding program data...');
    
    for (const program of samplePrograms) {
      await createProgram(program);
      console.log(`Created program: ${program.name}`);
    }
    
    console.log(`Successfully seeded ${samplePrograms.length} programs!`);
  } catch (error) {
    console.error('Error seeding program data:', error);
    throw error;
  }
};
