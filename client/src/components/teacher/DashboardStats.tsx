'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { StudentService } from '@/services/studentService';
import { AssignmentService } from '@/services/assignmentService';
import { TeacherDataSeeder } from '@/utils/seedTeacherData';
import { Student } from '@/types/student';
import { Assignment } from '@/types/assignment';

interface DashboardStatsProps {
  courseIds: string[];
  teacherId: string;
  onViewStudents: () => void;
  onViewAssignments: () => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  courseIds, 
  teacherId, 
  onViewStudents, 
  onViewAssignments 
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadDashboardData();
  }, [courseIds]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsData, assignmentsData] = await Promise.all([
        StudentService.getStudentsByCourses(courseIds),
        AssignmentService.getAssignmentsByCourses(courseIds)
      ]);
      
      setStudents(studentsData);
      setAssignments(assignmentsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      await TeacherDataSeeder.seedAllData(courseIds, teacherId);
      await loadDashboardData();
    } catch (err) {
      setError('Failed to create sample data');
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const getActiveStudents = () => students.filter(s => s.status === 'active').length;
  const getPublishedAssignments = () => assignments.filter(a => a.status === 'published').length;
  const getDraftAssignments = () => assignments.filter(a => a.status === 'draft').length;
  const getUpcomingAssignments = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return assignments.filter(a => {
      const dueDate = typeof a.dueDate === 'string' ? new Date(a.dueDate) : a.dueDate.toDate();
      return dueDate >= now && dueDate <= nextWeek;
    });
  };

  const getRecentActivity = () => {
    const recentAssignments = assignments
      .filter(a => a.status === 'published')
      .sort((a, b) => {
        const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt.toDate();
        const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt.toDate();
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    return recentAssignments;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const upcomingAssignments = getUpcomingAssignments();
  const recentActivity = getRecentActivity();

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box 
        sx={{
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: { xs: 2, sm: 3 },
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          color="#000054"
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            lineHeight: { xs: 1.2, sm: 1.3 }
          }}
        >
          Dashboard Overview
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1.5, sm: 1 }, 
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />}
            onClick={loadDashboardData}
            disabled={loading}
            sx={{
              borderColor: '#000054',
              color: '#000054',
              minHeight: { xs: '48px', sm: '40px' },
              fontSize: { xs: '0.9rem', sm: '0.875rem' },
              fontWeight: 500,
              px: { xs: 3, sm: 2.5 },
              borderRadius: { xs: 2, sm: 1 },
              '&:hover': {
                borderColor: '#E32845',
                color: '#E32845',
                bgcolor: 'rgba(227, 40, 69, 0.04)'
              }
            }}
          >
            {isMobile ? 'Refresh' : 'Refresh Data'}
          </Button>
          <Button
            variant="contained"
            onClick={handleSeedData}
            disabled={seeding || loading}
            sx={{
              bgcolor: '#E32845',
              minHeight: { xs: '48px', sm: '40px' },
              fontSize: { xs: '0.9rem', sm: '0.875rem' },
              fontWeight: 500,
              px: { xs: 3, sm: 2.5 },
              borderRadius: { xs: 2, sm: 1 },
              boxShadow: '0 2px 8px rgba(227, 40, 69, 0.3)',
              '&:hover': { 
                bgcolor: '#c41e3a',
                boxShadow: '0 4px 12px rgba(227, 40, 69, 0.4)'
              }
            }}
          >
            {seeding ? <CircularProgress size={20} color="inherit" /> : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                {isMobile ? 'Sample Data' : 'Create Sample Data'}
              </Box>
            )}
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: { xs: 2, sm: 2.5, md: 3 }, 
          mb: { xs: 3, sm: 4 }
        }}
      >
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderRadius: { xs: 3, sm: 2 },
              minHeight: { xs: '120px', sm: '140px' },
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0, 0, 84, 0.3)'
              },
              '&:active': {
                transform: 'translateY(-2px)'
              }
            }}
            onClick={onViewStudents}
          >
            <CardContent sx={{ 
              p: { xs: 2.5, sm: 3 },
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Box>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{ 
                      fontSize: { xs: '2rem', sm: '2.25rem' },
                      mb: 0.5
                    }}
                  >
                    {getActiveStudents()}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.9,
                      fontSize: { xs: '0.875rem', sm: '0.9rem' },
                      fontWeight: 500
                    }}
                  >
                    Active Students
                  </Typography>
                </Box>
                <PeopleIcon sx={{ 
                  fontSize: { xs: 36, sm: 42 }, 
                  color: '#E32845',
                  opacity: 0.9
                }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderRadius: { xs: 3, sm: 2 },
              minHeight: { xs: '120px', sm: '140px' },
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0, 0, 84, 0.3)'
              },
              '&:active': {
                transform: 'translateY(-2px)'
              }
            }}
            onClick={onViewAssignments}
          >
            <CardContent sx={{ 
              p: { xs: 2.5, sm: 3 },
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Box>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{ 
                      fontSize: { xs: '2rem', sm: '2.25rem' },
                      mb: 0.5
                    }}
                  >
                    {getPublishedAssignments()}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.9,
                      fontSize: { xs: '0.875rem', sm: '0.9rem' },
                      fontWeight: 500
                    }}
                  >
                    Published Assignments
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ 
                  fontSize: { xs: 36, sm: 42 }, 
                  color: '#E32845',
                  opacity: 0.9
                }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              borderRadius: { xs: 3, sm: 2 },
              minHeight: { xs: '120px', sm: '140px' },
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0, 0, 84, 0.3)'
              }
            }}
          >
            <CardContent sx={{ 
              p: { xs: 2.5, sm: 3 },
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Box>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{ 
                      fontSize: { xs: '2rem', sm: '2.25rem' },
                      mb: 0.5
                    }}
                  >
                    {courseIds.length}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.9,
                      fontSize: { xs: '0.875rem', sm: '0.9rem' },
                      fontWeight: 500
                    }}
                  >
                    Courses
                  </Typography>
                </Box>
                <SchoolIcon sx={{ 
                  fontSize: { xs: 36, sm: 42 }, 
                  color: '#E32845',
                  opacity: 0.9
                }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 10px)', lg: '1 1 calc(25% - 18px)' } }}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
              color: 'white',
              transition: 'all 0.3s ease',
              borderRadius: { xs: 3, sm: 2 },
              minHeight: { xs: '120px', sm: '140px' },
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0, 0, 84, 0.3)'
              }
            }}
          >
            <CardContent sx={{ 
              p: { xs: 2.5, sm: 3 },
              height: '100%',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Box>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{ 
                      fontSize: { xs: '2rem', sm: '2.25rem' },
                      mb: 0.5
                    }}
                  >
                    {getDraftAssignments()}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.9,
                      fontSize: { xs: '0.875rem', sm: '0.9rem' },
                      fontWeight: 500
                    }}
                  >
                    Draft Assignments
                  </Typography>
                </Box>
                <WarningIcon sx={{ 
                  fontSize: { xs: 36, sm: 42 }, 
                  color: '#E32845',
                  opacity: 0.9
                }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Content Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Upcoming Assignments */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2} color="#000054">
                Upcoming Assignments (Next 7 Days)
              </Typography>
              {upcomingAssignments.length > 0 ? (
                <List>
                  {upcomingAssignments.map((assignment, index) => (
                    <React.Fragment key={assignment.id}>
                      <ListItem>
                        <ListItemIcon>
                          <WarningIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={assignment.title}
                          secondary={`Due: ${typeof assignment.dueDate === 'string' 
                            ? new Date(assignment.dueDate).toLocaleDateString()
                            : assignment.dueDate.toDate().toLocaleDateString()
                          } • ${assignment.type}`}
                        />
                      </ListItem>
                      {index < upcomingAssignments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                  No assignments due in the next 7 days
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2} color="#000054">
                Recent Assignments
              </Typography>
              {recentActivity.length > 0 ? (
                <List>
                  {recentActivity.map((assignment, index) => (
                    <React.Fragment key={assignment.id}>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={assignment.title}
                          secondary={`Created: ${typeof assignment.createdAt === 'string' 
                            ? new Date(assignment.createdAt).toLocaleDateString()
                            : assignment.createdAt.toDate().toLocaleDateString()
                          } • ${assignment.maxPoints} points`}
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                  No recent assignments
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ flex: '1 1 100%' }}>
          <Paper sx={{ 
            p: { xs: 3, sm: 3 }, 
            bgcolor: '#f8fafc',
            borderRadius: { xs: 3, sm: 2 },
            border: '1px solid rgba(0, 0, 84, 0.1)'
          }}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              mb={{ xs: 2.5, sm: 2 }} 
              color="#000054"
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.25rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Quick Actions
            </Typography>
            <Box 
              sx={{
                display: 'flex', 
                gap: { xs: 2, sm: 2 }, 
                flexDirection: { xs: 'column', sm: 'row' },
                flexWrap: 'wrap'
              }}
            >
              <Button
                variant="contained"
                startIcon={<AssignmentIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />}
                onClick={onViewAssignments}
                sx={{
                  bgcolor: '#E32845',
                  minHeight: { xs: '56px', sm: '48px' },
                  fontSize: { xs: '1rem', sm: '0.9rem' },
                  fontWeight: 600,
                  px: { xs: 4, sm: 3 },
                  borderRadius: { xs: 3, sm: 2 },
                  flex: { xs: '1 1 auto', sm: '0 1 auto' },
                  boxShadow: '0 4px 12px rgba(227, 40, 69, 0.3)',
                  '&:hover': { 
                    bgcolor: '#c41e3a',
                    boxShadow: '0 6px 16px rgba(227, 40, 69, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  '&:active': {
                    transform: 'translateY(0px)'
                  }
                }}
              >
                {isMobile ? 'Create Assignment' : 'Create Assignment'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PeopleIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />}
                onClick={onViewStudents}
                sx={{
                  borderColor: '#000054',
                  color: '#000054',
                  minHeight: { xs: '56px', sm: '48px' },
                  fontSize: { xs: '1rem', sm: '0.9rem' },
                  fontWeight: 600,
                  px: { xs: 4, sm: 3 },
                  borderRadius: { xs: 3, sm: 2 },
                  flex: { xs: '1 1 auto', sm: '0 1 auto' },
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: '#E32845',
                    color: '#E32845',
                    bgcolor: 'rgba(227, 40, 69, 0.04)',
                    borderWidth: '2px',
                    transform: 'translateY(-1px)'
                  },
                  '&:active': {
                    transform: 'translateY(0px)'
                  }
                }}
              >
                {isMobile ? 'View Students' : 'View Students'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUpIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />}
                sx={{
                  borderColor: '#000054',
                  color: '#000054',
                  minHeight: { xs: '56px', sm: '48px' },
                  fontSize: { xs: '1rem', sm: '0.9rem' },
                  fontWeight: 600,
                  px: { xs: 4, sm: 3 },
                  borderRadius: { xs: 3, sm: 2 },
                  flex: { xs: '1 1 auto', sm: '0 1 auto' },
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: '#E32845',
                    color: '#E32845',
                    bgcolor: 'rgba(227, 40, 69, 0.04)',
                    borderWidth: '2px',
                    transform: 'translateY(-1px)'
                  },
                  '&:active': {
                    transform: 'translateY(0px)'
                  }
                }}
              >
                {isMobile ? 'View Analytics' : 'View Analytics'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Empty State */}
      {students.length === 0 && assignments.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <SchoolIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" mb={2}>
            Welcome to your Teacher Dashboard!
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Get started by creating some sample data to explore the features
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleSeedData}
            disabled={seeding}
            sx={{
              bgcolor: '#E32845',
              '&:hover': { bgcolor: '#c41e3a' }
            }}
          >
            {seeding ? <CircularProgress size={20} /> : 'Create Sample Data'}
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default DashboardStats;
