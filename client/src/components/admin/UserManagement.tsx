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
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

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

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleOpenDialog = (user: User | null = null) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setError(null);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#000054', fontWeight: 'bold' }}>User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={isLoading}
          sx={{
            backgroundColor: '#E32845',
            '&:hover': {
              backgroundColor: '#c41e3a',
            },
          }}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 2, color: 'error.main' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          background: 'white',
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 84, 0.1)',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#000054',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000054',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#000054',
                },
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#000054' }} />,
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ '&.Mui-focused': { color: '#000054' } }}>Filter by Role</InputLabel>
              <Select
                value={roleFilter}
                label="Filter by Role"
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000054',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000054',
                  },
                }}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="parent">Parent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ '&.Mui-focused': { color: '#000054' } }}>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000054',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000054',
                  },
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>No users found</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          {user.name}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getStatusIcon(user.status)}
                          <Box sx={{ ml: 1 }}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleOpenDialog(user)}
                            size="small"
                            disabled={isSubmitting}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteUser(user.id)}
                            color="error"
                            size="small"
                            disabled={isSubmitting}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </Paper>

      <UserFormDialog
        open={openDialog}
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
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isSubmitting}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a',
              },
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
