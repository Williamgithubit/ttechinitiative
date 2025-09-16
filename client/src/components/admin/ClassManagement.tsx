// src/components/admin/ClassManagement.tsx
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  createClassAsync,
  updateClassAsync,
  deleteClassAsync,
  addStudentToClassAsync,
  removeStudentFromClassAsync
} from '@/store/Admin/subjectClassSlice';
import { Class, Student } from '@/services/userManagementService';
import toast from 'react-hot-toast';

interface ClassFormData {
  name: string;
  grade: string;
  section: string;
  capacity: number;
  subjects: string[];
  description: string;
}

const ClassManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();
  
  const { classes, students, subjects, searchTerm, loading } = useAppSelector((state) => state.subjectClass);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    grade: '1',
    section: 'A',
    capacity: 30,
    subjects: [],
    description: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter classes based on search term
  const filteredClasses = useMemo(() => {
    if (!searchTerm) return classes;
    
    return classes.filter(cls =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.grade.toString().includes(searchTerm)
    );
  }, [classes, searchTerm]);

  // Get available students (not assigned to the selected class)
  const availableStudents = useMemo(() => {
    if (!selectedClass) return students;
    
    const classStudentIds = selectedClass.students?.map(s => s.id) || [];
    return students.filter(student => !classStudentIds.includes(student.id));
  }, [students, selectedClass]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    }

    const gradeNum = parseInt(formData.grade);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      newErrors.grade = 'Grade must be between 1 and 12';
    }

    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    }

    if (formData.capacity < 1 || formData.capacity > 100) {
      newErrors.capacity = 'Capacity must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenDialog = (cls?: Class) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        capacity: cls.capacity,
        subjects: cls.subjects || [],
        description: cls.description || ''
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        grade: '1',
        section: 'A',
        capacity: 30,
        subjects: [],
        description: ''
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingClass(null);
    setFormData({
      name: '',
      grade: '1',
      section: 'A',
      capacity: 30,
      subjects: [],
      description: ''
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingClass) {
        await dispatch(updateClassAsync({
          id: editingClass.id,
          data: formData
        })).unwrap();
        toast.success('Class updated successfully');
      } else {
        await dispatch(createClassAsync(formData)).unwrap();
        toast.success('Class created successfully');
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleDeleteClick = (cls: Class) => {
    setClassToDelete(cls);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;

    try {
      await dispatch(deleteClassAsync(classToDelete.id)).unwrap();
      toast.success('Class deleted successfully');
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleStudentManagement = (cls: Class) => {
    setSelectedClass(cls);
    setStudentDialogOpen(true);
  };

  const handleAddStudent = async (student: Student) => {
    if (!selectedClass) return;

    try {
      await dispatch(addStudentToClassAsync({
        classId: selectedClass.id,
        studentId: student.id
      })).unwrap();
      toast.success(`${student.name} added to class`);
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleRemoveStudent = async (student: Student) => {
    if (!selectedClass) return;

    try {
      await dispatch(removeStudentFromClassAsync({
        classId: selectedClass.id,
        studentId: student.id
      })).unwrap();
      toast.success(`${student.name} removed from class`);
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleFormChange = (field: keyof ClassFormData, value: string | number | string[]) => {
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
          Classes ({filteredClasses.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading.classes}
          sx={{
            backgroundColor: '#E32845',
            '&:hover': { backgroundColor: '#c41e3a' },
            textTransform: 'none',
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Add Class
        </Button>
      </Box>

      {/* Classes Grid */}
      <Grid container spacing={3}>
        {filteredClasses.map((cls) => (
          <Grid item xs={12} md={6} lg={4} key={cls.id}>
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
                {/* Class Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: '#000054',
                      width: 40,
                      height: 40,
                      mr: 2
                    }}
                  >
                    <ClassIcon />
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
                      {cls.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={`Grade ${cls.grade}`}
                        size="small"
                        sx={{
                          backgroundColor: '#E32845',
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                      <Chip
                        label={`Section ${cls.section}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Description */}
                {cls.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, lineHeight: 1.5 }}
                  >
                    {cls.description}
                  </Typography>
                )}

                {/* Enrollment Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GroupsIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Students: {cls.currentEnrollment || 0} / {cls.capacity}
                  </Typography>
                </Box>

                {/* Subjects */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#000054' }}>
                    Subjects ({cls.subjects?.length || 0})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {cls.subjects?.slice(0, 3).map((subjectId) => {
                      const subject = subjects.find(s => s.id === subjectId);
                      return subject ? (
                        <Chip
                          key={subjectId}
                          label={subject.code}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ) : null;
                    })}
                    {(cls.subjects?.length || 0) > 3 && (
                      <Chip
                        label={`+${(cls.subjects?.length || 0) - 3} more`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                  <Button
                    size="small"
                    startIcon={<GroupsIcon />}
                    onClick={() => handleStudentManagement(cls)}
                    disabled={loading.classes}
                    sx={{ 
                      textTransform: 'none',
                      color: '#000054',
                      fontSize: '0.75rem'
                    }}
                  >
                    Manage Students
                  </Button>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit Class">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(cls)}
                        disabled={loading.classes}
                        sx={{ color: '#000054' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Class">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(cls)}
                        disabled={loading.classes}
                        sx={{ color: '#E32845' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredClasses.length === 0 && !loading.classes && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary'
          }}
        >
          <ClassIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            {searchTerm ? 'No classes found' : 'No classes yet'}
          </Typography>
          <Typography variant="body2">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Create your first class to get started'
            }
          </Typography>
        </Box>
      )}

      {/* Add/Edit Class Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ color: '#000054', fontWeight: 600 }}>
          {editingClass ? 'Edit Class' : 'Add New Class'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Grade"
                type="number"
                value={formData.grade}
                onChange={(e) => handleFormChange('grade', e.target.value || '1')}
                error={!!errors.grade}
                helperText={errors.grade}
                inputProps={{ min: 1, max: 12 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Section"
                value={formData.section}
                onChange={(e) => handleFormChange('section', e.target.value.toUpperCase())}
                error={!!errors.section}
                helperText={errors.section}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleFormChange('capacity', parseInt(e.target.value) || 30)}
                error={!!errors.capacity}
                helperText={errors.capacity}
                inputProps={{ min: 1, max: 100 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Subjects</InputLabel>
                <Select
                  multiple
                  value={formData.subjects}
                  onChange={(e) => handleFormChange('subjects', e.target.value as string[])}
                  label="Subjects"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => {
                        const subject = subjects.find(s => s.id === value);
                        return (
                          <Chip 
                            key={value} 
                            label={subject?.code || value} 
                            size="small" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={loading.classes}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading.classes}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': { backgroundColor: '#c41e3a' }
            }}
          >
            {loading.classes ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              editingClass ? 'Update' : 'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Management Dialog */}
      <Dialog
        open={studentDialogOpen}
        onClose={() => setStudentDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ color: '#000054', fontWeight: 600 }}>
          Manage Students - {selectedClass?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Current Students */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: '#000054' }}>
                Current Students ({selectedClass?.students?.length || 0})
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {selectedClass?.students?.map((student) => (
                  <ListItem key={student.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#E32845' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.name}
                      secondary={student.email}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Remove from class">
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveStudent(student)}
                          disabled={loading.classes}
                          sx={{ color: '#E32845' }}
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {(!selectedClass?.students || selectedClass.students.length === 0) && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No students in this class
                  </Typography>
                )}
              </List>
            </Grid>

            {/* Available Students */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: '#000054' }}>
                Available Students ({availableStudents.length})
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {availableStudents.map((student) => (
                  <ListItem key={student.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: '#000054' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.name}
                      secondary={student.email}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Add to class">
                        <IconButton
                          edge="end"
                          onClick={() => handleAddStudent(student)}
                          disabled={loading.classes}
                          sx={{ color: '#000054' }}
                        >
                          <PersonAddIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {availableStudents.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No available students
                  </Typography>
                )}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStudentDialogOpen(false)}>
            Close
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
          Delete Class
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{classToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading.classes}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={loading.classes}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassManagement;
