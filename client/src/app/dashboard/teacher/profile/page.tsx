'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/store';
import { selectAuthState } from '@/store/Auth/authSlice';
import { TeacherProfileService, TeacherProfile as TeacherProfileType } from '@/services/teacherProfileService';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Divider,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Container,
  Stack,
  Badge,
  Fade,
  Skeleton
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Camera as CameraIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  MenuBook as BookIcon,
  WorkOutline as WorkIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';

// Using TeacherProfile type from service

const TeacherProfilePage = () => {
  const { user } = useAppSelector(selectAuthState);
  const [profile, setProfile] = useState<TeacherProfileType>({
    displayName: '',
    email: '',
    phone: '',
    department: '',
    subjects: [],
    bio: '',
    officeHours: '',
    officeLocation: '',
    yearsExperience: 0,
    education: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        setError(null);
        
        let existingProfile = await TeacherProfileService.getProfile(user.uid);
        
        if (!existingProfile) {
          // Initialize profile with auth data if it doesn't exist
          existingProfile = await TeacherProfileService.initializeProfile(user.uid, {
            displayName: user.displayName || '',
            email: user.email || ''
          });
        }
        
        setProfile(existingProfile);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
        // Set basic profile from auth data as fallback
        setProfile({
          displayName: user.displayName || '',
          email: user.email || '',
          phone: '',
          department: '',
          subjects: [],
          bio: '',
          officeHours: '',
          officeLocation: '',
          yearsExperience: 0,
          education: ''
        });
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await TeacherProfileService.updateProfile(user.uid, {
        displayName: profile.displayName,
        phone: profile.phone,
        department: profile.department,
        subjects: profile.subjects,
        bio: profile.bio,
        officeHours: profile.officeHours,
        officeLocation: profile.officeLocation,
        yearsExperience: profile.yearsExperience,
        education: profile.education
      });
      
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values if needed
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uid) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setPhotoUploading(true);
    setError(null);

    try {
      const photoURL = await TeacherProfileService.uploadProfilePhoto(user.uid, file);
      setProfile(prev => ({ ...prev, photoURL }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!user?.uid) return;

    setPhotoUploading(true);
    setError(null);

    try {
      await TeacherProfileService.deleteProfilePhoto(user.uid);
      setProfile(prev => ({ ...prev, photoURL: '' }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleInputChange = (field: keyof TeacherProfileType, value: string | number | string[]) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (profileLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      {/* Professional Header with Gradient Background */}
      <Paper 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)',
          color: 'white',
          p: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 2, sm: 3 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: { xs: '150px', sm: '200px' },
            height: { xs: '150px', sm: '200px' },
            background: 'radial-gradient(circle, rgba(227, 40, 69, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)'
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 2, sm: 3 }} 
            alignItems={{ xs: 'center', sm: 'flex-start' }}
          >
            <Box sx={{ position: 'relative' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: '#4CAF50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white'
                    }}
                  >
                    <VerifiedIcon sx={{ fontSize: 14, color: 'white' }} />
                  </Box>
                }
              >
                <Avatar
                  src={profile.photoURL || undefined}
                  sx={{ 
                    width: { xs: 100, sm: 120, md: 140 }, 
                    height: { xs: 100, sm: 120, md: 140 },
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                    fontWeight: 'bold',
                    border: { xs: '3px solid rgba(255, 255, 255, 0.3)', sm: '4px solid rgba(255, 255, 255, 0.3)' }
                  }}
                >
                  {!profile.photoURL && (profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'T')}
                </Avatar>
              </Badge>
              
              {/* Photo Upload/Delete Controls */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: { xs: -4, sm: -8 },
                  right: { xs: -4, sm: -8 },
                  display: 'flex',
                  gap: { xs: 0.5, sm: 1 }
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  type="file"
                  onChange={handlePhotoUpload}
                />
                <label htmlFor="photo-upload">
                  <IconButton
                    component="span"
                    disabled={photoUploading}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      color: '#000054',
                      width: { xs: 40, sm: 32 },
                      height: { xs: 40, sm: 32 },
                      minWidth: { xs: 44, sm: 32 },
                      minHeight: { xs: 44, sm: 32 },
                      '&:hover': {
                        bgcolor: 'white',
                        color: '#E32845'
                      }
                    }}
                  >
                    {photoUploading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <CameraIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </label>
                
                {profile.photoURL && (
                  <IconButton
                    onClick={handlePhotoDelete}
                    disabled={photoUploading}
                    sx={{
                      bgcolor: 'rgba(227, 40, 69, 0.9)',
                      color: 'white',
                      width: { xs: 40, sm: 32 },
                      height: { xs: 40, sm: 32 },
                      minWidth: { xs: 44, sm: 32 },
                      minHeight: { xs: 44, sm: 32 },
                      '&:hover': {
                        bgcolor: '#E32845'
                      }
                    }}
                  >
                    <CancelIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>
            </Box>
            
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                sx={{ 
                  mb: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  lineHeight: { xs: 1.2, sm: 1.3 },
                  background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {profile.displayName || 'Teacher Name'}
              </Typography>
              
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1, sm: 2 }} 
                sx={{ 
                  mb: { xs: 1.5, sm: 2 }, 
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  alignItems: { xs: 'center', sm: 'flex-start' }
                }}
              >
                <Chip 
                  icon={<SchoolIcon />}
                  label={profile.department}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 },
                    '& .MuiChip-icon': { color: '#E32845', fontSize: { xs: 16, sm: 20 } },
                    '& .MuiChip-label': { px: { xs: 1, sm: 1.5 } }
                  }}
                />
                <Chip 
                  icon={<WorkIcon />}
                  label={`${profile.yearsExperience} Years Experience`}
                  sx={{ 
                    bgcolor: 'rgba(227, 40, 69, 0.2)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 },
                    '& .MuiChip-icon': { color: 'white', fontSize: { xs: 16, sm: 20 } },
                    '& .MuiChip-label': { px: { xs: 1, sm: 1.5 } }
                  }}
                />
              </Stack>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                  lineHeight: { xs: 1.5, sm: 1.6 },
                  maxWidth: { xs: '100%', sm: '500px', md: '600px' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                {profile.bio || 'Passionate educator dedicated to student success and academic excellence.'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Alerts */}
      <Fade in={success}>
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-icon': { fontSize: '1.5rem' }
          }}
        >
          <Typography fontWeight={500}>Profile updated successfully!</Typography>
        </Alert>
      </Fade>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Personal Information Card */}
        <Grid item xs={12} lg={6}>
          <Card 
            sx={{ 
              height: '100%', 
              borderRadius: { xs: 2, sm: 3 },
              boxShadow: '0 8px 32px rgba(0, 0, 84, 0.1)',
              border: '1px solid rgba(0, 0, 84, 0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(0, 0, 84, 0.15)',
                transform: { xs: 'none', sm: 'translateY(-2px)' }
              }
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {/* Card Header */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: { xs: 2, sm: 3, md: 4 },
                pb: { xs: 1.5, sm: 2 },
                borderBottom: '2px solid #f5f5f5',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 0 }
              }}>
                <Box sx={{
                  p: { xs: 1, sm: 1.5 },
                  borderRadius: 2,
                  bgcolor: 'rgba(227, 40, 69, 0.1)',
                  mr: { xs: 1, sm: 2 }
                }}>
                  <PersonIcon sx={{ color: '#E32845', fontSize: { xs: 24, sm: 28 } }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="700" 
                    color="#000054"
                    sx={{ mb: 0.5 }}
                  >
                    Personal Information
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Your basic profile details
                  </Typography>
                </Box>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    sx={{
                      borderColor: '#000054',
                      color: '#000054',
                      minHeight: { xs: 44, sm: 36 },
                      fontSize: { xs: '0.875rem', sm: '0.875rem' },
                      px: { xs: 2, sm: 3 },
                      '&:hover': {
                        borderColor: '#E32845',
                        color: '#E32845',
                        bgcolor: 'rgba(227, 40, 69, 0.05)'
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: { xs: '100%', sm: 'auto' }
                  }}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      sx={{
                        borderColor: '#666',
                        color: '#666',
                        minHeight: { xs: 44, sm: 36 },
                        fontSize: { xs: '0.875rem', sm: '0.875rem' },
                        px: { xs: 2, sm: 3 },
                        flex: { xs: 1, sm: 'none' },
                        '&:hover': {
                          borderColor: '#333',
                          color: '#333'
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                      sx={{
                        bgcolor: '#E32845',
                        minHeight: { xs: 44, sm: 36 },
                        fontSize: { xs: '0.875rem', sm: '0.875rem' },
                        px: { xs: 2, sm: 3 },
                        flex: { xs: 1, sm: 'none' },
                        '&:hover': { bgcolor: '#c41e3a' }
                      }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* Contact Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: '#000054' }}>
                    Contact Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profile.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: '#000054' }} />,
                      sx: { minHeight: { xs: 56, sm: 48 } }
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: '#000054' }} />,
                      sx: { minHeight: { xs: 56, sm: 48 } }
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: '#000054' }} />,
                      sx: { minHeight: { xs: 56, sm: 48 } }
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={profile.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      startAdornment: <SchoolIcon sx={{ mr: 1, color: '#000054' }} />,
                      sx: { minHeight: { xs: 56, sm: 48 } }
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>

                {/* Professional Details */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: '#000054' }}>
                    Professional Details
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    multiline
                    rows={4}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      },
                      '& .MuiInputBase-root': {
                        minHeight: { xs: 120, sm: 80 }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Office Hours"
                    value={profile.officeHours}
                    onChange={(e) => handleInputChange('officeHours', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      sx: { minHeight: { xs: 56, sm: 48 } }
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Office Location"
                    value={profile.officeLocation}
                    onChange={(e) => handleInputChange('officeLocation', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      sx: { minHeight: { xs: 56, sm: 48 } }
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Years of Experience"
                    type="number"
                    value={profile.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      sx: { minHeight: { xs: 56, sm: 48 } }
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Education"
                    value={profile.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{
                      sx: { minHeight: { xs: 56, sm: 48 } }
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '1rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherProfilePage;
