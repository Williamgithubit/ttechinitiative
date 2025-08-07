'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import Grid from "@/components/ui/Grid"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  EventBusy as EventBusyIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { AttendanceService } from '@/services/attendanceService';
import { StudentService } from '@/services/studentService';
import { CourseService } from '@/services/courseService';
import { 
  AttendanceRecord, 
  AttendanceSession, 
  CreateAttendanceData, 
  AttendanceFilter,
  AttendanceStatus,
  StudentAttendanceRecord
} from '@/types/attendance';
import { Student } from '@/types/student';
import { Course } from '@/types/course';
import SeedDataButton from './SeedDataButton';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AttendanceManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openMarkAttendance, setOpenMarkAttendance] = useState(false);
  const [openBulkAttendance, setOpenBulkAttendance] = useState(false);
  const [openEditAttendance, setOpenEditAttendance] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  
  // Form states
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('present');
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [checkOutTime, setCheckOutTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Filter states
  const [filter, setFilter] = useState<AttendanceFilter>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock teacher ID - in real app, get from auth context
  const teacherId = 'teacher-1';

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (filter.courseId || filter.startDate || filter.endDate) {
      loadAttendanceRecords();
    }
  }, [filter]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsData, coursesData, sessionsData] = await Promise.all([
        StudentService.getStudents(),
        CourseService.getCourses(),
        AttendanceService.getAttendanceSessions(teacherId)
      ]);
      
      setStudents(studentsData);
      setCourses(coursesData);
      setAttendanceSessions(sessionsData);
      
      // Check if we have any data
      if (studentsData.length === 0 && coursesData.length === 0) {
        setError('No students or courses found. Please add some students and courses first.');
      } else if (studentsData.length === 0) {
        setError('No students found. Please add some students first.');
      } else if (coursesData.length === 0) {
        setError('No courses found. Please add some courses first.');
      } else {
        // Load today's attendance records by default
        const todayFilter: AttendanceFilter = {
          startDate: selectedDate,
          endDate: selectedDate
        };
        setFilter(todayFilter);
      }
      
    } catch (err) {
      setError('Failed to connect to database. Please check your internet connection.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      const records = await AttendanceService.getAttendanceRecords(filter);
      setAttendanceRecords(records);
    } catch (err) {
      setError('Failed to load attendance records');
      console.error('Error loading attendance records:', err);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedStudent || !selectedCourse) {
      setError('Please select student and course');
      return;
    }

    try {
      const student = students.find(s => s.id === selectedStudent);
      const course = courses.find(c => c.id === selectedCourse);
      
      if (!student || !course) {
        setError('Invalid student or course selection');
        return;
      }

      const attendanceData: CreateAttendanceData = {
        studentId: selectedStudent,
        courseId: selectedCourse,
        date: selectedDate,
        status: attendanceStatus,
        checkInTime: checkInTime || undefined,
        checkOutTime: checkOutTime || undefined,
        notes: notes || undefined
      };

      await AttendanceService.markAttendance(attendanceData, teacherId);
      
      setOpenMarkAttendance(false);
      resetForm();
      loadAttendanceRecords();
      
    } catch (err) {
      setError('Failed to mark attendance');
      console.error('Error marking attendance:', err);
    }
  };

  const handleBulkMarkAttendance = async () => {
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    try {
      const course = courses.find(c => c.id === selectedCourse);
      if (!course) {
        setError('Invalid course selection');
        return;
      }

      // Get students enrolled in the course
      const courseStudents = students.filter(student => 
        student.enrolledCourses?.includes(selectedCourse)
      );

      if (courseStudents.length === 0) {
        setError('No students enrolled in this course');
        return;
      }

      await AttendanceService.bulkMarkAttendance(
        courseStudents,
        selectedCourse,
        course.name,
        selectedDate,
        teacherId
      );

      setOpenBulkAttendance(false);
      resetForm();
      loadAttendanceRecords();
      
    } catch (err) {
      setError('Failed to mark bulk attendance');
      console.error('Error marking bulk attendance:', err);
    }
  };

  const handleEditAttendance = async () => {
    if (!selectedRecord) return;

    try {
      await AttendanceService.updateAttendance(selectedRecord.id, {
        status: attendanceStatus,
        checkInTime: checkInTime || undefined,
        checkOutTime: checkOutTime || undefined,
        notes: notes || undefined
      });

      setOpenEditAttendance(false);
      resetForm();
      loadAttendanceRecords();
      
    } catch (err) {
      setError('Failed to update attendance');
      console.error('Error updating attendance:', err);
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    try {
      await AttendanceService.deleteAttendanceRecord(id);
      loadAttendanceRecords();
    } catch (err) {
      setError('Failed to delete attendance record');
      console.error('Error deleting attendance:', err);
    }
  };

  const resetForm = () => {
    setSelectedStudent('');
    setSelectedCourse('');
    setAttendanceStatus('present');
    setCheckInTime('');
    setCheckOutTime('');
    setNotes('');
    setSelectedRecord(null);
  };

  const openEditDialog = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setSelectedStudent(record.studentId);
    setSelectedCourse(record.courseId);
    setAttendanceStatus(record.status);
    setCheckInTime(record.checkInTime ? new Date(record.checkInTime as any).toTimeString().slice(0, 5) : '');
    setCheckOutTime(record.checkOutTime ? new Date(record.checkOutTime as any).toTimeString().slice(0, 5) : '');
    setNotes(record.notes || '');
    setOpenEditAttendance(true);
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'absent':
        return <CancelIcon sx={{ color: 'error.main' }} />;
      case 'late':
        return <ScheduleIcon sx={{ color: 'warning.main' }} />;
      case 'excused':
        return <EventBusyIcon sx={{ color: 'info.main' }} />;
      default:
        return undefined;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'excused':
        return 'info';
      default:
        return 'default';
    }
  };

  const calculateAttendanceStats = () => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const excused = attendanceRecords.filter(r => r.status === 'excused').length;
    
    return { total, present, absent, late, excused };
  };

  const stats = calculateAttendanceStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          Attendance Management
        </Typography>
        
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenMarkAttendance(true)}
            sx={{
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1a1a6e 0%, #000054 100%)',
              }
            }}
          >
            Mark Attendance
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<GroupIcon />}
            onClick={() => setOpenBulkAttendance(true)}
            sx={{
              borderColor: '#000054',
              color: '#000054',
              '&:hover': {
                borderColor: '#1a1a6e',
                backgroundColor: 'rgba(0, 0, 84, 0.04)'
              }
            }}
          >
            Bulk Mark
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity={error.includes('No students') || error.includes('No courses') ? 'info' : 'error'} 
          sx={{ mb: 3 }} 
          onClose={() => setError(null)}
          action={
            (error.includes('No students') || error.includes('No courses')) ? (
              <SeedDataButton onDataSeeded={() => {
                setError(null);
                loadInitialData();
              }} />
            ) : null
          }
        >
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2">
                    Total Records
                  </Typography>
                </Box>
                <GroupIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {stats.present}
                  </Typography>
                  <Typography variant="body2">
                    Present
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {stats.absent}
                  </Typography>
                  <Typography variant="body2">
                    Absent
                  </Typography>
                </Box>
                <CancelIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {stats.late}
                  </Typography>
                  <Typography variant="body2">
                    Late
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {stats.excused}
                  </Typography>
                  <Typography variant="body2">
                    Excused
                  </Typography>
                </Box>
                <EventBusyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select
                value={filter.courseId || ''}
                label="Course"
                onChange={(e) => setFilter({ ...filter, courseId: e.target.value })}
              >
                <MenuItem value="">All Courses</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={filter.startDate || ''}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filter.endDate || ''}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filter.status || ''}
                label="Status"
                onChange={(e) => setFilter({ ...filter, status: e.target.value as AttendanceStatus })}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="late">Late</MenuItem>
                <MenuItem value="excused">Excused</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance Records Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 84, 0.04)' }}>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>Course</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Check In</strong></TableCell>
                <TableCell><strong>Check Out</strong></TableCell>
                <TableCell><strong>Notes</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{record.studentName}</TableCell>
                  <TableCell>{record.courseName}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(record.status)}
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
                  <TableCell>
                    {record.checkOutTime ? 
                      new Date(record.checkOutTime as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Tooltip title={record.notes || 'No notes'}>
                      <span>{record.notes ? record.notes.substring(0, 30) + '...' : '-'}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(record)}
                      sx={{ color: '#000054' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAttendance(record.id)}
                      sx={{ color: '#E32845' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              
              {attendanceRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No attendance records found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Mark Attendance Dialog */}
      <Dialog open={openMarkAttendance} onClose={() => setOpenMarkAttendance(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={selectedCourse}
                  label="Course"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select
                  value={selectedStudent}
                  label="Student"
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  {students
                    .filter(student => !selectedCourse || student.enrolledCourses?.includes(selectedCourse))
                    .map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={attendanceStatus}
                  label="Status"
                  onChange={(e) => setAttendanceStatus(e.target.value as AttendanceStatus)}
                >
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="excused">Excused</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check In Time"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check Out Time"
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMarkAttendance(false)}>Cancel</Button>
          <Button 
            onClick={handleMarkAttendance} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1a1a6e 0%, #000054 100%)',
              }
            }}
          >
            Mark Attendance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Mark Attendance Dialog */}
      <Dialog open={openBulkAttendance} onClose={() => setOpenBulkAttendance(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Mark Attendance</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={selectedCourse}
                  label="Course"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                This will mark all students enrolled in the selected course as present for the selected date.
                You can edit individual records afterwards if needed.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkAttendance(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkMarkAttendance} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1a1a6e 0%, #000054 100%)',
              }
            }}
          >
            Mark All Present
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog open={openEditAttendance} onClose={() => setOpenEditAttendance(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Attendance</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={attendanceStatus}
                  label="Status"
                  onChange={(e) => setAttendanceStatus(e.target.value as AttendanceStatus)}
                >
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="excused">Excused</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check In Time"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Check Out Time"
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditAttendance(false)}>Cancel</Button>
          <Button 
            onClick={handleEditAttendance} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1a1a6e 0%, #000054 100%)',
              }
            }}
          >
            Update Attendance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceManagement;
