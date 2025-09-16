// src/store/Admin/subjectClassSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Timestamp } from 'firebase/firestore';
import { 
  Subject, 
  Class, 
  Teacher, 
  Student 
} from '@/services/userManagementService';
import { 
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  fetchClasses,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass
} from '@/services/subjectClassService';

// Helper function to serialize Firebase Timestamps
const serializeTimestamp = (timestamp: any) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

// Helper function to serialize objects with timestamps
const serializeObject = (obj: any) => {
  if (!obj) return obj;
  
  const serialized = { ...obj };
  
  // Convert Firebase Timestamps to ISO strings
  if (serialized.createdAt) {
    serialized.createdAt = serializeTimestamp(serialized.createdAt);
  }
  if (serialized.updatedAt) {
    serialized.updatedAt = serializeTimestamp(serialized.updatedAt);
  }
  
  // Handle nested teacher object
  if (serialized.teacher) {
    serialized.teacher = serializeObject(serialized.teacher);
  }
  
  // Handle nested students array
  if (serialized.students && Array.isArray(serialized.students)) {
    serialized.students = serialized.students.map((student: any) => serializeObject(student));
  }
  
  return serialized;
};

// Extended interfaces for Redux state
export interface SubjectWithTeacher extends Subject {
  teacher?: Teacher;
}

export interface ClassWithStudents extends Class {
  students: Student[];
}

export interface SubjectClassState {
  subjects: SubjectWithTeacher[];
  classes: ClassWithStudents[];
  teachers: Teacher[];
  students: Student[];
  loading: {
    subjects: boolean;
    classes: boolean;
    teachers: boolean;
    students: boolean;
  };
  error: {
    subjects: string | null;
    classes: string | null;
    teachers: string | null;
    students: string | null;
  };
  searchTerm: string;
  selectedTab: 'subjects' | 'classes';
}

const initialState: SubjectClassState = {
  subjects: [],
  classes: [],
  teachers: [],
  students: [],
  loading: {
    subjects: false,
    classes: false,
    teachers: false,
    students: false,
  },
  error: {
    subjects: null,
    classes: null,
    teachers: null,
    students: null,
  },
  searchTerm: '',
  selectedTab: 'subjects',
};

// Async thunks for subjects
export const fetchSubjectsAsync = createAsyncThunk(
  'subjectClass/fetchSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const subjects = await fetchSubjects();
      return subjects.map(subject => serializeObject(subject));
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch subjects');
    }
  }
);

export const createSubjectAsync = createAsyncThunk(
  'subjectClass/createSubject',
  async (subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const subject = await createSubject(subjectData);
      return serializeObject(subject);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create subject');
    }
  }
);

export const updateSubjectAsync = createAsyncThunk(
  'subjectClass/updateSubject',
  async ({ id, data }: { id: string; data: Partial<Subject> }, { rejectWithValue }) => {
    try {
      const subject = await updateSubject(id, data);
      return serializeObject(subject);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update subject');
    }
  }
);

export const deleteSubjectAsync = createAsyncThunk(
  'subjectClass/deleteSubject',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteSubject(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete subject');
    }
  }
);

// Async thunks for classes
export const fetchClassesAsync = createAsyncThunk(
  'subjectClass/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const classes = await fetchClasses();
      return classes.map(cls => serializeObject(cls));
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch classes');
    }
  }
);

export const createClassAsync = createAsyncThunk(
  'subjectClass/createClass',
  async (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt' | 'currentEnrollment'>, { rejectWithValue }) => {
    try {
      const cls = await createClass(classData);
      return serializeObject(cls);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create class');
    }
  }
);

export const updateClassAsync = createAsyncThunk(
  'subjectClass/updateClass',
  async ({ id, data }: { id: string; data: Partial<Class> }, { rejectWithValue }) => {
    try {
      const cls = await updateClass(id, data);
      return serializeObject(cls);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update class');
    }
  }
);

export const deleteClassAsync = createAsyncThunk(
  'subjectClass/deleteClass',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteClass(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete class');
    }
  }
);

export const addStudentToClassAsync = createAsyncThunk(
  'subjectClass/addStudentToClass',
  async ({ classId, studentId }: { classId: string; studentId: string }, { rejectWithValue }) => {
    try {
      const cls = await addStudentToClass(classId, studentId);
      return serializeObject(cls);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add student to class');
    }
  }
);

export const removeStudentFromClassAsync = createAsyncThunk(
  'subjectClass/removeStudentFromClass',
  async ({ classId, studentId }: { classId: string; studentId: string }, { rejectWithValue }) => {
    try {
      const cls = await removeStudentFromClass(classId, studentId);
      return serializeObject(cls);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove student from class');
    }
  }
);

const subjectClassSlice = createSlice({
  name: 'subjectClass',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedTab: (state, action: PayloadAction<'subjects' | 'classes'>) => {
      state.selectedTab = action.payload;
    },
    clearErrors: (state) => {
      state.error = {
        subjects: null,
        classes: null,
        teachers: null,
        students: null,
      };
    },
    setTeachers: (state, action: PayloadAction<Teacher[]>) => {
      state.teachers = action.payload;
    },
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Subjects
    builder
      .addCase(fetchSubjectsAsync.pending, (state) => {
        state.loading.subjects = true;
        state.error.subjects = null;
      })
      .addCase(fetchSubjectsAsync.fulfilled, (state, action) => {
        state.loading.subjects = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjectsAsync.rejected, (state, action) => {
        state.loading.subjects = false;
        state.error.subjects = action.payload as string;
      })
      .addCase(createSubjectAsync.pending, (state) => {
        state.loading.subjects = true;
        state.error.subjects = null;
      })
      .addCase(createSubjectAsync.fulfilled, (state, action) => {
        state.loading.subjects = false;
        state.subjects.push(action.payload);
      })
      .addCase(createSubjectAsync.rejected, (state, action) => {
        state.loading.subjects = false;
        state.error.subjects = action.payload as string;
      })
      .addCase(updateSubjectAsync.pending, (state) => {
        state.loading.subjects = true;
        state.error.subjects = null;
      })
      .addCase(updateSubjectAsync.fulfilled, (state, action) => {
        state.loading.subjects = false;
        const index = state.subjects.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.subjects[index] = action.payload;
        }
      })
      .addCase(updateSubjectAsync.rejected, (state, action) => {
        state.loading.subjects = false;
        state.error.subjects = action.payload as string;
      })
      .addCase(deleteSubjectAsync.pending, (state) => {
        state.loading.subjects = true;
        state.error.subjects = null;
      })
      .addCase(deleteSubjectAsync.fulfilled, (state, action) => {
        state.loading.subjects = false;
        state.subjects = state.subjects.filter(s => s.id !== action.payload);
      })
      .addCase(deleteSubjectAsync.rejected, (state, action) => {
        state.loading.subjects = false;
        state.error.subjects = action.payload as string;
      })
      // Classes
      .addCase(fetchClassesAsync.pending, (state) => {
        state.loading.classes = true;
        state.error.classes = null;
      })
      .addCase(fetchClassesAsync.fulfilled, (state, action) => {
        state.loading.classes = false;
        state.classes = action.payload;
      })
      .addCase(fetchClassesAsync.rejected, (state, action) => {
        state.loading.classes = false;
        state.error.classes = action.payload as string;
      })
      .addCase(createClassAsync.pending, (state) => {
        state.loading.classes = true;
        state.error.classes = null;
      })
      .addCase(createClassAsync.fulfilled, (state, action) => {
        state.loading.classes = false;
        state.classes.push(action.payload);
      })
      .addCase(createClassAsync.rejected, (state, action) => {
        state.loading.classes = false;
        state.error.classes = action.payload as string;
      })
      .addCase(updateClassAsync.pending, (state) => {
        state.loading.classes = true;
        state.error.classes = null;
      })
      .addCase(updateClassAsync.fulfilled, (state, action) => {
        state.loading.classes = false;
        const index = state.classes.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.classes[index] = action.payload;
        }
      })
      .addCase(updateClassAsync.rejected, (state, action) => {
        state.loading.classes = false;
        state.error.classes = action.payload as string;
      })
      .addCase(deleteClassAsync.pending, (state) => {
        state.loading.classes = true;
        state.error.classes = null;
      })
      .addCase(deleteClassAsync.fulfilled, (state, action) => {
        state.loading.classes = false;
        state.classes = state.classes.filter(c => c.id !== action.payload);
      })
      .addCase(deleteClassAsync.rejected, (state, action) => {
        state.loading.classes = false;
        state.error.classes = action.payload as string;
      })
      .addCase(addStudentToClassAsync.fulfilled, (state, action) => {
        const classIndex = state.classes.findIndex(c => c.id === action.payload.id);
        if (classIndex !== -1) {
          state.classes[classIndex] = action.payload;
        }
      })
      .addCase(removeStudentFromClassAsync.fulfilled, (state, action) => {
        const classIndex = state.classes.findIndex(c => c.id === action.payload.id);
        if (classIndex !== -1) {
          state.classes[classIndex] = action.payload;
        }
      });
  },
});

export const { 
  setSearchTerm, 
  setSelectedTab, 
  clearErrors, 
  setTeachers, 
  setStudents 
} = subjectClassSlice.actions;

export default subjectClassSlice.reducer;
