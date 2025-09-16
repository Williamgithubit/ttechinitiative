import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock data names to remove
const mockNames = [
  'Alice Johnson',
  'Bob Smith',
  'Carol Davis',
  'Robert Johnson',
  'Sarah Smith',
  'Michael Davis'
];

const mockEmails = [
  'alice.johnson@student.edu',
  'bob.smith@student.edu',
  'carol.davis@student.edu',
  'robert.johnson@email.com',
  'sarah.smith@email.com',
  'michael.davis@email.com'
];

async function cleanMockData() {
  try {
    console.log('Starting to clean mock data from Firebase collections...');

    // Clean students collection
    console.log('Cleaning students collection...');
    const studentsRef = collection(db, 'students');
    const studentsSnapshot = await getDocs(studentsRef);
    
    let deletedStudents = 0;
    for (const docSnapshot of studentsSnapshot.docs) {
      const data = docSnapshot.data();
      if (mockNames.includes(data.name) || mockEmails.includes(data.email)) {
        await deleteDoc(doc(db, 'students', docSnapshot.id));
        console.log(`Deleted mock student: ${data.name}`);
        deletedStudents++;
      }
    }

    // Clean teachers collection
    console.log('Cleaning teachers collection...');
    const teachersRef = collection(db, 'teachers');
    const teachersSnapshot = await getDocs(teachersRef);
    
    let deletedTeachers = 0;
    for (const docSnapshot of teachersSnapshot.docs) {
      const data = docSnapshot.data();
      if (mockNames.includes(data.name) || mockEmails.includes(data.email)) {
        await deleteDoc(doc(db, 'teachers', docSnapshot.id));
        console.log(`Deleted mock teacher: ${data.name}`);
        deletedTeachers++;
      }
    }

    // Clean parents collection
    console.log('Cleaning parents collection...');
    const parentsRef = collection(db, 'parents');
    const parentsSnapshot = await getDocs(parentsRef);
    
    let deletedParents = 0;
    for (const docSnapshot of parentsSnapshot.docs) {
      const data = docSnapshot.data();
      if (mockNames.includes(data.name) || mockEmails.includes(data.email)) {
        await deleteDoc(doc(db, 'parents', docSnapshot.id));
        console.log(`Deleted mock parent: ${data.name}`);
        deletedParents++;
      }
    }

    console.log('\n=== Cleanup Summary ===');
    console.log(`Deleted ${deletedStudents} mock students`);
    console.log(`Deleted ${deletedTeachers} mock teachers`);
    console.log(`Deleted ${deletedParents} mock parents`);
    console.log('Mock data cleanup completed!');

  } catch (error) {
    console.error('Error cleaning mock data:', error);
  }
}

cleanMockData();
