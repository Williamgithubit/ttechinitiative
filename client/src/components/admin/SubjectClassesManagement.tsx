// src/components/admin/SubjectClassesManagement.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  fetchSubjectsAsync,
  fetchClassesAsync,
  setSearchTerm,
  setSelectedTab,
  setTeachers,
  setStudents,
  clearErrors
} from '@/store/Admin/subjectClassSlice';
import { fetchTeachers, fetchStudents } from '@/services/userManagementService';
import SubjectManagement from './SubjectManagement';
import ClassManagement from './ClassManagement';
import toast from 'react-hot-toast';

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
      id={`subject-class-tabpanel-${index}`}
      aria-labelledby={`subject-class-tab-${index}`}
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
    id: `subject-class-tab-${index}`,
    'aria-controls': `subject-class-tabpanel-${index}`,
  };
}

const SubjectClassesManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();
  
  const {
    searchTerm,
    selectedTab,
    loading,
    error
  } = useAppSelector((state) => state.subjectClass);

  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Initialize data
    const initializeData = async () => {
      try {
        // Fetch subjects and classes
        dispatch(fetchSubjectsAsync());
        dispatch(fetchClassesAsync());
        
        // Fetch teachers and students for dropdowns
        const [teachers, students] = await Promise.all([
          fetchTeachers(),
          fetchStudents()
        ]);
        
        dispatch(setTeachers(teachers));
        dispatch(setStudents(students));
      } catch (error) {
        console.error('Error initializing data:', error);
        toast.error('Failed to load initial data');
      }
    };

    initializeData();
  }, [dispatch]);

  useEffect(() => {
    // Update Redux state when tab changes
    dispatch(setSelectedTab(tabValue === 0 ? 'subjects' : 'classes'));
  }, [tabValue, dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    dispatch(clearErrors());
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  const currentError = selectedTab === 'subjects' ? error.subjects : error.classes;
  const isLoading = selectedTab === 'subjects' ? loading.subjects : loading.classes;

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            color: '#000054',
            fontWeight: 'bold',
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          Academic Management
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Manage subjects, classes, and their relationships
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={`Search ${selectedTab}...`}
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: { xs: '100%', sm: 400 },
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#000054',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#000054',
              },
            },
          }}
        />
      </Box>

      {/* Error Display */}
      {currentError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearErrors())}
        >
          {currentError}
        </Alert>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress size={40} sx={{ color: '#000054' }} />
        </Box>
      )}

      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="subject class management tabs"
            variant={isMobile ? 'fullWidth' : 'standard'}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600,
                color: '#666',
                '&.Mui-selected': {
                  color: '#000054',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#E32845',
                height: 3,
              },
            }}
          >
            <Tab 
              label="Subjects" 
              {...a11yProps(0)}
              sx={{ minWidth: { xs: 'auto', sm: 120 } }}
            />
            <Tab 
              label="Classes" 
              {...a11yProps(1)}
              sx={{ minWidth: { xs: 'auto', sm: 120 } }}
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <SubjectManagement />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <ClassManagement />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SubjectClassesManagement;
