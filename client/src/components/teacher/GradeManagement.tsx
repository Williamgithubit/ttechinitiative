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
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import Grid from "@/components/ui/Grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { GradeService } from '@/services/gradeService';
import { StudentService } from '@/services/studentService';
import { CourseService } from '@/services/courseService';
import { 
  Grade, 
  CreateGradeData, 
  UpdateGradeData, 
  GradeFilter
} from '@/types/grade';
import { Student } from '@/types/student';
import { Course } from '@/types/course';
import { seedGradeData } from '@/utils/seedGradeData';

const GradeManagement: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [openAddGrade, setOpenAddGrade] = useState(false);
  const [openEditGrade, setOpenEditGrade] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  
  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignmentName, setAssignmentName] = useState('');
  const [assignmentType, setAssignmentType] = useState<'homework' | 'quiz' | 'exam' | 'project' | 'participation' | 'midterm' | 'final'>('homework');
  const [score, setScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [weight, setWeight] = useState<number>(10);
  const [gradedDate, setGradedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [feedback, setFeedback] = useState('');
  
  // Filter states
  const [filter, setFilter] = useState<GradeFilter>({});
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGradeForMenu, setSelectedGradeForMenu] = useState<Grade | null>(null);

  const teacherId = 'teacher1';

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (filter) {
      loadGrades();
    }
  }, [filter]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsData, coursesData] = await Promise.all([
        StudentService.getStudents(),
        CourseService.getCourses()
      ]);
      
      setStudents(studentsData);
      setCourses(coursesData);
      
      if (studentsData.length === 0 && coursesData.length === 0) {
        setError('No students or courses found. Please add some students and courses first.');
      } else {
        await loadGrades();
      }
    } catch (err) {
      setError('Failed to load initial data. Please check your connection.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async () => {
    try {
      const gradesData = await GradeService.getGrades(filter);
      setGrades(gradesData);
    } catch (err) {
      setError('Failed to load grades');
      console.error('Error loading grades:', err);
    }
  };

  const handleAddGrade = async () => {
    if (!selectedStudent || !selectedCourse || !assignmentName) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const gradeData: CreateGradeData = {
        studentId: selectedStudent,
        courseId: selectedCourse,
        assignmentName,
        assignmentType,
        score,
        maxScore,
        weight,
        gradedDate,
        dueDate: dueDate || undefined,
        feedback: feedback || undefined
      };

      await GradeService.createGrade(gradeData, teacherId);
      
      setOpenAddGrade(false);
      resetForm();
      loadGrades();
      
    } catch (err) {
      setError('Failed to create grade');
      console.error('Error creating grade:', err);
    }
  };

  const handleEditGrade = async () => {
    if (!selectedGrade) return;

    try {
      const updateData: UpdateGradeData = {
        score,
        maxScore,
        weight,
        gradedDate,
        feedback: feedback || undefined
      };

      await GradeService.updateGrade(selectedGrade.id, updateData);
      
      setOpenEditGrade(false);
      resetForm();
      loadGrades();
      
    } catch (err) {
      setError('Failed to update grade');
      console.error('Error updating grade:', err);
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    try {
      await GradeService.deleteGrade(gradeId);
      loadGrades();
    } catch (err) {
      setError('Failed to delete grade');
      console.error('Error deleting grade:', err);
    }
  };

  const resetForm = () => {
    setSelectedStudent('');
    setSelectedCourse('');
    setAssignmentName('');
    setAssignmentType('homework');
    setScore(0);
    setMaxScore(100);
    setWeight(10);
    setGradedDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setFeedback('');
    setSelectedGrade(null);
  };

  const openEditDialog = (grade: Grade) => {
    setSelectedGrade(grade);
    setSelectedStudent(grade.studentId);
    setSelectedCourse(grade.courseId);
    setAssignmentName(grade.assignmentName || '');
    setAssignmentType(grade.assignmentType);
    setScore(grade.score);
    setMaxScore(grade.maxScore);
    setWeight(grade.weight);
    setGradedDate(grade.gradedDate);
    setDueDate(grade.dueDate || '');
    setFeedback(grade.feedback || '');
    setOpenEditGrade(true);
  };

  const applyFilters = () => {
    const newFilter: GradeFilter = {};
    if (filterCourse) newFilter.courseId = filterCourse;
    if (filterStudent) newFilter.studentId = filterStudent;
    if (filterType) newFilter.assignmentType = filterType;
    setFilter(newFilter);
  };

  const clearFilters = () => {
    setFilterCourse('');
    setFilterStudent('');
    setFilterType('');
    setFilter({});
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      await seedGradeData(teacherId);
      await loadGrades();
      setError(null);
    } catch (err) {
      setError('Failed to seed grade data');
      console.error('Error seeding data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, grade: Grade) => {
    setAnchorEl(event.currentTarget);
    setSelectedGradeForMenu(grade);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGradeForMenu(null);
  };

  const calculateGradeStats = () => {
    if (grades.length === 0) return null;
    
    const total = grades.length;
    const average = grades.reduce((sum, g) => sum + g.percentage, 0) / total;
    const passing = grades.filter(g => g.percentage >= 60).length;
    
    return {
      total,
      average: Math.round(average * 100) / 100,
      passing,
      failing: total - passing
    };
  };

  const stats = calculateGradeStats();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
        color: 'white',
        p: 3,
        borderRadius: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssessmentIcon sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Grade Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddGrade(true)}
            sx={{ 
              bgcolor: '#E32845', 
              '&:hover': { bgcolor: '#c41e3a' },
              color: 'white'
            }}
          >
            Add Grade
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadGrades}
            sx={{ 
              borderColor: 'white', 
              color: 'white',
              '&:hover': { borderColor: '#E32845', bgcolor: 'rgba(227, 40, 69, 0.1)' }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AssignmentIcon sx={{ color: '#E32845', fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.total}
                    </Typography>
                    <Typography variant="body2">Total Grades</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUpIcon sx={{ color: '#E32845', fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.average}%
                    </Typography>
                    <Typography variant="body2">Average Grade</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SchoolIcon sx={{ color: '#E32845', fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.passing}
                    </Typography>
                    <Typography variant="body2">Passing Grades</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AssessmentIcon sx={{ color: '#E32845', fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.failing}
                    </Typography>
                    <Typography variant="body2">Failing Grades</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#000054' }}>
          Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Course</InputLabel>
              <Select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                label="Course"
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
            <FormControl fullWidth size="small">
              <InputLabel>Student</InputLabel>
              <Select
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                label="Student"
              >
                <MenuItem value="">All Students</MenuItem>
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Assignment Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Assignment Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="homework">Homework</MenuItem>
                <MenuItem value="quiz">Quiz</MenuItem>
                <MenuItem value="exam">Exam</MenuItem>
                <MenuItem value="project">Project</MenuItem>
                <MenuItem value="participation">Participation</MenuItem>
                <MenuItem value="midterm">Midterm</MenuItem>
                <MenuItem value="final">Final</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={applyFilters}
                sx={{ 
                  bgcolor: '#000054',
                  '&:hover': { bgcolor: '#1a1a6e' }
                }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{ 
                  borderColor: '#000054',
                  color: '#000054',
                  '&:hover': { borderColor: '#E32845', color: '#E32845' }
                }}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Grades Table */}
      {!loading && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Course</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Assignment</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Weight</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id} hover>
                    <TableCell>{grade.studentName}</TableCell>
                    <TableCell>{grade.courseName}</TableCell>
                    <TableCell>{grade.assignmentName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={grade.assignmentType.charAt(0).toUpperCase() + grade.assignmentType.slice(1)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{grade.score}/{grade.maxScore}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${grade.percentage}% (${grade.letterGrade})`}
                        color={getGradeColor(grade.percentage) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{grade.weight}%</TableCell>
                    <TableCell>{grade.gradedDate}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, grade)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Empty State */}
      {!loading && grades.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No grades found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Start by adding grades or seed some sample data
          </Typography>
          <Button
            variant="contained"
            onClick={handleSeedData}
            sx={{ 
              bgcolor: '#000054',
              '&:hover': { bgcolor: '#1a1a6e' }
            }}
          >
            Seed Sample Data
          </Button>
        </Paper>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedGradeForMenu) openEditDialog(selectedGradeForMenu);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Grade</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedGradeForMenu) handleDeleteGrade(selectedGradeForMenu.id);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Grade</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Grade Dialog */}
      <Dialog open={openAddGrade} onClose={() => setOpenAddGrade(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#000054', color: 'white' }}>
          Add New Grade
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Student *</InputLabel>
                <Select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  label="Student *"
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Course *</InputLabel>
                <Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  label="Course *"
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Assignment Name *"
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Assignment Type</InputLabel>
                <Select
                  value={assignmentType}
                  onChange={(e) => setAssignmentType(e.target.value as any)}
                  label="Assignment Type"
                >
                  <MenuItem value="homework">Homework</MenuItem>
                  <MenuItem value="quiz">Quiz</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                  <MenuItem value="project">Project</MenuItem>
                  <MenuItem value="participation">Participation</MenuItem>
                  <MenuItem value="midterm">Midterm</MenuItem>
                  <MenuItem value="final">Final</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="normal"
                label="Score"
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="normal"
                label="Max Score"
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="normal"
                label="Weight (%)"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Graded Date"
                type="date"
                value={gradedDate}
                onChange={(e) => setGradedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Feedback"
                multiline
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAddGrade(false)}>Cancel</Button>
          <Button 
            onClick={handleAddGrade}
            variant="contained"
            sx={{ 
              bgcolor: '#E32845',
              '&:hover': { bgcolor: '#c41e3a' }
            }}
          >
            Add Grade
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Grade Dialog */}
      <Dialog open={openEditGrade} onClose={() => setOpenEditGrade(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#000054', color: 'white' }}>
          Edit Grade
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="normal"
                label="Score"
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="normal"
                label="Max Score"
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                margin="normal"
                label="Weight (%)"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Graded Date"
                type="date"
                value={gradedDate}
                onChange={(e) => setGradedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Feedback"
                multiline
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenEditGrade(false)}>Cancel</Button>
          <Button 
            onClick={handleEditGrade}
            variant="contained"
            sx={{ 
              bgcolor: '#E32845',
              '&:hover': { bgcolor: '#c41e3a' }
            }}
          >
            Update Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GradeManagement;
