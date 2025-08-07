import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { 
  StudentProgress, 
  CourseProgress, 
  LessonResponse, 
  ReportFilters, 
  ReportSummary,
  StudentSummary,
  AssignmentStats,
  RecentSubmission,
  StudentLessonResponse
} from '@/types/report';
import { Student } from '@/types/student';
import { Assignment, AssignmentSubmission } from '@/types/assignment';
import { Course } from '@/types/course';

export class ReportService {
  // Get comprehensive student progress report
  static async getStudentProgressReport(
    teacherId: string, 
    filters?: ReportFilters
  ): Promise<StudentProgress[]> {
    try {
      const progressData: StudentProgress[] = [];
      
      // Get teacher's courses
      const coursesQuery = query(
        collection(db, 'courses'),
        where('teacherId', '==', teacherId)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      
      for (const courseDoc of coursesSnapshot.docs) {
        const course = { id: courseDoc.id, ...courseDoc.data() } as Course;
        
        // Skip if course filter is applied and doesn't match
        if (filters?.courseId && course.id !== filters.courseId) continue;
        
        // Get students in this course
        const studentsQuery = query(
          collection(db, 'students'),
          where('courseIds', 'array-contains', course.id)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        
        // Get assignments for this course
        const assignmentsQuery = query(
          collection(db, 'assignments'),
          where('courseId', '==', course.id)
        );
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        const assignments = assignmentsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Assignment[];
        
        for (const studentDoc of studentsSnapshot.docs) {
          const student = { id: studentDoc.id, ...studentDoc.data() } as Student;
          
          // Skip if student filter is applied and doesn't match
          if (filters?.studentIds && !filters.studentIds.includes(student.id)) continue;
          
          // Calculate student progress
          const progress = await this.calculateStudentProgress(
            student, 
            course, 
            assignments,
            filters
          );
          
          progressData.push(progress);
        }
      }
      
      return progressData;
    } catch (error) {
      console.error('Error getting student progress report:', error);
      throw error;
    }
  }
  
  // Get course progress overview
  static async getCourseProgressReport(
    teacherId: string,
    filters?: ReportFilters
  ): Promise<CourseProgress[]> {
    try {
      const courseProgressData: CourseProgress[] = [];
      
      const coursesQuery = query(
        collection(db, 'courses'),
        where('teacherId', '==', teacherId)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      
      for (const courseDoc of coursesSnapshot.docs) {
        const course = { id: courseDoc.id, ...courseDoc.data() } as Course;
        
        if (filters?.courseId && course.id !== filters.courseId) continue;
        
        const courseProgress = await this.calculateCourseProgress(course, filters);
        courseProgressData.push(courseProgress);
      }
      
      return courseProgressData;
    } catch (error) {
      console.error('Error getting course progress report:', error);
      throw error;
    }
  }
  
  // Get lesson response analytics
  static async getLessonResponseReport(
    teacherId: string,
    filters?: ReportFilters
  ): Promise<LessonResponse[]> {
    try {
      const lessonResponses: LessonResponse[] = [];
      
      // Get teacher's courses
      const coursesQuery = query(
        collection(db, 'courses'),
        where('teacherId', '==', teacherId)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      
      for (const courseDoc of coursesSnapshot.docs) {
        const course = { id: courseDoc.id, ...courseDoc.data() } as Course;
        
        if (filters?.courseId && course.id !== filters.courseId) continue;
        
        // Get lessons for this course (stored as assignments with type 'lesson')
        const lessonsQuery = query(
          collection(db, 'assignments'),
          where('courseId', '==', course.id),
          where('type', '==', 'lesson')
        );
        const lessonsSnapshot = await getDocs(lessonsQuery);
        
        for (const lessonDoc of lessonsSnapshot.docs) {
          const lesson = { id: lessonDoc.id, ...lessonDoc.data() } as Assignment;
          
          const lessonResponse = await this.calculateLessonResponse(lesson, course.id);
          lessonResponses.push(lessonResponse);
        }
      }
      
      return lessonResponses;
    } catch (error) {
      console.error('Error getting lesson response report:', error);
      throw error;
    }
  }
  
  // Get report summary
  static async getReportSummary(
    teacherId: string,
    filters?: ReportFilters
  ): Promise<ReportSummary> {
    try {
      const studentProgress = await this.getStudentProgressReport(teacherId, filters);
      const courseProgress = await this.getCourseProgressReport(teacherId, filters);
      
      const totalStudents = studentProgress.length;
      const averageGrade = studentProgress.reduce((sum, s) => sum + s.averageScore, 0) / totalStudents || 0;
      const completionRate = studentProgress.reduce((sum, s) => sum + s.completionRate, 0) / totalStudents || 0;
      const engagementLevel = studentProgress.reduce((sum, s) => sum + s.engagementScore, 0) / totalStudents || 0;
      
      // Find top performing course
      const topCourse = courseProgress.reduce((top, course) => 
        course.averageGrade > (top?.averageGrade || 0) ? course : top
      , courseProgress[0])?.courseName || 'N/A';
      
      // Find most engaged student
      const mostEngagedStudent = studentProgress.reduce((top, student) =>
        student.engagementScore > (top?.engagementScore || 0) ? student : top
      , studentProgress[0])?.studentName || 'N/A';
      
      // Find students needing attention (low grades or completion rates)
      const needsAttention = studentProgress
        .filter(s => s.averageScore < 70 || s.completionRate < 0.7)
        .map(s => ({
          studentId: s.studentId,
          name: s.studentName,
          grade: s.averageScore,
          completionRate: s.completionRate
        }))
        .slice(0, 5);
      
      return {
        totalStudents,
        averageGrade,
        completionRate,
        engagementLevel,
        improvementTrend: 'stable', // This would require historical data
        topCourse,
        mostEngagedStudent,
        needsAttention
      };
    } catch (error) {
      console.error('Error getting report summary:', error);
      throw error;
    }
  }
  
  // Real-time listener for report data
  static subscribeToReportUpdates(
    teacherId: string,
    callback: (data: any) => void,
    filters?: ReportFilters
  ): () => void {
    const coursesQuery = query(
      collection(db, 'courses'),
      where('teacherId', '==', teacherId)
    );
    
    return onSnapshot(coursesQuery, async (snapshot) => {
      try {
        const summary = await this.getReportSummary(teacherId, filters);
        callback(summary);
      } catch (error) {
        console.error('Error in real-time report updates:', error);
      }
    });
  }
  
  // Helper method to calculate individual student progress
  private static async calculateStudentProgress(
    student: Student,
    course: Course,
    assignments: Assignment[],
    filters?: ReportFilters
  ): Promise<StudentProgress> {
    // Get student submissions
    const submissionsQuery = query(
      collection(db, 'submissions'),
      where('studentId', '==', student.id),
      where('courseId', '==', course.id)
    );
    const submissionsSnapshot = await getDocs(submissionsQuery);
    const submissions = submissionsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as AssignmentSubmission[];
    
    // Filter assignments by date range if provided
    let filteredAssignments = assignments;
    if (filters?.dateRange) {
      filteredAssignments = assignments.filter(a => {
        const assignmentDate = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : 
                               a.createdAt ? new Date(a.createdAt) : new Date();
        return assignmentDate >= filters.dateRange!.startDate && 
               assignmentDate <= filters.dateRange!.endDate;
      });
    }
    
    // Filter by assignment types if provided
    if (filters?.assignmentTypes?.length) {
      filteredAssignments = filteredAssignments.filter(a => 
        filters.assignmentTypes!.includes(a.type)
      );
    }
    
    const totalAssignments = filteredAssignments.length;
    const completedAssignments = submissions.filter(s => 
      filteredAssignments.some(a => a.id === s.assignmentId)
    ).length;
    
    const completionRate = totalAssignments > 0 ? completedAssignments / totalAssignments : 0;
    
    // Calculate average score
    const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null);
    const averageScore = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length 
      : 0;
    
    // Calculate engagement score (simplified)
    const engagementScore = Math.min(100, 
      (completionRate * 40) + 
      (averageScore * 0.4) + 
      (Math.min(submissions.length / Math.max(totalAssignments, 1), 1) * 20)
    );
    
    // Get recent submissions
    const recentSubmissions: RecentSubmission[] = submissions
      .sort((a, b) => {
        const dateA = a.submittedAt instanceof Timestamp ? a.submittedAt.toDate() : 
                      a.submittedAt ? new Date(a.submittedAt) : new Date(0);
        const dateB = b.submittedAt instanceof Timestamp ? b.submittedAt.toDate() : 
                      b.submittedAt ? new Date(b.submittedAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5)
      .map(s => {
        const assignment = assignments.find(a => a.id === s.assignmentId);
        const submittedDate = s.submittedAt instanceof Timestamp ? s.submittedAt.toDate() : 
                              s.submittedAt ? new Date(s.submittedAt) : new Date();
        return {
          assignmentId: s.assignmentId,
          assignmentTitle: assignment?.title || 'Unknown Assignment',
          submittedAt: submittedDate,
          grade: s.grade || 0,
          feedback: s.feedback || '',
          isLate: s.isLate || false
        };
      });
    
    // Determine strengths and areas for improvement (simplified)
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];
    
    if (completionRate > 0.8) strengths.push('Consistent assignment completion');
    if (averageScore > 85) strengths.push('High academic performance');
    if (engagementScore > 75) strengths.push('Strong engagement');
    
    if (completionRate < 0.7) areasForImprovement.push('Assignment completion');
    if (averageScore < 70) areasForImprovement.push('Academic performance');
    if (engagementScore < 60) areasForImprovement.push('Class engagement');
    
    return {
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      courseId: course.id,
      courseName: course.name,
      overallGrade: averageScore,
      completedAssignments,
      totalAssignments,
      completionRate,
      averageScore,
      lastActivity: submissions.length > 0 
        ? (() => {
            const sortedSubmissions = submissions.sort((a, b) => {
              const dateA = a.submittedAt instanceof Timestamp ? a.submittedAt.toDate() : 
                            a.submittedAt ? new Date(a.submittedAt) : new Date(0);
              const dateB = b.submittedAt instanceof Timestamp ? b.submittedAt.toDate() : 
                            b.submittedAt ? new Date(b.submittedAt) : new Date(0);
              return dateB.getTime() - dateA.getTime();
            });
            const latestSubmission = sortedSubmissions[0];
            return latestSubmission.submittedAt instanceof Timestamp ? 
                   latestSubmission.submittedAt.toDate() : 
                   latestSubmission.submittedAt ? new Date(latestSubmission.submittedAt) : new Date();
          })()
        : new Date(),
      engagementScore,
      strengths,
      areasForImprovement,
      recentSubmissions
    };
  }
  
  // Helper method to calculate course progress
  private static async calculateCourseProgress(
    course: Course,
    filters?: ReportFilters
  ): Promise<CourseProgress> {
    // Get students in course
    const studentsQuery = query(
      collection(db, 'students'),
      where('courseIds', 'array-contains', course.id)
    );
    const studentsSnapshot = await getDocs(studentsQuery);
    const students = studentsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Student[];
    
    // Get assignments for course
    const assignmentsQuery = query(
      collection(db, 'assignments'),
      where('courseId', '==', course.id)
    );
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    const assignments = assignmentsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Assignment[];
    
    // Calculate metrics
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    
    // This would require calculating individual progress for each student
    // For now, using simplified calculations
    const averageGrade = 75; // Placeholder
    const completionRate = 0.8; // Placeholder
    const engagementLevel: 'High' | 'Medium' | 'Low' = averageGrade > 80 ? 'High' : 
                                                       averageGrade > 60 ? 'Medium' : 'Low';
    
    // Top performers and struggling students (simplified)
    const topPerformers: StudentSummary[] = students.slice(0, 3).map(s => ({
      studentId: s.id,
      name: s.name,
      grade: 85 + Math.random() * 10, // Placeholder
      completionRate: 0.9 + Math.random() * 0.1 // Placeholder
    }));
    
    const strugglingStudents: StudentSummary[] = students.slice(-2).map(s => ({
      studentId: s.id,
      name: s.name,
      grade: 50 + Math.random() * 20, // Placeholder
      completionRate: 0.3 + Math.random() * 0.4 // Placeholder
    }));
    
    // Assignment statistics
    const assignmentStats: AssignmentStats[] = assignments.map(a => ({
      assignmentId: a.id,
      title: a.title,
      type: a.type,
      averageGrade: 70 + Math.random() * 25, // Placeholder
      completionRate: 0.6 + Math.random() * 0.4, // Placeholder
      submissionCount: Math.floor(totalStudents * (0.6 + Math.random() * 0.4)),
      totalStudents,
      difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)] as 'Easy' | 'Medium' | 'Hard'
    }));
    
    return {
      courseId: course.id,
      courseName: course.name,
      totalStudents,
      activeStudents,
      averageGrade,
      completionRate,
      engagementLevel,
      topPerformers,
      strugglingStudents,
      assignmentStats
    };
  }
  
  // Helper method to calculate lesson response
  private static async calculateLessonResponse(
    lesson: Assignment,
    courseId: string
  ): Promise<LessonResponse> {
    // Get student responses to this lesson
    const responsesQuery = query(
      collection(db, 'submissions'),
      where('assignmentId', '==', lesson.id)
    );
    const responsesSnapshot = await getDocs(responsesQuery);
    const responses = responsesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as AssignmentSubmission[];
    
    // Get students in course
    const studentsQuery = query(
      collection(db, 'students'),
      where('courseIds', 'array-contains', courseId)
    );
    const studentsSnapshot = await getDocs(studentsQuery);
    const students = studentsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Student[];
    
    const studentResponses: StudentLessonResponse[] = students.map(student => {
      const response = responses.find(r => r.studentId === student.id);
      return {
        studentId: student.id,
        studentName: student.name,
        completed: !!response,
        timeSpent: response?.timeSpent || 0,
        engagementScore: response ? 70 + Math.random() * 30 : 0, // Placeholder
        questionsAsked: response?.questionsAsked || 0,
        feedback: response?.feedback,
        difficultyRating: response?.difficultyRating,
        completedAt: response?.submittedAt ? 
          (response.submittedAt instanceof Timestamp ? response.submittedAt.toDate() : new Date(response.submittedAt)) : 
          undefined
      };
    });
    
    const completedResponses = studentResponses.filter(r => r.completed);
    const averageEngagement = completedResponses.length > 0 
      ? completedResponses.reduce((sum, r) => sum + r.engagementScore, 0) / completedResponses.length 
      : 0;
    
    const completionRate = students.length > 0 ? completedResponses.length / students.length : 0;
    const averageTimeSpent = completedResponses.length > 0 
      ? completedResponses.reduce((sum, r) => sum + r.timeSpent, 0) / completedResponses.length 
      : 0;
    
    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      courseId,
      studentResponses,
      averageEngagement,
      completionRate,
      averageTimeSpent,
      feedbackSentiment: 'Positive', // Placeholder - would analyze feedback text
      commonQuestions: [], // Placeholder - would extract from responses
      difficultyRating: 3 // Placeholder - would calculate from student ratings
    };
  }
}
