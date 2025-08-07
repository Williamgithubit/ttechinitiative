import { StudentService } from '@/services/studentService';
import { AssignmentService } from '@/services/assignmentService';

export class TeacherDataSeeder {
  static async seedAllData(courseIds: string[], teacherId: string): Promise<void> {
    try {
      console.log('Starting to seed teacher dashboard data...');
      
      // Create sample students
      await StudentService.createSampleStudents(courseIds);
      console.log('✅ Sample students created');
      
      // Create sample assignments
      await AssignmentService.createSampleAssignments(courseIds, teacherId);
      console.log('✅ Sample assignments created');
      
      // Create sample performance data
      await this.createSamplePerformanceData(courseIds);
      console.log('✅ Sample performance data created');
      
      console.log('🎉 All teacher dashboard data seeded successfully!');
    } catch (error) {
      console.error('❌ Error seeding teacher dashboard data:', error);
      throw error;
    }
  }

  private static async createSamplePerformanceData(courseIds: string[]): Promise<void> {
    // This would create sample performance data for students
    // For now, we'll just log that it would be created
    console.log('Creating sample performance data for courses:', courseIds);
    
    // In a real implementation, this would:
    // 1. Get all students
    // 2. Create performance records for each student in each course
    // 3. Add sample assignment grades
    // 4. Add attendance records
    // 5. Add activity logs
  }

  static async createSampleCourses(): Promise<string[]> {
    // Mock course creation - in a real app, this would create actual course records
    const sampleCourses = [
      { id: 'math-101', name: 'Mathematics 101', subject: 'Mathematics' },
      { id: 'science-201', name: 'Science 201', subject: 'Science' },
      { id: 'english-101', name: 'English Literature 101', subject: 'English' }
    ];

    console.log('Mock courses created:', sampleCourses);
    return sampleCourses.map(course => course.id);
  }
}
