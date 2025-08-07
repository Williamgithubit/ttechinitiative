import { collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';

export const seedReportData = async (teacherId: string, courseIds: string[]) => {
  try {
    console.log('Seeding report data...');

    // Create sample submissions for existing assignments
    const sampleSubmissions = [
      {
        studentId: 'student-1',
        assignmentId: 'assignment-1',
        courseId: courseIds[0] || 'course-1',
        grade: 85,
        submittedAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        feedback: 'Great work! Well-structured solution.',
        isLate: false,
        timeSpent: 45
      },
      {
        studentId: 'student-2',
        assignmentId: 'assignment-1',
        courseId: courseIds[0] || 'course-1',
        grade: 92,
        submittedAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        feedback: 'Excellent understanding of the concepts.',
        isLate: false,
        timeSpent: 38
      },
      {
        studentId: 'student-3',
        assignmentId: 'assignment-1',
        courseId: courseIds[0] || 'course-1',
        grade: 67,
        submittedAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
        feedback: 'Good effort, but needs improvement in implementation.',
        isLate: true,
        timeSpent: 62
      },
      {
        studentId: 'student-1',
        assignmentId: 'assignment-2',
        courseId: courseIds[0] || 'course-1',
        grade: 78,
        submittedAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
        feedback: 'Good progress, keep practicing.',
        isLate: false,
        timeSpent: 52
      },
      {
        studentId: 'student-2',
        assignmentId: 'assignment-2',
        courseId: courseIds[0] || 'course-1',
        grade: 88,
        submittedAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
        feedback: 'Very good work, clear understanding.',
        isLate: false,
        timeSpent: 41
      }
    ];

    // Add submissions to Firestore
    for (const submission of sampleSubmissions) {
      await addDoc(collection(db, 'submissions'), submission);
    }

    // Create sample lesson assignments (type: 'lesson')
    const sampleLessons = [
      {
        title: 'Introduction to React Hooks',
        description: 'Learn about useState and useEffect hooks',
        type: 'lesson',
        courseId: courseIds[0] || 'course-1',
        teacherId: teacherId,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        dueDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        maxPoints: 100,
        instructions: 'Complete the interactive lesson on React Hooks',
        status: 'published'
      },
      {
        title: 'JavaScript ES6 Features',
        description: 'Arrow functions, destructuring, and template literals',
        type: 'lesson',
        courseId: courseIds[1] || 'course-2',
        teacherId: teacherId,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
        dueDate: Timestamp.fromDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)),
        maxPoints: 100,
        instructions: 'Study ES6 features and complete the exercises',
        status: 'published'
      },
      {
        title: 'Database Design Principles',
        description: 'Normalization and relationship design',
        type: 'lesson',
        courseId: courseIds[0] || 'course-1',
        teacherId: teacherId,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
        dueDate: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
        maxPoints: 100,
        instructions: 'Learn about database normalization and ER diagrams',
        status: 'published'
      }
    ];

    // Add lessons to Firestore
    for (const lesson of sampleLessons) {
      await addDoc(collection(db, 'assignments'), lesson);
    }

    // Create sample student activity data
    const sampleActivities = [
      {
        studentId: 'student-1',
        courseId: courseIds[0] || 'course-1',
        activityType: 'lesson_view',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 1 * 60 * 60 * 1000)),
        duration: 25,
        metadata: {
          lessonId: 'lesson-1',
          completionRate: 0.8
        }
      },
      {
        studentId: 'student-2',
        courseId: courseIds[0] || 'course-1',
        activityType: 'assignment_submission',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
        duration: 45,
        metadata: {
          assignmentId: 'assignment-1',
          attempts: 1
        }
      },
      {
        studentId: 'student-3',
        courseId: courseIds[0] || 'course-1',
        activityType: 'discussion_post',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 3 * 60 * 60 * 1000)),
        duration: 15,
        metadata: {
          postId: 'post-1',
          wordCount: 150
        }
      }
    ];

    // Add activities to Firestore
    for (const activity of sampleActivities) {
      await addDoc(collection(db, 'student_activities'), activity);
    }

    // Create sample feedback data
    const sampleFeedback = [
      {
        studentId: 'student-1',
        assignmentId: 'assignment-1',
        courseId: courseIds[0] || 'course-1',
        teacherId: teacherId,
        feedback: 'Great work on this assignment! Your code is well-structured and follows best practices.',
        rating: 4,
        timestamp: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        type: 'assignment_feedback'
      },
      {
        studentId: 'student-2',
        assignmentId: 'assignment-1',
        courseId: courseIds[0] || 'course-1',
        teacherId: teacherId,
        feedback: 'Excellent understanding of the concepts. Keep up the good work!',
        rating: 5,
        timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        type: 'assignment_feedback'
      },
      {
        studentId: 'student-3',
        assignmentId: 'assignment-1',
        courseId: courseIds[0] || 'course-1',
        teacherId: teacherId,
        feedback: 'Good effort, but there are some areas for improvement. Please review the feedback comments.',
        rating: 3,
        timestamp: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
        type: 'assignment_feedback'
      }
    ];

    // Add feedback to Firestore
    for (const feedback of sampleFeedback) {
      await addDoc(collection(db, 'feedback'), feedback);
    }

    console.log('Report data seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding report data:', error);
    throw error;
  }
};

export const seedAdditionalStudentData = async (courseIds: string[]) => {
  try {
    console.log('Seeding additional student data...');

    // Create more diverse student data for better reports
    const additionalStudents = [
      {
        id: 'student-4',
        name: 'Emma Wilson',
        email: 'emma.wilson@student.edu',
        grade: '11th',
        status: 'active',
        courseIds: [courseIds[0] || 'course-1'],
        enrollmentDate: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        lastActivity: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
        parentContact: {
          name: 'Robert Wilson',
          email: 'robert.wilson@email.com',
          phone: '555-0104'
        }
      },
      {
        id: 'student-5',
        name: 'James Brown',
        email: 'james.brown@student.edu',
        grade: '12th',
        status: 'active',
        courseIds: [courseIds[1] || 'course-2'],
        enrollmentDate: Timestamp.fromDate(new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)),
        lastActivity: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        parentContact: {
          name: 'Linda Brown',
          email: 'linda.brown@email.com',
          phone: '555-0105'
        }
      },
      {
        id: 'student-6',
        name: 'Sophia Davis',
        email: 'sophia.davis@student.edu',
        grade: '10th',
        status: 'active',
        courseIds: [courseIds[0] || 'course-1', courseIds[1] || 'course-2'],
        enrollmentDate: Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
        lastActivity: Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000)),
        parentContact: {
          name: 'Michael Davis',
          email: 'michael.davis@email.com',
          phone: '555-0106'
        }
      }
    ];

    // Add students to Firestore
    for (const student of additionalStudents) {
      await setDoc(doc(db, 'students', student.id), student);
    }

    console.log('Additional student data seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding additional student data:', error);
    throw error;
  }
};
