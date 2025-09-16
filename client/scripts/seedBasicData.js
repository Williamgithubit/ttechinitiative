import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
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

const subjects = [
  { name: 'Mathematics', code: 'MATH', description: 'Basic Mathematics', credits: 3 },
  { name: 'English', code: 'ENG', description: 'English Language and Literature', credits: 3 },
  { name: 'Science', code: 'SCI', description: 'General Science', credits: 3 },
  { name: 'History', code: 'HIST', description: 'World History', credits: 2 },
  { name: 'Computer Science', code: 'CS', description: 'Introduction to Computer Science', credits: 3 }
];

const classes = [
  {
    name: 'Grade 9A',
    grade: '9',
    section: 'A',
    capacity: 30,
    currentEnrollment: 0,
    subjects: [] // Will be filled after subjects are created
  },
  {
    name: 'Grade 10A',
    grade: '10',
    section: 'A',
    capacity: 30,
    currentEnrollment: 0,
    subjects: []
  },
  {
    name: 'Grade 11A',
    grade: '11',
    section: 'A',
    capacity: 25,
    currentEnrollment: 0,
    subjects: []
  }
];

async function seedData() {
  try {
    console.log('Starting to seed basic data...');

    // Check if subjects already exist
    const subjectsSnapshot = await getDocs(collection(db, 'subjects'));
    if (subjectsSnapshot.empty) {
      console.log('Creating subjects...');
      const subjectIds = [];
      for (const subject of subjects) {
        const docRef = await addDoc(collection(db, 'subjects'), subject);
        subjectIds.push(docRef.id);
        console.log(`Created subject: ${subject.name} with ID: ${docRef.id}`);
      }

      // Update classes with subject IDs
      console.log('Creating classes...');
      for (const classData of classes) {
        classData.subjects = subjectIds; // Assign all subjects to each class
        const docRef = await addDoc(collection(db, 'classes'), classData);
        console.log(`Created class: ${classData.name} with ID: ${docRef.id}`);
      }
    } else {
      console.log('Subjects already exist, skipping seed...');
      
      // Check if classes exist
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      if (classesSnapshot.empty) {
        console.log('Creating classes with existing subjects...');
        const subjectIds = subjectsSnapshot.docs.map(doc => doc.id);
        
        for (const classData of classes) {
          classData.subjects = subjectIds;
          const docRef = await addDoc(collection(db, 'classes'), classData);
          console.log(`Created class: ${classData.name} with ID: ${docRef.id}`);
        }
      } else {
        console.log('Classes already exist, skipping...');
      }
    }

    console.log('Basic data seeding completed!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();
