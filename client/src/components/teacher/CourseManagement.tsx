import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Switch,
  Autocomplete
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Book as BookIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { CourseService } from '@/services/courseService';
import { Course, CreateCourseData, UpdateCourseData, CourseSubject } from '@/types/course';

interface CourseManagementProps {
  teacherId: string;
  teacherName: string;
  onCoursesChange?: (courses: Course[]) => void;
}

interface CourseFormData extends CreateCourseData {
  id?: string;
}

const COURSE_SUBJECTS: CourseSubject[] = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Art',
  'Physical Education',
  'Music',
  'Computer Science',
  'Other'
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const CourseManagement: React.FC<CourseManagementProps> = ({
  teacherId,
  teacherName,
  onCoursesChange
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    description: '',
    code: '',
    subject: 'Mathematics',
    grade: '',
    semester: '',
    year: new Date().getFullYear(),
    maxEnrollment: 25,
    schedule: {
      days: [],
      startTime: '09:00',
      endTime: '10:00',
      room: ''
    }
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [teacherId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const teacherCourses = await CourseService.getCoursesByTeacher(teacherId);
      setCourses(teacherCourses);
      onCoursesChange?.(teacherCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load courses',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        id: course.id,
        name: course.name,
        description: course.description,
        code: course.code,
        subject: course.subject as CourseSubject,
        grade: course.grade || '',
        semester: course.semester,
        year: course.year,
        maxEnrollment: course.maxEnrollment || 25,
        schedule: course.schedule || {
          days: [],
          startTime: '09:00',
          endTime: '10:00',
          room: ''
        }
      });
    } else {
      setEditingCourse(null);
      setFormData({
        name: '',
        description: '',
        code: '',
        subject: 'Mathematics',
        grade: '',
        semester: new Date().getMonth() < 6 ? 'Spring' : 'Fall',
        year: new Date().getFullYear(),
        maxEnrollment: 25,
        schedule: {
          days: [],
          startTime: '09:00',
          endTime: '10:00',
          room: ''
        }
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCourse(null);
  };

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScheduleChange = (field: keyof NonNullable<CourseFormData['schedule']>, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule!,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (editingCourse) {
        // Update existing course
        const updateData: UpdateCourseData = {
          name: formData.name,
          description: formData.description,
          code: formData.code,
          subject: formData.subject,
          grade: formData.grade,
          semester: formData.semester,
          year: formData.year,
          maxEnrollment: formData.maxEnrollment,
          schedule: formData.schedule
        };
        
        await CourseService.updateCourse(editingCourse.id, updateData);
        setSnackbar({
          open: true,
          message: 'Course updated successfully',
          severity: 'success'
        });
      } else {
        // Create new course
        const createData: CreateCourseData = {
          name: formData.name,
          description: formData.description,
          code: formData.code,
          subject: formData.subject,
          grade: formData.grade,
          semester: formData.semester,
          year: formData.year,
          maxEnrollment: formData.maxEnrollment,
          schedule: formData.schedule
        };
        
        await CourseService.createCourse(teacherId, teacherName, createData);
        setSnackbar({
          open: true,
          message: 'Course created successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${editingCourse ? 'update' : 'create'} course`,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      try {
        await CourseService.deleteCourse(courseId);
        setSnackbar({
          open: true,
          message: 'Course deleted successfully',
          severity: 'success'
        });
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete course',
          severity: 'error'
        });
      }
    }
  };

  const handleSeedSampleData = async () => {
    try {
      setLoading(true);
      await CourseService.seedSampleCourses(teacherId, teacherName);
      setSnackbar({
        open: true,
        message: 'Sample courses created successfully',
        severity: 'success'
      });
      fetchCourses();
    } catch (error) {
      console.error('Error seeding sample data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create sample courses',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'completed': return 'info';
      case 'draft': return 'warning';
      default: return 'default';
    }
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
          My Courses
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCourses}
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a'
              }
            }}
          >
            Add Course
          </Button>
        </Box>
      </Box>

      {/* Empty State */}
      {courses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" mb={2}>
            No courses found
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            You haven't created any courses yet. Get started by adding your first course or loading sample data.
          </Typography>
          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                backgroundColor: '#E32845',
                '&:hover': {
                  backgroundColor: '#c41e3a'
                }
              }}
            >
              Create Course
            </Button>
            <Button
              variant="outlined"
              onClick={handleSeedSampleData}
              sx={{
                borderColor: '#000054',
                color: '#000054',
                '&:hover': {
                  borderColor: '#1a1a6e',
                  backgroundColor: 'rgba(0, 0, 84, 0.04)'
                }
              }}
            >
              Load Sample Data
            </Button>
          </Box>
        </Paper>
      ) : (
        /* Course Grid */
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
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
                  {/* Course Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h3" sx={{ 
                      color: '#000054', 
                      fontWeight: 'bold',
                      flex: 1,
                      mr: 1
                    }}>
                      {course.name}
                    </Typography>
                    <Chip 
                      label={course.status} 
                      color={getStatusColor(course.status)}
                      size="small"
                    />
                  </Box>

                  {/* Course Details */}
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      <strong>Code:</strong> {course.code}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      <strong>Subject:</strong> {course.subject}
                    </Typography>
                    {course.grade && (
                      <Typography variant="body2" color="textSecondary" mb={1}>
                        <strong>Grade:</strong> {course.grade}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      <strong>Semester:</strong> {course.semester} {course.year}
                    </Typography>
                  </Box>

                  {/* Enrollment Info */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <PeopleIcon sx={{ fontSize: 16, color: '#666', mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {course.enrollmentCount}{course.maxEnrollment ? `/${course.maxEnrollment}` : ''} students
                    </Typography>
                  </Box>

                  {/* Schedule */}
                  {course.schedule && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <ScheduleIcon sx={{ fontSize: 16, color: '#666', mr: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        {course.schedule.days.join(', ')} ({course.schedule.startTime} - {course.schedule.endTime})
                      </Typography>
                    </Box>
                  )}

                  {/* Description */}
                  <Typography variant="body2" color="textSecondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {course.description}
                  </Typography>
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(course)}
                    sx={{ color: '#000054' }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteCourse(course.id, course.name)}
                    sx={{ color: '#E32845' }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Course Form Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#000054',
          color: 'white'
        }}>
          {editingCourse ? 'Edit Course' : 'Create New Course'}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#000054', mb: 2 }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Course Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Course Code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="e.g., MATH101"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  label="Subject"
                >
                  {COURSE_SUBJECTS.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Grade Level"
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                placeholder="e.g., 9th Grade"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Enrollment"
                type="number"
                value={formData.maxEnrollment}
                onChange={(e) => handleInputChange('maxEnrollment', parseInt(e.target.value) || 25)}
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>

            {/* Semester and Year */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={formData.semester}
                  onChange={(e) => handleInputChange('semester', e.target.value)}
                  label="Semester"
                >
                  <MenuItem value="Spring">Spring</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                  <MenuItem value="Fall">Fall</MenuItem>
                  <MenuItem value="Winter">Winter</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                inputProps={{ min: 2020, max: 2030 }}
              />
            </Grid>

            {/* Schedule */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#000054', mb: 2 }}>
                Schedule
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={DAYS_OF_WEEK}
                value={formData.schedule?.days || []}
                onChange={(_, newValue) => handleScheduleChange('days', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Class Days"
                    placeholder="Select days"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={formData.schedule?.startTime || '09:00'}
                onChange={(e) => handleScheduleChange('startTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={formData.schedule?.endTime || '10:00'}
                onChange={(e) => handleScheduleChange('endTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Room"
                value={formData.schedule?.room || ''}
                onChange={(e) => handleScheduleChange('room', e.target.value)}
                placeholder="e.g., Room 201"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !formData.name || !formData.code || !formData.description}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a'
              }
            }}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              editingCourse ? 'Update Course' : 'Create Course'
            )}
          </Button>
        </DialogActions>
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

export default CourseManagement;
