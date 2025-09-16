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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import Grid from '@/components/ui/Grid';
import {
  Student,
  Parent,
  Class,
  CreateStudentData
} from '@/services/userManagementService';

interface StudentFormData extends Omit<CreateStudentData, 'dateOfBirth'> {
  dateOfBirth: Dayjs | null;
  password?: string;
}

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (studentData: CreateStudentData) => Promise<void>;
  student: Student | null;
  parents: Parent[];
  classes: Class[];
  isSubmitting: boolean;
}

const StudentFormDialog: React.FC<StudentFormDialogProps> = ({
  open,
  onClose,
  onSave,
  student,
  parents,
  classes,
  isSubmitting,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState<StudentFormData>({
    email: '',
    name: '',
    phone: '',
    studentId: '',
    classId: '',
    parentIds: [],
    dateOfBirth: null,
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        email: student.email || '',
        name: student.name || '',
        phone: student.phone || '',
        studentId: student.studentId || '',
        classId: student.classId || '',
        parentIds: student.parentIds || [],
        dateOfBirth: student.dateOfBirth ? dayjs(student.dateOfBirth) : null,
        address: student.address || '',
        emergencyContact: {
          name: student.emergencyContact?.name || '',
          phone: student.emergencyContact?.phone || '',
          relationship: student.emergencyContact?.relationship || ''
        },
        password: '' // Don't show existing password
      });
    } else {
      setFormData({
        email: '',
        name: '',
        phone: '',
        studentId: '',
        classId: '',
        parentIds: [],
        dateOfBirth: null,
        address: '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: ''
        },
        password: ''
      });
    }
    setErrors({});
  }, [student, open]);

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

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    if (!formData.classId) {
      newErrors.classId = 'Class assignment is required';
    }

    // Only validate password for new students
    if (!student) {
      if (!formData.password || formData.password.trim().length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CreateStudentData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact!,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Convert dayjs date back to JavaScript Date for the API
        const submitData: CreateStudentData = {
          ...formData,
          dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toDate() : undefined
        };
        await onSave(submitData);
      } catch {
        // Error handled in parent
      }
    }
  };

  const handleParentChange = (event: any, newValue: Parent[]) => {
    handleChange('parentIds', newValue.map(parent => parent.id));
  };

  const selectedClass = classes.find(cls => cls.id === formData.classId);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            {student ? 'Edit Student' : 'Add New Student'}
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
                  disabled={isSubmitting || !!student}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={isSubmitting}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={formData.studentId}
                  onChange={(e) => handleChange('studentId', e.target.value)}
                  error={!!errors.studentId}
                  helperText={errors.studentId}
                  disabled={isSubmitting || !!student}
                  required
                />
              </Grid>
              
              {!student && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password || ''}
                    onChange={(e) => handleChange('password', e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password || 'Initial password for student login'}
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

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(newValue) => handleChange('dateOfBirth', newValue)}
                  disabled={isSubmitting}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.dateOfBirth,
                      helperText: errors.dateOfBirth
                    }
                  }}
                />
              </Grid>

              {/* Class Assignment */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#000054' }}>
                  Class Assignment
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.classId} disabled={isSubmitting}>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={formData.classId || ''}
                    onChange={(e) => handleChange('classId', e.target.value)}
                    label="Class"
                    required
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name} - Grade {cls.grade} {cls.section} 
                        ({cls.currentEnrollment}/{cls.capacity})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.classId && <FormHelperText>{errors.classId}</FormHelperText>}
                </FormControl>
              </Grid>

              {selectedClass && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary">
                      Class Details
                    </Typography>
                    <Typography variant="body2">
                      Subjects: {selectedClass.subjects.length} assigned
                    </Typography>
                    <Typography variant="body2">
                      Capacity: {selectedClass.currentEnrollment}/{selectedClass.capacity}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Parent Assignment */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#000054' }}>
                  Parent/Guardian Assignment
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={parents}
                  getOptionLabel={(option) => `${option.name} (${option.relationship}) - ${option.email}`}
                  value={parents.filter(parent => (formData.parentIds || []).includes(parent.id))}
                  onChange={handleParentChange}
                  disabled={isSubmitting}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Parents/Guardians"
                      helperText="Select one or more parents/guardians for this student"
                    />
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        label={`${option.name} (${option.relationship})`}
                        {...getTagProps({ index })}
                        key={option.id}
                        color="info"
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
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={isSubmitting}
                />
              </Grid>

              {/* Emergency Contact */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#000054' }}>
                  Emergency Contact
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  value={formData.emergencyContact?.name ?? ''}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  disabled={isSubmitting}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.emergencyContact?.phone ?? ''}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  disabled={isSubmitting}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={formData.emergencyContact?.relationship ?? ''}
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                  disabled={isSubmitting}
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
              ) : student ? (
                'Update Student'
              ) : (
                'Create Student'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default StudentFormDialog;
