import { AttendanceService } from '@/services/attendanceService';
import { StudentService } from '@/services/studentService';
import { CourseService } from '@/services/courseService';
import { AttendanceStatus } from '@/types/attendance';

export const seedAttendanceData = async (): Promise<void> => {
  try {
    console.log('Starting attendance data seeding...');

    // Get existing students and courses
    const [students, courses] = await Promise.all([
      StudentService.getStudents(),
      CourseService.getCourses()
    ]);

    if (students.length === 0 || courses.length === 0) {
      console.warn('No students or courses found. Please seed student and course data first.');
      return;
    }

    const teacherId = 'teacher-1'; // Mock teacher ID
    const statuses: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

    // Generate attendance data for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const attendancePromises: Promise<any>[] = [];

    // For each day in the range
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];
      
      // Skip weekends (assuming classes are Monday-Friday)
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      // For each course
      for (const course of courses) {
        // Create attendance session
        const sessionPromise = AttendanceService.createAttendanceSession(
          course.id,
          course.name,
          dateString,
          '09:00',
          '17:00',
          teacherId
        );
        attendancePromises.push(sessionPromise);

        // Get students enrolled in this course
        const enrolledStudents = students.filter(student => 
          student.enrolledCourses?.includes(course.id)
        );

        // Mark attendance for each enrolled student
        for (const student of enrolledStudents) {
          // 85% chance of being present, 10% absent, 3% late, 2% excused
          const random = Math.random();
          let status: AttendanceStatus;
          let checkInTime: string | undefined;
          let checkOutTime: string | undefined;
          let notes: string | undefined;

          if (random < 0.85) {
            status = 'present';
            // Random check-in time between 8:45 and 9:15
            const checkInMinutes = 8 * 60 + 45 + Math.floor(Math.random() * 30);
            const checkInHours = Math.floor(checkInMinutes / 60);
            const checkInMins = checkInMinutes % 60;
            checkInTime = `${checkInHours.toString().padStart(2, '0')}:${checkInMins.toString().padStart(2, '0')}`;
            
            // Random check-out time between 16:45 and 17:15
            const checkOutMinutes = 16 * 60 + 45 + Math.floor(Math.random() * 30);
            const checkOutHours = Math.floor(checkOutMinutes / 60);
            const checkOutMins = checkOutMinutes % 60;
            checkOutTime = `${checkOutHours.toString().padStart(2, '0')}:${checkOutMins.toString().padStart(2, '0')}`;
          } else if (random < 0.95) {
            status = 'absent';
            notes = getRandomAbsentReason();
          } else if (random < 0.98) {
            status = 'late';
            // Late check-in time between 9:15 and 10:00
            const checkInMinutes = 9 * 60 + 15 + Math.floor(Math.random() * 45);
            const checkInHours = Math.floor(checkInMinutes / 60);
            const checkInMins = checkInMinutes % 60;
            checkInTime = `${checkInHours.toString().padStart(2, '0')}:${checkInMins.toString().padStart(2, '0')}`;
            
            // Normal check-out time
            const checkOutMinutes = 16 * 60 + 45 + Math.floor(Math.random() * 30);
            const checkOutHours = Math.floor(checkOutMinutes / 60);
            const checkOutMins = checkOutMinutes % 60;
            checkOutTime = `${checkOutHours.toString().padStart(2, '0')}:${checkOutMins.toString().padStart(2, '0')}`;
            notes = 'Arrived late due to traffic';
          } else {
            status = 'excused';
            notes = getRandomExcusedReason();
          }

          const attendancePromise = AttendanceService.markAttendance({
            studentId: student.id,
            courseId: course.id,
            date: dateString,
            status,
            checkInTime,
            checkOutTime,
            notes
          }, teacherId);

          attendancePromises.push(attendancePromise);
        }
      }
    }

    // Execute all attendance marking operations
    await Promise.all(attendancePromises);

    console.log(`Successfully seeded attendance data for ${attendancePromises.length} records`);
    
  } catch (error) {
    console.error('Error seeding attendance data:', error);
    throw error;
  }
};

const getRandomAbsentReason = (): string => {
  const reasons = [
    'Sick leave',
    'Family emergency',
    'Medical appointment',
    'Personal reasons',
    'Transportation issues',
    'Weather conditions',
    'Technical difficulties'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
};

const getRandomExcusedReason = (): string => {
  const reasons = [
    'School event participation',
    'Medical appointment with documentation',
    'Family bereavement',
    'Court appearance',
    'Religious observance',
    'Educational field trip',
    'Pre-approved absence'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
};

// Utility function to seed specific date range
export const seedAttendanceForDateRange = async (
  startDate: string,
  endDate: string,
  courseIds?: string[]
): Promise<void> => {
  try {
    const [students, courses] = await Promise.all([
      StudentService.getStudents(),
      CourseService.getCourses()
    ]);

    const targetCourses = courseIds 
      ? courses.filter(c => courseIds.includes(c.id))
      : courses;

    const teacherId = 'teacher-1';
    const attendancePromises: Promise<any>[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      for (const course of targetCourses) {
        const enrolledStudents = students.filter(student => 
          student.enrolledCourses?.includes(course.id)
        );

        for (const student of enrolledStudents) {
          const random = Math.random();
          let status: AttendanceStatus = random < 0.85 ? 'present' : 
                                       random < 0.95 ? 'absent' : 
                                       random < 0.98 ? 'late' : 'excused';

          const attendancePromise = AttendanceService.markAttendance({
            studentId: student.id,
            courseId: course.id,
            date: dateString,
            status,
            notes: status === 'absent' ? getRandomAbsentReason() : 
                   status === 'excused' ? getRandomExcusedReason() : undefined
          }, teacherId);

          attendancePromises.push(attendancePromise);
        }
      }
    }

    await Promise.all(attendancePromises);
    console.log(`Successfully seeded attendance data for date range: ${startDate} to ${endDate}`);
    
  } catch (error) {
    console.error('Error seeding attendance data for date range:', error);
    throw error;
  }
};
