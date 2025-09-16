import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as CertificateIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';

interface ActivityItem {
  id: string;
  type: 'user_registered' | 'program_created' | 'event_created' | 'task_completed' | 'admission_submitted' | 'certificate_issued' | 'email_sent' | 'system_update';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  priority: 'low' | 'medium' | 'high';
  status: 'completed' | 'pending' | 'failed';
}

interface EnhancedRecentActivityProps {
  maxItems?: number;
  showRefresh?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
}

const EnhancedRecentActivity: React.FC<EnhancedRecentActivityProps> = ({
  maxItems = 10,
  showRefresh = true,
  onActivityClick,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Mock activities - replace with actual API calls
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'admission_submitted',
      title: 'New Admission Application',
      description: 'John Doe submitted application for Computer Science program',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      user: { name: 'John Doe' },
      priority: 'high',
      status: 'pending',
    },
    {
      id: '2',
      type: 'user_registered',
      title: 'New User Registration',
      description: 'Jane Smith registered as an instructor',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      user: { name: 'Jane Smith' },
      priority: 'medium',
      status: 'completed',
    },
    {
      id: '3',
      type: 'certificate_issued',
      title: 'Certificate Issued',
      description: 'Web Development certificate issued to Mike Johnson',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      user: { name: 'Admin' },
      priority: 'medium',
      status: 'completed',
    },
    {
      id: '4',
      type: 'program_created',
      title: 'New Program Created',
      description: 'Data Science Bootcamp program added to catalog',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      user: { name: 'Admin' },
      priority: 'low',
      status: 'completed',
    },
    {
      id: '5',
      type: 'email_sent',
      title: 'Bulk Email Sent',
      description: 'Welcome email sent to 25 new students',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: { name: 'System' },
      priority: 'low',
      status: 'completed',
    },
    {
      id: '6',
      type: 'event_created',
      title: 'Event Scheduled',
      description: 'Tech Career Fair 2024 scheduled for March 15',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      user: { name: 'Admin' },
      priority: 'medium',
      status: 'completed',
    },
    {
      id: '7',
      type: 'system_update',
      title: 'System Backup',
      description: 'Daily backup completed successfully',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      user: { name: 'System' },
      priority: 'low',
      status: 'completed',
    },
  ];

  const loadActivities = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setActivities(mockActivities.slice(0, maxItems));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadActivities();
      setLoading(false);
    };
    loadData();
  }, [maxItems]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registered':
        return <PersonAddIcon color="primary" />;
      case 'program_created':
        return <SchoolIcon color="secondary" />;
      case 'event_created':
        return <EventIcon color="success" />;
      case 'admission_submitted':
        return <AssignmentIcon color="warning" />;
      case 'certificate_issued':
        return <CertificateIcon color="info" />;
      case 'email_sent':
        return <EmailIcon color="action" />;
      case 'system_update':
        return <SecurityIcon color="action" />;
      case 'task_completed':
        return <CheckCircleIcon color="success" />;
      default:
        return <AddIcon />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registered':
        return '#000054';
      case 'program_created':
        return '#E32845';
      case 'event_created':
        return '#4CAF50';
      case 'admission_submitted':
        return '#FF9800';
      case 'certificate_issued':
        return '#2196F3';
      case 'email_sent':
        return '#9C27B0';
      case 'system_update':
        return '#607D8B';
      case 'task_completed':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          mb: 3,
          background: 'white',
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 84, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  return (
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#000054', 
            fontWeight: 'bold',
            fontSize: { xs: '1rem', sm: '1.25rem' } 
          }}
        >
          Recent Activity
        </Typography>
        {showRefresh && (
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            size="small"
          >
            <RefreshIcon />
          </IconButton>
        )}
      </Box>

      {activities.length > 0 ? (
        <List sx={{ p: 0 }}>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem 
                sx={{ 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  py: { xs: 1.5, sm: 1 },
                  px: { xs: 1, sm: 2 },
                  gap: { xs: 1, sm: 0 },
                  cursor: onActivityClick ? 'pointer' : 'default',
                  '&:hover': onActivityClick ? {
                    backgroundColor: 'rgba(0, 0, 84, 0.05)',
                  } : {},
                }}
                onClick={() => onActivityClick?.(activity)}
              >
                <ListItemIcon sx={{ 
                  minWidth: { xs: '30px', sm: '40px' },
                  mr: { xs: 0, sm: 1 }
                }}>
                  {activity.user?.avatar ? (
                    <Avatar 
                      src={activity.user.avatar} 
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    getActivityIcon(activity.type)
                  )}
                </ListItemIcon>
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 0.5,
                  width: { xs: '100%', sm: 'auto' }
                }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      fontWeight: 500,
                    }}
                  >
                    {activity.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {activity.description}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    mt: 0.5,
                  }}>
                    <Typography variant="caption" color="textSecondary">
                      {formatTimestamp(activity.timestamp)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip 
                        label={activity.status} 
                        size="small" 
                        color={getStatusColor(activity.status)}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                      <Chip 
                        label={activity.priority} 
                        size="small" 
                        color={getPriorityColor(activity.priority)}
                        variant="filled"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                      {activity.user && (
                        <Chip 
                          label={activity.user.name} 
                          size="small" 
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </ListItem>
              {index < activities.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography color="textSecondary">
            No recent activity found
          </Typography>
        </Box>
      )}

      {activities.length >= maxItems && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="text" 
              size="small"
              sx={{ color: '#000054' }}
            >
              View All Activity
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default EnhancedRecentActivity;
