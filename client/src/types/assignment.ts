import { FirestoreTimestamp } from './auth';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  teacherId: string;
  type: 'homework' | 'quiz' | 'exam' | 'project' | 'discussion';
  maxPoints: number;
  dueDate: FirestoreTimestamp | string;
  createdAt: FirestoreTimestamp | string;
  updatedAt: FirestoreTimestamp | string;
  instructions?: string;
  attachments?: AssignmentAttachment[];
  settings: {
    allowLateSubmissions: boolean;
    latePenalty?: number; // percentage deduction per day
    maxAttempts?: number;
    timeLimit?: number; // minutes
    showCorrectAnswers: boolean;
    randomizeQuestions: boolean;
  };
  status: 'draft' | 'published' | 'closed';
  questions?: QuizQuestion[];
}

export interface AssignmentAttachment {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'link' | 'video' | 'image';
  size?: number;
  uploadedAt: FirestoreTimestamp | string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  question: string;
  points: number;
  options?: string[]; // for multiple choice
  correctAnswer?: string | string[];
  explanation?: string;
  order: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: FirestoreTimestamp | string;
  status: 'submitted' | 'graded' | 'returned' | 'late';
  content: SubmissionContent;
  grade?: number;
  feedback?: string;
  gradedAt?: FirestoreTimestamp | string;
  gradedBy?: string;
  attempt: number;
  timeSpent?: number; // minutes
  questionsAsked?: number; // number of questions asked during assignment
  isLate?: boolean; // whether the submission was late
  difficultyRating?: number; // 1-5 scale difficulty rating from student
  attachments?: SubmissionAttachment[];
}

export interface SubmissionContent {
  text?: string;
  answers?: { [questionId: string]: string | string[] };
  files?: string[]; // file URLs
}

export interface SubmissionAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: FirestoreTimestamp | string;
}

export interface AssignmentAnalytics {
  assignmentId: string;
  totalSubmissions: number;
  onTimeSubmissions: number;
  lateSubmissions: number;
  notSubmitted: number;
  averageGrade: number;
  gradeDistribution: {
    range: string;
    count: number;
  }[];
  completionRate: number;
  averageTimeSpent: number;
  commonMistakes?: {
    questionId: string;
    incorrectAnswers: { answer: string; count: number }[];
  }[];
}

export interface GradingRubric {
  id: string;
  assignmentId: string;
  criteria: RubricCriterion[];
  totalPoints: number;
  createdAt: FirestoreTimestamp | string;
  updatedAt: FirestoreTimestamp | string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
}

export interface AutoGradingResult {
  submissionId: string;
  totalScore: number;
  maxScore: number;
  questionResults: {
    questionId: string;
    score: number;
    maxScore: number;
    isCorrect: boolean;
    feedback?: string;
  }[];
  gradedAt: FirestoreTimestamp | string;
}
