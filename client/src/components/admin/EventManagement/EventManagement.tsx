import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import Grid from '@/components/ui/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Event as EventIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import {
  Event,
  CreateEventData,
  UpdateEventData,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsStats,
} from '@/services/eventService';
import { seedEventData } from '@/utils/seedEventData';

interface EventManagementProps {
  openDialog?: boolean;
  onCloseDialog?: () => void;
}

const EventManagement: React.FC<EventManagementProps> = ({ openDialog = false, onCloseDialog }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    location: '',
    capacity: 50,
    status: 'upcoming',
    category: 'workshop',
    price: 0,
    isPublic: true,
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    totalRegistrations: 0,
    totalCapacity: 0,
  });

  useEffect(() => {
    loadEvents();
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

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter, categoryFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [eventsData, statsData] = await Promise.all([
        getEvents(),
        getEventsStats(),
      ]);
      
      setEvents(eventsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    setFilteredEvents(filtered);
  };

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      await seedEventData();
      await loadEvents();
    } catch (err) {
      setError('Failed to seed sample data');
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        capacity: event.capacity,
        status: event.status,
        category: event.category,
        price: event.price,
        isPublic: event.isPublic,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        location: '',
        capacity: 50,
        status: 'upcoming',
        category: 'workshop',
        price: 0,
        isPublic: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, formData);
      } else {
        await createEvent(formData);
      }
      
      handleCloseDialog();
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      await deleteEvent(id);
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming': return 'info';
      case 'ongoing': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: Event['category']) => {
    switch (category) {
      case 'workshop': return 'primary';
      case 'seminar': return 'secondary';
      case 'conference': return 'success';
      case 'training': return 'warning';
      case 'networking': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return amount === 0 ? 'Free' : `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Events...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box 
        sx={{
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
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
          Event Management
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
            onClick={loadEvents}
            disabled={loading}
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
            startIcon={<StorageIcon />}
            onClick={handleSeedData}
            disabled={seeding}
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
            disabled={loading}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a',
              },
            }}
          >
            {isMobile ? 'Add' : 'Add Event'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Events
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
                <EventIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Upcoming Events
                  </Typography>
                  <Typography variant="h4">{stats.upcoming}</Typography>
                </Box>
                <EventIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Registrations
                  </Typography>
                  <Typography variant="h4">{stats.totalRegistrations}</Typography>
                </Box>
                <PeopleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Capacity
                  </Typography>
                  <Typography variant="h4">{stats.totalCapacity}</Typography>
                </Box>
                <LocationIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  </InputAdornment>
                ),
                sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                size={isMobile ? "small" : "medium"}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
                size={isMobile ? "small" : "medium"}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="workshop">Workshop</MenuItem>
                <MenuItem value="seminar">Seminar</MenuItem>
                <MenuItem value="conference">Conference</MenuItem>
                <MenuItem value="training">Training</MenuItem>
                <MenuItem value="networking">Networking</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Events Table */}
      <Paper>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Date & Time</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Category</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Capacity</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Registrations</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          {event.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          noWrap
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                            maxWidth: { xs: '150px', sm: '200px', md: '300px' },
                          }}
                        >
                          {event.description.length > (isMobile ? 30 : 60)
                            ? `${event.description.substring(0, isMobile ? 30 : 60)}...` 
                            : event.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                          {formatDate(event.startDate)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          to {formatDate(event.endDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{event.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={isMobile ? event.status.charAt(0).toUpperCase() : event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(event.status),
                          color: '#fff',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          height: { xs: '20px', sm: '24px' },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Chip
                        label={event.category}
                        color={getCategoryColor(event.category)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{event.capacity}</TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{event.registrations || 0}</TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(event.price)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 0, sm: 1 } }}>
                        <IconButton
                          size={isMobile ? "small" : "medium"}
                          onClick={() => handleOpenDialog(event)}
                          sx={{ 
                            color: '#000054',
                            padding: { xs: 0.5, sm: 1 }
                          }}
                        >
                          <EditIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                        </IconButton>
                        <IconButton
                          size={isMobile ? "small" : "medium"}
                          onClick={() => handleDelete(event.id)}
                          sx={{ 
                            color: '#E32845',
                            padding: { xs: 0.5, sm: 1 }
                          }}
                          disabled={deleting === event.id}
                        >
                          {deleting === event.id ? 
                            <CircularProgress size={isMobile ? 16 : 20} /> : 
                            <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="textSecondary" sx={{ py: 4 }}>
                      {events.length === 0 
                        ? 'No events found. Click "Add Event" to create your first event.' 
                        : 'No events match your current filters.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Event Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            width: { xs: '95%', sm: '80%', md: '70%' },
            maxWidth: { xs: '95%', sm: '80%', md: '800px' },
            p: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
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
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={isMobile ? 3 : 4}
                required
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
                InputLabelProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date & Time"
                type="datetime-local"
                value={formData.startDate.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                InputLabelProps={{ 
                  shrink: true,
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
                required
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date & Time"
                type="datetime-local"
                value={formData.endDate.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                InputLabelProps={{ 
                  shrink: true,
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
                required
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
                InputLabelProps={{
                  sx: { fontSize: { xs: '0.875rem', sm: '1rem' } }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Event['status'] })}
                >
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="ongoing">Ongoing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Event['category'] })}
                >
                  <MenuItem value="workshop">Workshop</MenuItem>
                  <MenuItem value="seminar">Seminar</MenuItem>
                  <MenuItem value="conference">Conference</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="networking">Networking</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  />
                }
                label="Public Event"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: { xs: 1, sm: 2 } }}>
          <Button 
            onClick={handleCloseDialog}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.title || !formData.description || !formData.location}
            size={isMobile ? "small" : "medium"}
            sx={{
              backgroundColor: '#E32845',
              '&:hover': {
                backgroundColor: '#c41e3a',
              },
            }}
          >
            {editingEvent ? (isMobile ? 'Update' : 'Update Event') : (isMobile ? 'Create' : 'Create Event')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventManagement;
