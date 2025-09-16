import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Divider,
  Avatar,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Badge 
} from '@mui/material';
import Grid from "@/components/ui/Grid"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ContactEmergency as ContactIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { Student, StudentProfile as StudentProfileType } from '@/types/student';
import { StudentService } from '@/services/studentService';
import { Course } from '@/types/course';
import { CourseService } from '@/services/courseService';

interface StudentManagementProps {
  courseIds: string[];
  teacherId: string;
  onViewProfile?: (studentId: string) => void;
}

// Removed StudentFormData interface as teachers cannot add/edit students

const StudentManagement: React.FC<StudentManagementProps> = ({
  courseIds,
  teacherId,
  onViewProfile
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed dialog states as teachers cannot add/edit students
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileType | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [currentTab, setCurrentTab] = useState(0);
  // Removed form data and submitting states as teachers cannot add/edit students
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    fetchData();
  }, [courseIds]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, statusFilter, gradeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, coursesData] = await Promise.all([
        StudentService.getStudentsByCourses(courseIds),
        CourseService.getCoursesByTeacher(teacherId)
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load student data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    // Apply grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(student => student.grade === gradeFilter);
    }

    setFilteredStudents(filtered);
  };

  // Removed dialog and form handling functions as teachers cannot add/edit students

  const handleViewProfile = async (studentId: string) => {
    try {
      setLoading(true);
      const profile = await StudentService.getStudentProfile(studentId);
      if (profile) {
        setSelectedStudent(profile);
        setProfileDialogOpen(true);
      }
    } catch (error) {
      console.error('Error loading student profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load student profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSampleData = async () => {
    try {
      setLoading(true);
      await StudentService.createSampleStudents(courseIds);
      setSnackbar({
        open: true,
        message: 'Sample students created successfully',
        severity: 'success'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating sample data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create sample students',
        severity: 'error'
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Never';
    const dateObj = typeof date === 'string' ? new Date(date) : date.toDate();
    return dateObj.toLocaleDateString();
  };

  const getUniqueGrades = () => {
    const grades = students.map(s => s.grade).filter(Boolean);
    return [...new Set(grades)].sort();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#000054', fontWeight: 'bold' }}>
          Student Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{
              borderColor: '#000054',
              color: '#000054',
              '&:hover': {
                borderColor: '#1a1a6e',
                backgroundColor: 'rgba(0, 0, 84, 0.04)'
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
              <TextField
                fullWidth
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(25% - 16px)' } }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(25% - 16px)' } }}>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  label="Grade"
                >
                  <MenuItem value="all">All Grades</MenuItem>
                  {getUniqueGrades().map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(16.67% - 16px)' } }}>
              <Typography variant="body2" color="textSecondary">
                {filteredStudents.length} of {students.length} students
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Empty State */}
      {students.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" mb={2}>
            No students found
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Students are managed by administrators. Contact your admin to add new students to your courses.
          </Typography>
          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={handleCreateSampleData}
              sx={{
                borderColor: '#000054',
                color: '#000054',
                '&:hover': {
                  borderColor: '#1a1a6e',
                  backgroundColor: 'rgba(0, 0, 84, 0.04)'
                }
              }}
            >
              Create Sample Data
            </Button>
          </Box>
        </Paper>
      ) : filteredStudents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No students match your filters
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search terms or filters
          </Typography>
        </Paper>
      ) : (
        /* Student Grid */
        <Grid container spacing={3}>
          {filteredStudents.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                },
                transition: 'box-shadow 0.2s ease'
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Student Header */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      src={student.photoURL}
                      sx={{ width: 48, height: 48, mr: 2, bgcolor: '#000054' }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#000054' }}>
                        {student.name}
                      </Typography>
                      <Chip 
                        label={student.status} 
                        size="small"
                        color={student.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>

                  {/* Student Details */}
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <EmailIcon sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                      <Typography variant="body2" color="textSecondary">
                        {student.email}
                      </Typography>
                    </Box>
                    
                    {student.grade && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <SchoolIcon sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                        <Typography variant="body2" color="textSecondary">
                          Grade: {student.grade}
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="body2" color="textSecondary" mb={1}>
                      Courses: {student.enrolledCourses.length}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary">
                      Last Login: {formatDate(student.lastLoginAt)}
                    </Typography>

                    {student.parentContact && (
                      <Box display="flex" alignItems="center" mt={1}>
                        <ContactIcon sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                        <Typography variant="body2" color="textSecondary">
                          Parent: {student.parentContact.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 2, justifyContent: 'center' }}>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewProfile(student.id)}
                    sx={{ color: '#000054' }}
                  >
                    View Profile
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Student form dialog removed - teachers can only view students */}

      {/* Student Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#000054',
          color: 'white'
        }}>
          Student Profile
          <IconButton
            onClick={() => setProfileDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {selectedStudent.name}
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {selectedStudent.email}
              </Typography>
              {/* Add more profile details here */}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentManagement;
