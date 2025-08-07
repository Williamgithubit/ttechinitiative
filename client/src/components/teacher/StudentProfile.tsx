'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Grid,
  Paper,
  LinearProgress,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Note as NoteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ContactEmergency as ContactIcon
} from '@mui/icons-material';
import { StudentProfile as StudentProfileType, TeacherNote } from '@/types/student';
import { StudentService } from '@/services/studentService';

interface StudentProfileProps {
  studentId: string;
  onClose: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ studentId, onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteDialog, setNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<TeacherNote | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isPrivateNote, setIsPrivateNote] = useState(false);

  useEffect(() => {
    loadStudentProfile();
  }, [studentId]);

  const loadStudentProfile = async () => {
    try {
      setLoading(true);
      const profileData = await StudentService.getStudentProfile(studentId);
      setProfile(profileData);
    } catch (err) {
      setError('Failed to load student profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteContent('');
    setIsPrivateNote(false);
    setNoteDialog(true);
  };

  const handleEditNote = (note: TeacherNote) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setIsPrivateNote(note.isPrivate);
    setNoteDialog(true);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !profile) return;

    try {
      if (editingNote) {
        await StudentService.updateTeacherNote(editingNote.id, {
          content: noteContent,
          isPrivate: isPrivateNote
        });
      } else {
        await StudentService.addTeacherNote({
          studentId: profile.id,
          teacherId: user?.uid || '',
          content: noteContent,
          isPrivate: isPrivateNote
        });
      }
      
      setNoteDialog(false);
      await loadStudentProfile(); // Refresh data
    } catch (err) {
      setError('Failed to save note');
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await StudentService.deleteTeacherNote(noteId);
      await loadStudentProfile(); // Refresh data
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date.toDate();
    return dateObj.toLocaleDateString();
  };

  const getOverallGrade = () => {
    if (!profile?.performance.length) return 0;
    const total = profile.performance.reduce((sum, perf) => sum + perf.overallGrade, 0);
    return Math.round(total / profile.performance.length);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error || 'Student profile not found'}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#000054', fontWeight: 'bold' }}>
          Student Profile
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#666' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                <Avatar
                  src={profile.photoURL}
                  sx={{ width: 80, height: 80, mb: 2, bgcolor: '#000054' }}
                >
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                  {profile.name}
                </Typography>
                <Chip 
                  label={profile.status} 
                  color={profile.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box space={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <EmailIcon sx={{ mr: 1, color: '#666' }} />
                  <Typography variant="body2">{profile.email}</Typography>
                </Box>
                
                {profile.grade && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <SchoolIcon sx={{ mr: 1, color: '#666' }} />
                    <Typography variant="body2">Grade: {profile.grade}</Typography>
                  </Box>
                )}

                {profile.parentContact && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                      Parent Contact
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <ContactIcon sx={{ mr: 1, color: '#666' }} />
                      <Typography variant="body2">{profile.parentContact.name}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <EmailIcon sx={{ mr: 1, color: '#666' }} />
                      <Typography variant="body2">{profile.parentContact.email}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <PhoneIcon sx={{ mr: 1, color: '#666' }} />
                      <Typography variant="body2">{profile.parentContact.phone}</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Performance Overview
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                    <Typography variant="h4" color="#000054" fontWeight="bold">
                      {getOverallGrade()}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Overall Grade
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                    <Typography variant="h4" color="#E32845" fontWeight="bold">
                      {profile.enrolledCourses.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Enrolled Courses
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                    <Typography variant="h4" color="#000054" fontWeight="bold">
                      {profile.performance.reduce((sum, p) => sum + p.engagementMetrics.assignmentsCompleted, 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Assignments Done
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                    <Typography variant="h4" color="#000054" fontWeight="bold">
                      {Math.round(profile.performance.reduce((sum, p) => sum + p.participationScore, 0) / profile.performance.length || 0)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Participation
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Course Performance Details */}
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  Course Performance
                </Typography>
                {profile.performance.map((perf, index) => (
                  <Box key={index} mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">Course {index + 1}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {perf.overallGrade}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={perf.overallGrade} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: perf.overallGrade >= 80 ? '#4caf50' : perf.overallGrade >= 60 ? '#ff9800' : '#f44336'
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Recent Activity
              </Typography>
              <List>
                {profile.recentActivity.slice(0, 5).map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.details} • ${formatDate(activity.timestamp)}`}
                    />
                  </ListItem>
                ))}
                {profile.recentActivity.length === 0 && (
                  <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                    No recent activity
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Teacher Notes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Teacher Notes
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddNote}
                  sx={{
                    bgcolor: '#E32845',
                    '&:hover': { bgcolor: '#c41e3a' }
                  }}
                >
                  Add Note
                </Button>
              </Box>

              <List>
                {profile.notes.map((note) => (
                  <ListItem key={note.id} divider>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">{note.content}</Typography>
                          {note.isPrivate && (
                            <Chip label="Private" size="small" color="warning" />
                          )}
                        </Box>
                      }
                      secondary={`Added on ${formatDate(note.createdAt)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleEditNote(note)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteNote(note.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {profile.notes.length === 0 && (
                  <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                    No notes added yet
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Note Dialog */}
      <Dialog open={noteDialog} onClose={() => setNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingNote ? 'Edit Note' : 'Add New Note'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label="Note Content"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isPrivateNote}
                onChange={(e) => setIsPrivateNote(e.target.checked)}
              />
            }
            label="Private Note (only visible to teachers)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveNote}
            variant="contained"
            sx={{
              bgcolor: '#E32845',
              '&:hover': { bgcolor: '#c41e3a' }
            }}
          >
            {editingNote ? 'Update' : 'Add'} Note
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentProfile;
