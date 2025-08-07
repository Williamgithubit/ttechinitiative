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
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Student, StudentProfile, StudentPerformance, ActivityLog, TeacherNote } from '@/types/student';

const STUDENTS_COLLECTION = 'students';
const PERFORMANCE_COLLECTION = 'studentPerformance';
const ACTIVITY_LOGS_COLLECTION = 'activityLogs';
const TEACHER_NOTES_COLLECTION = 'teacherNotes';

export class StudentService {
  // Get all students
  static async getStudents(): Promise<Student[]> {
    try {
      const studentsRef = collection(db, STUDENTS_COLLECTION);
      // Simplified query to avoid Firebase index requirement
      const q = query(
        studentsRef,
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      let students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Student));
      
      // Sort by name on client side to avoid index requirement
      students.sort((a, b) => a.name.localeCompare(b.name));
      
      return students;
    } catch (error) {
      console.error('Error fetching students:', error);
      // Return empty array instead of throwing to prevent component crash
      return [];
    }
  }

  // Get all students for a teacher's courses
  static async getStudentsByCourses(courseIds: string[]): Promise<Student[]> {
    try {
      if (courseIds.length === 0) return [];
      
      const studentsRef = collection(db, STUDENTS_COLLECTION);
      // Use simpler query to avoid composite index requirement
      const q = query(
        studentsRef,
        where('enrolledCourses', 'array-contains-any', courseIds)
      );
      
      const snapshot = await getDocs(q);
      const students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Student));
      
      // Filter and sort on client side to avoid index requirements
      return students
        .filter(student => student.status === 'active')
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  // Get detailed student profile
  static async getStudentProfile(studentId: string): Promise<StudentProfile | null> {
    try {
      const studentDoc = await getDoc(doc(db, STUDENTS_COLLECTION, studentId));
      if (!studentDoc.exists()) return null;

      const student = { id: studentDoc.id, ...studentDoc.data() } as Student;

      // Get performance data
      const performanceQuery = query(
        collection(db, PERFORMANCE_COLLECTION),
        where('studentId', '==', studentId)
      );
      const performanceSnapshot = await getDocs(performanceQuery);
      const performance = performanceSnapshot.docs.map(doc => ({
        ...doc.data()
      } as StudentPerformance));

      // Get recent activity
      const activityQuery = query(
        collection(db, ACTIVITY_LOGS_COLLECTION),
        where('studentId', '==', studentId),
        limit(20)
      );
      const activitySnapshot = await getDocs(activityQuery);
      const recentActivity = activitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ActivityLog))
      .sort((a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : 
                     (a.timestamp as any)?.seconds ? (a.timestamp as any).seconds * 1000 : 0;
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : 
                     (b.timestamp as any)?.seconds ? (b.timestamp as any).seconds * 1000 : 0;
        return bTime - aTime; // descending order
      });

      // Get teacher notes
      const notesQuery = query(
        collection(db, TEACHER_NOTES_COLLECTION),
        where('studentId', '==', studentId)
      );
      const notesSnapshot = await getDocs(notesQuery);
      const notes = notesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TeacherNote))
      .sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 
                     (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 
                     (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 0;
        return bTime - aTime; // descending order
      });

      return {
        ...student,
        performance,
        recentActivity,
        notes
      };
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    }
  }

  // Update student information
  static async updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
    try {
      const studentRef = doc(db, STUDENTS_COLLECTION, studentId);
      await updateDoc(studentRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  // Add teacher note
  static async addTeacherNote(note: Omit<TeacherNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const notesRef = collection(db, TEACHER_NOTES_COLLECTION);
      const docRef = await addDoc(notesRef, {
        ...note,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding teacher note:', error);
      throw error;
    }
  }

  // Update teacher note
  static async updateTeacherNote(noteId: string, updates: Partial<TeacherNote>): Promise<void> {
    try {
      const noteRef = doc(db, TEACHER_NOTES_COLLECTION, noteId);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating teacher note:', error);
      throw error;
    }
  }

  // Delete teacher note
  static async deleteTeacherNote(noteId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, TEACHER_NOTES_COLLECTION, noteId));
    } catch (error) {
      console.error('Error deleting teacher note:', error);
      throw error;
    }
  }

  // Log student activity
  static async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const activityRef = collection(db, ACTIVITY_LOGS_COLLECTION);
      await addDoc(activityRef, {
        ...activity,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  // Get student performance for a specific course
  static async getStudentPerformance(studentId: string, courseId: string): Promise<StudentPerformance | null> {
    try {
      const performanceQuery = query(
        collection(db, PERFORMANCE_COLLECTION),
        where('studentId', '==', studentId),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(performanceQuery);
      
      if (snapshot.empty) return null;
      
      return snapshot.docs[0].data() as StudentPerformance;
    } catch (error) {
      console.error('Error fetching student performance:', error);
      throw error;
    }
  }

  // Search students by name or email
  static async searchStudents(searchTerm: string, courseIds: string[]): Promise<Student[]> {
    try {
      const studentsRef = collection(db, STUDENTS_COLLECTION);
      const q = query(
        studentsRef,
        where('enrolledCourses', 'array-contains-any', courseIds)
      );
      
      const snapshot = await getDocs(q);
      const students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Student));

      // Filter by search term and sort alphabetically (client-side)
      const searchLower = searchTerm.toLowerCase();
      return students
        .filter(student => 
          student.name.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower)
        )
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  }

  // Create sample student data for testing
  static async createSampleStudents(courseIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      const studentsRef = collection(db, STUDENTS_COLLECTION);

      const sampleStudents = [
        {
          uid: 'student1',
          name: 'Alice Johnson',
          email: 'alice.johnson@student.edu',
          enrolledCourses: courseIds.slice(0, 2),
          grade: '10th',
          parentContact: {
            name: 'Robert Johnson',
            email: 'robert.johnson@email.com',
            phone: '(555) 123-4567'
          },
          status: 'active' as const,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          uid: 'student2',
          name: 'Bob Smith',
          email: 'bob.smith@student.edu',
          enrolledCourses: courseIds,
          grade: '11th',
          parentContact: {
            name: 'Sarah Smith',
            email: 'sarah.smith@email.com',
            phone: '(555) 234-5678'
          },
          status: 'active' as const,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        {
          uid: 'student3',
          name: 'Carol Davis',
          email: 'carol.davis@student.edu',
          enrolledCourses: [courseIds[0]],
          grade: '9th',
          parentContact: {
            name: 'Michael Davis',
            email: 'michael.davis@email.com',
            phone: '(555) 345-6789'
          },
          status: 'active' as const,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      ];

      sampleStudents.forEach((student) => {
        const docRef = doc(studentsRef);
        batch.set(docRef, student);
      });

      await batch.commit();
      console.log('Sample students created successfully');
    } catch (error) {
      console.error('Error creating sample students:', error);
      throw error;
    }
  }
}
