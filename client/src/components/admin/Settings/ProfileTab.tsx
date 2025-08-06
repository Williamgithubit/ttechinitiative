import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  InputAdornment,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PhotoCamera as PhotoCameraIcon,
  AccountCircle as AccountIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { updateUser } from '@/store/Auth/authSlice';

interface ProfileTabProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ onSuccess, onError }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const currentUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  // Profile settings state
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    bio: '',
    location: '',
    website: '',
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      
      // Save to localStorage for now (in production, this would save to API)
      localStorage.setItem('profileSettings', JSON.stringify(profileData));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update Redux store with new profile data
      if (currentUser) {
        dispatch(updateUser({ 
          ...currentUser, 
          name: profileData.name, 
          email: profileData.email 
        }));
      }
      
      setEditingProfile(false);
      onSuccess('Profile updated successfully!');
    } catch (err) {
      onError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      onError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      onError('Password must be at least 8 characters long');
      return;
    }

    if (!passwordData.currentPassword) {
      onError('Current password is required');
      return;
    }

    try {
      setLoading(true);
      
      // In production, this would call Firebase Auth to change password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordDialogOpen(false);
      onSuccess('Password changed successfully!');
    } catch (err) {
      onError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Grid container spacing={3}>
      {/* Profile Card */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}>
              {currentUser?.name?.charAt(0) || 'A'}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {currentUser?.name || 'Admin User'}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {currentUser?.role || 'Administrator'}
            </Typography>
            <Chip label="Active" color="success" size="small" sx={{ mb: 2 }} />
            <br />
            <Button
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              size="small"
              onClick={() => onSuccess('Photo upload coming soon!')}
            >
              Change Photo
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Profile Information */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader
            title="Profile Information"
            action={
              <IconButton onClick={() => setEditingProfile(!editingProfile)}>
                {editingProfile ? <CancelIcon /> : <EditIcon />}
              </IconButton>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!editingProfile}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!editingProfile}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!editingProfile}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  disabled={!editingProfile}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!editingProfile}
                  placeholder="Tell us about yourself..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  disabled={!editingProfile}
                  placeholder="https://example.com"
                />
              </Grid>
              {editingProfile && (
                <Grid item xs={12}>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleProfileSave}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Password & Security Section */}
        <Card sx={{ mt: 3 }}>
          <CardHeader title="Password & Security" />
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body1" gutterBottom>
                  Password
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last changed 30 days ago
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => setPasswordDialogOpen(true)}
              >
                Change Password
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            width: { xs: '95%', sm: '80%', md: '60%' },
            p: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Change Password</DialogTitle>
        <DialogContent>
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ 
                  ...passwordData, 
                  currentPassword: e.target.value 
                })}
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ 
                  ...passwordData, 
                  newPassword: e.target.value 
                })}
                helperText="Password must be at least 8 characters long"
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ 
                  ...passwordData, 
                  confirmPassword: e.target.value 
                })}
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: { xs: 1, sm: 2 } }}>
          <Button
            onClick={() => setPasswordDialogOpen(false)}
            disabled={loading}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={loading}
            size={isMobile ? "small" : "medium"}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a',
              },
            }}
          >
            {loading ? <CircularProgress size={isMobile ? 16 : 20} /> : (isMobile ? 'Change' : 'Change Password')}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ProfileTab;
