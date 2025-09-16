// src/app/dashboard/admin/subjects-classes/page.tsx
'use client';

import React from 'react';
import { Box } from '@mui/material';
import SubjectClassesManagement from '@/components/admin/SubjectClassesManagement';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

const SubjectsClassesPage: React.FC = () => {
  return (
    <AdminProtectedRoute>
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        p: { xs: 1, sm: 2, md: 3 }
      }}>
        <SubjectClassesManagement />
      </Box>
    </AdminProtectedRoute>
  );
};

export default SubjectsClassesPage;
