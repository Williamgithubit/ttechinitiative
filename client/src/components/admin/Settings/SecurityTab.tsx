import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import {
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  DeviceHub as DeviceIcon,
  Timer as TimerIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface SecurityTabProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ onSuccess, onError }) => {
  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true,
    deviceTracking: true,
    ipWhitelist: '',
    lastPasswordChange: '30 days ago',
    activeSessions: 2,
    trustedDevices: 3,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load security settings from localStorage
    const savedSecurity = localStorage.getItem('securitySettings');
    if (savedSecurity) {
      try {
        const parsed = JSON.parse(savedSecurity);
        setSecuritySettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading security settings:', error);
      }
    }
  }, []);

  const saveSettings = async (newSettings: typeof securitySettings) => {
    try {
      setLoading(true);
      
      // Save to localStorage (in production, this would save to API)
      localStorage.setItem('securitySettings', JSON.stringify(newSettings));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSecuritySettings(newSettings);
      onSuccess('Security settings updated successfully!');
    } catch (err) {
      onError('Failed to update security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityChange = (setting: string) => (event: any) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    const newSettings = { ...securitySettings, [setting]: value };
    
    // Auto-save for switches, manual save for text inputs
    if (event.target.type === 'checkbox') {
      saveSettings(newSettings);
    } else {
      setSecuritySettings(newSettings);
    }
  };

  const handleTextFieldSave = (setting: string) => {
    saveSettings(securitySettings);
  };

  const getSecurityScore = () => {
    let score = 0;
    if (securitySettings.twoFactorEnabled) score += 25;
    if (securitySettings.loginNotifications) score += 15;
    if (securitySettings.deviceTracking) score += 15;
    if (securitySettings.sessionTimeout <= 60) score += 20;
    if (securitySettings.passwordExpiry <= 90) score += 15;
    if (securitySettings.ipWhitelist.length > 0) score += 10;
    return score;
  };

  const getSecurityLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'success' as const };
    if (score >= 60) return { level: 'Good', color: 'primary' as const };
    if (score >= 40) return { level: 'Fair', color: 'warning' as const };
    return { level: 'Poor', color: 'error' as const };
  };

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {/* Security Overview */}
      <Box sx={{ flex: '1 1 100%' }}>
        <Card>
          <CardHeader title="Security Overview" />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <ShieldIcon color={securityLevel.color} fontSize="large" />
                  <Box>
                    <Typography variant="h6">
                      Security Level: {securityLevel.level}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Security Score: {securityScore}/100
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 calc(33.33% - 8px)', textAlign: 'center' }}>
                    <Typography variant="h6">{securitySettings.activeSessions}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Active Sessions
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 calc(33.33% - 8px)', textAlign: 'center' }}>
                    <Typography variant="h6">{securitySettings.trustedDevices}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Trusted Devices
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 calc(33.33% - 8px)', textAlign: 'center' }}>
                    <Typography variant="h6">{securitySettings.lastPasswordChange}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Last Password Change
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Authentication Settings */}
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
        <Card>
          <CardHeader title="Authentication" />
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LockIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary="Add an extra layer of security to your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onChange={handleSecurityChange('twoFactorEnabled')}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Login Notifications"
                  secondary="Get notified of new sign-ins to your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onChange={handleSecurityChange('loginNotifications')}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <DeviceIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Device Tracking"
                  secondary="Track and monitor devices that access your account"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={securitySettings.deviceTracking}
                    onChange={handleSecurityChange('deviceTracking')}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            {!securitySettings.twoFactorEnabled && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Recommended:</strong> Enable Two-Factor Authentication for better security.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Session Management */}
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
        <Card>
          <CardHeader title="Session Management" />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={handleSecurityChange('sessionTimeout')}
                  onBlur={() => handleTextFieldSave('sessionTimeout')}
                  inputProps={{ min: 5, max: 480 }}
                  helperText="Sessions will automatically expire after this time"
                  InputProps={{
                    startAdornment: <TimerIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="Password Expiry (days)"
                  type="number"
                  value={securitySettings.passwordExpiry}
                  onChange={handleSecurityChange('passwordExpiry')}
                  onBlur={() => handleTextFieldSave('passwordExpiry')}
                  inputProps={{ min: 30, max: 365 }}
                  helperText="Force password change after this many days"
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  label="IP Whitelist"
                  multiline
                  rows={3}
                  value={securitySettings.ipWhitelist}
                  onChange={handleSecurityChange('ipWhitelist')}
                  onBlur={() => handleTextFieldSave('ipWhitelist')}
                  placeholder="192.168.1.1&#10;10.0.0.1&#10;203.0.113.1"
                  helperText="Enter IP addresses, one per line. Leave empty to allow all IPs."
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Security Recommendations */}
      <Box sx={{ flex: '1 1 100%' }}>
        <Card>
          <CardHeader title="Security Recommendations" />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {!securitySettings.twoFactorEnabled && (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.33% - 12px)' } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="warning" />
                    <Typography variant="body2">
                      Enable Two-Factor Authentication
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {securitySettings.sessionTimeout > 120 && (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.33% - 12px)' } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="warning" />
                    <Typography variant="body2">
                      Consider shorter session timeout
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {securitySettings.passwordExpiry > 90 && (
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.33% - 12px)' } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="warning" />
                    <Typography variant="body2">
                      Consider shorter password expiry
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {securitySettings.twoFactorEnabled && 
               securitySettings.sessionTimeout <= 60 && 
               securitySettings.passwordExpiry <= 90 && (
                <Box sx={{ flex: '1 1 100%' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ShieldIcon color="success" />
                    <Typography variant="body2" color="success.main">
                      Your security settings look great! Keep up the good work.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ flex: '1 1 100%' }}>
        <Card>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Button
                  variant="outlined"
                  onClick={() => onSuccess('Session management coming soon!')}
                >
                  View Active Sessions
                </Button>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  onClick={() => onSuccess('Device management coming soon!')}
                >
                  Manage Trusted Devices
                </Button>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  onClick={() => onSuccess('Activity log coming soon!')}
                >
                  View Security Log
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SecurityTab;
