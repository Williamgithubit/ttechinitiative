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
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { 
  AttendanceRecord, 
  AttendanceSession, 
  CreateAttendanceData, 
  UpdateAttendanceData,
  AttendanceFilter,
  StudentAttendanceRecord,
  AttendanceStats,
  AttendanceReport
} from '@/types/attendance';
import { Student } from '@/types/student';

const ATTENDANCE_COLLECTION = 'attendance';
const ATTENDANCE_SESSIONS_COLLECTION = 'attendanceSessions';

export class AttendanceService {
  // Create attendance session
  static async createAttendanceSession(
    courseId: string, 
    courseName: string, 
    date: string, 
    startTime: string, 
    endTime: string, 
    teacherId: string
  ): Promise<string> {
    try {
      const sessionData: Omit<AttendanceSession, 'id'> = {
        courseId,
        courseName,
        date,
        startTime,
        endTime,
        teacherId,
        isActive: true,
        totalStudents: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, ATTENDANCE_SESSIONS_COLLECTION), sessionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating attendance session:', error);
      throw error;
    }
  }

  // Get attendance sessions
  static async getAttendanceSessions(teacherId: string, courseId?: string): Promise<AttendanceSession[]> {
    try {
      // Simplified query to avoid Firebase index requirement
      const q = query(
        collection(db, ATTENDANCE_SESSIONS_COLLECTION),
        where('teacherId', '==', teacherId)
      );

      const snapshot = await getDocs(q);
      let sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceSession[];

      // Filter by courseId on client side if needed
      if (courseId) {
        sessions = sessions.filter(session => session.courseId === courseId);
      }

      // Sort by date on client side to avoid index requirement
      sessions.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // descending order
      });

      return sessions;
    } catch (error) {
      console.error('Error fetching attendance sessions:', error);
      // Return empty array instead of throwing to prevent component crash
      return [];
    }
  }

  // Mark attendance for a student
  static async markAttendance(data: CreateAttendanceData, teacherId: string): Promise<string> {
    try {
      const attendanceData: Omit<AttendanceRecord, 'id'> = {
        studentId: data.studentId,
        studentName: '', // Will be populated from student data
        courseId: data.courseId,
        courseName: '', // Will be populated from course data
        date: data.date,
        status: data.status,
        checkInTime: data.checkInTime ? Timestamp.fromDate(new Date(`${data.date}T${data.checkInTime}`)) : undefined,
        checkOutTime: data.checkOutTime ? Timestamp.fromDate(new Date(`${data.date}T${data.checkOutTime}`)) : undefined,
        notes: data.notes,
        markedBy: teacherId,
        markedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), attendanceData);
      
      // Update session counts
      await this.updateSessionCounts(data.courseId, data.date);
      
      return docRef.id;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  // Bulk mark attendance for multiple students
  static async bulkMarkAttendance(
    students: Student[], 
    courseId: string, 
    courseName: string,
    date: string, 
    teacherId: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      students.forEach(student => {
        const docRef = doc(collection(db, ATTENDANCE_COLLECTION));
        const attendanceData: Omit<AttendanceRecord, 'id'> = {
          studentId: student.id,
          studentName: student.name,
          courseId,
          courseName,
          date,
          status: 'present', // Default to present
          markedBy: teacherId,
          markedAt: Timestamp.now()
        };
        batch.set(docRef, attendanceData);
      });

      await batch.commit();
      await this.updateSessionCounts(courseId, date);
    } catch (error) {
      console.error('Error bulk marking attendance:', error);
      throw error;
    }
  }

  // Update attendance record
  static async updateAttendance(id: string, data: UpdateAttendanceData): Promise<void> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now()
      };

      if (data.checkInTime) {
        updateData.checkInTime = Timestamp.fromDate(new Date(data.checkInTime));
      }
      if (data.checkOutTime) {
        updateData.checkOutTime = Timestamp.fromDate(new Date(data.checkOutTime));
      }

      await updateDoc(doc(db, ATTENDANCE_COLLECTION, id), updateData);
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }

  // Get attendance records with filters
  static async getAttendanceRecords(filter: AttendanceFilter = {}): Promise<AttendanceRecord[]> {
    try {
      let q = query(collection(db, ATTENDANCE_COLLECTION), orderBy('date', 'desc'));

      if (filter.courseId) {
        q = query(q, where('courseId', '==', filter.courseId));
      }
      if (filter.studentId) {
        q = query(q, where('studentId', '==', filter.studentId));
      }
      if (filter.status) {
        q = query(q, where('status', '==', filter.status));
      }

      const snapshot = await getDocs(q);
      let records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];

      // Apply date filters
      if (filter.startDate) {
        records = records.filter(record => record.date >= filter.startDate!);
      }
      if (filter.endDate) {
        records = records.filter(record => record.date <= filter.endDate!);
      }

      return records;
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }
  }

  // Get student attendance summary
  static async getStudentAttendanceSummary(
    studentId: string, 
    courseId?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<StudentAttendanceRecord> {
    try {
      const filter: AttendanceFilter = { studentId, courseId, startDate, endDate };
      const records = await this.getAttendanceRecords(filter);
      
      const stats = this.calculateAttendanceStats(records);
      
      return {
        studentId,
        studentName: records[0]?.studentName || '',
        records,
        stats
      };
    } catch (error) {
      console.error('Error fetching student attendance summary:', error);
      throw error;
    }
  }

  // Calculate attendance statistics
  static calculateAttendanceStats(records: AttendanceRecord[]): AttendanceStats {
    const totalSessions = records.length;
    const totalPresent = records.filter(r => r.status === 'present').length;
    const totalAbsent = records.filter(r => r.status === 'absent').length;
    const totalLate = records.filter(r => r.status === 'late').length;
    const totalExcused = records.filter(r => r.status === 'excused').length;
    
    const attendanceRate = totalSessions > 0 ? ((totalPresent + totalLate + totalExcused) / totalSessions) * 100 : 0;
    const punctualityRate = totalSessions > 0 ? ((totalPresent + totalExcused) / totalSessions) * 100 : 0;

    return {
      totalSessions,
      totalPresent,
      totalAbsent,
      totalLate,
      totalExcused,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      punctualityRate: Math.round(punctualityRate * 100) / 100
    };
  }

  // Generate attendance report
  static async generateAttendanceReport(
    courseId: string, 
    date: string
  ): Promise<AttendanceReport> {
    try {
      const records = await this.getAttendanceRecords({ courseId, startDate: date, endDate: date });
      
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const excused = records.filter(r => r.status === 'excused').length;
      const totalStudents = records.length;
      
      const attendanceRate = totalStudents > 0 ? ((present + late + excused) / totalStudents) * 100 : 0;

      return {
        sessionId: `${courseId}-${date}`,
        courseId,
        courseName: records[0]?.courseName || '',
        date,
        totalStudents,
        attendanceRecords: records,
        summary: {
          present,
          absent,
          late,
          excused,
          attendanceRate: Math.round(attendanceRate * 100) / 100
        }
      };
    } catch (error) {
      console.error('Error generating attendance report:', error);
      throw error;
    }
  }

  // Real-time listener for attendance records
  static subscribeToAttendanceRecords(
    filter: AttendanceFilter,
    callback: (records: AttendanceRecord[]) => void
  ): () => void {
    let q = query(collection(db, ATTENDANCE_COLLECTION), orderBy('date', 'desc'));

    if (filter.courseId) {
      q = query(q, where('courseId', '==', filter.courseId));
    }
    if (filter.studentId) {
      q = query(q, where('studentId', '==', filter.studentId));
    }

    return onSnapshot(q, (snapshot) => {
      let records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];

      // Apply additional filters
      if (filter.startDate) {
        records = records.filter(record => record.date >= filter.startDate!);
      }
      if (filter.endDate) {
        records = records.filter(record => record.date <= filter.endDate!);
      }
      if (filter.status) {
        records = records.filter(record => record.status === filter.status);
      }

      callback(records);
    });
  }

  // Delete attendance record
  static async deleteAttendanceRecord(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ATTENDANCE_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      throw error;
    }
  }

  // Update session counts (helper method)
  private static async updateSessionCounts(courseId: string, date: string): Promise<void> {
    try {
      const records = await this.getAttendanceRecords({ courseId, startDate: date, endDate: date });
      
      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = records.filter(r => r.status === 'absent').length;
      const lateCount = records.filter(r => r.status === 'late').length;
      const excusedCount = records.filter(r => r.status === 'excused').length;
      
      // Find and update the session
      const sessionsQuery = query(
        collection(db, ATTENDANCE_SESSIONS_COLLECTION),
        where('courseId', '==', courseId),
        where('date', '==', date)
      );
      
      const sessionsSnapshot = await getDocs(sessionsQuery);
      
      if (!sessionsSnapshot.empty) {
        const sessionDoc = sessionsSnapshot.docs[0];
        await updateDoc(sessionDoc.ref, {
          totalStudents: records.length,
          presentCount,
          absentCount,
          lateCount,
          excusedCount,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error updating session counts:', error);
    }
  }
}
