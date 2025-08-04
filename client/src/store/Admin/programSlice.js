import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';

// Helper function to convert Firestore data to plain JS objects
const convertTimestampsToDates = (data) => {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => convertTimestampsToDates(item));
  }
  
  // Handle primitive types
  if (typeof data !== 'object') {
    return data;
  }
  
  // Handle Firestore Timestamp - convert to ISO string and don't store raw
  if (data.toDate && typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }
  
  // Handle regular objects
  const result = {};
  
  Object.keys(data).forEach(key => {
    // Skip raw timestamp fields to avoid serialization issues
    if (key.endsWith('Raw')) {
      return;
    }
    
    const value = data[key];
    
    // Skip undefined values
    if (value === undefined) {
      return;
    }
    
    // Handle nested objects and arrays
    if (value !== null && typeof value === 'object') {
      result[key] = convertTimestampsToDates(value);
    } else {
      result[key] = value;
    }
  });
  
  return result;
};

// Async thunks
export const fetchPrograms = createAsyncThunk(
  'programs/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const programsRef = collection(db, 'programs');
      const q = query(programsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const programs = [];
      querySnapshot.forEach((doc) => {
        programs.push({ 
          id: doc.id, 
          ...convertTimestampsToDates(doc.data()) 
        });
      });
      
      return programs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProgramById = createAsyncThunk(
  'programs/fetchById',
  async (programId, { rejectWithValue }) => {
    try {
      const programRef = doc(db, 'programs', programId);
      const programSnap = await getDoc(programRef);
      
      if (!programSnap.exists()) {
        throw new Error('Program not found');
      }
      
      return { 
        id: programSnap.id, 
        ...convertTimestampsToDates(programSnap.data()) 
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProgram = createAsyncThunk(
  'programs/create',
  async (programData, { rejectWithValue }) => {
    try {
      const programsRef = collection(db, 'programs');
      const newProgram = {
        ...programData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: programData.status || 'draft',
        studentsCount: 0,
      };
      
      // Convert dates to Firestore timestamps
      if (newProgram.startDate && !(newProgram.startDate instanceof Date)) {
        newProgram.startDate = new Date(newProgram.startDate);
      }
      
      if (newProgram.endDate && !(newProgram.endDate instanceof Date)) {
        newProgram.endDate = new Date(newProgram.endDate);
      }
      
      const docRef = await addDoc(programsRef, newProgram);
      // Convert back to plain object with serializable dates
      const createdDoc = await getDoc(docRef);
      return { 
        id: docRef.id, 
        ...convertTimestampsToDates(createdDoc.data())
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProgram = createAsyncThunk(
  'programs/update',
  async ({ id, ...programData }, { rejectWithValue }) => {
    try {
      const programRef = doc(db, 'programs', id);
      const updatedData = {
        ...programData,
        updatedAt: serverTimestamp(),
      };
      
      // Convert dates to Firestore timestamps if they exist
      if (updatedData.startDate && !(updatedData.startDate instanceof Date)) {
        updatedData.startDate = new Date(updatedData.startDate);
      }
      
      if (updatedData.endDate && !(updatedData.endDate instanceof Date)) {
        updatedData.endDate = new Date(updatedData.endDate);
      }
      
      await updateDoc(programRef, updatedData);
      
      // Fetch the updated program to get the latest data
      const updatedProgram = await getDoc(programRef);
      return { 
        id: updatedProgram.id, 
        ...convertTimestampsToDates(updatedProgram.data()) 
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProgram = createAsyncThunk(
  'programs/delete',
  async (programId, { rejectWithValue }) => {
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
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const programSlice = createSlice({
  name: 'programs',
  initialState: {
    programs: [],
    currentProgram: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProgram: (state) => {
      state.currentProgram = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Programs
    builder
      .addCase(fetchPrograms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.loading = false;
        state.programs = action.payload;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Program By Id
      .addCase(fetchProgramById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgramById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProgram = action.payload;
      })
      .addCase(fetchProgramById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Program
      .addCase(createProgram.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProgram.fulfilled, (state, action) => {
        state.loading = false;
        state.programs.unshift(action.payload);
      })
      .addCase(createProgram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Program
      .addCase(updateProgram.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProgram.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.programs.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.programs[index] = action.payload;
        }
        state.currentProgram = action.payload;
      })
      .addCase(updateProgram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Program
      .addCase(deleteProgram.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProgram.fulfilled, (state, action) => {
        state.loading = false;
        state.programs = state.programs.filter(program => program.id !== action.payload);
        state.currentProgram = null;
      })
      .addCase(deleteProgram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProgram, clearError } = programSlice.actions;
export default programSlice.reducer;
