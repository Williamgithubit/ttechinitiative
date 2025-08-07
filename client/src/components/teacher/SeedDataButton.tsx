'use client';

import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { StudentService } from '@/services/studentService';
import { CourseService } from '@/services/courseService';

interface SeedDataButtonProps {
  onDataSeeded?: () => void;
}

const SeedDataButton: React.FC<SeedDataButtonProps> = ({ onDataSeeded }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const seedSampleData = async () => {
    setLoading(true);
    try {
      // Mock teacher data
      const teacherId = 'teacher-1';
      const teacherName = 'Demo Teacher';

      // Create sample courses first
      const courseIds = await CourseService.seedSampleCourses(teacherId, teacherName);
      
      // Create sample students
      await StudentService.createSampleStudents(courseIds);

      setSnackbar({
        open: true,
        message: 'Sample data created successfully! You can now use the attendance features.',
        severity: 'success'
      });

      // Notify parent component to refresh data
      if (onDataSeeded) {
        onDataSeeded();
      }

    } catch (error) {
      console.error('Error seeding sample data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create sample data. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
        onClick={seedSampleData}
        disabled={loading}
        sx={{
          background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          },
          '&:disabled': {
            background: '#ccc',
          }
        }}
      >
        {loading ? 'Creating Sample Data...' : 'Create Sample Data'}
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SeedDataButton;
