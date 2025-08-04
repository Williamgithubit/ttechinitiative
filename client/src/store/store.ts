// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { combineReducers } from 'redux';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

// Import reducers
import authReducer from './Auth/authSlice';
import userManagementReducer from './Admin/userManagementSlice';
import programReducer from './Admin/programSlice';
import { apiSlice } from './apiSlice';
import { userManagementApi } from './Admin/userManagementApi';

// Create a no-op storage for server-side rendering
const createNoopStorage = () => {
  return {
    getItem(_key: string): Promise<string | null> {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string): Promise<string> {
      return Promise.resolve(value);
    },
    removeItem(_key: string): Promise<void> {
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  userManagement: userManagementReducer,
  program: programReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  [userManagementApi.reducerPath]: userManagementApi.reducer,
});

// Persist config
const persistConfig = {
  key: 'auth',
  version: 1,
  storage,
  // Add any reducers you want to persist here
  whitelist: ['auth'], // Only persist the auth reducer
  // Add any reducers you want to blacklist here
  blacklist: [apiSlice.reducerPath, userManagementApi.reducerPath],
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with proper typing
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
    .concat(apiSlice.middleware)
    .concat(userManagementApi.middleware),
});

// Create persistor
export const persistor = persistStore(store);

// Export store methods
export const getState = store.getState;
export const dispatch = store.dispatch;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export a hook that can be reused to resolve types
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = <T>(
  selector: (state: RootState) => T
) => {
  return useSelector(selector);
};

// Export types for the store and persistor
export type AppStore = typeof store;
export type AppState = ReturnType<AppStore['getState']>;