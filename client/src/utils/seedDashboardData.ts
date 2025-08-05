import { 
  collection, 
  addDoc, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/services/firebase';

/**
 * Utility to seed sample data for dashboard testing
 * This should only be run once to populate initial data
 */

export const seedSampleData = async () => {
  try {
    console.log('Starting to seed sample data...');

    // Check if we already have data to avoid duplicates
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const programsSnapshot = await getDocs(collection(db, 'programs'));
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));

    // Seed sample programs if none exist
    if (programsSnapshot.empty) {
      console.log('Seeding sample programs...');
      const samplePrograms = [
        {
          title: 'Web Development Bootcamp',
          description: 'Learn modern web development with React and Node.js',
          status: 'active',
          startDate: Timestamp.fromDate(new Date('2024-01-15')),
          endDate: Timestamp.fromDate(new Date('2024-06-15')),
          capacity: 30,
          enrolled: 25,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          title: 'Data Science Fundamentals',
          description: 'Introduction to data science and machine learning',
          status: 'active',
          startDate: Timestamp.fromDate(new Date('2024-02-01')),
          endDate: Timestamp.fromDate(new Date('2024-07-01')),
          capacity: 20,
          enrolled: 18,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          title: 'Mobile App Development',
          description: 'Build mobile apps with React Native',
          status: 'planning',
          startDate: Timestamp.fromDate(new Date('2024-03-01')),
          endDate: Timestamp.fromDate(new Date('2024-08-01')),
          capacity: 25,
          enrolled: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      for (const program of samplePrograms) {
        await addDoc(collection(db, 'programs'), program);
      }
      console.log('Sample programs seeded successfully');
    }

    // Seed sample events if none exist
    if (eventsSnapshot.empty) {
      console.log('Seeding sample events...');
      const sampleEvents = [
        {
          title: 'Tech Career Fair 2024',
          description: 'Connect with top tech companies',
          date: Timestamp.fromDate(new Date('2024-09-15')),
          location: 'Convention Center',
          status: 'upcoming',
          capacity: 500,
          registered: 234,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          title: 'AI Workshop Series',
          description: 'Hands-on AI and machine learning workshop',
          date: Timestamp.fromDate(new Date('2024-08-20')),
          location: 'Tech Hub',
          status: 'upcoming',
          capacity: 50,
          registered: 45,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          title: 'Coding Bootcamp Graduation',
          description: 'Celebrating our latest graduates',
          date: Timestamp.fromDate(new Date('2024-08-10')),
          location: 'Main Campus',
          status: 'upcoming',
          capacity: 200,
          registered: 150,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      for (const event of sampleEvents) {
        await addDoc(collection(db, 'events'), event);
      }
      console.log('Sample events seeded successfully');
    }

    // Seed sample tasks if none exist
    if (tasksSnapshot.empty) {
      console.log('Seeding sample tasks...');
      const sampleTasks = [
        {
          title: 'Update course curriculum',
          description: 'Review and update web development curriculum',
          status: 'completed',
          priority: 'high',
          assignedTo: 'admin',
          dueDate: Timestamp.fromDate(new Date('2024-07-15')),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          title: 'Prepare marketing materials',
          description: 'Create brochures for upcoming programs',
          status: 'completed',
          priority: 'medium',
          assignedTo: 'marketing',
          dueDate: Timestamp.fromDate(new Date('2024-07-20')),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          title: 'Schedule instructor interviews',
          description: 'Interview candidates for new instructor positions',
          status: 'in_progress',
          priority: 'high',
          assignedTo: 'hr',
          dueDate: Timestamp.fromDate(new Date('2024-08-01')),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          title: 'Setup new classroom equipment',
          description: 'Install computers and projectors in new classroom',
          status: 'pending',
          priority: 'medium',
          assignedTo: 'facilities',
          dueDate: Timestamp.fromDate(new Date('2024-08-15')),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          title: 'Review student applications',
          description: 'Process applications for fall semester',
          status: 'completed',
          priority: 'high',
          assignedTo: 'admissions',
          dueDate: Timestamp.fromDate(new Date('2024-07-30')),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      for (const task of sampleTasks) {
        await addDoc(collection(db, 'tasks'), task);
      }
      console.log('Sample tasks seeded successfully');
    }

    console.log('Sample data seeding completed!');
    console.log(`Users: ${usersSnapshot.size} (existing)`);
    console.log(`Programs: ${programsSnapshot.size > 0 ? programsSnapshot.size : 3} (${programsSnapshot.empty ? 'seeded' : 'existing'})`);
    console.log(`Events: ${eventsSnapshot.size > 0 ? eventsSnapshot.size : 3} (${eventsSnapshot.empty ? 'seeded' : 'existing'})`);
    console.log(`Tasks: ${tasksSnapshot.size > 0 ? tasksSnapshot.size : 5} (${tasksSnapshot.empty ? 'seeded' : 'existing'})`);

  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
};

// Helper function to clear all sample data (use with caution!)
export const clearSampleData = async () => {
  console.warn('This will clear ALL data from collections. Use with extreme caution!');
  // Implementation would go here if needed for testing
};
