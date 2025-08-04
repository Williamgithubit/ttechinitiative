import { createApi } from '@reduxjs/toolkit/query/react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Custom Firebase query function
const firebaseBaseQuery = async ({ collection: collectionName, method = 'GET', data, query: queryFn }) => {
  try {
    const collectionRef = collection(db, collectionName);
    
    switch (method) {
      case 'GET':
        const q = queryFn ? query(collectionRef, ...queryFn) : collectionRef;
        const querySnapshot = await getDocs(q);
        return { data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
        
      case 'POST':
        const docRef = await addDoc(collectionRef, data);
        return { data: { id: docRef.id, ...data } };
        
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  } catch (error) {
    return { error };
  }
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: firebaseBaseQuery,
  tagTypes: ['Program'],
  endpoints: (builder) => ({
    getPrograms: builder.query({
      query: () => ({
        collection: 'programs',
        method: 'GET'
      }),
      providesTags: ['Program']
    }),
    
    getTeacherPrograms: builder.query({
      query: (teacherId) => ({
        collection: 'programs',
        method: 'GET',
        query: [where('teacherId', '==', teacherId)]
      }),
      providesTags: ['Program']
    }),
    
    addProgram: builder.mutation({
      query: (program) => ({
        collection: 'programs',
        method: 'POST',
        data: program
      }),
      invalidatesTags: ['Program']
    }),
    
    // Add more endpoints as needed
  }),
});

export const { 
  useGetProgramsQuery, 
  useGetTeacherProgramsQuery,
  useAddProgramMutation 
} = apiSlice;