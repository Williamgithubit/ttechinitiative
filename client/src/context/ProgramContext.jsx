import { createContext, useContext, useEffect, useState } from 'react';
import { useGetProgramsQuery } from '../store/apiSlice';
import { useAuth } from './AuthContext';

const ProgramContext = createContext();

export const ProgramProvider = ({ children }) => {
  const { user } = useAuth();
  const { data: allPrograms = [], isLoading, error, refetch } = useGetProgramsQuery();
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);

  // In a real app, you would fetch the user's enrolled programs from Firestore
  useEffect(() => {
    if (user) {
      // Simulate fetching enrolled programs for the current user
      // In a real app, you would query Firestore for the user's enrolled programs
      const userPrograms = allPrograms.filter(program => 
        program.enrolledStudents?.includes(user.uid)
      );
      setEnrolledPrograms(userPrograms);
    }
  }, [user, allPrograms]);

  const enrollInProgram = async (programId) => {
    try {
      // In a real app, you would update Firestore to add the user to the program's enrolledStudents
      console.log(`Enrolling user ${user.uid} in program ${programId}`);
      // After successful enrollment, refetch programs
      await refetch();
    } catch (error) {
      console.error('Error enrolling in program:', error);
      throw error;
    }
  };

  const value = {
    programs: allPrograms,
    enrolledPrograms,
    isLoading,
    error,
    enrollInProgram,
    refetchPrograms: refetch
  };

  return (
    <ProgramContext.Provider value={value}>
      {children}
    </ProgramContext.Provider>
  );
};

export const usePrograms = () => {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error('usePrograms must be used within a ProgramProvider');
  }
  return context;
};

export default ProgramContext;
