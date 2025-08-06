import React, { useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import Grid from '@/components/ui/Grid';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  Program,
  CreateProgramData,
  UpdateProgramData,
} from '@/services/programService';
import { seedProgramData } from '@/utils/seedProgramData';



interface ProgramManagementProps {
  openDialog?: boolean;
  onCloseDialog?: () => void;
}

const ProgramManagement: React.FC<ProgramManagementProps> = ({ openDialog = false, onCloseDialog }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Load programs on component mount
  useEffect(() => {
    loadPrograms();
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

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const programsData = await getPrograms();
      setPrograms(programsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (program: Program | null = null) => {
    setEditingProgram(program);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProgram(null);
  };

  const handleSaveProgram = async (programData: CreateProgramData) => {
    try {
      setSubmitting(true);
      setError(null);

      if (editingProgram) {
        // Update existing program
        const updateData: UpdateProgramData = {
          ...programData,
          id: editingProgram.id,
        };
        await updateProgram(updateData);
      } else {
        // Create new program
        await createProgram(programData);
      }

      // Reload programs to get fresh data
      await loadPrograms();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save program');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        setError(null);
        await deleteProgram(id);
        // Reload programs to get fresh data
        await loadPrograms();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete program');
      }
    }
  };

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      setError(null);
      await seedProgramData();
      // Reload programs to show the new data
      await loadPrograms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed sample data');
    } finally {
      setSeeding(false);
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = (program.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (program.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || program.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'draft':
        return 'warning';
      case 'upcoming':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box 
        sx={{
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: 3
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            color: '#000054', 
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Program Management
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadPrograms}
            disabled={loading || seeding}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
            sx={{
              borderColor: '#000054',
              color: '#000054',
              '&:hover': {
                borderColor: '#1a1a6e',
                backgroundColor: 'rgba(0, 0, 84, 0.04)',
              },
            }}
          >
            {isMobile ? "" : "Refresh"}
          </Button>
          <Button
            variant="contained"
            onClick={handleSeedData}
            disabled={loading || seeding}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
            sx={{
              backgroundColor: '#000054',
              '&:hover': {
                backgroundColor: '#1a1a6e',
              },
            }}
          >
            {seeding ? 'Seeding...' : (isMobile ? 'Seed Data' : 'Seed Sample Data')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading || seeding}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a',
              },
            }}
          >
            {isMobile ? 'Add' : 'Add Program'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper 
        sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          mb: 3,
          background: 'white',
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 84, 0.1)',
        }}
      >
        <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search programs..."
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer 
        component={Paper}
        sx={{
          background: 'white',
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 84, 0.1)',
          overflowX: 'auto',
        }}
      >
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead sx={{ background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Start Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>End Date</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 2 }}>Loading programs...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredPrograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {programs.length === 0 ? 'No programs found. Create your first program!' : 'No programs match your search criteria.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <Typography 
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        fontWeight: 'medium'
                      }}
                    >
                      {program.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography 
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        maxWidth: { sm: '150px', md: '250px' }
                      }}
                    >
                      {program.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={program.status}
                      color={getStatusColor(program.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {new Date(program.startDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {new Date(program.endDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton 
                        onClick={() => handleOpenDialog(program)} 
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                        sx={{ p: { xs: 0.5, sm: 1 } }}
                      >
                        <EditIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteProgram(program.id)} 
                        color="error"
                        size={isMobile ? "small" : "medium"}
                        sx={{ p: { xs: 0.5, sm: 1 } }}
                      >
                        <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ProgramFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveProgram}
        program={editingProgram}
        submitting={submitting}
      />
    </Box>
  );
};

interface ProgramFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (program: CreateProgramData) => void;
  program: Program | null;
  submitting: boolean;
}

const ProgramFormDialog: React.FC<ProgramFormDialogProps> = ({ open, onClose, onSave, program, submitting }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState<CreateProgramData>(
    program || {
      name: '',
      description: '',
      status: 'draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Update form data when program prop changes
  React.useEffect(() => {
    if (program) {
      setFormData({
        name: program.name,
        description: program.description,
        status: program.status,
        startDate: program.startDate,
        endDate: program.endDate,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'draft',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  }, [program]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: '95%', sm: '80%', md: '65%' },
          maxWidth: { xs: '95vw', sm: '600px' },
          m: { xs: 1, sm: 'auto' },
          borderRadius: { xs: 1, sm: 2 },
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ 
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          p: { xs: 2, sm: 3 }
        }}>
          {program ? 'Edit Program' : 'Add New Program'}
        </DialogTitle>
        <DialogContent 
          dividers
          sx={{ p: { xs: 2, sm: 3 } }}
        >
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Program Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                margin="normal"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
                InputLabelProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={isMobile ? 2 : 3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                margin="normal"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
                InputLabelProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={(e) => handleChange(e as React.ChangeEvent<{ name?: string; value: unknown }>)}
                  label="Status"
                  required
                  size={isMobile ? "small" : "medium"}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
                margin="normal"
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
                InputLabelProps={{
                  shrink: true,
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
                margin="normal"
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
                InputLabelProps={{
                  shrink: true,
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, justifyContent: 'space-between' }}>
          <Button 
            onClick={onClose} 
            disabled={submitting}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={submitting}
            size={isMobile ? "small" : "medium"}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a',
              },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            {submitting ? 'Saving...' : (program ? 'Update' : (isMobile ? 'Create' : 'Create Program'))}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProgramManagement;
