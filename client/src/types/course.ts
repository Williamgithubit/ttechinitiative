import { Timestamp } from 'firebase/firestore';

export interface Course {
  id: string;
  name: string;
  description: string;
  code: string; // Course code like "MATH101"
  teacherId: string;
  teacherName: string;
  subject: string;
  grade?: string;
  semester: string;
  year: number;
  status: 'active' | 'inactive' | 'completed' | 'draft';
  enrollmentCount: number;
  maxEnrollment?: number;
  schedule?: {
    days: string[]; // ['Monday', 'Wednesday', 'Friday']
    startTime: string; // '09:00'
    endTime: string; // '10:30'
    room?: string;
  };
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export interface CreateCourseData {
  name: string;
  description: string;
  code: string;
  subject: string;
  grade?: string;
  semester: string;
  year: number;
  maxEnrollment?: number;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
    room?: string;
  };
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  status?: 'active' | 'inactive' | 'completed' | 'draft';
}

export type CourseStatus = 'active' | 'inactive' | 'completed' | 'draft';
export type CourseSubject = 'Mathematics' | 'Science' | 'English' | 'History' | 'Art' | 'Physical Education' | 'Music' | 'Computer Science' | 'Other';
