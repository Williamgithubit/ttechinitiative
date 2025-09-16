import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Box,
  Typography,
  Autocomplete,
  CircularProgress,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Grid from '@/components/ui/Grid';
import {
  Teacher,
  Subject,
  Class,
  CreateTeacherData
} from '@/services/userManagementService';

interface TeacherFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (teacherData: CreateTeacherData) => Promise<void>;
  teacher: Teacher | null;
  subjects: Subject[];
  classes: Class[];
  isSubmitting: boolean;
}

const TeacherFormDialog: React.FC<TeacherFormDialogProps> = ({
  open,
  onClose,
  onSave,
  teacher,
  subjects,
  classes,
  isSubmitting,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState<CreateTeacherData & { password?: string }>({
    email: '',
    name: '',
    phone: '',
    employeeId: '',
    subjects: [],
    classes: [],
    qualifications: [],
    experience: 0,
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFormData({
        email: teacher.email,
        name: teacher.name,
        phone: teacher.phone || '',
        employeeId: teacher.employeeId,
        subjects: teacher.subjects,
        classes: teacher.classes || [],
        qualifications: teacher.qualifications || [],
        experience: teacher.experience || 0,
        password: '' // Don't show existing password
      });
    } else {
      setFormData({
        email: '',
        name: '',
        phone: '',
        employeeId: '',
        subjects: [],
        classes: [],
        qualifications: [],
        experience: 0,
        password: ''
      });
    }
    setErrors({});
  }, [teacher, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!formData.subjects || formData.subjects.length === 0) {
      newErrors.subjects = 'At least one subject must be assigned';
    }

    // Only validate password for new teachers
    if (!teacher) {
      if (!formData.password || formData.password.trim().length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreateTeacherData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSave(formData);
      } catch {
        // Error handled in parent
      }
    }
  };

  const handleSubjectChange = (event: any, newValue: Subject[]) => {
    handleChange('subjects', newValue.map(subject => subject.id));
  };

  const handleClassChange = (event: any, newValue: Class[]) => {
    handleChange('classes', newValue.map(cls => cls.id));
  };

  return (
    <Dialog 
      open={open} 
      onClose={isSubmitting ? undefined : onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: '95%', sm: '90%', md: '700px' },
          maxWidth: '100%',
          m: { xs: 1, sm: 2 }
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ 
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          p: { xs: 2, sm: 3 }
        }}>
          {teacher ? 'Edit Teacher' : 'Add New Teacher'}
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: '#000054' }}>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={isSubmitting}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isSubmitting || !!teacher}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee ID"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                error={!!errors.employeeId}
                helperText={errors.employeeId}
                disabled={isSubmitting || !!teacher}
                required
              />
            </Grid>
            
            {!teacher && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password || 'Initial password for teacher login'}
                  disabled={isSubmitting}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isSubmitting}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            {/* Subject Assignment */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#000054' }}>
                Subject Assignment
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={subjects}
                getOptionLabel={(option) => `${option.name} (${option.code})`}
                value={subjects.filter(subject => formData.subjects.includes(subject.id))}
                onChange={handleSubjectChange}
                disabled={isSubmitting}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Subjects"
                    error={!!errors.subjects}
                    helperText={errors.subjects || "Select one or more subjects this teacher will handle"}
                    required
                  />
                )}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={`${option.name} (${option.code})`}
                      {...getTagProps({ index })}
                      key={option.id}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
              />
            </Grid>

            {/* Class Assignment */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#000054' }}>
                Class Assignment (Optional)
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={classes}
                getOptionLabel={(option) => `${option.name} - Grade ${option.grade} ${option.section}`}
                value={classes.filter(cls => formData.classes?.includes(cls.id))}
                onChange={handleClassChange}
                disabled={isSubmitting}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Classes"
                    helperText="Select classes this teacher will handle (optional)"
                  />
                )}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={`${option.name} - Grade ${option.grade} ${option.section}`}
                      {...getTagProps({ index })}
                      key={option.id}
                      color="secondary"
                      variant="outlined"
                    />
                  ))
                }
              />
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#000054' }}>
                Additional Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                type="number"
                value={formData.experience}
                onChange={(e) => handleChange('experience', parseInt(e.target.value) || 0)}
                disabled={isSubmitting}
                inputProps={{ min: 0, max: 50 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Qualifications"
                multiline
                rows={3}
                value={formData.qualifications?.join(', ') || ''}
                onChange={(e) => handleChange('qualifications', e.target.value.split(',').map(q => q.trim()).filter(q => q))}
                disabled={isSubmitting}
                helperText="Enter qualifications separated by commas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, justifyContent: 'space-between' }}>
          <Button 
            onClick={onClose} 
            disabled={isSubmitting}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isSubmitting}
            size={isMobile ? "small" : "medium"}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a',
              },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : teacher ? (
              'Update Teacher'
            ) : (
              'Create Teacher'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeacherFormDialog;
