// src/components/admin/SubjectManagement.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Avatar,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import Grid from '@/components/ui/Grid'; 
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  createSubjectAsync,
  updateSubjectAsync,
  deleteSubjectAsync
} from '@/store/Admin/subjectClassSlice';
import { Teacher } from '@/services/userManagementService';
import { SubjectWithTeacher } from '@/store/Admin/subjectClassSlice';
import toast from 'react-hot-toast';

interface SubjectFormData {
  name: string;
  code: string;
  description: string;
  teacherId?: string;
  level: string;
}

const SubjectManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();
  
  const { subjects, teachers, searchTerm, loading } = useAppSelector((state) => state.subjectClass);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithTeacher | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectWithTeacher | null>(null);
  
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    description: '',
    teacherId: '',
    level: 'Elementary'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter subjects based on search term
  const filteredSubjects = useMemo(() => {
    if (!searchTerm) return subjects;
    
    return subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subjects, searchTerm]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Subject code is required';
    }

    if (!formData.level) {
      newErrors.level = 'Level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenDialog = (subject?: SubjectWithTeacher) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description || '',
        teacherId: subject.teacherId || '',
        level: subject.level || 'Elementary'
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        teacherId: '',
        level: 'Elementary'
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      teacherId: '',
      level: 'Elementary'
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingSubject) {
        await dispatch(updateSubjectAsync({
          id: editingSubject.id,
          data: {
            ...formData,
            teacherId: formData.teacherId || undefined
          }
        })).unwrap();
        toast.success('Subject updated successfully');
      } else {
        await dispatch(createSubjectAsync({
          ...formData,
          teacherId: formData.teacherId || undefined
        })).unwrap();
        toast.success('Subject created successfully');
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleDeleteClick = (subject: SubjectWithTeacher) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;

    try {
      await dispatch(deleteSubjectAsync(subjectToDelete.id)).unwrap();
      toast.success('Subject deleted successfully');
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleFormChange = (field: keyof SubjectFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box>
      {/* Header with Add Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h6" sx={{ color: '#000054', fontWeight: 600 }}>
          Subjects ({filteredSubjects.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading.subjects}
          sx={{
            backgroundColor: '#E32845',
            '&:hover': { backgroundColor: '#c41e3a' },
            textTransform: 'none',
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Add Subject
        </Button>
      </Box>

      {/* Subjects Grid */}
      <Grid container spacing={3}>
        {filteredSubjects.map((subject) => (
          <Grid item xs={12} md={6} lg={4} key={subject.id}>
            <Card 
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Subject Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: '#000054',
                      width: 40,
                      height: 40,
                      mr: 2
                    }}
                  >
                    <SchoolIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#000054',
                        fontSize: '1.1rem',
                        wordBreak: 'break-word'
                      }}
                    >
                      {subject.name}
                    </Typography>
                    <Chip
                      label={subject.code}
                      size="small"
                      sx={{
                        backgroundColor: '#E32845',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                </Box>

                {/* Description */}
                {subject.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, lineHeight: 1.5 }}
                  >
                    {subject.description}
                  </Typography>
                )}

                {/* Level */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Level: 
                  </Typography>
                  <Chip
                    label={subject.level || 'Elementary'}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Teacher Assignment */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#000054' }}>
                    Assigned Teacher
                  </Typography>
                  {subject.teacher ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 1.5,
                          backgroundColor: '#E32845'
                        }}
                      >
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {subject.teacher.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {subject.teacher.email}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No teacher assigned
                    </Typography>
                  )}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 'auto' }}>
                  <Tooltip title="Edit Subject">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(subject)}
                      disabled={loading.subjects}
                      sx={{ color: '#000054' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Subject">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(subject)}
                      disabled={loading.subjects}
                      sx={{ color: '#E32845' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredSubjects.length === 0 && !loading.subjects && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary'
          }}
        >
          <SchoolIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            {searchTerm ? 'No subjects found' : 'No subjects yet'}
          </Typography>
          <Typography variant="body2">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Create your first subject to get started'
            }
          </Typography>
        </Box>
      )}

      {/* Add/Edit Subject Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ color: '#000054', fontWeight: 600 }}>
          {editingSubject ? 'Edit Subject' : 'Add New Subject'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject Code"
                value={formData.code}
                onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
                error={!!errors.code}
                helperText={errors.code}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.level}>
                <InputLabel>Level *</InputLabel>
                <Select
                  value={formData.level}
                  onChange={(e) => handleFormChange('level', e.target.value)}
                  label="Level *"
                  required
                >
                  <MenuItem value="Kindergarten">Kindergarten</MenuItem>
                  <MenuItem value="Elementary">Elementary</MenuItem>
                  <MenuItem value="Junior High">Junior High</MenuItem>
                  <MenuItem value="Senior High">Senior High</MenuItem>
                </Select>
                {errors.level && (
                  <FormHelperText>{errors.level}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assign Teacher</InputLabel>
                <Select
                  value={formData.teacherId}
                  onChange={(e) => handleFormChange('teacherId', e.target.value)}
                  label="Assign Teacher"
                >
                  <MenuItem value="">
                    <em>No teacher assigned</em>
                  </MenuItem>
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={loading.subjects}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading.subjects}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': { backgroundColor: '#c41e3a' }
            }}
          >
            {loading.subjects ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              editingSubject ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: '#E32845' }}>
          Delete Subject
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{subjectToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading.subjects}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={loading.subjects}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectManagement;
