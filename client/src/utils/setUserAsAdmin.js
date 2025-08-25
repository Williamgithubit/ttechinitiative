// Utility script to set a user as admin in Firestore
// Run this in your browser console or as a Node.js script

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// Replace 'YOUR_USER_ID' with your actual Firebase Auth user ID
const setUserAsAdmin = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'admin'
    });
    console.log('User role updated to admin successfully!');
  } catch (error) {
    console.error('Error updating user role:', error);
  }
};

// Usage: setUserAsAdmin('your-firebase-user-id');
export { setUserAsAdmin };
