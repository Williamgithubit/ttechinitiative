import React, { useState, useEffect } from 'react';
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



const ProgramManagement: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Load programs on component mount
  useEffect(() => {
    loadPrograms();
  }, []);

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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" sx={{ color: '#000054', fontWeight: 'bold' }}>Program Management</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadPrograms}
            disabled={loading || seeding}
            sx={{
              borderColor: '#000054',
              color: '#000054',
              '&:hover': {
                borderColor: '#1a1a6e',
                backgroundColor: 'rgba(0, 0, 84, 0.04)',
              },
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={handleSeedData}
            disabled={loading || seeding}
            sx={{
              backgroundColor: '#000054',
              '&:hover': {
                backgroundColor: '#1a1a6e',
              },
            }}
          >
            {seeding ? 'Seeding...' : 'Seed Sample Data'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading || seeding}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a',
              },
            }}
          >
            Add Program
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
          p: 2, 
          mb: 3,
          background: 'white',
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 84, 0.1)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={3}>
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
        }}
      >
        <Table>
          <TableHead sx={{ background: 'linear-gradient(135deg, #000054 0%, #1a1a6e 100%)' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Start Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>End Date</TableCell>
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
                  <TableCell>{program.name}</TableCell>
                  <TableCell>{program.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={program.status}
                      color={getStatusColor(program.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(program.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(program.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenDialog(program)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteProgram(program.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ProgramFormDialog
        open={openDialog}
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{program ? 'Edit Program' : 'Add New Program'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                margin="normal"
                variant="outlined"
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
                InputLabelProps={{
                  shrink: true,
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
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={submitting}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a',
              },
            }}
          >
            {submitting ? 'Saving...' : (program ? 'Update' : 'Create')} Program
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProgramManagement;
