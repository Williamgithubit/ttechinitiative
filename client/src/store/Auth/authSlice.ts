import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
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

// Initial state
const initialState: AuthState = {
  user: null,
  role: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

// Initialize auth state listener
export const initializeAuth = createAsyncThunk<
  { user: User | null; isAuthenticated: boolean },
  void,
  { rejectValue: string }
>(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      return new Promise<{ user: User | null; isAuthenticated: boolean }>((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              // User is signed in
              const userId = firebaseUser.uid;
              const userEmail = firebaseUser.email;

              if (!userEmail) {
                console.error('User email is missing during auth state change');
                resolve({ user: null, isAuthenticated: false });
                return;
              }

              const { claims } = await firebaseUser.getIdTokenResult();
              const userDocRef = doc(db, 'users', userId);
              const userDoc = await getDoc(userDocRef);
              
              if (!userDoc.exists()) {
                console.error('User document not found in Firestore during auth state change');
                await firebaseSignOut(auth);
                resolve({ user: null, isAuthenticated: false });
                return;
              }
              
              const userData = userDoc.data();
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

              console.log('Auth state changed - user authenticated:', userUpdate);
              resolve({ user: userUpdate, isAuthenticated: true });
            } else {
              // User is signed out
              console.log('Auth state changed - user signed out');
              resolve({ user: null, isAuthenticated: false });
            }
          } catch (error) {
            console.error('Error in auth state listener:', error);
            reject(error);
          }
        });

        // Store the unsubscribe function for cleanup if needed
        // In a real app, you might want to store this in the component that calls initializeAuth
      });
    } catch (error) {
      console.error('Initialize auth error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Auth initialization failed');
    }
  }
);

// Logout async thunk
export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Logging out user...');
      await firebaseSignOut(auth);
      console.log('Firebase logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  }
);

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

// Update user profile async thunk
export const updateUser = createAsyncThunk<
  User,
  Partial<User>,
  { rejectValue: string }
>(
  'auth/updateUser',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentUser = state.auth.user;
      
      if (!currentUser) {
        return rejectWithValue('No authenticated user found');
      }

      // Update user document in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...userData,
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(userDocRef, updateData, { merge: true });
      
      // Return the updated user object
      const updatedUser: User = {
        ...currentUser,
        ...updateData,
      };
      
      console.log('User profile updated successfully:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Update failed');
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
      .addCase(initializeAuth.pending, (state) => {
        console.log('Auth initialization pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        console.log('Auth initialization fulfilled:', action.payload);
        state.loading = false;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.role = action.payload.user.role;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.role = null;
          state.isAuthenticated = false;
        }
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        console.error('Auth initialization rejected');
        state.loading = false;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.error = null;
      })
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
      })
      .addCase(logout.pending, (state) => {
        console.log('Logout pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        console.log('Logout fulfilled');
        state.loading = false;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        console.error('Logout rejected:', action.payload || 'Unknown error');
        state.loading = false;
        state.error = action.payload || 'Logout failed';
        // Still clear user data even if logout fails
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      })
      .addCase(updateUser.pending, (state) => {
        console.log('Update user pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        console.log('Update user fulfilled:', action.payload);
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.role;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        console.error('Update user rejected:', action.payload || 'Unknown error');
        state.loading = false;
        state.error = action.payload || 'Update failed';
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
