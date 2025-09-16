'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tab,
  Tabs
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ReportService } from '@/services/reportService';
import { CourseService } from '@/services/courseService';
import { 
  StudentProgress, 
  CourseProgress, 
  LessonResponse, 
  ReportFilters, 
  ReportSummary 
} from '@/types/report';
import { Course } from '@/types/course';

interface ReportsProps {
  teacherId: string;
}

const Reports: React.FC<ReportsProps> = ({ teacherId }) => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data state
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [lessonResponses, setLessonResponses] = useState<LessonResponse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Filter state
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date()
    }
  });

  // Chart colors
  const COLORS = ['#000054', '#1a1a6e', '#E32845', '#4CAF50', '#FF9800', '#9C27B0'];

  // Load initial data
  useEffect(() => {
    loadReportData();
    loadCourses();
  }, [teacherId]);

  // Real-time updates
  useEffect(() => {
    const unsubscribe = ReportService.subscribeToReportUpdates(
      teacherId,
      (updatedSummary) => {
        setReportSummary(updatedSummary);
      },
      filters
    );

    return () => unsubscribe();
  }, [teacherId, filters]);

  const loadCourses = async () => {
    try {
      const teacherCourses = await CourseService.getCoursesByTeacher(teacherId);
      setCourses(teacherCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summary, students, coursesData, lessons] = await Promise.all([
        ReportService.getReportSummary(teacherId, filters),
        ReportService.getStudentProgressReport(teacherId, filters),
        ReportService.getCourseProgressReport(teacherId, filters),
        ReportService.getLessonResponseReport(teacherId, filters)
      ]);

      setReportSummary(summary);
      setStudentProgress(students);
      setCourseProgress(coursesData);
      setLessonResponses(lessons);
    } catch (error) {
      console.error('Error loading report data:', error);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Chart data preparation
  const getStudentPerformanceChartData = () => {
    return studentProgress.map(student => ({
      name: student.studentName.split(' ')[0], // First name only
      grade: student.averageScore,
      completion: student.completionRate * 100,
      engagement: student.engagementScore
    }));
  };

  const getCourseComparisonChartData = () => {
    return courseProgress.map(course => ({
      name: course.courseName,
      averageGrade: course.averageGrade,
      completionRate: course.completionRate * 100,
      totalStudents: course.totalStudents,
      activeStudents: course.activeStudents
    }));
  };

  const getEngagementTrendData = () => {
    // Simulate trend data - in real implementation, this would come from historical data
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        engagement: 60 + Math.random() * 30,
        submissions: Math.floor(10 + Math.random() * 20)
      };
    });
    return days;
  };

  const getAssignmentTypeDistribution = () => {
    const types = ['Homework', 'Quiz', 'Project', 'Discussion', 'Exam'];
    return types.map(type => ({
      name: type,
      value: Math.floor(Math.random() * 20) + 5,
      color: COLORS[types.indexOf(type)]
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} sx={{ color: '#000054' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={loadReportData} sx={{ ml: 2 }}>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#000054', fontWeight: 'bold' }}>
          Student Progress Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ borderColor: '#000054', color: '#000054' }}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ borderColor: '#000054', color: '#000054' }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': { backgroundColor: '#c41e3a' }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      {reportSummary && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#000054', fontWeight: 'bold' }}>
                    {reportSummary.totalStudents}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Students
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#E32845' }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#000054', fontWeight: 'bold' }}>
                    {reportSummary.averageGrade.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Grade
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#4CAF50' }}>
                  <AssessmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#000054', fontWeight: 'bold' }}>
                    {(reportSummary.completionRate * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completion Rate
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#FF9800' }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#000054', fontWeight: 'bold' }}>
                    {reportSummary.engagementLevel.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Engagement Level
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#9C27B0' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              color: '#666',
              '&.Mui-selected': {
                color: '#000054',
                fontWeight: 'bold'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#E32845'
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Student Progress" />
          <Tab label="Course Analysis" />
          <Tab label="Lesson Response" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Engagement Trend Chart */}
          <Card sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(66.67% - 12px)' } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
                Engagement Trend (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getEngagementTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#000054" 
                    strokeWidth={3}
                    name="Engagement %" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="submissions" 
                    stroke="#E32845" 
                    strokeWidth={3}
                    name="Submissions" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Assignment Type Distribution */}
          <Card sx={{ flex: { xs: '1 1 100%', lg: '1 1 calc(33.33% - 12px)' } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
                Assignment Types
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getAssignmentTypeDistribution()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent ?? 0) * 100}%`}
                  >
                    {getAssignmentTypeDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Students Needing Attention */}
          {reportSummary?.needsAttention && reportSummary.needsAttention.length > 0 && (
            <Card sx={{ flex: '1 1 100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
                  <WarningIcon sx={{ mr: 1, color: '#E32845' }} />
                  Students Needing Attention
                </Typography>
                <List>
                  {reportSummary.needsAttention.map((student, index) => (
                    <ListItem key={student.studentId} divider={index < reportSummary.needsAttention.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: '#E32845' }}>
                          {student.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={student.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Grade: {student.grade.toFixed(1)}% | Completion: {(student.completionRate * 100).toFixed(1)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={student.grade}
                              sx={{
                                mt: 1,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: student.grade < 60 ? '#E32845' : '#FF9800'
                                }
                              }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Student Performance Chart */}
          <Card sx={{ flex: '1 1 100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
                Individual Student Performance
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getStudentPerformanceChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="grade" fill="#000054" name="Average Grade" />
                  <Bar dataKey="completion" fill="#E32845" name="Completion %" />
                  <Bar dataKey="engagement" fill="#4CAF50" name="Engagement Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Student Progress Details */}
          <Card sx={{ flex: '1 1 100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
                Detailed Student Progress
              </Typography>
              <List>
                {studentProgress.slice(0, 5).map((student, index) => (
                  <ListItem key={student.studentId} divider={index < 4}>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#000054' }}>
                        {student.studentName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {student.studentName}
                          </Typography>
                          <Chip
                            label={`${student.averageScore.toFixed(1)}%`}
                            color={student.averageScore >= 80 ? 'success' : student.averageScore >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {student.courseName} • {student.completedAssignments}/{student.totalAssignments} assignments completed
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {student.strengths.slice(0, 2).map((strength, i) => (
                              <Chip
                                key={i}
                                label={strength}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}
                              />
                            ))}
                            {student.areasForImprovement.slice(0, 1).map((area, i) => (
                              <Chip
                                key={i}
                                label={area}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: '#E32845', color: '#E32845' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 2 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Course Comparison Chart */}
          <Card sx={{ flex: '1 1 100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
                Course Performance Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={getCourseComparisonChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="averageGrade"
                    stackId="1"
                    stroke="#000054"
                    fill="#000054"
                    name="Average Grade"
                  />
                  <Area
                    type="monotone"
                    dataKey="completionRate"
                    stackId="2"
                    stroke="#E32845"
                    fill="#E32845"
                    name="Completion Rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Course Details */}
          {courseProgress.map((course) => (
            <Card key={course.courseId} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
                  {course.courseName}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    {course.activeStudents}/{course.totalStudents} Active Students
                  </Typography>
                  <Chip
                    label={course.engagementLevel}
                    color={
                      course.engagementLevel === 'High' ? 'success' :
                      course.engagementLevel === 'Medium' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Box>
                <Typography variant="body1" gutterBottom>
                  Average Grade: <strong>{course.averageGrade.toFixed(1)}%</strong>
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={course.averageGrade}
                  sx={{
                    mb: 2,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: course.averageGrade >= 80 ? '#4CAF50' : 
                                     course.averageGrade >= 60 ? '#FF9800' : '#E32845'
                    }
                  }}
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#000054' }}>
                  Top Performers:
                </Typography>
                {course.topPerformers.slice(0, 3).map((student) => (
                  <Typography key={student.studentId} variant="body2" color="textSecondary">
                    • {student.name} ({student.grade.toFixed(1)}%)
                  </Typography>
                ))}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {activeTab === 3 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Lesson Response Overview */}
          <Card sx={{ flex: '1 1 100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
                Lesson Response Analytics
              </Typography>
              {lessonResponses.length === 0 ? (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  No lesson data available. Create lessons as assignments with type "lesson" to see analytics here.
                </Typography>
              ) : (
                <List>
                  {lessonResponses.map((lesson) => (
                    <ListItem key={lesson.lessonId} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: '#000054' }}>
                          <SchoolIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={lesson.lessonTitle}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Completion: {(lesson.completionRate * 100).toFixed(1)}% | 
                              Avg. Engagement: {lesson.averageEngagement.toFixed(1)}% | 
                              Avg. Time: {lesson.averageTimeSpent.toFixed(0)} min
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip
                                label={lesson.feedbackSentiment}
                                size="small"
                                color={
                                  lesson.feedbackSentiment === 'Positive' ? 'success' :
                                  lesson.feedbackSentiment === 'Neutral' ? 'default' : 'error'
                                }
                              />
                              <Chip
                                label={`Difficulty: ${lesson.difficultyRating}/5`}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default Reports;
