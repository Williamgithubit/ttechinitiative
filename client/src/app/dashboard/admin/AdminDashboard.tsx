'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { performLogout } from '@/store/Auth/logoutAction';
import { useAppDispatch } from '@/store/store';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  Typography,
  Button,
  AppBar,
  Toolbar,
  CssBaseline,
  Paper,
  Card,
  CardHeader,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  InsertChart as InsertChartIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Event as EventIcon,
  Article as ArticleIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Add as AddIcon,
  ManageAccounts as ManageAccountsIcon,
  Email as EmailIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Import Admin Components
import UserManagement from '@/components/admin/UserManagement';
import ProgramManagement from '@/components/admin/ProgramManagement/ProgramManagement';
import Dashboard from '@/components/admin/Dashboard';

const drawerWidth = 240;

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <InsertChartIcon /> },
  { id: 'users', label: 'User Management', icon: <PeopleIcon /> },
  { id: 'programs', label: 'Programs', icon: <SchoolIcon /> },
  { id: 'reports', label: 'Reports', icon: <ArticleIcon /> },
  { id: 'events', label: 'Events', icon: <EventIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      bgcolor: 'background.paper',
      overflowY: 'auto',
    }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ 
          color: 'primary.main', 
          fontWeight: 600,
          width: '100%',
          textAlign: 'center',
        }}>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {tabs.map(({ id, label, icon }) => (
          <ListItem key={id} disablePadding>
            <ListItemButton
              selected={tab === id}
              onClick={() => setTab(id)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {React.cloneElement(icon, {
                  color: tab === id ? 'primary' : 'inherit'
                })}
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ExitToAppIcon />}
          fullWidth
          onClick={async () => {
            try {
              await dispatch(performLogout());
              setSnackbar({ open: true, message: 'Logged out successfully', severity: 'success' });
              router.push('/login');
              router.refresh();
            } catch (error) {
              console.error('Logout failed:', error);
              setSnackbar({ open: true, message: 'Logout failed', severity: 'error' });
              // Still redirect to login even if logout fails
              router.push('/login');
              router.refresh();
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {tabs.find(t => t.id === tab)?.label || 'Dashboard'}
          </Typography>
          {!isMobile && (
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  // TODO: Implement add new functionality
                  setSnackbar({ open: true, message: 'Add new functionality coming soon!', severity: 'info' });
                }}
                sx={{ ml: 1 }}
              >
                Add New
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '64px', md: '64px' },
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'users' && <UserManagement />}
        {tab === 'programs' && <ProgramManagement />}
        {tab === 'reports' && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reports
            </Typography>
            <Typography paragraph>
              Reports dashboard will be available in the next update.
            </Typography>
          </Paper>
        )}
        {tab === 'events' && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Events
            </Typography>
            <Typography paragraph>
              Events management will be available in the next update.
            </Typography>
          </Paper>
        )}
        {tab === 'settings' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Account Settings"
                  avatar={<ManageAccountsIcon color="primary" />}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Update your account information and preferences.
                  </Typography>
                  <Button variant="outlined" size="small">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Notifications"
                  avatar={<EmailIcon color="primary" />}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Manage your notification preferences.
                  </Typography>
                  <Button variant="outlined" size="small">
                    Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="About"
                  avatar={<InfoIcon color="primary" />}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Version 1.0.0
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setSnackbar({ open: true, message: 'Check for updates coming soon!', severity: 'info' })}
                  >
                    Check for Updates
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
