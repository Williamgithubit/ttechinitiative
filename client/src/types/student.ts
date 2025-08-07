import { FirestoreTimestamp } from './auth';

export interface Student {
  id: string;
  uid: string; // Firebase Auth UID
  name: string;
  email: string;
  photoURL?: string;
  enrolledCourses: string[]; // Course IDs
  parentContact?: {
    name: string;
    email: string;
    phone: string;
  };
  grade?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: FirestoreTimestamp | string;
  updatedAt: FirestoreTimestamp | string;
  lastLoginAt?: FirestoreTimestamp | string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface StudentPerformance {
  studentId: string;
  courseId: string;
  assignments: AssignmentGrade[];
  overallGrade: number;
  attendance: AttendanceRecord[];
  participationScore: number;
  lastActivity: FirestoreTimestamp | string;
  engagementMetrics: {
    loginFrequency: number;
    timeSpentInCourse: number; // minutes
    assignmentsCompleted: number;
    assignmentsTotal: number;
    averageSubmissionTime: number; // hours before deadline
  };
}

export interface AssignmentGrade {
  assignmentId: string;
  assignmentTitle: string;
  grade: number;
  maxPoints: number;
  submittedAt?: FirestoreTimestamp | string;
  gradedAt?: FirestoreTimestamp | string;
  feedback?: string;
  status: 'not_submitted' | 'submitted' | 'graded' | 'late';
}

export interface AttendanceRecord {
  date: FirestoreTimestamp | string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface StudentProfile extends Student {
  performance: StudentPerformance[];
  recentActivity: ActivityLog[];
  notes: TeacherNote[];
}

export interface ActivityLog {
  id: string;
  studentId: string;
  action: string;
  details: string;
  timestamp: FirestoreTimestamp | string;
  courseId?: string;
  assignmentId?: string;
}

export interface TeacherNote {
  id: string;
  studentId: string;
  teacherId: string;
  content: string;
  isPrivate: boolean;
  createdAt: FirestoreTimestamp | string;
  updatedAt: FirestoreTimestamp | string;
}
