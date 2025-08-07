import { GradeService } from '@/services/gradeService';
import { CreateGradeData } from '@/types/grade';

export const seedGradeData = async (teacherId: string): Promise<void> => {
  try {
    console.log('Starting to seed grade data...');

    // Sample grade data for different students and courses
    const sampleGrades: CreateGradeData[] = [
      // Mathematics grades
      {
        studentId: 'student1',
        courseId: 'course1',
        assignmentName: 'Algebra Quiz 1',
        assignmentType: 'quiz',
        score: 85,
        maxScore: 100,
        weight: 10,
        gradedDate: '2024-01-15',
        dueDate: '2024-01-14',
        submittedDate: '2024-01-14',
        feedback: 'Good work on linear equations. Review quadratic formulas.',
        isLate: false
      },
      {
        studentId: 'student1',
        courseId: 'course1',
        assignmentName: 'Geometry Homework',
        assignmentType: 'homework',
        score: 92,
        maxScore: 100,
        weight: 5,
        gradedDate: '2024-01-20',
        dueDate: '2024-01-19',
        submittedDate: '2024-01-19',
        feedback: 'Excellent understanding of geometric principles.',
        isLate: false
      },
      {
        studentId: 'student1',
        courseId: 'course1',
        assignmentName: 'Midterm Exam',
        assignmentType: 'midterm',
        score: 78,
        maxScore: 100,
        weight: 25,
        gradedDate: '2024-02-01',
        dueDate: '2024-02-01',
        submittedDate: '2024-02-01',
        feedback: 'Solid performance. Focus on calculus concepts for improvement.',
        isLate: false
      },
      {
        studentId: 'student2',
        courseId: 'course1',
        assignmentName: 'Algebra Quiz 1',
        assignmentType: 'quiz',
        score: 95,
        maxScore: 100,
        weight: 10,
        gradedDate: '2024-01-15',
        dueDate: '2024-01-14',
        submittedDate: '2024-01-14',
        feedback: 'Outstanding work! Perfect understanding demonstrated.',
        isLate: false
      },
      {
        studentId: 'student2',
        courseId: 'course1',
        assignmentName: 'Geometry Homework',
        assignmentType: 'homework',
        score: 88,
        maxScore: 100,
        weight: 5,
        gradedDate: '2024-01-20',
        dueDate: '2024-01-19',
        submittedDate: '2024-01-20',
        feedback: 'Good work, but submitted late.',
        isLate: true,
        latePenalty: 5
      },
      
      // Science grades
      {
        studentId: 'student1',
        courseId: 'course2',
        assignmentName: 'Chemistry Lab Report',
        assignmentType: 'project',
        score: 90,
        maxScore: 100,
        weight: 15,
        gradedDate: '2024-01-25',
        dueDate: '2024-01-24',
        submittedDate: '2024-01-24',
        feedback: 'Excellent lab technique and analysis. Well-written report.',
        isLate: false
      },
      {
        studentId: 'student1',
        courseId: 'course2',
        assignmentName: 'Physics Quiz',
        assignmentType: 'quiz',
        score: 82,
        maxScore: 100,
        weight: 10,
        gradedDate: '2024-02-05',
        dueDate: '2024-02-05',
        submittedDate: '2024-02-05',
        feedback: 'Good understanding of motion concepts. Review energy principles.',
        isLate: false
      },
      {
        studentId: 'student2',
        courseId: 'course2',
        assignmentName: 'Chemistry Lab Report',
        assignmentType: 'project',
        score: 87,
        maxScore: 100,
        weight: 15,
        gradedDate: '2024-01-25',
        dueDate: '2024-01-24',
        submittedDate: '2024-01-24',
        feedback: 'Good experimental design. Improve data analysis section.',
        isLate: false
      },
      
      // English grades
      {
        studentId: 'student3',
        courseId: 'course3',
        assignmentName: 'Essay: Shakespeare Analysis',
        assignmentType: 'project',
        score: 94,
        maxScore: 100,
        weight: 20,
        gradedDate: '2024-01-30',
        dueDate: '2024-01-29',
        submittedDate: '2024-01-29',
        feedback: 'Exceptional analysis and writing. Great use of textual evidence.',
        isLate: false
      },
      {
        studentId: 'student3',
        courseId: 'course3',
        assignmentName: 'Grammar Quiz',
        assignmentType: 'quiz',
        score: 76,
        maxScore: 100,
        weight: 8,
        gradedDate: '2024-02-10',
        dueDate: '2024-02-10',
        submittedDate: '2024-02-10',
        feedback: 'Review punctuation rules and sentence structure.',
        isLate: false
      },
      {
        studentId: 'student4',
        courseId: 'course3',
        assignmentName: 'Essay: Shakespeare Analysis',
        assignmentType: 'project',
        score: 81,
        maxScore: 100,
        weight: 20,
        gradedDate: '2024-01-30',
        dueDate: '2024-01-29',
        submittedDate: '2024-01-31',
        feedback: 'Good ideas but needs better organization. Late submission.',
        isLate: true,
        latePenalty: 10
      },
      
      // History grades
      {
        studentId: 'student3',
        courseId: 'course4',
        assignmentName: 'World War II Research Project',
        assignmentType: 'project',
        score: 89,
        maxScore: 100,
        weight: 25,
        gradedDate: '2024-02-15',
        dueDate: '2024-02-14',
        submittedDate: '2024-02-14',
        feedback: 'Thorough research and good presentation. Excellent use of primary sources.',
        isLate: false
      },
      {
        studentId: 'student4',
        courseId: 'course4',
        assignmentName: 'World War II Research Project',
        assignmentType: 'project',
        score: 73,
        maxScore: 100,
        weight: 25,
        gradedDate: '2024-02-15',
        dueDate: '2024-02-14',
        submittedDate: '2024-02-14',
        feedback: 'Adequate research but needs more analysis and better citations.',
        isLate: false
      },
      {
        studentId: 'student5',
        courseId: 'course4',
        assignmentName: 'Civil Rights Movement Essay',
        assignmentType: 'homework',
        score: 96,
        maxScore: 100,
        weight: 15,
        gradedDate: '2024-02-20',
        dueDate: '2024-02-19',
        submittedDate: '2024-02-19',
        feedback: 'Outstanding analysis and writing. Excellent historical perspective.',
        isLate: false
      },
      
      // Additional participation and exam grades
      {
        studentId: 'student1',
        courseId: 'course1',
        assignmentName: 'Class Participation - Week 3',
        assignmentType: 'participation',
        score: 95,
        maxScore: 100,
        weight: 5,
        gradedDate: '2024-01-21',
        feedback: 'Excellent engagement and thoughtful contributions to discussions.',
        isLate: false
      },
      {
        studentId: 'student2',
        courseId: 'course2',
        assignmentName: 'Final Exam',
        assignmentType: 'final',
        score: 91,
        maxScore: 100,
        weight: 30,
        gradedDate: '2024-02-25',
        dueDate: '2024-02-25',
        submittedDate: '2024-02-25',
        feedback: 'Strong performance across all topics. Well prepared.',
        isLate: false
      },
      {
        studentId: 'student3',
        courseId: 'course3',
        assignmentName: 'Vocabulary Quiz 2',
        assignmentType: 'quiz',
        score: 88,
        maxScore: 100,
        weight: 8,
        gradedDate: '2024-02-12',
        dueDate: '2024-02-12',
        submittedDate: '2024-02-12',
        feedback: 'Good improvement from last quiz. Keep studying!',
        isLate: false
      },
      {
        studentId: 'student4',
        courseId: 'course4',
        assignmentName: 'Map Skills Assessment',
        assignmentType: 'quiz',
        score: 79,
        maxScore: 100,
        weight: 10,
        gradedDate: '2024-02-08',
        dueDate: '2024-02-08',
        submittedDate: '2024-02-08',
        feedback: 'Need to practice reading coordinates and scale.',
        isLate: false
      },
      {
        studentId: 'student5',
        courseId: 'course1',
        assignmentName: 'Statistics Project',
        assignmentType: 'project',
        score: 93,
        maxScore: 100,
        weight: 20,
        gradedDate: '2024-02-18',
        dueDate: '2024-02-17',
        submittedDate: '2024-02-17',
        feedback: 'Excellent data analysis and clear presentation of findings.',
        isLate: false
      }
    ];

    // Create grades in batches to avoid overwhelming the database
    const batchSize = 5;
    for (let i = 0; i < sampleGrades.length; i += batchSize) {
      const batch = sampleGrades.slice(i, i + batchSize);
      const promises = batch.map(gradeData => 
        GradeService.createGrade(gradeData, teacherId)
      );
      
      await Promise.all(promises);
      console.log(`Created grades batch ${Math.floor(i / batchSize) + 1}`);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Successfully seeded ${sampleGrades.length} grades!`);
  } catch (error) {
    console.error('Error seeding grade data:', error);
    throw error;
  }
};
