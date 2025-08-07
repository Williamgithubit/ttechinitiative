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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Course, CreateCourseData, UpdateCourseData } from '@/types/course';

export class CourseService {
  private static readonly COLLECTION_NAME = 'courses';

  // Get all courses for a specific teacher
  static async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    try {
      const coursesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        coursesRef, 
        where('teacherId', '==', teacherId)
      );
      
      const querySnapshot = await getDocs(q);
      const courses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
      
      // Sort by createdAt descending (client-side to avoid Firebase index requirement)
      return courses.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 
                     (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 
                     (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      throw error;
    }
  }

  // Get active courses for a specific teacher
  static async getActiveCoursesByTeacher(teacherId: string): Promise<Course[]> {
    try {
      const coursesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        coursesRef, 
        where('teacherId', '==', teacherId),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
    } catch (error) {
      console.error('Error fetching active teacher courses:', error);
      throw error;
    }
  }

  // Get a single course by ID
  static async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const courseDoc = await getDoc(doc(db, this.COLLECTION_NAME, courseId));
      if (courseDoc.exists()) {
        return {
          id: courseDoc.id,
          ...courseDoc.data()
        } as Course;
      }
      return null;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  // Create a new course
  static async createCourse(teacherId: string, teacherName: string, courseData: CreateCourseData): Promise<string> {
    try {
      const now = Timestamp.now();
      const newCourse = {
        ...courseData,
        teacherId,
        teacherName,
        status: 'active' as const,
        enrollmentCount: 0,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newCourse);
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // Update an existing course
  static async updateCourse(courseId: string, updates: UpdateCourseData): Promise<void> {
    try {
      const courseRef = doc(db, this.COLLECTION_NAME, courseId);
      await updateDoc(courseRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  // Delete a course
  static async deleteCourse(courseId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Get all courses (for admin purposes)
  static async getAllCourses(): Promise<Course[]> {
    try {
      const coursesRef = collection(db, this.COLLECTION_NAME);
      // Simplified query to avoid Firebase index requirement
      const q = query(coursesRef);
      
      const querySnapshot = await getDocs(q);
      let courses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
      
      // Sort by createdAt on client side to avoid index requirement
      courses.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 
                     (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds * 1000 : 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 
                     (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds * 1000 : 0;
        return bTime - aTime; // descending order
      });
      
      return courses;
    } catch (error) {
      console.error('Error fetching all courses:', error);
      // Return empty array instead of throwing to prevent component crash
      return [];
    }
  }

  // Alias for getAllCourses for consistency
  static async getCourses(): Promise<Course[]> {
    return this.getAllCourses();
  }

  // Update enrollment count
  static async updateEnrollmentCount(courseId: string, count: number): Promise<void> {
    try {
      const courseRef = doc(db, this.COLLECTION_NAME, courseId);
      await updateDoc(courseRef, {
        enrollmentCount: count,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating enrollment count:', error);
      throw error;
    }
  }

  // Seed sample course data for a teacher
  static async seedSampleCourses(teacherId: string, teacherName: string): Promise<string[]> {
    try {
      const currentYear = new Date().getFullYear();
      const currentSemester = new Date().getMonth() < 6 ? 'Spring' : 'Fall';
      
      const sampleCourses: CreateCourseData[] = [
        {
          name: 'Algebra Basics',
          description: 'Introduction to algebraic concepts and problem-solving techniques',
          code: 'MATH101',
          subject: 'Mathematics',
          grade: '9th Grade',
          semester: currentSemester,
          year: currentYear,
          maxEnrollment: 25,
          schedule: {
            days: ['Monday', 'Wednesday', 'Friday'],
            startTime: '09:00',
            endTime: '10:00',
            room: 'Room 201'
          }
        },
        {
          name: 'English Literature',
          description: 'Exploring classic and contemporary literature',
          code: 'ENG201',
          subject: 'English',
          grade: '10th Grade',
          semester: currentSemester,
          year: currentYear,
          maxEnrollment: 20,
          schedule: {
            days: ['Tuesday', 'Thursday'],
            startTime: '10:30',
            endTime: '12:00',
            room: 'Room 105'
          }
        },
        {
          name: 'Biology Fundamentals',
          description: 'Basic principles of biology and life sciences',
          code: 'SCI301',
          subject: 'Science',
          grade: '11th Grade',
          semester: currentSemester,
          year: currentYear,
          maxEnrollment: 22,
          schedule: {
            days: ['Monday', 'Wednesday', 'Friday'],
            startTime: '13:00',
            endTime: '14:30',
            room: 'Lab 3'
          }
        }
      ];

      const batch = writeBatch(db);
      const courseIds: string[] = [];

      for (const courseData of sampleCourses) {
        const courseRef = doc(collection(db, this.COLLECTION_NAME));
        const now = Timestamp.now();
        
        batch.set(courseRef, {
          ...courseData,
          teacherId,
          teacherName,
          status: 'active',
          enrollmentCount: Math.floor(Math.random() * (courseData.maxEnrollment! - 5)) + 5, // Random enrollment
          createdAt: now,
          updatedAt: now
        });
        
        courseIds.push(courseRef.id);
      }

      await batch.commit();
      return courseIds;
    } catch (error) {
      console.error('Error seeding sample courses:', error);
      throw error;
    }
  }
}
