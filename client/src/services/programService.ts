import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface Program {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft' | 'upcoming';
  startDate: string;
  endDate: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProgramData {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft' | 'upcoming';
  startDate: string;
  endDate: string;
}

export interface UpdateProgramData extends CreateProgramData {
  id: string;
}

const COLLECTION_NAME = 'programs';

// Get all programs
export const getPrograms = async (): Promise<Program[]> => {
  try {
    const programsQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(programsQuery);
    const programs: Program[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      programs.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      });
    });
    
    return programs;
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw new Error('Failed to fetch programs');
  }
};

// Get programs by status
export const getProgramsByStatus = async (status: string): Promise<Program[]> => {
  try {
    const programsQuery = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(programsQuery);
    const programs: Program[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      programs.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      });
    });
    
    return programs;
  } catch (error) {
    console.error('Error fetching programs by status:', error);
    throw new Error('Failed to fetch programs by status');
  }
};

// Create a new program
export const createProgram = async (programData: CreateProgramData): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...programData,
      createdAt: now,
      updatedAt: now,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating program:', error);
    throw new Error('Failed to create program');
  }
};

// Update an existing program
export const updateProgram = async (programData: UpdateProgramData): Promise<void> => {
  try {
    const { id, ...updateData } = programData;
    const programRef = doc(db, COLLECTION_NAME, id);
    
    await updateDoc(programRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating program:', error);
    throw new Error('Failed to update program');
  }
};

// Delete a program
export const deleteProgram = async (programId: string): Promise<void> => {
  try {
    const programRef = doc(db, COLLECTION_NAME, programId);
    await deleteDoc(programRef);
  } catch (error) {
    console.error('Error deleting program:', error);
    throw new Error('Failed to delete program');
  }
};

// Get program statistics
export const getProgramStats = async () => {
  try {
    const programs = await getPrograms();
    
    const stats = {
      total: programs.length,
      active: programs.filter(p => p.status === 'active').length,
      inactive: programs.filter(p => p.status === 'inactive').length,
      draft: programs.filter(p => p.status === 'draft').length,
      upcoming: programs.filter(p => p.status === 'upcoming').length,
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting program stats:', error);
    throw new Error('Failed to get program statistics');
  }
};
