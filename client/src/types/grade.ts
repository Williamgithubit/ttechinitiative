export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  assignmentId?: string;
  assignmentName?: string;
  assignmentType: 'homework' | 'quiz' | 'exam' | 'project' | 'participation' | 'midterm' | 'final';
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  gradePoints: number;
  weight: number; // Weight of this grade in overall course grade
  gradedDate: string;
  dueDate?: string;
  submittedDate?: string;
  feedback?: string;
  rubricScores?: RubricScore[];
  isExcused: boolean;
  isLate: boolean;
  latePenalty?: number;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RubricScore {
  criteriaId: string;
  criteriaName: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

export interface GradeCategory {
  id: string;
  name: string;
  weight: number; // Percentage weight in final grade
  dropLowest?: number; // Number of lowest grades to drop
  courseId: string;
}

export interface CourseGradeSummary {
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  currentGrade: number;
  letterGrade: string;
  gradePoints: number;
  totalPoints: number;
  maxPoints: number;
  categoryBreakdown: CategoryGrade[];
  lastUpdated: string;
}

export interface CategoryGrade {
  categoryName: string;
  currentScore: number;
  maxScore: number;
  percentage: number;
  weight: number;
  gradeCount: number;
}

export interface CreateGradeData {
  studentId: string;
  courseId: string;
  assignmentId?: string;
  assignmentName?: string;
  assignmentType: 'homework' | 'quiz' | 'exam' | 'project' | 'participation' | 'midterm' | 'final';
  score: number;
  maxScore: number;
  weight: number;
  gradedDate: string;
  dueDate?: string;
  submittedDate?: string;
  feedback?: string;
  rubricScores?: RubricScore[];
  isExcused?: boolean;
  isLate?: boolean;
  latePenalty?: number;
}

export interface UpdateGradeData {
  score?: number;
  maxScore?: number;
  weight?: number;
  gradedDate?: string;
  feedback?: string;
  rubricScores?: RubricScore[];
  isExcused?: boolean;
  isLate?: boolean;
  latePenalty?: number;
}

export interface GradeFilter {
  courseId?: string;
  studentId?: string;
  assignmentType?: string;
  startDate?: string;
  endDate?: string;
  minGrade?: number;
  maxGrade?: number;
}

export interface GradeStats {
  totalGrades: number;
  averageGrade: number;
  highestGrade: number;
  lowestGrade: number;
  passingGrades: number;
  failingGrades: number;
  gradeDistribution: {
    'A': number;
    'B': number;
    'C': number;
    'D': number;
    'F': number;
  };
}

export interface BulkGradeData {
  grades: CreateGradeData[];
  courseId: string;
  assignmentName: string;
  assignmentType: 'homework' | 'quiz' | 'exam' | 'project' | 'participation' | 'midterm' | 'final';
  maxScore: number;
  weight: number;
  dueDate?: string;
}

// Utility functions for grade calculations
export const calculateLetterGrade = (percentage: number): string => {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
};

export const calculateGradePoints = (letterGrade: string): number => {
  const gradePoints: { [key: string]: number } = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };
  return gradePoints[letterGrade] || 0.0;
};

export const calculatePercentage = (score: number, maxScore: number): number => {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100 * 100) / 100; // Round to 2 decimal places
};
