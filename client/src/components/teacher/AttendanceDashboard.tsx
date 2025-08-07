'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Today as TodayIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { AttendanceService } from '@/services/attendanceService';
import { StudentService } from '@/services/studentService';
import { CourseService } from '@/services/courseService';
import { 
  AttendanceRecord, 
  StudentAttendanceRecord,
  AttendanceStats
} from '@/types/attendance';
import { Student } from '@/types/student';
import { Course } from '@/types/course';

interface AttendanceOverview {
  totalStudents: number;
  totalCourses: number;
  todayAttendanceRate: number;
  weeklyAttendanceRate: number;
  monthlyAttendanceRate: number;
  topPerformers: StudentAttendanceRecord[];
  lowPerformers: StudentAttendanceRecord[];
  recentRecords: AttendanceRecord[];
}

const AttendanceDashboard: React.FC = () => {
  const [overview, setOverview] = useState<AttendanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock teacher ID - in real app, get from auth context
  const teacherId = 'teacher-1';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [students, courses] = await Promise.all([
        StudentService.getStudents(),
        CourseService.getCourses()
      ]);

      // Get date ranges
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get attendance records for different periods
      const [todayRecords, weekRecords, monthRecords, recentRecords] = await Promise.all([
        AttendanceService.getAttendanceRecords({ startDate: today, endDate: today }),
        AttendanceService.getAttendanceRecords({ startDate: weekAgo, endDate: today }),
        AttendanceService.getAttendanceRecords({ startDate: monthAgo, endDate: today }),
        AttendanceService.getAttendanceRecords({})
      ]);

      // Calculate attendance rates
      const todayAttendanceRate = calculateAttendanceRate(todayRecords);
      const weeklyAttendanceRate = calculateAttendanceRate(weekRecords);
      const monthlyAttendanceRate = calculateAttendanceRate(monthRecords);

      // Get student performance data
      const studentPerformancePromises = students.map(async (student) => {
        const studentRecords = monthRecords.filter(r => r.studentId === student.id);
        const stats = AttendanceService.calculateAttendanceStats(studentRecords);
        
        return {
          studentId: student.id,
          studentName: student.name,
          records: studentRecords,
          stats
        };
      });

      const studentPerformance = await Promise.all(studentPerformancePromises);

      // Sort by attendance rate
      const sortedPerformance = studentPerformance
        .filter(sp => sp.records.length > 0)
        .sort((a, b) => b.stats.attendanceRate - a.stats.attendanceRate);

      const topPerformers = sortedPerformance.slice(0, 5);
      const lowPerformers = sortedPerformance.slice(-5).reverse();

      setOverview({
        totalStudents: students.length,
        totalCourses: courses.length,
        todayAttendanceRate,
        weeklyAttendanceRate,
        monthlyAttendanceRate,
        topPerformers,
        lowPerformers,
        recentRecords: recentRecords.slice(0, 10)
      });

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceRate = (records: AttendanceRecord[]): number => {
    if (records.length === 0) return 0;
    
    const presentRecords = records.filter(r => 
      r.status === 'present' || r.status === 'late' || r.status === 'excused'
    ).length;
    
    return Math.round((presentRecords / records.length) * 100);
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'success';
    if (rate >= 75) return 'warning';
    return 'error';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'excused': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !overview) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error || 'Failed to load dashboard data'}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          mb: 3
        }}
      >
        Attendance Overview
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {overview.totalStudents}
                  </Typography>
                  <Typography variant="body2">
                    Total Students
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #E32845 0%, #c41e3a 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {overview.totalCourses}
                  </Typography>
                  <Typography variant="body2">
                    Active Courses
                  </Typography>
                </Box>
                <SchoolIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {overview.todayAttendanceRate}%
                  </Typography>
                  <Typography variant="body2">
                    Today's Attendance
                  </Typography>
                </Box>
                <TodayIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {overview.monthlyAttendanceRate}%
                  </Typography>
                  <Typography variant="body2">
                    Monthly Average
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Trends */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
              Attendance Trends
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Today</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {overview.todayAttendanceRate}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={overview.todayAttendanceRate} 
                color={getAttendanceColor(overview.todayAttendanceRate) as any}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">This Week</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {overview.weeklyAttendanceRate}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={overview.weeklyAttendanceRate} 
                color={getAttendanceColor(overview.weeklyAttendanceRate) as any}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">This Month</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {overview.monthlyAttendanceRate}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={overview.monthlyAttendanceRate} 
                color={getAttendanceColor(overview.monthlyAttendanceRate) as any}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
              Top Performers
            </Typography>
            
            <List>
              {overview.topPerformers.map((student, index) => (
                <React.Fragment key={student.studentId}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32 }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.studentName}
                      secondary={`${student.stats.attendanceRate}% attendance`}
                    />
                    <Box display="flex" alignItems="center">
                      <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    </Box>
                  </ListItem>
                  {index < overview.topPerformers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              
              {overview.topPerformers.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">
                  No data available
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#E32845', fontWeight: 'bold' }}>
              Needs Attention
            </Typography>
            
            <List>
              {overview.lowPerformers.map((student, index) => (
                <React.Fragment key={student.studentId}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#f44336', width: 32, height: 32 }}>
                        {student.studentName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.studentName}
                      secondary={`${student.stats.attendanceRate}% attendance`}
                    />
                    <Box display="flex" alignItems="center">
                      <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
                    </Box>
                  </ListItem>
                  {index < overview.lowPerformers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              
              {overview.lowPerformers.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">
                  All students performing well!
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
          Recent Attendance Records
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 84, 0.04)' }}>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>Course</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {overview.recentRecords.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{record.studentName}</TableCell>
                  <TableCell>{record.courseName}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      color={getStatusColor(record.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {record.checkInTime ? 
                      new Date(record.checkInTime as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
              
              {overview.recentRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No recent attendance records
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AttendanceDashboard;
