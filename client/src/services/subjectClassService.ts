// src/services/subjectClassService.ts
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
  writeBatch,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Subject, 
  Class, 
  Teacher, 
  Student 
} from './userManagementService';

// Extended interfaces for the service
export interface SubjectWithTeacher extends Subject {
  teacher?: Teacher;
}

export interface ClassWithStudents extends Class {
  students: Student[];
}

class SubjectClassService {
  private subjectsCollection = collection(db, 'subjects');
  private classesCollection = collection(db, 'classes');
  private teachersCollection = collection(db, 'teachers');
  private studentsCollection = collection(db, 'students');

  // Subject CRUD operations
  async fetchSubjects(): Promise<SubjectWithTeacher[]> {
    try {
      const subjectsQuery = query(this.subjectsCollection, orderBy('name'));
      const subjectsSnapshot = await getDocs(subjectsQuery);
      
      const subjects: SubjectWithTeacher[] = [];
      
      for (const subjectDoc of subjectsSnapshot.docs) {
        const subjectData = { id: subjectDoc.id, ...subjectDoc.data() } as Subject;
        
        // Fetch teacher details if assigned
        let teacher: Teacher | undefined;
        if (subjectData.teacherId) {
          const teacherDoc = await getDoc(doc(this.teachersCollection, subjectData.teacherId));
          if (teacherDoc.exists()) {
            teacher = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;
          }
        }
        
        subjects.push({
          ...subjectData,
          teacher
        });
      }
      
      return subjects;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw new Error('Failed to fetch subjects');
    }
  }

  async createSubject(subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubjectWithTeacher> {
    try {
      // Check for duplicate subject name
      const duplicateQuery = query(
        this.subjectsCollection, 
        where('name', '==', subjectData.name)
      );
      const duplicateSnapshot = await getDocs(duplicateQuery);
      
      if (!duplicateSnapshot.empty) {
        throw new Error('A subject with this name already exists');
      }

      // Filter out undefined values to prevent Firebase errors
      const cleanedData = Object.fromEntries(
        Object.entries(subjectData).filter(([_, value]) => value !== undefined)
      );

      const newSubject = {
        ...cleanedData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(this.subjectsCollection, newSubject);
      
      // Fetch teacher details if assigned
      let teacher: Teacher | undefined;
      if (subjectData.teacherId) {
        const teacherDoc = await getDoc(doc(this.teachersCollection, subjectData.teacherId));
        if (teacherDoc.exists()) {
          teacher = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;
        }
      }

      return {
        id: docRef.id,
        name: subjectData.name,
        code: subjectData.code,
        ...newSubject,
        teacher
      };
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }

  async updateSubject(id: string, data: Partial<Subject>): Promise<SubjectWithTeacher> {
    try {
      // Check for duplicate name if name is being updated
      if (data.name) {
        const duplicateQuery = query(
          this.subjectsCollection, 
          where('name', '==', data.name)
        );
        const duplicateSnapshot = await getDocs(duplicateQuery);
        
        // Check if duplicate exists and it's not the same document
        const duplicateDoc = duplicateSnapshot.docs.find(doc => doc.id !== id);
        if (duplicateDoc) {
          throw new Error('A subject with this name already exists');
        }
      }

      const subjectRef = doc(this.subjectsCollection, id);
      
      // Filter out undefined values to prevent Firebase errors
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );
      
      const updateData = {
        ...cleanedData,
        updatedAt: Timestamp.now()
      };

      await updateDoc(subjectRef, updateData);
      
      // Fetch updated subject with teacher details
      const updatedDoc = await getDoc(subjectRef);
      if (!updatedDoc.exists()) {
        throw new Error('Subject not found after update');
      }

      const subjectData = { id: updatedDoc.id, ...updatedDoc.data() } as Subject;
      
      // Fetch teacher details if assigned
      let teacher: Teacher | undefined;
      if (subjectData.teacherId) {
        const teacherDoc = await getDoc(doc(this.teachersCollection, subjectData.teacherId));
        if (teacherDoc.exists()) {
          teacher = { id: teacherDoc.id, ...teacherDoc.data() } as Teacher;
        }
      }

      return {
        ...subjectData,
        teacher
      };
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  }

  async deleteSubject(id: string): Promise<void> {
    try {
      const subjectRef = doc(this.subjectsCollection, id);
      const subjectDoc = await getDoc(subjectRef);
      
      if (!subjectDoc.exists()) {
        throw new Error('Subject not found');
      }

      // Check if subject is assigned to any classes
      const classesQuery = query(
        this.classesCollection, 
        where('subjects', 'array-contains', id)
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      if (!classesSnapshot.empty) {
        throw new Error('Cannot delete subject that is assigned to classes. Please remove it from classes first.');
      }

      await deleteDoc(subjectRef);
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }

  // Class CRUD operations
  async fetchClasses(): Promise<ClassWithStudents[]> {
    try {
      const classesQuery = query(this.classesCollection, orderBy('grade'), orderBy('section'));
      const classesSnapshot = await getDocs(classesQuery);
      
      const classes: ClassWithStudents[] = [];
      
      for (const classDoc of classesSnapshot.docs) {
        const classData = { id: classDoc.id, ...classDoc.data() } as Class;
        
        // Fetch students in this class
        const studentsQuery = query(
          this.studentsCollection, 
          where('classId', '==', classDoc.id)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        
        const students: Student[] = studentsSnapshot.docs.map(studentDoc => ({
          id: studentDoc.id,
          ...studentDoc.data()
        } as Student));
        
        classes.push({
          ...classData,
          students
        });
      }
      
      return classes;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw new Error('Failed to fetch classes');
    }
  }

  async createClass(classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt' | 'currentEnrollment'>): Promise<ClassWithStudents> {
    try {
      // Check for duplicate class (same grade and section)
      const duplicateQuery = query(
        this.classesCollection,
        where('grade', '==', classData.grade),
        where('section', '==', classData.section)
      );
      const duplicateSnapshot = await getDocs(duplicateQuery);
      
      if (!duplicateSnapshot.empty) {
        throw new Error('A class with this grade and section already exists');
      }

      const newClass = {
        ...classData,
        currentEnrollment: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(this.classesCollection, newClass);

      return {
        id: docRef.id,
        ...newClass,
        students: []
      };
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  async updateClass(id: string, data: Partial<Class>): Promise<ClassWithStudents> {
    try {
      // Check for duplicate if grade or section is being updated
      if (data.grade !== undefined || data.section !== undefined) {
        const classRef = doc(this.classesCollection, id);
        const currentDoc = await getDoc(classRef);
        
        if (!currentDoc.exists()) {
          throw new Error('Class not found');
        }
        
        const currentData = currentDoc.data() as Class;
        const newGrade = data.grade !== undefined ? data.grade : currentData.grade;
        const newSection = data.section !== undefined ? data.section : currentData.section;
        
        const duplicateQuery = query(
          this.classesCollection,
          where('grade', '==', newGrade),
          where('section', '==', newSection)
        );
        const duplicateSnapshot = await getDocs(duplicateQuery);
        
        // Check if duplicate exists and it's not the same document
        const duplicateDoc = duplicateSnapshot.docs.find(doc => doc.id !== id);
        if (duplicateDoc) {
          throw new Error('A class with this grade and section already exists');
        }
      }

      const classRef = doc(this.classesCollection, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };

      await updateDoc(classRef, updateData);
      
      // Fetch updated class with students
      const updatedDoc = await getDoc(classRef);
      if (!updatedDoc.exists()) {
        throw new Error('Class not found after update');
      }

      const classData = { id: updatedDoc.id, ...updatedDoc.data() } as Class;
      
      // Fetch students in this class
      const studentsQuery = query(
        this.studentsCollection, 
        where('classId', '==', id)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      
      const students: Student[] = studentsSnapshot.docs.map(studentDoc => ({
        id: studentDoc.id,
        ...studentDoc.data()
      } as Student));

      return {
        ...classData,
        students
      };
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  async deleteClass(id: string): Promise<void> {
    try {
      const classRef = doc(this.classesCollection, id);
      const classDoc = await getDoc(classRef);
      
      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }

      // Check if there are students in this class
      const studentsQuery = query(
        this.studentsCollection, 
        where('classId', '==', id)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      
      if (!studentsSnapshot.empty) {
        throw new Error('Cannot delete class that has students. Please move students to other classes first.');
      }

      await deleteDoc(classRef);
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  // Student-Class relationship management
  async addStudentToClass(classId: string, studentId: string): Promise<ClassWithStudents> {
    try {
      const batch = writeBatch(db);
      
      // Update student's classId
      const studentRef = doc(this.studentsCollection, studentId);
      batch.update(studentRef, { 
        classId: classId,
        updatedAt: Timestamp.now()
      });
      
      // Update class enrollment count
      const classRef = doc(this.classesCollection, classId);
      const classDoc = await getDoc(classRef);
      
      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }
      
      const classData = classDoc.data() as Class;
      batch.update(classRef, { 
        currentEnrollment: classData.currentEnrollment + 1,
        updatedAt: Timestamp.now()
      });
      
      await batch.commit();
      
      // Return updated class with students
      return this.getClassWithStudents(classId);
    } catch (error) {
      console.error('Error adding student to class:', error);
      throw error;
    }
  }

  async removeStudentFromClass(classId: string, studentId: string): Promise<ClassWithStudents> {
    try {
      const batch = writeBatch(db);
      
      // Remove student's classId
      const studentRef = doc(this.studentsCollection, studentId);
      batch.update(studentRef, { 
        classId: '',
        updatedAt: Timestamp.now()
      });
      
      // Update class enrollment count
      const classRef = doc(this.classesCollection, classId);
      const classDoc = await getDoc(classRef);
      
      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }
      
      const classData = classDoc.data() as Class;
      batch.update(classRef, { 
        currentEnrollment: Math.max(0, classData.currentEnrollment - 1),
        updatedAt: Timestamp.now()
      });
      
      await batch.commit();
      
      // Return updated class with students
      return this.getClassWithStudents(classId);
    } catch (error) {
      console.error('Error removing student from class:', error);
      throw error;
    }
  }

  private async getClassWithStudents(classId: string): Promise<ClassWithStudents> {
    const classRef = doc(this.classesCollection, classId);
    const classDoc = await getDoc(classRef);
    
    if (!classDoc.exists()) {
      throw new Error('Class not found');
    }
    
    const classData = { id: classDoc.id, ...classDoc.data() } as Class;
    
    // Fetch students in this class
    const studentsQuery = query(
      this.studentsCollection, 
      where('classId', '==', classId)
    );
    const studentsSnapshot = await getDocs(studentsQuery);
    
    const students: Student[] = studentsSnapshot.docs.map(studentDoc => ({
      id: studentDoc.id,
      ...studentDoc.data()
    } as Student));
    
    return {
      ...classData,
      students
    };
  }
}

// Export service functions
const subjectClassService = new SubjectClassService();

export const fetchSubjects = () => subjectClassService.fetchSubjects();
export const createSubject = (data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => 
  subjectClassService.createSubject(data);
export const updateSubject = (id: string, data: Partial<Subject>) => 
  subjectClassService.updateSubject(id, data);
export const deleteSubject = (id: string) => subjectClassService.deleteSubject(id);

export const fetchClasses = () => subjectClassService.fetchClasses();
export const createClass = (data: Omit<Class, 'id' | 'createdAt' | 'updatedAt' | 'currentEnrollment'>) => 
  subjectClassService.createClass(data);
export const updateClass = (id: string, data: Partial<Class>) => 
  subjectClassService.updateClass(id, data);
export const deleteClass = (id: string) => subjectClassService.deleteClass(id);

export const addStudentToClass = (classId: string, studentId: string) => 
  subjectClassService.addStudentToClass(classId, studentId);
export const removeStudentFromClass = (classId: string, studentId: string) => 
  subjectClassService.removeStudentFromClass(classId, studentId);

export default subjectClassService;
