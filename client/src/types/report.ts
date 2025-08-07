export interface StudentProgress {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  overallGrade: number;
  completedAssignments: number;
  totalAssignments: number;
  completionRate: number;
  averageScore: number;
  lastActivity: Date;
  engagementScore: number; // 0-100 based on participation, submission timeliness, etc.
  strengths: string[];
  areasForImprovement: string[];
  recentSubmissions: RecentSubmission[];
}

export interface RecentSubmission {
  assignmentId: string;
  assignmentTitle: string;
  submittedAt: Date;
  grade: number;
  feedback?: string;
  isLate: boolean;
}

export interface CourseProgress {
  courseId: string;
  courseName: string;
  totalStudents: number;
  activeStudents: number;
  averageGrade: number;
  completionRate: number;
  engagementLevel: 'High' | 'Medium' | 'Low';
  topPerformers: StudentSummary[];
  strugglingStudents: StudentSummary[];
  assignmentStats: AssignmentStats[];
}

export interface StudentSummary {
  studentId: string;
  name: string;
  grade: number;
  completionRate: number;
}

export interface AssignmentStats {
  assignmentId: string;
  title: string;
  type: string;
  averageGrade: number;
  completionRate: number;
  submissionCount: number;
  totalStudents: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface LessonResponse {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  studentResponses: StudentLessonResponse[];
  averageEngagement: number;
  completionRate: number;
  averageTimeSpent: number; // in minutes
  feedbackSentiment: 'Positive' | 'Neutral' | 'Negative';
  commonQuestions: string[];
  difficultyRating: number; // 1-5 scale
}

export interface StudentLessonResponse {
  studentId: string;
  studentName: string;
  completed: boolean;
  timeSpent: number; // in minutes
  engagementScore: number; // 0-100
  questionsAsked: number;
  feedback?: string;
  difficultyRating?: number; // 1-5 scale
  completedAt?: Date;
}

export interface ReportFilters {
  courseId?: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  studentIds?: string[];
  assignmentTypes?: string[];
  performanceLevel?: 'all' | 'high' | 'medium' | 'low';
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ReportSummary {
  totalStudents: number;
  averageGrade: number;
  completionRate: number;
  engagementLevel: number;
  improvementTrend: 'up' | 'down' | 'stable';
  topCourse: string;
  mostEngagedStudent: string;
  needsAttention: StudentSummary[];
}
