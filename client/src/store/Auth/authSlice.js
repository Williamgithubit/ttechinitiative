import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import auth, { db } from '../../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const userEmail = userCredential.user.email;

      console.log('=== LOGIN START ===');
      console.log('User logged in:', { userId, email: userEmail });

      const { claims } = await auth.currentUser.getIdTokenResult();
      console.log('Custom claims:', claims);

      const userDocRef = doc(db, 'users', userId);
      console.log('Fetching user document from Firestore...');
      const userDoc = await getDoc(userDocRef);
      let userData = userDoc.exists() ? userDoc.data() : null;
      console.log('Initial user data from Firestore:', userData);

      const userRole = claims.role || userData?.role || 'user';
      console.log('Determined user role:', userRole);

      const userUpdate = {
        email: userEmail,
        name: userCredential.user.displayName || userData?.name || 'User',
        photoURL: userCredential.user.photoURL || userData?.photoURL || '',
        role: userRole,
        status: 'active',
        updatedAt: serverTimestamp(),
      };

      if (!userDoc.exists()) {
        userUpdate.createdAt = serverTimestamp();
        console.log('Creating new user document with role:', userRole);
      } else if (!userData?.role) {
        console.log('Updating existing user document with role:', userRole);
      }

      await setDoc(userDocRef, userUpdate, { merge: true });
      console.log('User document saved with data:', userUpdate);

      const updatedDoc = await getDoc(userDocRef);
      const updatedUserData = updatedDoc.exists() ? updatedDoc.data() : null;
      console.log('Verified user data after save:', updatedUserData);

      const result = {
        uid: userId,
        email: userEmail,
        name: userCredential.user.displayName || updatedUserData?.name || 'User',
        photoURL: userCredential.user.photoURL || updatedUserData?.photoURL || '',
        role: userRole,
        status: updatedUserData?.status || 'active',
      };

      console.log('=== LOGIN COMPLETE ===');
      console.log('Returning user data:', result);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            console.log('=== INITIALIZE AUTH START ===');
            console.log('User detected:', firebaseUser.uid);

            const { claims } = await firebaseUser.getIdTokenResult();
            console.log('Custom claims:', claims);

            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.exists() ? userDoc.data() : null;
            console.log('Firestore user data:', userData);

            const userRole = claims.role || userData?.role || 'user';
            console.log('Determined user role:', userRole);

            const result = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || userData?.name || 'User',
              photoURL: firebaseUser.photoURL || userData?.photoURL || '',
              role: userRole,
              status: userData?.status || 'active',
            };

            console.log('=== INITIALIZE AUTH COMPLETE ===');
            console.log('Returning user data:', result);
            resolve(result);
          } else {
            console.log('No user authenticated');
            dispatch(clearUser()); // Explicitly clear state
            reject(null);
          }
          unsubscribe();
        }, (error) => {
          console.error('Auth state error:', error);
          dispatch(clearUser());
          reject(rejectWithValue(error.message));
        });
      });
    } catch (error) {
      console.error('Initialize auth error:', error);
      dispatch(clearUser());
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);
      console.log('Sign out successful');
      dispatch(clearUser()); // Ensure state is cleared
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  role: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.loading = false;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.role = null;
      state.loading = false;
      state.isAuthenticated = false;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
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
        console.log('Login fulfilled - updating state with:', action.payload);
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        console.error('Login rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(initializeAuth.pending, (state) => {
        console.log('Initialize auth pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        console.log('Initialize auth fulfilled - updating state with:', action.payload);
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        console.log('Initialize auth rejected:', action.payload);
        state.loading = false;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(signOut.pending, (state) => {
        console.log('Sign out pending...');
        state.loading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        console.log('Sign out fulfilled - clearing state...');
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        console.error('Sign out rejected:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectAuthState = (state) => state.auth;

export const selectCurrentUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectUser = createSelector(
  [selectCurrentUser, selectAuthState],
  (user, auth) => ({
    ...user,
    role: auth.role,
  })
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

export const { setUser, clearUser, setError, clearError } = authSlice.actions;

export default authSlice.reducer;