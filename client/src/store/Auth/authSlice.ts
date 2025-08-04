import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LoginCredentials, User, UserRole } from '@/types/auth';

// Define the auth state interface
interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  role: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

export const login = createAsyncThunk<
  User,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('Attempting to sign in with:', { email });
      
      // First, verify the user exists and the password is correct
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        const error = err as { code: string; message: string };
        console.error('Firebase Auth Error:', {
          code: error.code,
          message: error.message,
          email: email,
          timestamp: new Date().toISOString()
        });
        
        // Provide more specific error messages
        if (error.code === 'auth/user-not-found') {
          return rejectWithValue('No user found with this email address');
        } else if (error.code === 'auth/wrong-password') {
          return rejectWithValue('Incorrect password');
        } else if (error.code === 'auth/too-many-requests') {
          return rejectWithValue('Too many failed login attempts. Please try again later.');
        } else if (error.code === 'auth/user-disabled') {
          return rejectWithValue('This account has been disabled');
        } else {
          return rejectWithValue(`Authentication failed: ${error.message}`);
        }
      }
      
      const firebaseUser = userCredential.user;
      const userId = firebaseUser.uid;
      const userEmail = firebaseUser.email;

      if (!userEmail) {
        console.error('User email is missing after successful authentication');
        return rejectWithValue('User email is missing');
      }

      const { claims } = await firebaseUser.getIdTokenResult();
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.error('User document not found in Firestore');
        await firebaseSignOut(auth);
        return rejectWithValue('User data not found');
      }
      
      const userData = userDoc.data();

      // Helper function to convert Firebase Timestamp to Date string or return as is
      const convertTimestamps = <T>(obj: T): T => {
        if (!obj) return obj;
        
        // If it's a Firebase Timestamp
        if (typeof obj === 'object' && obj !== null && 'toDate' in obj && typeof (obj as { toDate: () => Date }).toDate === 'function') {
          return (obj as { toDate: () => Date }).toDate().toISOString() as unknown as T;
        }
        
        // If it's an array, process each item
        if (Array.isArray(obj)) {
          return obj.map(convertTimestamps) as unknown as T;
        }
        
        // If it's an object, process each property
        if (typeof obj === 'object' && obj !== null) {
          const result: Record<string, unknown> = {};
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              result[key] = convertTimestamps((obj as Record<string, unknown>)[key]);
            }
          }
          return result as T;
        }
        
        // Return primitives as-is
        return obj;
      };

      // Convert all timestamps in userData
      const processedUserData = convertTimestamps(userData);

      // Get role from claims or user data, default to 'student'
      const userRole = (claims.role as UserRole) || processedUserData.role || 'student';

      // Create a user object with all necessary fields
      const userUpdate: User = {
        id: userId,
        email: userEmail,
        name: processedUserData.name || firebaseUser.displayName || 'User',
        role: userRole,
        status: processedUserData.status || 'active',
        createdAt: processedUserData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(processedUserData.avatar && { avatar: processedUserData.avatar }),
        ...(processedUserData.phone && { phone: processedUserData.phone }),
        ...(processedUserData.address && { address: processedUserData.address }),
      };

      // Update the user document with the latest data
      await setDoc(userDocRef, userUpdate, { merge: true });

      return userUpdate;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.role = null;
      state.loading = false;
      state.isAuthenticated = false;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        console.log('Login pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('Login fulfilled with payload:', action.payload);
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.error = null;
        console.log('Updated auth state after login:', JSON.stringify({
          user: state.user ? { ...state.user, password: '***' } : null,
          role: state.role,
          isAuthenticated: state.isAuthenticated,
          loading: state.loading,
          error: state.error
        }, null, 2));
      })
      .addCase(login.rejected, (state, action) => {
        console.error('Login rejected:', action.payload || 'Unknown error');
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      });
  },
});

// Selectors
export const selectAuthState = (state: { auth: AuthState }) => state.auth;

export const selectCurrentUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

export const { clearUser, setError, clearError } = authSlice.actions;

export default authSlice.reducer;
