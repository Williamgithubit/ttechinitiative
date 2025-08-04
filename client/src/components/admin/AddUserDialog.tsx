import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

type UserRole = 'Teacher' | 'Student' | 'Parent' | 'Admin';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onAddUser: (userData: { name: string; email: string; role: UserRole }) => void;
  loading?: boolean;
}

export default function AddUserDialog({ open, onClose, onAddUser, loading = false }: AddUserDialogProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Teacher' as UserRole,
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
  });

  const roles: UserRole[] = ['Teacher', 'Student', 'Parent', 'Admin'];

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: '', email: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAddUser(formData);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({ name: '', email: '', role: 'Teacher' });
    setErrors({ name: '', email: '' });
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Add New User
          </Typography>
          <IconButton 
            onClick={handleClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Full Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
              size="small"
            />
            
            <TextField
              margin="dense"
              id="email"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              size="small"
            />
            
            <TextField
              select
              margin="dense"
              id="role"
              name="role"
              label="Role"
              fullWidth
              variant="outlined"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              size="small"
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleClose}
            color="inherit"
            disabled={loading}
            sx={{
              borderRadius: 1,
              px: 2,
              py: 0.5,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              borderRadius: 1,
              px: 3,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            {loading ? (
              <>
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      border: '2px solid',
                      borderColor: 'primary.contrastText',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      mr: 1,
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                  Adding...
                </Box>
              </>
            ) : (
              'Add User'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
