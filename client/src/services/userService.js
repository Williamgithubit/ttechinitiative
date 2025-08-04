import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get a user's role from Firestore
 * @param {string} userId - The user's UID
 * @returns {Promise<string>} The user's role
 */
export const getUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().role || 'student'; // Default to 'student' if role not set
    }
    // If user document doesn't exist, create it with default role
    await setDoc(doc(db, 'users', userId), {
      role: 'student',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return 'student';
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
};

/**
 * Update a user's role in Firestore
 * @param {string} userId - The user's UID
 * @param {string} role - The new role
 * @returns {Promise<void>}
 */
export const updateUserRole = async (userId, role) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Get user profile data
 * @param {string} userId - The user's UID
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update user profile data
 * @param {string} userId - The user's UID
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
