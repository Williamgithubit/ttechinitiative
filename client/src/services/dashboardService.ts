import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

export interface DashboardStats {
  totalUsers: number;
  activePrograms: number;
  upcomingEvents: number;
  tasksCompleted: number;
  totalCertificates: number;
  totalAdmissions: number;
}

export interface RecentActivity {
  id: string;
  type:
    | "user_registered"
    | "program_created"
    | "event_created"
    | "task_completed";
  description: string;
  timestamp: string;
  user?: string;
}

/**
 * Fetch dashboard statistics from Firebase
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Try aggregated stats doc first (recommended). This keeps rules tight
    // and avoids broad collection reads on the client.
    const statsRef = doc(db, "dashboard", "stats");
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
      const data = statsSnap.data() as Partial<DashboardStats>;
      return {
        totalUsers: data.totalUsers ?? 0,
        activePrograms: data.activePrograms ?? 0,
        upcomingEvents: data.upcomingEvents ?? 0,
        tasksCompleted: data.tasksCompleted ?? 0,
        totalCertificates: data.totalCertificates ?? 0,
        totalAdmissions: data.totalAdmissions ?? 0,
      };
    }

    console.warn(
      "dashboard/stats missing — falling back to live collection reads"
    );

    // Fetch total users count
    const usersSnapshot = await getDocs(collection(db, "users"));
    const totalUsers = usersSnapshot.size;

    // Fetch active programs count
    const programsQuery = query(
      collection(db, "programs"),
      where("status", "==", "active")
    );
    const programsSnapshot = await getDocs(programsQuery);
    const activePrograms = programsSnapshot.size;

    // Fetch upcoming events count (simplified to avoid composite index)
    const eventsSnapshot = await getDocs(collection(db, "events"));
    const now = new Date();
    let upcomingEvents = 0;

    eventsSnapshot.forEach((doc) => {
      const eventData = doc.data();
      const eventDate = eventData.date?.toDate
        ? eventData.date.toDate()
        : new Date(eventData.date);
      const status = eventData.status;

      if (eventDate >= now && status !== "cancelled") {
        upcomingEvents++;
      }
    });

    // Fetch tasks completion rate (simplified to avoid multiple queries)
    const allTasksSnapshot = await getDocs(collection(db, "tasks"));
    let completedTasksCount = 0;

    allTasksSnapshot.forEach((doc) => {
      const taskData = doc.data();
      if (taskData.status === "completed") {
        completedTasksCount++;
      }
    });

    const tasksCompleted =
      allTasksSnapshot.size > 0
        ? Math.round((completedTasksCount / allTasksSnapshot.size) * 100)
        : 0;

    // Fetch total certificates count
    const certificatesSnapshot = await getDocs(collection(db, "certificates"));
    const totalCertificates = certificatesSnapshot.size;

    // Fetch total admission applications count
    const admissionsSnapshot = await getDocs(collection(db, "admissionApplications"));
    const totalAdmissions = admissionsSnapshot.size;

    return {
      totalUsers,
      activePrograms,
      upcomingEvents,
      tasksCompleted,
      totalCertificates,
      totalAdmissions,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
};

/**
 * Fetch recent activity from Firebase
 */
export const fetchRecentActivity = async (
  limitCount: number = 10
): Promise<RecentActivity[]> => {
  try {
    const activities: RecentActivity[] = [];

    // Fetch recent user registrations
    const recentUsersQuery = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const recentUsersSnapshot = await getDocs(recentUsersQuery);

    recentUsersSnapshot.forEach((doc) => {
      const userData = doc.data();
      activities.push({
        id: `user_${doc.id}`,
        type: "user_registered",
        description: `New user ${userData.name || userData.email} registered`,
        timestamp: userData.createdAt || new Date().toISOString(),
        user: userData.name || userData.email,
      });
    });

    // Fetch recent programs
    const recentProgramsQuery = query(
      collection(db, "programs"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const recentProgramsSnapshot = await getDocs(recentProgramsQuery);

    recentProgramsSnapshot.forEach((doc) => {
      const programData = doc.data();
      activities.push({
        id: `program_${doc.id}`,
        type: "program_created",
        description: `New program "${
          programData.title || programData.name
        }" created`,
        timestamp: programData.createdAt || new Date().toISOString(),
      });
    });

    // Fetch recent events
    const recentEventsQuery = query(
      collection(db, "events"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const recentEventsSnapshot = await getDocs(recentEventsQuery);

    recentEventsSnapshot.forEach((doc) => {
      const eventData = doc.data();
      activities.push({
        id: `event_${doc.id}`,
        type: "event_created",
        description: `New event "${
          eventData.title || eventData.name
        }" scheduled`,
        timestamp: eventData.createdAt || new Date().toISOString(),
      });
    });

    // Sort all activities by timestamp and limit
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw new Error("Failed to fetch recent activity");
  }
};

/**
 * Get formatted time ago string
 */
export const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return time.toLocaleDateString();
};
