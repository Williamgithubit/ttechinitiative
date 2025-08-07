'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Grid,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AutoMode as AutoGradeIcon
} from '@mui/icons-material';
import { Assignment, AssignmentSubmission, AssignmentAnalytics } from '@/types/assignment';
import { AssignmentService } from '@/services/assignmentService';

interface AssignmentManagementProps {
  courseIds: string[];
  teacherId: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AssignmentManagement: React.FC<AssignmentManagementProps> = ({ courseIds, teacherId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [analytics, setAnalytics] = useState<AssignmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewSubmissions, setViewSubmissions] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'homework' as Assignment['type'],
    maxPoints: 100,
    dueDate: '',
    instructions: '',
    allowLateSubmissions: true,
    latePenalty: 10,
    maxAttempts: 1,
    timeLimit: 0,
    showCorrectAnswers: false,
    randomizeQuestions: false
  });

  useEffect(() => {
    loadAssignments();
  }, [courseIds]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const assignmentsData = await AssignmentService.getAssignmentsByCourses(courseIds);
      setAssignments(assignmentsData);
    } catch (err) {
      setError('Failed to load assignments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId: string) => {
    try {
      const submissionsData = await AssignmentService.getAssignmentSubmissions(assignmentId);
      setSubmissions(submissionsData);
      
      const analyticsData = await AssignmentService.getAssignmentAnalytics(assignmentId);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to load submissions');
      console.error(err);
    }
  };

  const handleCreateAssignment = () => {
    setSelectedAssignment(null);
    setFormData({
      title: '',
      description: '',
      courseId: courseIds[0] || '',
      type: 'homework',
      maxPoints: 100,
      dueDate: '',
      instructions: '',
      allowLateSubmissions: true,
      latePenalty: 10,
      maxAttempts: 1,
      timeLimit: 0,
      showCorrectAnswers: false,
      randomizeQuestions: false
    });
    setAssignmentDialog(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      type: assignment.type,
      maxPoints: assignment.maxPoints,
      dueDate: typeof assignment.dueDate === 'string' 
        ? assignment.dueDate.split('T')[0] 
        : assignment.dueDate.toDate().toISOString().split('T')[0],
      instructions: assignment.instructions || '',
      allowLateSubmissions: assignment.settings.allowLateSubmissions,
      latePenalty: assignment.settings.latePenalty || 10,
      maxAttempts: assignment.settings.maxAttempts || 1,
      timeLimit: assignment.settings.timeLimit || 0,
      showCorrectAnswers: assignment.settings.showCorrectAnswers,
      randomizeQuestions: assignment.settings.randomizeQuestions
    });
    setAssignmentDialog(true);
  };

  const handleSaveAssignment = async () => {
    try {
      const assignmentData = {
        ...formData,
        teacherId,
        dueDate: new Date(formData.dueDate),
        settings: {
          allowLateSubmissions: formData.allowLateSubmissions,
          latePenalty: formData.latePenalty,
          maxAttempts: formData.maxAttempts,
          timeLimit: formData.timeLimit,
          showCorrectAnswers: formData.showCorrectAnswers,
          randomizeQuestions: formData.randomizeQuestions
        },
        status: 'published' as const
      };

      if (selectedAssignment) {
        await AssignmentService.updateAssignment(selectedAssignment.id, assignmentData);
      } else {
        await AssignmentService.createAssignment(assignmentData);
      }

      setAssignmentDialog(false);
      await loadAssignments();
    } catch (err) {
      setError('Failed to save assignment');
      console.error(err);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await AssignmentService.deleteAssignment(assignmentId);
      await loadAssignments();
    } catch (err) {
      setError('Failed to delete assignment');
      console.error(err);
    }
  };

  const handleViewSubmissions = async (assignmentId: string) => {
    setViewSubmissions(assignmentId);
    await loadSubmissions(assignmentId);
    setTabValue(1);
  };

  const handleAutoGrade = async (assignmentId: string) => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment || assignment.type !== 'quiz') {
        setError('Auto-grading is only available for quizzes');
        return;
      }

      const submissionsToGrade = submissions.filter(s => !s.grade);
      
      for (const submission of submissionsToGrade) {
        await AssignmentService.autoGradeQuiz(submission.id, assignment);
      }

      await loadSubmissions(assignmentId);
    } catch (err) {
      setError('Failed to auto-grade submissions');
      console.error(err);
    }
  };

  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    try {
      await AssignmentService.gradeSubmission(submissionId, grade, feedback, teacherId);
      await loadSubmissions(viewSubmissions!);
    } catch (err) {
      setError('Failed to grade submission');
      console.error(err);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date.toDate();
    return dateObj.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'closed': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <QuizIcon />;
      case 'exam': return <AssignmentIcon />;
      case 'project': return <SchoolIcon />;
      default: return <AssignmentIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Assignments" />
          <Tab label="Submissions" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Assignments Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold" color="#000054">
            Assignment Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateAssignment}
            sx={{
              bgcolor: '#E32845',
              '&:hover': { bgcolor: '#c41e3a' }
            }}
          >
            Create Assignment
          </Button>
        </Box>

        <Grid container spacing={2}>
          {assignments.map((assignment) => (
            <Grid item xs={12} md={6} lg={4} key={assignment.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    {getTypeIcon(assignment.type)}
                    <Typography variant="h6" fontWeight="bold" ml={1}>
                      {assignment.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    {assignment.description}
                  </Typography>

                  <Box display="flex" gap={1} mb={2}>
                    <Chip 
                      label={assignment.type} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={assignment.status} 
                      size="small" 
                      color={getStatusColor(assignment.status)}
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Due: {formatDate(assignment.dueDate)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Max Points: {assignment.maxPoints}
                    </Typography>
                  </Box>

                  <Box display="flex" gap={1}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewSubmissions(assignment.id)}
                      title="View Submissions"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditAssignment(assignment)}
                      title="Edit Assignment"
                    >
                      <EditIcon />
                    </IconButton>
                    {assignment.type === 'quiz' && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleAutoGrade(assignment.id)}
                        title="Auto Grade"
                      >
                        <AutoGradeIcon />
                      </IconButton>
                    )}
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      title="Delete Assignment"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {assignments.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" mb={2}>
              No assignments created yet
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateAssignment}
              sx={{
                bgcolor: '#E32845',
                '&:hover': { bgcolor: '#c41e3a' }
              }}
            >
              Create Your First Assignment
            </Button>
          </Paper>
        )}
      </TabPanel>

      {/* Submissions Tab */}
      <TabPanel value={tabValue} index={1}>
        {viewSubmissions ? (
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#000054" mb={3}>
              Assignment Submissions
            </Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Submitted At</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.studentName}</TableCell>
                      <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={submission.status} 
                          size="small"
                          color={submission.status === 'graded' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {submission.grade !== undefined 
                          ? `${submission.grade}/${assignments.find(a => a.id === submission.assignmentId)?.maxPoints || 100}`
                          : 'Not graded'
                        }
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Select an assignment to view submissions
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={2}>
        {analytics ? (
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#000054" mb={3}>
              Assignment Analytics
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="#000054" fontWeight="bold">
                    {analytics.totalSubmissions}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Submissions
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="#4caf50" fontWeight="bold">
                    {analytics.onTimeSubmissions}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    On Time
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="#ff9800" fontWeight="bold">
                    {analytics.lateSubmissions}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Late Submissions
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="#E32845" fontWeight="bold">
                    {Math.round(analytics.averageGrade)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Grade
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Grade Distribution
                </Typography>
                {analytics.gradeDistribution.map((range) => (
                  <Box key={range.range} mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">{range.range}%</Typography>
                      <Typography variant="body2">{range.count} students</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(range.count / analytics.totalSubmissions) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Select an assignment to view analytics
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialog} onClose={() => setAssignmentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAssignment ? 'Edit Assignment' : 'Create New Assignment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                >
                  {courseIds.map((courseId) => (
                    <MenuItem key={courseId} value={courseId}>
                      Course {courseId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Assignment['type'] })}
                >
                  <MenuItem value="homework">Homework</MenuItem>
                  <MenuItem value="quiz">Quiz</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                  <MenuItem value="project">Project</MenuItem>
                  <MenuItem value="discussion">Discussion</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Points"
                value={formData.maxPoints}
                onChange={(e) => setFormData({ ...formData, maxPoints: parseInt(e.target.value) })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.allowLateSubmissions}
                    onChange={(e) => setFormData({ ...formData, allowLateSubmissions: e.target.checked })}
                  />
                }
                label="Allow Late Submissions"
              />
            </Grid>

            {formData.allowLateSubmissions && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Late Penalty (%)"
                  value={formData.latePenalty}
                  onChange={(e) => setFormData({ ...formData, latePenalty: parseInt(e.target.value) })}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveAssignment}
            variant="contained"
            sx={{
              bgcolor: '#E32845',
              '&:hover': { bgcolor: '#c41e3a' }
            }}
          >
            {selectedAssignment ? 'Update' : 'Create'} Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentManagement;
