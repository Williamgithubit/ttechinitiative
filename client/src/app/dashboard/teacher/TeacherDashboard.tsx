'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { performLogout } from '@/store/Auth/logoutAction';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { selectAuthState } from '@/store/Auth/authSlice';
import { CourseService } from '@/services/courseService';
import { Course } from '@/types/course';
import Image from 'next/image';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  Typography,
  Button,
  AppBar,
  Toolbar,
  CssBaseline,
  Snackbar,
  Alert,
  Paper,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Menu as MenuIcon,
  Add as AddIcon,
  Book as BookIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { FaBarsStaggered } from "react-icons/fa6";
import AssignmentManagement from '@/components/teacher/AssignmentManagement';
import StudentManagement from '@/components/teacher/StudentManagement';
import StudentProfile from '@/components/teacher/StudentProfile';
import DashboardStats from '@/components/teacher/DashboardStats';
import CourseManagement from '@/components/teacher/CourseManagement';
import Reports from '@/components/teacher/Reports';
import AttendanceManagement from '@/components/teacher/AttendanceManagement';
import AttendanceDashboard from '@/components/teacher/AttendanceDashboard';
import GradeManagement from '@/components/teacher/GradeManagement';
import Settings from '@/components/teacher/Settings';

const drawerWidth = 280;
const mobileDrawerWidth = '90vw';
const maxMobileDrawerWidth = 300;

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'courses', label: 'My Courses', icon: <SchoolIcon /> },
  { id: 'students', label: 'Students', icon: <PeopleIcon /> },
  { id: 'assignments', label: 'Assignments', icon: <AssignmentIcon /> },
  { id: 'attendance', label: 'Attendance', icon: <EventNoteIcon /> },
  { id: 'reports', label: 'Reports', icon: <AssessmentIcon /> },
  { id: 'grades', label: 'Grades', icon: <AssessmentIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

const TeacherDashboard = () => {
  const [tab, setTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector(selectAuthState);

  // Fetch teacher's courses from Firebase
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.uid) {
        setCoursesLoading(false);
        return;
      }

      try {
        setCoursesLoading(true);
        setCoursesError(null);
        
        const teacherCourses = await CourseService.getActiveCoursesByTeacher(user.uid);
        setCourses(teacherCourses);
        setCourseIds(teacherCourses.map(course => course.id));
        
        if (teacherCourses.length === 0) {
          // If no courses found, create sample data
          const sampleCourseIds = await CourseService.seedSampleCourses(user.uid, (user.name || user.email || 'Unknown Teacher') as string);
          const newCourses = await CourseService.getCoursesByTeacher(user.uid);
          setCourses(newCourses);
          setCourseIds(newCourses.map(course => course.id));
          
          setSnackbar({
            open: true,
            message: 'Sample courses created for demonstration!',
            severity: 'info'
          });
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCoursesError('Failed to load courses');
        setSnackbar({
          open: true,
          message: 'Failed to load courses',
          severity: 'error'
        });
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [user?.uid, user?.name, user?.email]);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await dispatch(performLogout());
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
      overflowY: 'auto',
      width: '100%',
    }}>
      {/* Logo */}
      <Toolbar sx={{ 
        justifyContent: 'center', 
        py: { xs: 2, sm: 3 }, 
        mt: { xs: 2, sm: 3 },
        minHeight: { xs: '60px', sm: '70px' },
        flexDirection: 'column',
        gap: 1
      }}>
        <Box 
          component="button"
          onClick={() => router.push('/')}
          sx={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              opacity: 0.8,
            },
            transition: 'opacity 0.2s ease',
          }}
        >
          <Image
            src="/assets/TTI-Logo-kHVWUz7q.png"
            alt="T-Tech Initiative Logo"
            width={isMobile ? 70 : 85}
            height={isMobile ? 28 : 34}
            style={{
              objectFit: 'contain',
            }}
          />
        </Box>
        

      </Toolbar>
      
      {/* Divider */}
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
      
      {/* Navigation */}
      <List>
        {tabs.map(({ id, label, icon }) => (
          <ListItem key={id} disablePadding>
            <ListItemButton
              selected={tab === id}
              onClick={() => {
                setTab(id);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                minHeight: { xs: '56px', sm: '48px' },
                px: { xs: 3, sm: 2 },
                py: { xs: 2, sm: 1.5 },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&.Mui-selected': {
                  backgroundColor: '#E32845',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#c41e3a',
                  },
                },
                mx: 1,
                my: 0.5,
                borderRadius: 1,
              }}
            >
              <ListItemIcon sx={{ 
                color: tab === id ? 'white' : 'rgba(255, 255, 255, 0.8)',
                minWidth: { xs: 48, sm: 40 },
                '& .MuiSvgIcon-root': {
                  fontSize: { xs: '1.5rem', sm: '1.25rem' }
                }
              }}>
                {icon}
              </ListItemIcon>
              <ListItemText 
                primary={label} 
                primaryTypographyProps={{
                  fontSize: { xs: '1rem', sm: '0.875rem' },
                  fontWeight: tab === id ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />
      
      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<ExitToAppIcon />}
          onClick={handleLogout}
          sx={{
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: '#E32845',
              backgroundColor: 'rgba(227, 40, 69, 0.1)',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  const renderDashboardContent = () => {
    return (
      <DashboardStats 
        courseIds={courseIds}
        teacherId={user?.uid || 'teacher-id'}
        onViewStudents={() => setTab('students')}
        onViewAssignments={() => setTab('assignments')}
      />
    );
  };

  const renderTabContent = () => {
    switch (tab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'courses':
        return (
          <CourseManagement 
            teacherId={user?.uid || ''}
            teacherName={(user?.name || user?.email || 'Unknown Teacher') as string}
            onCoursesChange={(newCourses) => {
              setCourses(newCourses);
              setCourseIds(newCourses.map(course => course.id));
            }}
          />
        );
      case 'students':
        return selectedStudentId ? (
          <StudentProfile 
            studentId={selectedStudentId} 
            onClose={() => setSelectedStudentId(null)} 
          />
        ) : (
          <StudentManagement 
            courseIds={courseIds} 
            teacherId={user?.uid || 'teacher-id'}
            onViewProfile={(studentId) => setSelectedStudentId(studentId)} 
          />
        );
      case 'assignments':
        return (
          <AssignmentManagement 
            courseIds={courseIds} 
            teacherId={user?.uid || 'teacher-id'} 
          />
        );
      case 'attendance':
        return (
          <AttendanceManagement />
        );
      case 'reports':
        return (
          <Reports 
            teacherId={user?.uid || 'teacher-id'} 
          />
        );
      case 'grades':
        return <GradeManagement />;
      case 'settings':
        return <Settings />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <FaBarsStaggered />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 500
              }}
            >
              {tabs.find(t => t.id === tab)?.label || 'Dashboard'}
            </Typography>
            
            {/* User Name in Header */}
            {user && (
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  display: { xs: 'none', sm: 'block' },
                  opacity: 0.9,
                  mr: 2
                }}
              >
                Welcome, {user.displayName || user.email?.split('@')[0] || 'User'}
              </Typography>
            )}
            
            <Button
              variant="contained"
              startIcon={!isMobile ? <AddIcon /> : undefined}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                backgroundColor: '#E32845',
                minHeight: { xs: '36px', sm: '40px' },
                minWidth: { xs: '60px', sm: '100px' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '&:hover': {
                  backgroundColor: '#c41e3a',
                },
              }}
              onClick={() => {
                setSnackbar({ 
                  open: true, 
                  message: `Add new ${tabs.find(t => t.id === tab)?.label || 'item'} functionality coming soon!`, 
                  severity: 'info' 
                });
              }}
            >
              {isMobile ? <AddIcon sx={{ fontSize: 18 }} /> : 'Add New'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: { xs: mobileDrawerWidth, sm: Math.min(maxMobileDrawerWidth, drawerWidth) },
              maxWidth: maxMobileDrawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', sm: '64px' },
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
          overflow: 'auto',
          '& > *': {
            maxWidth: '100%',
            overflowX: 'hidden'
          }
        }}
      >
        {renderTabContent()}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherDashboard;