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
import { 
  Assignment, 
  AssignmentSubmission, 
  AssignmentAnalytics, 
  AutoGradingResult,
  QuizQuestion 
} from '@/types/assignment';

const ASSIGNMENTS_COLLECTION = 'assignments';
const SUBMISSIONS_COLLECTION = 'assignmentSubmissions';
const ANALYTICS_COLLECTION = 'assignmentAnalytics';

export class AssignmentService {
  // Get assignments for a teacher's courses
  static async getAssignmentsByCourses(courseIds: string[]): Promise<Assignment[]> {
    try {
      if (courseIds.length === 0) return [];
      
      const assignmentsRef = collection(db, ASSIGNMENTS_COLLECTION);
      // Use simpler query to avoid composite index requirement
      const q = query(
        assignmentsRef,
        where('courseId', 'in', courseIds)
      );
      
      const snapshot = await getDocs(q);
      const assignments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Assignment));
      
      // Sort on client side to avoid index requirements
      return assignments.sort((a, b) => {
        const dateA = typeof a.dueDate === 'string' ? new Date(a.dueDate) : a.dueDate.toDate();
        const dateB = typeof b.dueDate === 'string' ? new Date(b.dueDate) : b.dueDate.toDate();
        return dateB.getTime() - dateA.getTime(); // desc order
      });
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  // Create new assignment
  static async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const assignmentsRef = collection(db, ASSIGNMENTS_COLLECTION);
      const docRef = await addDoc(assignmentsRef, {
        ...assignment,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  // Update assignment
  static async updateAssignment(assignmentId: string, updates: Partial<Assignment>): Promise<void> {
    try {
      const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId);
      await updateDoc(assignmentRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  // Delete assignment
  static async deleteAssignment(assignmentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ASSIGNMENTS_COLLECTION, assignmentId));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  // Get assignment submissions
  static async getAssignmentSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    try {
      const submissionsRef = collection(db, SUBMISSIONS_COLLECTION);
      const q = query(
        submissionsRef,
        where('assignmentId', '==', assignmentId),
        orderBy('submittedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AssignmentSubmission));
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }

  // Grade submission
  static async gradeSubmission(
    submissionId: string, 
    grade: number, 
    feedback: string, 
    gradedBy: string
  ): Promise<void> {
    try {
      const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
      await updateDoc(submissionRef, {
        grade,
        feedback,
        gradedBy,
        gradedAt: Timestamp.now(),
        status: 'graded'
      });
    } catch (error) {
      console.error('Error grading submission:', error);
      throw error;
    }
  }

  // Auto-grade quiz submission
  static async autoGradeQuiz(submissionId: string, assignment: Assignment): Promise<AutoGradingResult> {
    try {
      const submissionDoc = await getDoc(doc(db, SUBMISSIONS_COLLECTION, submissionId));
      if (!submissionDoc.exists()) {
        throw new Error('Submission not found');
      }

      const submission = submissionDoc.data() as AssignmentSubmission;
      const questions = assignment.questions || [];
      
      let totalScore = 0;
      const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
      
      const questionResults = questions.map(question => {
        const studentAnswer = submission.content.answers?.[question.id];
        const correctAnswer = question.correctAnswer;
        
        let isCorrect = false;
        let score = 0;
        
        if (question.type === 'multiple_choice' || question.type === 'true_false') {
          isCorrect = studentAnswer === correctAnswer;
          score = isCorrect ? question.points : 0;
        } else if (question.type === 'short_answer') {
          // Simple string matching for auto-grading (can be enhanced)
          isCorrect = typeof studentAnswer === 'string' && 
                     typeof correctAnswer === 'string' &&
                     studentAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
          score = isCorrect ? question.points : 0;
        }
        
        totalScore += score;
        
        return {
          questionId: question.id,
          score,
          maxScore: question.points,
          isCorrect,
          feedback: question.explanation || undefined
        };
      });

      const result: AutoGradingResult = {
        submissionId,
        totalScore,
        maxScore,
        questionResults,
        gradedAt: Timestamp.now()
      };

      // Update submission with auto-graded results
      await updateDoc(doc(db, SUBMISSIONS_COLLECTION, submissionId), {
        grade: totalScore,
        feedback: `Auto-graded: ${totalScore}/${maxScore} points`,
        gradedAt: Timestamp.now(),
        status: 'graded'
      });

      return result;
    } catch (error) {
      console.error('Error auto-grading quiz:', error);
      throw error;
    }
  }

  // Get assignment analytics
  static async getAssignmentAnalytics(assignmentId: string): Promise<AssignmentAnalytics> {
    try {
      const submissions = await this.getAssignmentSubmissions(assignmentId);
      const assignment = await getDoc(doc(db, ASSIGNMENTS_COLLECTION, assignmentId));
      
      if (!assignment.exists()) {
        throw new Error('Assignment not found');
      }

      const assignmentData = assignment.data() as Assignment;
      const dueDate = assignmentData.dueDate;
      
      const totalSubmissions = submissions.length;
      const onTimeSubmissions = submissions.filter(s => {
        if (typeof dueDate === 'string') {
          return new Date(s.submittedAt as string) <= new Date(dueDate);
        }
        return (s.submittedAt as any).toDate() <= (dueDate as any).toDate();
      }).length;
      
      const lateSubmissions = totalSubmissions - onTimeSubmissions;
      const gradedSubmissions = submissions.filter(s => s.grade !== undefined);
      
      const averageGrade = gradedSubmissions.length > 0 
        ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length
        : 0;

      // Grade distribution
      const gradeRanges = [
        { range: '90-100', min: 90, max: 100 },
        { range: '80-89', min: 80, max: 89 },
        { range: '70-79', min: 70, max: 79 },
        { range: '60-69', min: 60, max: 69 },
        { range: '0-59', min: 0, max: 59 }
      ];

      const gradeDistribution = gradeRanges.map(range => ({
        range: range.range,
        count: gradedSubmissions.filter(s => 
          (s.grade || 0) >= range.min && (s.grade || 0) <= range.max
        ).length
      }));

      const completionRate = totalSubmissions > 0 ? (totalSubmissions / 100) * 100 : 0; // Assuming 100 students
      const averageTimeSpent = submissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / submissions.length || 0;

      return {
        assignmentId,
        totalSubmissions,
        onTimeSubmissions,
        lateSubmissions,
        notSubmitted: 0, // Would need student enrollment data
        averageGrade,
        gradeDistribution,
        completionRate,
        averageTimeSpent
      };
    } catch (error) {
      console.error('Error getting assignment analytics:', error);
      throw error;
    }
  }

  // Create sample assignments for testing
  static async createSampleAssignments(courseIds: string[], teacherId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      const assignmentsRef = collection(db, ASSIGNMENTS_COLLECTION);

      const sampleAssignments = [
        {
          title: 'Math Quiz - Algebra Basics',
          description: 'Test your understanding of basic algebraic concepts',
          courseId: courseIds[0],
          teacherId,
          type: 'quiz' as const,
          maxPoints: 100,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          instructions: 'Complete all questions. You have 30 minutes to finish.',
          settings: {
            allowLateSubmissions: true,
            latePenalty: 10,
            maxAttempts: 2,
            timeLimit: 30,
            showCorrectAnswers: true,
            randomizeQuestions: false
          },
          status: 'published' as const,
          questions: [
            {
              id: 'q1',
              type: 'multiple_choice' as const,
              question: 'What is 2x + 3 = 7?',
              points: 25,
              options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
              correctAnswer: 'x = 2',
              explanation: 'Subtract 3 from both sides: 2x = 4, then divide by 2: x = 2',
              order: 1
            },
            {
              id: 'q2',
              type: 'true_false' as const,
              question: 'The equation x² = 4 has only one solution.',
              points: 25,
              correctAnswer: 'false',
              explanation: 'x² = 4 has two solutions: x = 2 and x = -2',
              order: 2
            }
          ]
        },
        {
          title: 'Science Project - Solar System',
          description: 'Create a presentation about a planet in our solar system',
          courseId: courseIds[1] || courseIds[0],
          teacherId,
          type: 'project' as const,
          maxPoints: 200,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          instructions: 'Choose a planet and create a 10-slide presentation covering its characteristics, atmosphere, and interesting facts.',
          settings: {
            allowLateSubmissions: true,
            latePenalty: 5,
            showCorrectAnswers: false,
            randomizeQuestions: false
          },
          status: 'published' as const
        },
        {
          title: 'English Essay - Character Analysis',
          description: 'Analyze the main character in your chosen novel',
          courseId: courseIds[2] || courseIds[0],
          teacherId,
          type: 'homework' as const,
          maxPoints: 150,
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          instructions: 'Write a 500-word essay analyzing the development of the main character throughout the story.',
          settings: {
            allowLateSubmissions: true,
            latePenalty: 15,
            showCorrectAnswers: false,
            randomizeQuestions: false
          },
          status: 'published' as const
        }
      ];

      sampleAssignments.forEach((assignment) => {
        const docRef = doc(assignmentsRef);
        batch.set(docRef, {
          ...assignment,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      });

      await batch.commit();
      console.log('Sample assignments created successfully');
    } catch (error) {
      console.error('Error creating sample assignments:', error);
      throw error;
    }
  }
}
