'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar, 
  Button,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import Grid from "@/components/ui/Grid"
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Visibility as ViewIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Student } from '@/types/student';
import { StudentService } from '@/services/studentService';

interface StudentListProps {
  courseIds: string[];
  onViewProfile: (studentId: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ courseIds, onViewProfile }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStudents();
  }, [courseIds]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await StudentService.getStudentsByCourses(courseIds);
      setStudents(studentsData);
    } catch (err) {
      setError('Failed to load students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleCreateSampleData = async () => {
    try {
      await StudentService.createSampleStudents(courseIds);
      await loadStudents();
    } catch (err) {
      setError('Failed to create sample data');
      console.error(err);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Never';
    const dateObj = typeof date === 'string' ? new Date(date) : date.toDate();
    return dateObj.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: '#000054', fontWeight: 'bold' }}>
          Students
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateSampleData}
          sx={{
            bgcolor: '#E32845',
            '&:hover': { bgcolor: '#c41e3a' }
          }}
        >
          Create Sample Data
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {filteredStudents.length > 0 ? (
        <Grid container spacing={2}>
          {filteredStudents.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student.id} component="div">
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      src={student.photoURL}
                      sx={{ width: 48, height: 48, mr: 2, bgcolor: '#000054' }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {student.name}
                      </Typography>
                      <Chip 
                        label={student.status} 
                        size="small"
                        color={student.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <EmailIcon sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                      <Typography variant="body2" color="textSecondary">
                        {student.email}
                      </Typography>
                    </Box>
                    
                    {student.grade && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <SchoolIcon sx={{ mr: 1, color: '#666', fontSize: 16 }} />
                        <Typography variant="body2" color="textSecondary">
                          Grade: {student.grade}
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="body2" color="textSecondary">
                      Courses: {student.enrolledCourses.length}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary">
                      Last Login: {formatDate(student.lastLoginAt)}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    onClick={() => onViewProfile(student.id)}
                    sx={{
                      borderColor: '#000054',
                      color: '#000054',
                      '&:hover': {
                        borderColor: '#E32845',
                        color: '#E32845',
                        bgcolor: 'rgba(227, 40, 69, 0.04)'
                      }
                    }}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : students.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" mb={2}>
            No students found
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Create some sample student data to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateSampleData}
            sx={{
              bgcolor: '#E32845',
              '&:hover': { bgcolor: '#c41e3a' }
            }}
          >
            Create Sample Students
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No students match your search
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search terms
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default StudentList;
