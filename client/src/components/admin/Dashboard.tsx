import React from 'react';
import { Box, Typography, Paper, Card, CardContent} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Grid from '../ui/Grid';
const Dashboard = () => {
  const stats = [
    { title: 'Total Users', value: '1,254', icon: <PeopleIcon fontSize="large" color="primary" /> },
    { title: 'Active Programs', value: '24', icon: <SchoolIcon fontSize="large" color="secondary" /> },
    { title: 'Upcoming Events', value: '8', icon: <EventIcon fontSize="large" color="success" /> },
    { title: 'Tasks Completed', value: '89%', icon: <CheckCircleIcon fontSize="large" color="action" /> },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
        {stats.map((stat, index) => (
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
            <Typography color="textSecondary">
              Activity feed will be displayed here
            </Typography>
          </Paper>
        </Grid>
        <Grid xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography color="textSecondary">
              Quick action buttons will be displayed here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
