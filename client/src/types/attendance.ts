import { FirestoreTimestamp } from './common';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  date: string; // YYYY-MM-DD format
  status: AttendanceStatus;
  checkInTime?: FirestoreTimestamp | string;
  checkOutTime?: FirestoreTimestamp | string;
  notes?: string;
  markedBy: string; // teacher ID
  markedAt: FirestoreTimestamp | string;
  updatedAt?: FirestoreTimestamp | string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseName: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  teacherId: string;
  isActive: boolean;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  createdAt: FirestoreTimestamp | string;
  updatedAt?: FirestoreTimestamp | string;
}

export interface AttendanceStats {
  totalSessions: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  attendanceRate: number; // percentage
  punctualityRate: number; // percentage (present + excused) / total
}

export interface StudentAttendanceRecord {
  studentId: string;
  studentName: string;
  records: AttendanceRecord[];
  stats: AttendanceStats;
}

export interface AttendanceFilter {
  courseId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  studentId?: string;
}

export interface CreateAttendanceData {
  studentId: string;
  courseId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface UpdateAttendanceData {
  status?: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface AttendanceReport {
  sessionId: string;
  courseId: string;
  courseName: string;
  date: string;
  totalStudents: number;
  attendanceRecords: AttendanceRecord[];
  summary: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
}
