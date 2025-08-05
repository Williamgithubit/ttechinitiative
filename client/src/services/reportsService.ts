import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  startAfter,
  limit
} from 'firebase/firestore';
import { db } from '@/services/firebase';

// Utility to safely convert Firestore Timestamps or other date formats to a JS Date object
const toDate = (date: Timestamp | Date | string | undefined): Date | undefined => {
  if (!date) return undefined;
  if (date instanceof Timestamp) return date.toDate();
  if (date instanceof Date) return date;
  return new Date(date);
};

// Interfaces for Firestore documents
interface UserDoc {
  status: 'active' | 'inactive';
  createdAt: Timestamp | Date | string;
  lastLogin?: Timestamp | Date | string;
}

interface ProgramDoc {
  name: string;
  status: 'active' | 'inactive' | 'draft' | 'upcoming';
  createdAt: Timestamp | Date | string;
  startDate?: Timestamp | Date | string;
  endDate?: Timestamp | Date | string;
}

interface EventDoc {
  status: 'scheduled' | 'cancelled' | 'completed';
  date: Timestamp | Date | string;
}

interface TaskDoc {
  status: 'pending' | 'completed' | 'overdue';
  createdAt: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
  dueDate: Timestamp | Date | string;
}

export interface ReportData {
  id: string;
  title: string;
  type: 'user_activity' | 'program_performance' | 'engagement' | 'completion_rates';
  data: {
    [key: string]: string | number | boolean | Date | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalPrograms: number;
  activePrograms: number;
  totalEvents: number;
  upcomingEvents: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  userGrowth: UserGrowthData[];
  programEnrollment: ProgramEnrollmentData[];
  taskCompletion: TaskCompletionData[];
  userActivity: UserActivityData[];
}

export interface UserGrowthData {
  date: string;
  totalUsers: number;
  newUsers: number;
}

export interface ProgramEnrollmentData {
  programName: string;
  enrollments: number;
  completions: number;
  status: string;
}

export interface TaskCompletionData {
  date: string;
  completed: number;
  pending: number;
  overdue: number;
}

export interface UserActivityData {
  date: string;
  logins: number;
  activeUsers: number;
}

// Get comprehensive analytics data
export const getAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    // Fetch all collections data
    const [usersSnapshot, programsSnapshot, eventsSnapshot, tasksSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'programs')),
      getDocs(collection(db, 'events')),
      getDocs(collection(db, 'tasks'))
    ]);

    // Process users data
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data() as UserDoc;
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt) as Date,
        lastLogin: toDate(data.lastLogin),
      };
    });

    // Process programs data
    const programs = programsSnapshot.docs.map(doc => {
      const data = doc.data() as ProgramDoc;
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt) as Date,
      };
    });

    // Process events data
    const events = eventsSnapshot.docs.map(doc => {
      const data = doc.data() as EventDoc;
      return {
        id: doc.id,
        ...data,
        date: toDate(data.date) as Date,
      };
    });

    // Process tasks data
    const tasks = tasksSnapshot.docs.map(doc => {
      const data = doc.data() as TaskDoc;
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt) as Date,
        updatedAt: toDate(data.updatedAt),
        dueDate: toDate(data.dueDate) as Date,
      };
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate basic metrics
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'active').length;
    const totalPrograms = programs.length;
    const activePrograms = programs.filter(program => program.status === 'active').length;
    const totalEvents = events.length;
    const upcomingEvents = events.filter(event => event.date >= now && event.status !== 'cancelled').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Generate user growth data (last 30 days)
    const userGrowth: UserGrowthData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const usersUpToDate = users.filter(user => user.createdAt <= date).length;
      const newUsersOnDate = users.filter(user => {
        const userDate = user.createdAt.toISOString().split('T')[0];
        return userDate === dateStr;
      }).length;
      
      userGrowth.push({
        date: dateStr,
        totalUsers: usersUpToDate,
        newUsers: newUsersOnDate
      });
    }

    // Generate program enrollment data
    const programEnrollment: ProgramEnrollmentData[] = programs.map(program => ({
      programName: program.name,
      enrollments: Math.floor(Math.random() * 100) + 10, // Mock enrollment data
      completions: Math.floor(Math.random() * 50) + 5, // Mock completion data
      status: program.status
    }));

    // Generate task completion data (last 30 days)
    const taskCompletion: TaskCompletionData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const completedOnDate = tasks.filter(task => {
        if (task.status !== 'completed') return false;
        const completionDate = task.updatedAt || task.createdAt;
        return completionDate.toISOString().split('T')[0] === dateStr;
      }).length;

      const pendingOnDate = tasks.filter(task => {
        return task.status === 'pending' && task.createdAt <= date;
      }).length;

      const overdueOnDate = tasks.filter(task => {
        return task.status === 'pending' && task.dueDate < date;
      }).length;

      taskCompletion.push({
        date: dateStr,
        completed: completedOnDate,
        pending: pendingOnDate,
        overdue: overdueOnDate
      });
    }

    // Generate user activity data (last 30 days)
    const userActivity: UserActivityData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Mock activity data based on user count and some randomization
      const logins = Math.floor(Math.random() * activeUsers * 0.7) + Math.floor(activeUsers * 0.1);
      const activeUsersOnDate = Math.floor(Math.random() * activeUsers * 0.8) + Math.floor(activeUsers * 0.2);

      userActivity.push({
        date: dateStr,
        logins,
        activeUsers: activeUsersOnDate
      });
    }

    return {
      totalUsers,
      activeUsers,
      totalPrograms,
      activePrograms,
      totalEvents,
      upcomingEvents,
      totalTasks,
      completedTasks,
      completionRate,
      userGrowth,
      programEnrollment,
      taskCompletion,
      userActivity
    };

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw new Error('Failed to fetch analytics data');
  }
};

// Get user engagement metrics
export const getUserEngagementMetrics = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data() as UserDoc;
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt) as Date,
        lastLogin: toDate(data.lastLogin),
      };
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeLastWeek = users.filter(user => (user.lastLogin || user.createdAt) >= sevenDaysAgo).length;
    const activeLastMonth = users.filter(user => (user.lastLogin || user.createdAt) >= thirtyDaysAgo).length;
    const totalUsers = users.length;

    return {
      weeklyEngagement: totalUsers > 0 ? Math.round((activeLastWeek / totalUsers) * 100) : 0,
      monthlyEngagement: totalUsers > 0 ? Math.round((activeLastMonth / totalUsers) * 100) : 0,
      activeLastWeek,
      activeLastMonth,
      totalUsers
    };
  } catch (error) {
    console.error('Error fetching user engagement metrics:', error);
    throw new Error('Failed to fetch user engagement metrics');
  }
};

// Get program performance metrics
export const getProgramPerformanceMetrics = async () => {
  try {
    const programsSnapshot = await getDocs(collection(db, 'programs'));
    const programs = programsSnapshot.docs.map(doc => {
      const data = doc.data() as ProgramDoc;
      return {
        id: doc.id,
        ...data,
        createdAt: toDate(data.createdAt) as Date,
      };
    });

    const performanceData = programs.map(program => {
      const completions = Math.floor(Math.random() * 80) + 10; // Mock data
      const enrollments = Math.floor(Math.random() * 70) + completions; // Mock data, enrollments >= completions

      return {
        id: program.id,
        name: program.name,
        status: program.status,
        startDate: toDate(program.startDate),
        endDate: toDate(program.endDate),
        enrollments,
        completions,
        rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0-5.0
        completionRate: enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0,
      };
    });

    return performanceData;
  } catch (error) {
    console.error('Error fetching program performance metrics:', error);
    throw new Error('Failed to fetch program performance metrics');
  }
};
