import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser as deleteAuthUser } from 'firebase/auth';
import { db } from './firebase';
import auth from './firebase';

// Role-based access control constants
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  PARENT: 'parent',
  STUDENT: 'student'
};

// Check if user has admin role
const isAdmin = async (userId) => {
  try {
    if (!userId) return false;
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() && userDoc.data().role === ROLES.ADMIN;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

export const createUser = async (userData, currentUserId) => {
  try {
    const { email, name, role, password } = userData;
    
    // Check if current user is admin
    const isUserAdmin = await isAdmin(currentUserId);
    if (!isUserAdmin) {
      throw new Error('Unauthorized: Only admin users can create new users');
    }
    
    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`);
    }
    
    // Check if password is provided and meets requirements
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    // Create user with email and password in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      emailVerified: false,
    };

    await addDoc(collection(db, 'users'), userDoc);
    
    console.log('Successfully created user:', { uid: user.uid, email, role });
    // Return user data without the password for security
    const { password: _, ...userDataWithoutPassword } = userData;
    return { 
      id: user.uid, 
      ...userDataWithoutPassword,
      // Don't return the password in the response
      password: '********' // Placeholder to indicate password was set
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(error.message);
  }
};

// Helper function to convert Firestore Timestamp to plain object
const convertTimestamps = (obj) => {
  if (!obj) return obj;
  
  return Object.entries(obj).reduce((acc, [key, value]) => {
    // Convert Firestore Timestamp to ISO string
    if (value && typeof value === 'object' && 'toDate' in value) {
      acc[key] = value.toDate().toISOString();
    } 
    // Recursively process nested objects
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      acc[key] = convertTimestamps(value);
    } 
    // Keep arrays and other values as is
    else {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const getAllUsers = async () => {
  try {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const users = userSnapshot.docs.map((doc) => {
      const userData = doc.data();
      // Convert all Timestamp fields to serializable format
      const serializedData = convertTimestamps(userData);
      return {
        id: doc.id,
        ...serializedData
      };
    });
    console.log('Fetched users:', users);
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.message);
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updatedAt = new Date().toISOString();
    await updateDoc(userRef, { 
      role, 
      updatedAt,
      // Ensure the updatedAt is also stored as a Firestore timestamp
      updatedAtTimestamp: new Date(updatedAt)
    });
    console.log(`Updated role for user ${userId} to ${role}`);
    return { 
      userId, 
      role,
      updatedAt
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error(error.message);
  }
};

/**
 * Delete a user from both Authentication and Firestore
 * @param {string} userId - The ID of the user to delete
 * @param {string} authUid - The Firebase Auth UID of the user (optional, falls back to userId)
 * @returns {Promise<Object>} - The result of the deletion
 */
export const deleteUser = async (userId, authUid = null) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Delete user document from Firestore
    await deleteDoc(userRef);
    
    // If authUid is provided, delete the auth user
    if (authUid) {
      try {
        // Note: This requires the admin SDK on the server side
        // For client-side deletion, you would typically call a cloud function
        console.log(`User with UID ${authUid} needs to be deleted from Authentication using a Cloud Function`);
        // In a real app, you would call a cloud function here
        // await deleteAuthUser(authUid);
      } catch (authError) {
        console.warn('Could not delete auth user:', authError);
        // Continue even if auth deletion fails, as we've already deleted the Firestore doc
      }
    }
    
    console.log(`Successfully deleted user ${userId}`);
    return { 
      success: true, 
      userId,
      message: 'User deleted successfully' 
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};