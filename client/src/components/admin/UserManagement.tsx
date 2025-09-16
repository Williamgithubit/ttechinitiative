import React, { useState, useCallback, useEffect } from 'react';
import { auth } from '@/services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  useMediaQuery,
  useTheme,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Tooltip,
  Avatar,
  TablePagination,
  CircularProgress,
  Tabs,
  Tab,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorAccountIcon,
  ExpandMore as ExpandMoreIcon,
  Subject as SubjectIcon,
  Class as ClassIcon
} from '@mui/icons-material';
import {
  userManagementService,
  Teacher,
  Student,
  Parent,
  Subject,
  Class,
  CreateTeacherData,
  CreateStudentData,
  CreateParentData
} from '@/services/userManagementService';
import { TeachersTab, StudentsTab, ParentsTab } from './UserManagementTabs';
import TeacherFormDialog from './TeacherFormDialog';
import StudentFormDialog from './StudentFormDialog';
import ParentFormDialog from './ParentFormDialog';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  lastLogin: Date | null;
  createdAt: Date;
  emailVerified: boolean;
  photoURL: string | null;
}

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: string;
  status: string;
}

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (userData: CreateUserData) => Promise<void>;
  user: User | null;
  isSubmitting: boolean;
}

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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `user-tab-${index}`,
    'aria-controls': `user-tabpanel-${index}`,
  };
}

interface UserManagementProps {
  openDialog?: boolean;
  onCloseDialog?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ openDialog = false, onCloseDialog }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'teacher' | 'student' | 'parent'>('teacher');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user's ID token with force refresh to ensure latest claims
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Force refresh the token to ensure we have the latest claims
      const idToken = await currentUser.getIdToken(true);
      
      console.log('Fetching users with refreshed token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoleSpecificData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all role-specific data in parallel
      const [teachersData, studentsData, parentsData, subjectsData, classesData] = await Promise.all([
        userManagementService.getTeachers(),
        userManagementService.getStudents(),
        userManagementService.getParents(),
        userManagementService.getSubjects(),
        userManagementService.getClasses()
      ]);
      
      setTeachers(teachersData);
      setStudents(studentsData);
      setParents(parentsData);
      setSubjects(subjectsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Error fetching role-specific data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoleSpecificData();
  }, []);

  // Handle external dialog open request from parent component
  useEffect(() => {
    if (openDialog) {
      handleOpenDialog();
      // Call the parent's onCloseDialog to reset the state in the parent
      if (onCloseDialog) {
        onCloseDialog();
      }
    }
  }, [openDialog, onCloseDialog]);

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      setIsSubmitting(true);
      
      // Get the current user's ID token with force refresh to ensure latest claims
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Force refresh the token to ensure we have the latest claims
      const idToken = await currentUser.getIdToken(true);
      
      console.log('Creating user with refreshed token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to create user: ${response.statusText}`);
      }
      
      // Refresh users list
      await fetchUsers();
      
      // Close dialog
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error instanceof Error ? error.message : 'Failed to create user');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role-specific handlers
  const handleCreateTeacher = async (teacherData: CreateTeacherData) => {
    try {
      setIsSubmitting(true);
      await userManagementService.createTeacher(teacherData);
      setSuccess('Teacher created successfully');
      await fetchRoleSpecificData();
      handleCloseDialog();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create teacher');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStudent = async (studentData: CreateStudentData) => {
    try {
      setIsSubmitting(true);
      await userManagementService.createStudent(studentData);
      setSuccess('Student created successfully');
      await fetchRoleSpecificData();
      handleCloseDialog();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create student');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateParent = async (parentData: CreateParentData) => {
    try {
      setIsSubmitting(true);
      await userManagementService.createParent(parentData);
      setSuccess('Parent created successfully');
      await fetchRoleSpecificData();
      handleCloseDialog();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create parent');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDialog = (user: User | null = null) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleOpenRoleDialog = (type: 'teacher' | 'student' | 'parent', editItem: any = null) => {
    setDialogType(type);
    setDialogOpen(true);
    
    switch (type) {
      case 'teacher':
        setEditingTeacher(editItem);
        break;
      case 'student':
        setEditingStudent(editItem);
        break;
      case 'parent':
        setEditingParent(editItem);
        break;
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setEditingTeacher(null);
    setEditingStudent(null);
    setEditingParent(null);
    setError(null);
    setSuccess(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
    setSearchTerm('');
  };

  const handleSaveUser = async (userData: CreateUserData) => {
    try {
      setIsSubmitting(true);
      if (editingUser) {
        // Handle user update (if needed in the future)
        // const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(userData),
        // });
        // if (!response.ok) throw new Error('Failed to update user');
        await fetchUsers();
        handleCloseDialog();
      } else {
        await handleCreateUser(userData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error saving user:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setIsLoading(true);
        
        // Get the current user's ID token
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        const idToken = await currentUser.getIdToken();
        
        const response = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Failed to delete user: ${response.statusText}`);
        }
        
        await fetchUsers();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
        console.error('Error deleting user:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const getStatusIcon = useCallback((status: User['status']) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'disabled':
        return <Chip label="Disabled" color="error" size="small" icon={<CancelIcon />} />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  }, []);

  const getRoleColor = useCallback((role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'teacher':
        return 'secondary';
      case 'student':
        return 'success';
      case 'parent':
        return 'info';
      default:
        return 'default';
    }
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 2, sm: 0 },
        mb: 3 
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#000054', 
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            const roleTypes = ['teacher', 'student', 'parent'] as const;
            handleOpenRoleDialog(roleTypes[tabValue]);
          }}
          disabled={isLoading}
          fullWidth={useMediaQuery(theme.breakpoints.down('sm'))}
          size={useMediaQuery(theme.breakpoints.down('sm')) ? 'small' : 'medium'}
          sx={{
            backgroundColor: '#E32845',
            '&:hover': {
              backgroundColor: '#c41e3a',
            },
          }}
        >
          Add {tabValue === 0 ? 'Teacher' : tabValue === 1 ? 'Student' : 'Parent'}
        </Button>
      </Box>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
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
          <Tab 
            label="Teachers" 
            icon={<PersonIcon />} 
            iconPosition="start"
            {...a11yProps(0)} 
          />
          <Tab 
            label="Students" 
            icon={<SchoolIcon />} 
            iconPosition="start"
            {...a11yProps(1)} 
          />
          <Tab 
            label="Parents" 
            icon={<SupervisorAccountIcon />} 
            iconPosition="start"
            {...a11yProps(2)} 
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <TeachersTab 
          teachers={teachers}
          subjects={subjects}
          classes={classes}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onEdit={(teacher) => handleOpenRoleDialog('teacher', teacher)}
          onDelete={async (teacherId) => {
            if (window.confirm('Are you sure you want to delete this teacher?')) {
              try {
                await userManagementService.deleteTeacher(teacherId);
                setSuccess('Teacher deleted successfully');
                await fetchRoleSpecificData();
              } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to delete teacher');
              }
            }
          }}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <StudentsTab 
          students={students}
          classes={classes}
          parents={parents}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onEdit={(student) => handleOpenRoleDialog('student', student)}
          onDelete={async (studentId) => {
            if (window.confirm('Are you sure you want to delete this student?')) {
              try {
                await userManagementService.deleteStudent(studentId);
                setSuccess('Student deleted successfully');
                await fetchRoleSpecificData();
              } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to delete student');
              }
            }
          }}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ParentsTab 
          parents={parents}
          students={students}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onEdit={(parent) => handleOpenRoleDialog('parent', parent)}
          onDelete={async (parentId) => {
            if (window.confirm('Are you sure you want to delete this parent?')) {
              try {
                await userManagementService.deleteParent(parentId);
                setSuccess('Parent deleted successfully');
                await fetchRoleSpecificData();
              } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to delete parent');
              }
            }
          }}
        />
      </TabPanel>

      {/* Role-specific Dialogs */}
      <TeacherFormDialog
        open={dialogOpen && dialogType === 'teacher'}
        onClose={handleCloseDialog}
        onSave={handleCreateTeacher}
        teacher={editingTeacher}
        subjects={subjects}
        classes={classes}
        isSubmitting={isSubmitting}
      />

      <StudentFormDialog
        open={dialogOpen && dialogType === 'student'}
        onClose={handleCloseDialog}
        onSave={handleCreateStudent}
        student={editingStudent}
        parents={parents}
        classes={classes}
        isSubmitting={isSubmitting}
      />

      <ParentFormDialog
        open={dialogOpen && dialogType === 'parent'}
        onClose={handleCloseDialog}
        onSave={handleCreateParent}
        parent={editingParent}
        students={students}
        isSubmitting={isSubmitting}
      />

      <UserFormDialog
        open={dialogOpen && !dialogType}
        onClose={handleCloseDialog}
        onSave={handleSaveUser}
        user={editingUser}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
};

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onClose,
  onSave,
  user,
  isSubmitting,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState<CreateUserData>({
    email: user?.email || '',
    password: '',
    name: user?.name || '',
    role: user?.role || 'student',
    status: user?.status || 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        name: user.name,
        role: user.role,
        status: user.status,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'student',
        status: 'active',
      });
    }
    setErrors({});
  }, [user, open]);

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

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }> | 
    React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | 
    { target: { name: string; value: string } } |
    { target: { name: string; value: User['role'] } }
  ) => {
    const { name, value } = e.target as { name: string; value: string };
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

  return (
    <Dialog 
      open={open} 
      onClose={isSubmitting ? undefined : onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: '95%', sm: '80%', md: '600px' },
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
          {user ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isSubmitting || !!user}
              />
            </Grid>
            {!user && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={isSubmitting}
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.role} disabled={isSubmitting}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="parent">Parent</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.status} disabled={isSubmitting}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, justifyContent: 'space-between' }}>
          <Button 
            onClick={onClose} 
            disabled={isSubmitting}
            size={isMobile ? "small" : "medium"}
            sx={{ px: { xs: 2, sm: 3 } }}
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
              px: { xs: 2, sm: 3 }
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : user ? (
              'Update User'
            ) : (
              'Create User'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserManagement;
