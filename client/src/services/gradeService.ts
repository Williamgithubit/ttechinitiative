import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { 
  Grade, 
  CreateGradeData, 
  UpdateGradeData, 
  GradeFilter, 
  GradeStats,
  CourseGradeSummary,
  BulkGradeData,
  calculateLetterGrade,
  calculateGradePoints,
  calculatePercentage
} from '@/types/grade';

export class GradeService {
  private static readonly COLLECTION_NAME = 'grades';

  // Create a new grade
  static async createGrade(gradeData: CreateGradeData, teacherId: string): Promise<string> {
    try {
      const percentage = calculatePercentage(gradeData.score, gradeData.maxScore);
      const letterGrade = calculateLetterGrade(percentage);
      const gradePoints = calculateGradePoints(letterGrade);

      const grade: Omit<Grade, 'id'> = {
        ...gradeData,
        studentName: '', // Will be populated from student data
        courseName: '', // Will be populated from course data
        percentage,
        letterGrade,
        gradePoints,
        isExcused: gradeData.isExcused || false,
        isLate: gradeData.isLate || false,
        teacherId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Get student and course names
      const [studentDoc, courseDoc] = await Promise.all([
        getDoc(doc(db, 'students', gradeData.studentId)),
        getDoc(doc(db, 'courses', gradeData.courseId))
      ]);

      if (studentDoc.exists()) {
        grade.studentName = studentDoc.data().name || 'Unknown Student';
      }
      if (courseDoc.exists()) {
        grade.courseName = courseDoc.data().name || 'Unknown Course';
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), grade);
      return docRef.id;
    } catch (error) {
      console.error('Error creating grade:', error);
      throw new Error('Failed to create grade');
    }
  }

  // Get all grades with optional filtering
  static async getGrades(filter?: GradeFilter): Promise<Grade[]> {
    try {
      let q = query(collection(db, this.COLLECTION_NAME));

      // Apply filters
      if (filter?.courseId) {
        q = query(q, where('courseId', '==', filter.courseId));
      }
      if (filter?.studentId) {
        q = query(q, where('studentId', '==', filter.studentId));
      }
      if (filter?.assignmentType) {
        q = query(q, where('assignmentType', '==', filter.assignmentType));
      }

      q = query(q, orderBy('gradedDate', 'desc'));

      const querySnapshot = await getDocs(q);
      const grades: Grade[] = [];

      querySnapshot.forEach((doc) => {
        grades.push({
          id: doc.id,
          ...doc.data()
        } as Grade);
      });

      // Apply additional client-side filters
      let filteredGrades = grades;

      if (filter?.startDate) {
        filteredGrades = filteredGrades.filter(grade => 
          grade.gradedDate >= filter.startDate!
        );
      }
      if (filter?.endDate) {
        filteredGrades = filteredGrades.filter(grade => 
          grade.gradedDate <= filter.endDate!
        );
      }
      if (filter?.minGrade !== undefined) {
        filteredGrades = filteredGrades.filter(grade => 
          grade.percentage >= filter.minGrade!
        );
      }
      if (filter?.maxGrade !== undefined) {
        filteredGrades = filteredGrades.filter(grade => 
          grade.percentage <= filter.maxGrade!
        );
      }

      return filteredGrades;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw new Error('Failed to fetch grades');
    }
  }

  // Get grades for a specific student
  static async getStudentGrades(studentId: string, courseId?: string): Promise<Grade[]> {
    const filter: GradeFilter = { studentId };
    if (courseId) filter.courseId = courseId;
    return this.getGrades(filter);
  }

  // Get grades for a specific course
  static async getCourseGrades(courseId: string): Promise<Grade[]> {
    return this.getGrades({ courseId });
  }

  // Update a grade
  static async updateGrade(gradeId: string, updateData: UpdateGradeData): Promise<void> {
    try {
      const gradeRef = doc(db, this.COLLECTION_NAME, gradeId);
      const gradeDoc = await getDoc(gradeRef);
      
      if (!gradeDoc.exists()) {
        throw new Error('Grade not found');
      }

      const currentGrade = gradeDoc.data() as Grade;
      
      // Recalculate derived fields if score or maxScore changed
      let updatedFields: any = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      if (updateData.score !== undefined || updateData.maxScore !== undefined) {
        const newScore = updateData.score ?? currentGrade.score;
        const newMaxScore = updateData.maxScore ?? currentGrade.maxScore;
        const percentage = calculatePercentage(newScore, newMaxScore);
        const letterGrade = calculateLetterGrade(percentage);
        const gradePoints = calculateGradePoints(letterGrade);

        updatedFields = {
          ...updatedFields,
          percentage,
          letterGrade,
          gradePoints
        };
      }

      await updateDoc(gradeRef, updatedFields);
    } catch (error) {
      console.error('Error updating grade:', error);
      throw new Error('Failed to update grade');
    }
  }

  // Delete a grade
  static async deleteGrade(gradeId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, gradeId));
    } catch (error) {
      console.error('Error deleting grade:', error);
      throw new Error('Failed to delete grade');
    }
  }

  // Bulk create grades
  static async bulkCreateGrades(bulkData: BulkGradeData, teacherId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      const gradesCollection = collection(db, this.COLLECTION_NAME);

      for (const gradeData of bulkData.grades) {
        const percentage = calculatePercentage(gradeData.score, gradeData.maxScore);
        const letterGrade = calculateLetterGrade(percentage);
        const gradePoints = calculateGradePoints(letterGrade);

        const grade: Omit<Grade, 'id'> = {
          ...gradeData,
          studentName: '', // Will be updated separately
          courseName: '', // Will be updated separately
          percentage,
          letterGrade,
          gradePoints,
          isExcused: gradeData.isExcused || false,
          isLate: gradeData.isLate || false,
          teacherId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const docRef = doc(gradesCollection);
        batch.set(docRef, grade);
      }

      await batch.commit();
    } catch (error) {
      console.error('Error bulk creating grades:', error);
      throw new Error('Failed to bulk create grades');
    }
  }

  // Calculate grade statistics for a course
  static async getCourseGradeStats(courseId: string): Promise<GradeStats> {
    try {
      const grades = await this.getCourseGrades(courseId);
      
      if (grades.length === 0) {
        return {
          totalGrades: 0,
          averageGrade: 0,
          highestGrade: 0,
          lowestGrade: 0,
          passingGrades: 0,
          failingGrades: 0,
          gradeDistribution: { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 }
        };
      }

      const percentages = grades.map(g => g.percentage);
      const totalGrades = grades.length;
      const averageGrade = percentages.reduce((sum, p) => sum + p, 0) / totalGrades;
      const highestGrade = Math.max(...percentages);
      const lowestGrade = Math.min(...percentages);
      const passingGrades = grades.filter(g => g.percentage >= 60).length;
      const failingGrades = totalGrades - passingGrades;

      const gradeDistribution = {
        'A': grades.filter(g => g.letterGrade.startsWith('A')).length,
        'B': grades.filter(g => g.letterGrade.startsWith('B')).length,
        'C': grades.filter(g => g.letterGrade.startsWith('C')).length,
        'D': grades.filter(g => g.letterGrade.startsWith('D')).length,
        'F': grades.filter(g => g.letterGrade === 'F').length
      };

      return {
        totalGrades,
        averageGrade: Math.round(averageGrade * 100) / 100,
        highestGrade,
        lowestGrade,
        passingGrades,
        failingGrades,
        gradeDistribution
      };
    } catch (error) {
      console.error('Error calculating grade stats:', error);
      throw new Error('Failed to calculate grade statistics');
    }
  }

  // Calculate course grade summary for a student
  static async getStudentCourseGradeSummary(studentId: string, courseId: string): Promise<CourseGradeSummary | null> {
    try {
      const grades = await this.getStudentGrades(studentId, courseId);
      
      if (grades.length === 0) return null;

      const totalWeightedScore = grades.reduce((sum, grade) => 
        sum + (grade.percentage * grade.weight / 100), 0
      );
      const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
      
      const currentGrade = totalWeight > 0 ? totalWeightedScore / totalWeight * 100 : 0;
      const letterGrade = calculateLetterGrade(currentGrade);
      const gradePoints = calculateGradePoints(letterGrade);

      const totalPoints = grades.reduce((sum, grade) => sum + grade.score, 0);
      const maxPoints = grades.reduce((sum, grade) => sum + grade.maxScore, 0);

      // Get student and course names
      const [studentDoc, courseDoc] = await Promise.all([
        getDoc(doc(db, 'students', studentId)),
        getDoc(doc(db, 'courses', courseId))
      ]);

      const studentName = studentDoc.exists() ? studentDoc.data().name : 'Unknown Student';
      const courseName = courseDoc.exists() ? courseDoc.data().name : 'Unknown Course';

      return {
        courseId,
        courseName,
        studentId,
        studentName,
        currentGrade: Math.round(currentGrade * 100) / 100,
        letterGrade,
        gradePoints,
        totalPoints,
        maxPoints,
        categoryBreakdown: [], // Could be implemented with grade categories
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating student course grade summary:', error);
      throw new Error('Failed to calculate grade summary');
    }
  }

  // Get recent grades (last 10)
  static async getRecentGrades(teacherId: string, limitCount: number = 10): Promise<Grade[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('teacherId', '==', teacherId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const grades: Grade[] = [];

      querySnapshot.forEach((doc) => {
        grades.push({
          id: doc.id,
          ...doc.data()
        } as Grade);
      });

      return grades;
    } catch (error) {
      console.error('Error fetching recent grades:', error);
      throw new Error('Failed to fetch recent grades');
    }
  }
}
