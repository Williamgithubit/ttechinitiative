'use client';

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
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

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
    // Refresh settings
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
          <Tab icon={<PersonIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />} label="Profile" />
          <Tab icon={<NotificationsIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />} label="Notifications" disabled />
          <Tab icon={<SecurityIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />} label="Security" disabled />
          <Tab icon={<LanguageIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />} label="System" disabled />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            Profile Settings
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Coming soon...
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            Notification Settings
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Coming soon...
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            Security Settings
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
    </Box>
  );
};

export default Settings;
    
    setSaving(true);
    setError(null);
    try {
      // Update local settings state
      if (settings) {
        const updatedSettings = {
          ...settings,
          profile: {
            ...settings.profile,
            ...profileForm,
            updatedAt: new Date().toISOString()
          }
        };
        setSettings(updatedSettings);
      }
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = (notificationData: UpdateNotificationSettingsData) => {
    if (!user?.uid || !settings) return;
    
    setSaving(true);
    setError(null);
    try {
      // Update local settings state with proper merging
      const updatedSettings: TeacherSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          // Properly merge each notification category
          emailNotifications: {
            ...settings.notifications.emailNotifications,
            ...(notificationData.emailNotifications || {})
          },
          pushNotifications: {
            ...settings.notifications.pushNotifications,
            ...(notificationData.pushNotifications || {})
          },
          smsNotifications: {
            ...settings.notifications.smsNotifications,
            ...(notificationData.smsNotifications || {})
          },
          notificationTiming: {
            ...settings.notifications.notificationTiming,
            ...(notificationData.notificationTiming || {})
          },
          updatedAt: new Date().toISOString()
        }
      };
      setSettings(updatedSettings);
      setSuccess('Notification settings updated successfully');
    } catch (err) {
      setError('Failed to update notification settings');
      console.error('Error updating notifications:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      // Simulate password change (in real app, would call auth service)
      setOpenPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
    } catch (err) {
      setError('Failed to change password');
      console.error('Error changing password:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportSettings = () => {
    if (!settings) return;
    
    try {
      const settingsJson = JSON.stringify(settings, null, 2);
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teacher-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('Settings exported successfully');
    } catch (err) {
      setError('Failed to export settings');
      console.error('Error exporting settings:', err);
    }
  };

  const handleRefresh = () => {
    // Refresh settings like admin settings
    if (user?.uid) {
      initializeSettings();
      setSuccess('Settings refreshed successfully');
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  console.log('Render check:', { loading, hasSettings: !!settings, isAuthenticated });
  
  // Show loading while settings are loading/not available or auth is not ready
  if (loading || !settings || isAuthenticated === undefined) {
    console.log('Showing loading spinner');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Paper sx={{ 
        background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
        color: 'white',
        p: { xs: 2, sm: 3 },
        mb: 3,
        borderRadius: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <SettingsIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
          <Typography 
            variant="h4" 
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            Settings
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            opacity: 0.8,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Manage your account settings and preferences
        </Typography>
        
        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          mt: 2,
          flexWrap: 'wrap'
        }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
            onClick={handleExportSettings}
            size={window.innerWidth < 600 ? 'small' : 'medium'}
            sx={{ 
              borderColor: 'white', 
              color: 'white',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              '&:hover': { borderColor: '#E32845', bgcolor: 'rgba(227, 40, 69, 0.1)' }
            }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
            onClick={handleRefresh}
            size={window.innerWidth < 600 ? 'small' : 'medium'}
            sx={{ 
              borderColor: 'white', 
              color: 'white',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              '&:hover': { borderColor: '#E32845', bgcolor: 'rgba(227, 40, 69, 0.1)' }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Settings Tabs */}
      <Paper sx={{ width: '100%' }}>
        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'white',
            '& .MuiTab-root': {
              color: '#666',
              minHeight: { xs: '48px', sm: '48px' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
              minWidth: { xs: '80px', sm: '120px' },
              '&.Mui-selected': {
                color: '#E32845',
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#E32845'
            },
            '& .MuiTabs-scrollButtons': {
              color: '#000054'
            }
          }}
        >
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<LanguageIcon />} label="System" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Profile Picture" />
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={settings.profile.avatar}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  >
                    {settings.profile.firstName?.[0]}{settings.profile.lastName?.[0]}
                  </Avatar>
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => setOpenAvatarDialog(true)}
                    sx={{ 
                      borderColor: '#000054',
                      color: '#000054',
                      '&:hover': { borderColor: '#E32845', color: '#E32845' }
                    }}
                  >
                    Change Avatar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Personal Information" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={profileForm.firstName || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={profileForm.lastName || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={settings.profile.email}
                        disabled
                        helperText="Email cannot be changed here"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={profileForm.phoneNumber || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        value={profileForm.department || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        multiline
                        rows={4}
                        value={profileForm.bio || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={saving}
                      sx={{ 
                        bgcolor: '#E32845',
                        '&:hover': { bgcolor: '#c41e3a' }
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Profile'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setOpenPasswordDialog(true)}
                      sx={{ 
                        borderColor: '#000054',
                        color: '#000054',
                        '&:hover': { borderColor: '#E32845', color: '#E32845' }
                      }}
                    >
                      Change Password
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Email Notifications" />
                <CardContent>
                  <List>
                    {Object.entries(settings.notifications.emailNotifications).map(([key, value]) => (
                      <ListItem key={key}>
                        <ListItemText
                          primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          secondary="Receive notifications via email"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={value}
                            onChange={(e) => {
                              const newSettings = {
                                emailNotifications: {
                                  ...settings.notifications.emailNotifications,
                                  [key]: e.target.checked
                                }
                              };
                              handleSaveNotifications(newSettings);
                            }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Account Security" />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Two-Factor Authentication"
                        secondary="Add an extra layer of security"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.security.twoFactorEnabled}
                          onChange={(e) => {
                            // Handle security update
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Login Alerts"
                        secondary="Get notified of new logins"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings.security.loginAlerts.emailOnNewDevice}
                          onChange={(e) => {
                            // Handle security update for emailOnNewDevice
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* System Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Regional Settings" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={settings.system.language}
                          onChange={(e) => {
                            // Handle system update
                          }}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="es">Spanish</MenuItem>
                          <MenuItem value="fr">French</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Date Format</InputLabel>
                        <Select
                          value={settings.system.dateFormat}
                          onChange={(e) => {
                            // Handle system update
                          }}
                        >
                          <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                          <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                          <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#000054', color: 'white' }}>
          Change Password
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleChangePassword}
            variant="contained"
            disabled={saving}
            sx={{ 
              bgcolor: '#E32845',
              '&:hover': { bgcolor: '#c41e3a' }
            }}
          >
            {saving ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Avatar Upload Dialog */}
      <Dialog open={openAvatarDialog} onClose={() => setOpenAvatarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#000054', color: 'white' }}>
          Change Avatar
        </DialogTitle>
        <DialogContent sx={{ mt: 2, textAlign: 'center' }}>
          {avatarPreview && (
            <Avatar
              src={avatarPreview}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
          )}
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleAvatarFileChange}
          />
          <label htmlFor="avatar-upload">
            <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />}>
              Select Image
            </Button>
          </label>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAvatarDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {/* Handle avatar upload */}}
            variant="contained"
            disabled={!avatarFile || saving}
            sx={{ 
              bgcolor: '#E32845',
              '&:hover': { bgcolor: '#c41e3a' }
            }}
          >
            {saving ? 'Uploading...' : 'Upload Avatar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
