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
  Parent,
  Student,
  CreateParentData
} from '@/services/userManagementService';

interface ParentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (parentData: CreateParentData) => Promise<void>;
  parent: Parent | null;
  students: Student[];
  isSubmitting: boolean;
}

const ParentFormDialog: React.FC<ParentFormDialogProps> = ({
  open,
  onClose,
  onSave,
  parent,
  students,
  isSubmitting,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState<CreateParentData>({
    email: '',
    name: '',
    phone: '',
    studentIds: [],
    relationship: 'father',
    occupation: '',
    address: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (parent) {
      setFormData({
        email: parent.email,
        name: parent.name,
        phone: parent.phone || '',
        studentIds: parent.studentIds,
        relationship: parent.relationship,
        occupation: parent.occupation || '',
        address: parent.address || '',
        password: '' // Don't show existing password
      });
    } else {
      setFormData({
        email: '',
        name: '',
        phone: '',
        studentIds: [],
        relationship: 'father',
        occupation: '',
        address: '',
        password: ''
      });
    }
    setErrors({});
  }, [parent, open]);

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

    if (!formData.studentIds || formData.studentIds.length === 0) {
      newErrors.studentIds = 'At least one student must be assigned';
    }

    if (!formData.relationship) {
      newErrors.relationship = 'Relationship is required';
    }

    // Only validate password for new parents
    if (!parent) {
      if (!formData.password || formData.password.trim().length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreateParentData, value: any) => {
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

  const handleStudentChange = (event: any, newValue: Student[]) => {
    handleChange('studentIds', newValue.map(student => student.id));
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
          {parent ? 'Edit Parent/Guardian' : 'Add New Parent/Guardian'}
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
                disabled={isSubmitting || !!parent}
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
              <FormControl fullWidth error={!!errors.relationship} disabled={isSubmitting}>
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={formData.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  label="Relationship"
                  required
                >
                  <MenuItem value="father">Father</MenuItem>
                  <MenuItem value="mother">Mother</MenuItem>
                  <MenuItem value="guardian">Guardian</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.relationship && <FormHelperText>{errors.relationship}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {!parent && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password || 'Initial password for parent login'}
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

            {/* Student Assignment */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#000054' }}>
                Student Assignment
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={students}
                getOptionLabel={(option) => `${option.name} (${option.studentId}) - ${option.email}`}
                value={students.filter(student => formData.studentIds.includes(student.id))}
                onChange={handleStudentChange}
                disabled={isSubmitting}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Students"
                    error={!!errors.studentIds}
                    helperText={errors.studentIds || "Select one or more students this parent/guardian is responsible for"}
                    required
                  />
                )}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={`${option.name} (${option.studentId})`}
                      {...getTagProps({ index })}
                      key={option.id}
                      color="success"
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
                label="Occupation"
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
                disabled={isSubmitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={isSubmitting}
              />
            </Grid>

            {/* Summary */}
            {formData.studentIds.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mt: 2 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                    Assignment Summary
                  </Typography>
                  <Typography variant="body2">
                    This {formData.relationship} will be linked to {formData.studentIds.length} student(s):
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {students
                      .filter(student => formData.studentIds.includes(student.id))
                      .map(student => (
                        <Chip
                          key={student.id}
                          label={`${student.name} (${student.studentId})`}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                          color="success"
                          variant="outlined"
                        />
                      ))
                    }
                  </Box>
                </Box>
              </Grid>
            )}
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
            ) : parent ? (
              'Update Parent'
            ) : (
              'Create Parent'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ParentFormDialog;
