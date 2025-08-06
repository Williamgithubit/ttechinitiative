import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { 
  fetchDashboardStats, 
  fetchRecentActivity, 
  getTimeAgo,
  DashboardStats,
  RecentActivity 
} from '@/services/dashboardService';
import { seedSampleData } from '@/utils/seedDashboardData';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, activityData] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivity(10)
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadDashboardData();
  };

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      await seedSampleData();
      // Refresh data after seeding
      await loadDashboardData();
    } catch (err) {
      console.error('Error seeding data:', err);
      setError('Failed to seed sample data');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Activity icons
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered':
        return <PersonAddIcon color="primary" />;
      case 'program_created':
        return <SchoolIcon color="secondary" />;
      case 'event_created':
        return <ScheduleIcon color="success" />;
      case 'task_completed':
        return <CheckCircleIcon color="action" />;
      default:
        return <AddIcon />;
    }
  };

  // Activity colors
  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered':
        return 'primary';
      case 'program_created':
        return 'secondary';
      case 'event_created':
        return 'success';
      case 'task_completed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const statsCards = [
    { 
      title: 'Total Users', 
      value: stats?.totalUsers?.toLocaleString() || '0', 
      icon: <PeopleIcon fontSize="large" color="primary" /> 
    },
    { 
      title: 'Active Programs', 
      value: stats?.activePrograms?.toString() || '0', 
      icon: <SchoolIcon fontSize="large" color="secondary" /> 
    },
    { 
      title: 'Upcoming Events', 
      value: stats?.upcomingEvents?.toString() || '0', 
      icon: <EventIcon fontSize="large" color="success" /> 
    },
    { 
      title: 'Tasks Completed', 
      value: `${stats?.tasksCompleted || 0}%`, 
      icon: <CheckCircleIcon fontSize="large" color="action" /> 
    },
  ];

  return (
    <Box>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }} 
        gap={2}
        mb={2}>
        <Typography variant="h5" component="h1" sx={{ 
          fontWeight: 'bold', 
          color: '#000054',
          fontSize: { xs: '1.25rem', sm: '1.5rem' } 
        }}>
          Dashboard Overview
        </Typography>
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          width={{ xs: '100%', sm: 'auto' }}
        >
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            variant="outlined"
            disabled={loading}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
          >
            Refresh
          </Button>
          
          <Button
            startIcon={<StorageIcon />}
            onClick={handleSeedData}
            variant="contained"
            disabled={loading || seeding}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a',
              },
            }}
          >
            {seeding ? 'Seeding...' : 'Seed Sample Data'}
          </Button>
        </Stack>
      </Box>
      
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 2, mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid key={index} xs={12} sm={6} md={3}>
            <Paper 
              elevation={2}
              sx={{
                background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Card sx={{ background: 'transparent', boxShadow: 'none' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography 
                        color="rgba(255, 255, 255, 0.8)" 
                        gutterBottom
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography 
                        variant="h5" 
                        component="div" 
                        sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: { xs: '1.25rem', sm: '1.5rem' } 
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box sx={{ color: '#E32845' }}>
                      {React.cloneElement(stat.icon, { 
                        sx: { 
                          color: '#E32845', 
                          fontSize: { xs: '2rem', sm: '2.5rem' } 
                        } 
                      })}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid xs={12} md={8}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              mb: 3,
              background: 'white',
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 84, 0.1)',
              overflow: 'hidden',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: '#000054', 
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.25rem' } 
              }}
            >
              Recent Activity
            </Typography>
            {recentActivity.length > 0 ? (
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} divider sx={{ 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    py: { xs: 1.5, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <ListItemIcon sx={{ 
                      minWidth: { xs: '30px', sm: '40px' },
                      mr: { xs: 0, sm: 1 }
                    }}>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 0.5,
                      width: { xs: '100%', sm: 'auto' }
                    }}>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {activity.description}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1,
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' }
                      }}>
                        <Typography variant="caption" color="textSecondary">
                          {getTimeAgo(activity.timestamp)}
                        </Typography>
                        <Chip 
                          label={activity.type.replace('_', ' ')} 
                          size="small" 
                          color={getActivityColor(activity.type)}
                          variant="outlined"
                          sx={{ maxWidth: { xs: '100%', sm: '120px' } }}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">
                No recent activity found
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 1.5, sm: 2 },
              background: 'white',
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 84, 0.1)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#000054', fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Typography color="textSecondary">
              Quick action buttons will be available in the next update
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
