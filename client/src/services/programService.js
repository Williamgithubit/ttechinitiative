import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Get all programs
const getPrograms = async () => {
  try {
    const programsRef = collection(db, 'programs');
    const q = query(programsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const programs = [];
    querySnapshot.forEach((doc) => {
      programs.push({ id: doc.id, ...doc.data() });
    });
    
    return programs;
  } catch (error) {
    console.error('Error getting programs:', error);
    throw error;
  }
};

// Get a single program by ID
const getProgramById = async (programId) => {
  try {
    const programRef = doc(db, 'programs', programId);
    const programSnap = await getDoc(programRef);
    
    if (!programSnap.exists()) {
      throw new Error('Program not found');
    }
    
    return { id: programSnap.id, ...programSnap.data() };
  } catch (error) {
    console.error('Error getting program:', error);
    throw error;
  }
};

// Create a new program
const createProgram = async (programData) => {
  try {
    const programsRef = collection(db, 'programs');
    const newProgram = {
      ...programData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: programData.status || 'draft',
      studentsCount: 0,
    };
    
    const docRef = await addDoc(programsRef, newProgram);
    return { id: docRef.id, ...newProgram };
  } catch (error) {
    console.error('Error creating program:', error);
    throw error;
  }
};

// Update an existing program
const updateProgram = async (programId, programData) => {
  try {
    const programRef = doc(db, 'programs', programId);
    const updatedData = {
      ...programData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(programRef, updatedData);
    
    // Return the updated program
    const updatedProgram = await getDoc(programRef);
    return { id: updatedProgram.id, ...updatedProgram.data() };
  } catch (error) {
    console.error('Error updating program:', error);
    throw error;
  }
};

// Delete a program
const deleteProgram = async (programId) => {
  try {
    // First, check if there are any enrollments for this program
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(enrollmentsRef, where('programId', '==', programId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Cannot delete program with active enrollments');
    }
    
    // If no enrollments, proceed with deletion
    const programRef = doc(db, 'programs', programId);
    await deleteDoc(programRef);
    
    return programId;
  } catch (error) {
    console.error('Error deleting program:', error);
    throw error;
  }
};

// Get programs by status
const getProgramsByStatus = async (status) => {
  try {
    const programsRef = collection(db, 'programs');
    const q = query(programsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const programs = [];
    querySnapshot.forEach((doc) => {
      programs.push({ id: doc.id, ...doc.data() });
    });
    
    return programs;
  } catch (error) {
    console.error(`Error getting ${status} programs:`, error);
    throw error;
  }
};

// Get featured programs
const getFeaturedPrograms = async () => {
  try {
    const programsRef = collection(db, 'programs');
    const q = query(
      programsRef, 
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const programs = [];
    querySnapshot.forEach((doc) => {
      programs.push({ id: doc.id, ...doc.data() });
    });
    
    return programs;
  } catch (error) {
    console.error('Error getting featured programs:', error);
    throw error;
  }
};

// Search programs by name or code
const searchPrograms = async (searchTerm) => {
  try {
    // Since Firestore doesn't support OR queries directly,
    // we'll perform two separate queries and combine the results
    const programsRef = collection(db, 'programs');
    
    // Query for name match
    const nameQuery = query(
      programsRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    
    // Query for code match
    const codeQuery = query(
      programsRef,
      where('code', '>=', searchTerm.toUpperCase()),
      where('code', '<=', searchTerm.toUpperCase() + '\uf8ff')
    );
    
    const [nameSnapshot, codeSnapshot] = await Promise.all([
      getDocs(nameQuery),
      getDocs(codeQuery)
    ]);
    
    // Combine and deduplicate results
    const programsMap = new Map();
    
    nameSnapshot.forEach(doc => {
      programsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    
    codeSnapshot.forEach(doc => {
      programsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });
    
    return Array.from(programsMap.values());
  } catch (error) {
    console.error('Error searching programs:', error);
    throw error;
  }
};

export {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramsByStatus,
  getFeaturedPrograms,
  searchPrograms,
};
