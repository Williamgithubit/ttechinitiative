import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Import components
import ProfileTab from './ProfileTab';
import SecurityTab from './SecurityTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const handleRefresh = () => {
    // Refresh settings from localStorage or API
    window.location.reload();
  };

  return (
    <Box>
      {/* Header */}
      <Box 
        sx={{
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: 3
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            color: '#000054', 
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Settings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
          sx={{
            borderColor: '#000054',
            color: '#000054',
            '&:hover': {
              borderColor: '#1a1a6e',
              backgroundColor: 'rgba(0, 0, 84, 0.04)',
            },
          }}
        >
          {isMobile ? "" : "Refresh"}
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Settings Tabs */}
      <Paper 
        sx={{ 
          mb: 3,
          background: 'white',
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 84, 0.1)',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: '#000054',
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              minHeight: { xs: '48px', sm: '56px' },
              padding: { xs: '6px 12px', sm: '12px 16px' },
              '&.Mui-selected': {
                color: '#E32845',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#E32845',
            },
          }}
        >
          <Tab icon={<AccountIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />} label="Profile" />
          <Tab icon={<SecurityIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />} label="Security" />
          <Tab icon={<NotificationsIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />} label="Notifications" disabled />
          <Tab icon={<SettingsIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />} label="System" disabled />
          <Tab icon={<BusinessIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />} label="Organization" disabled />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <ProfileTab onSuccess={showSuccess} onError={showError} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <SecurityTab onSuccess={showSuccess} onError={showError} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            Notifications Settings
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Coming soon...
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            System Settings
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Coming soon...
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            Organization Settings
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Coming soon...
          </Typography>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default Settings;
