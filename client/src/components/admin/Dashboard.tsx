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
  Stack
} from '@mui/material';
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
import Grid from '../ui/Grid';
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<StorageIcon />}
            onClick={handleSeedData}
            disabled={loading || seeding}
            color="secondary"
          >
            {seeding ? 'Seeding...' : 'Seed Sample Data'}
          </Button>
        </Stack>
      </Box>
      
      <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid key={index} xs={12} sm={6} md={3}>
            <Paper elevation={2}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h5" component="div">
                        {stat.value}
                      </Typography>
                    </Box>
                    {stat.icon}
                  </Box>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {recentActivity.length > 0 ? (
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body1">
                        {activity.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                          {getTimeAgo(activity.timestamp)}
                        </Typography>
                        <Chip 
                          label={activity.type.replace('_', ' ')} 
                          size="small" 
                          color={getActivityColor(activity.type) as any}
                          variant="outlined"
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
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
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
