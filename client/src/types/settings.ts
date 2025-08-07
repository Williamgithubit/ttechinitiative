export interface TeacherProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
  department?: string;
  title?: string;
  officeLocation?: string;
  officeHours?: string;
  specializations?: string[];
  qualifications?: string[];
  yearsOfExperience?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: {
    newAssignments: boolean;
    gradeUpdates: boolean;
    attendanceAlerts: boolean;
    studentMessages: boolean;
    systemUpdates: boolean;
    weeklyReports: boolean;
  };
  pushNotifications: {
    newAssignments: boolean;
    gradeUpdates: boolean;
    attendanceAlerts: boolean;
    studentMessages: boolean;
    systemUpdates: boolean;
  };
  smsNotifications: {
    urgentAlerts: boolean;
    attendanceAlerts: boolean;
    systemMaintenance: boolean;
  };
  notificationTiming: {
    quietHoursStart: string; // HH:MM format
    quietHoursEnd: string; // HH:MM format
    weekendNotifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TeacherPreferences {
  id: string;
  userId: string;
  dashboard: {
    defaultView: 'dashboard' | 'courses' | 'students' | 'assignments';
    showQuickStats: boolean;
    compactMode: boolean;
    darkMode: boolean;
  };
  grading: {
    defaultGradingScale: 'percentage' | 'points' | 'letter';
    roundGrades: boolean;
    showGradeDistribution: boolean;
    autoCalculateGPA: boolean;
    latePenaltyPercentage: number;
  };
  attendance: {
    defaultAttendanceView: 'daily' | 'weekly' | 'monthly';
    autoMarkPresent: boolean;
    attendanceGracePeriod: number; // minutes
    requireCheckInOut: boolean;
  };
  assignments: {
    defaultAssignmentType: 'homework' | 'quiz' | 'exam' | 'project';
    autoPublishGrades: boolean;
    allowLateSubmissions: boolean;
    defaultDueDays: number;
  };
  communication: {
    autoReplyEnabled: boolean;
    autoReplyMessage?: string;
    preferredContactMethod: 'email' | 'sms' | 'app';
  };
  privacy: {
    showProfileToStudents: boolean;
    showOfficeHours: boolean;
    allowStudentMessages: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SecuritySettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  loginAlerts: {
    emailOnNewDevice: boolean;
    emailOnSuspiciousActivity: boolean;
    showLastLoginInfo: boolean;
  };
  sessionTimeout: number; // minutes
  allowedDevices: string[];
  lastPasswordChange: string;
  securityQuestions?: {
    question: string;
    answer: string; // This should be hashed
  }[];
  trustedIPs?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  id: string;
  userId: string;
  language: string;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  currency: string;
  academicYear: {
    startDate: string;
    endDate: string;
  };
  gradeBookSettings: {
    showDroppedGrades: boolean;
    calculateRunningAverage: boolean;
    weightCategories: boolean;
  };
  backupSettings: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionPeriod: number; // days
  };
  createdAt: string;
  updatedAt: string;
}

// Update DTOs
export interface UpdateTeacherProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  department?: string;
  title?: string;
  officeLocation?: string;
  officeHours?: string;
  specializations?: string[];
  qualifications?: string[];
  yearsOfExperience?: number;
  avatar?: string;
}

export interface UpdateNotificationSettingsData {
  emailNotifications?: Partial<NotificationSettings['emailNotifications']>;
  pushNotifications?: Partial<NotificationSettings['pushNotifications']>;
  smsNotifications?: Partial<NotificationSettings['smsNotifications']>;
  notificationTiming?: Partial<NotificationSettings['notificationTiming']>;
}

export interface UpdateTeacherPreferencesData {
  dashboard?: Partial<TeacherPreferences['dashboard']>;
  grading?: Partial<TeacherPreferences['grading']>;
  attendance?: Partial<TeacherPreferences['attendance']>;
  assignments?: Partial<TeacherPreferences['assignments']>;
  communication?: Partial<TeacherPreferences['communication']>;
  privacy?: Partial<TeacherPreferences['privacy']>;
}

export interface UpdateSecuritySettingsData {
  twoFactorEnabled?: boolean;
  loginAlerts?: Partial<SecuritySettings['loginAlerts']>;
  sessionTimeout?: number;
  allowedDevices?: string[];
  lastPasswordChange?: string;
  securityQuestions?: SecuritySettings['securityQuestions'];
  trustedIPs?: string[];
}

export interface UpdateSystemSettingsData {
  language?: string;
  timezone?: string;
  dateFormat?: SystemSettings['dateFormat'];
  timeFormat?: SystemSettings['timeFormat'];
  currency?: string;
  academicYear?: SystemSettings['academicYear'];
  gradeBookSettings?: Partial<SystemSettings['gradeBookSettings']>;
  backupSettings?: Partial<SystemSettings['backupSettings']>;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AvatarUploadData {
  file: File;
  userId: string;
}

// Combined settings interface for easy management
export interface TeacherSettings {
  profile: TeacherProfile;
  notifications: NotificationSettings;
  preferences: TeacherPreferences;
  security: SecuritySettings;
  system: SystemSettings;
}

// Default settings for new teachers
export const getDefaultNotificationSettings = (userId: string): Omit<NotificationSettings, 'id' | 'createdAt' | 'updatedAt'> => ({
  userId,
  emailNotifications: {
    newAssignments: true,
    gradeUpdates: true,
    attendanceAlerts: true,
    studentMessages: true,
    systemUpdates: true,
    weeklyReports: true
  },
  pushNotifications: {
    newAssignments: true,
    gradeUpdates: false,
    attendanceAlerts: true,
    studentMessages: true,
    systemUpdates: false
  },
  smsNotifications: {
    urgentAlerts: true,
    attendanceAlerts: false,
    systemMaintenance: true
  },
  notificationTiming: {
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    weekendNotifications: false
  }
});

export const getDefaultTeacherPreferences = (userId: string): Omit<TeacherPreferences, 'id' | 'createdAt' | 'updatedAt'> => ({
  userId,
  dashboard: {
    defaultView: 'dashboard',
    showQuickStats: true,
    compactMode: false,
    darkMode: false
  },
  grading: {
    defaultGradingScale: 'percentage',
    roundGrades: true,
    showGradeDistribution: true,
    autoCalculateGPA: false,
    latePenaltyPercentage: 10
  },
  attendance: {
    defaultAttendanceView: 'daily',
    autoMarkPresent: false,
    attendanceGracePeriod: 15,
    requireCheckInOut: false
  },
  assignments: {
    defaultAssignmentType: 'homework',
    autoPublishGrades: false,
    allowLateSubmissions: true,
    defaultDueDays: 7
  },
  communication: {
    autoReplyEnabled: false,
    autoReplyMessage: '',
    preferredContactMethod: 'email'
  },
  privacy: {
    showProfileToStudents: true,
    showOfficeHours: true,
    allowStudentMessages: true
  }
});

// Security Settings
export const getDefaultSecuritySettings = (userId: string): Omit<SecuritySettings, 'id' | 'createdAt' | 'updatedAt'> => ({
  userId,
  twoFactorEnabled: false,
  loginAlerts: {
    emailOnNewDevice: true,
    emailOnSuspiciousActivity: true,
    showLastLoginInfo: true
  },
  sessionTimeout: 480, // 8 hours in minutes
  allowedDevices: [],
  lastPasswordChange: new Date().toISOString(),
  securityQuestions: [
    { question: '', answer: '' },
    { question: '', answer: '' }
  ],
  trustedIPs: []
});

export const getDefaultSystemSettings = (userId: string): Omit<SystemSettings, 'id' | 'createdAt' | 'updatedAt'> => ({
  userId,
  language: 'en',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  currency: 'USD',
  academicYear: {
    startDate: new Date(new Date().getFullYear(), 8, 1).toISOString().split('T')[0], // September 1st
    endDate: new Date(new Date().getFullYear() + 1, 5, 30).toISOString().split('T')[0] // June 30th
  },
  gradeBookSettings: {
    showDroppedGrades: false,
    calculateRunningAverage: true,
    weightCategories: true
  },
  backupSettings: {
    autoBackup: true,
    backupFrequency: 'weekly',
    retentionPeriod: 90
  }
});
