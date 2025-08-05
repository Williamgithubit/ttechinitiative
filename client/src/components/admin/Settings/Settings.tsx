import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Button,
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" sx={{ color: '#000054', fontWeight: 'bold' }}>
          Settings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{
            borderColor: '#000054',
            color: '#000054',
            '&:hover': {
              borderColor: '#1a1a6e',
              backgroundColor: 'rgba(0, 0, 84, 0.04)',
            },
          }}
        >
          Refresh
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
              '&.Mui-selected': {
                color: '#E32845',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#E32845',
            },
          }}
        >
          <Tab icon={<AccountIcon />} label="Profile" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<NotificationsIcon />} label="Notifications" disabled />
          <Tab icon={<SettingsIcon />} label="System" disabled />
          <Tab icon={<BusinessIcon />} label="Organization" disabled />
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
