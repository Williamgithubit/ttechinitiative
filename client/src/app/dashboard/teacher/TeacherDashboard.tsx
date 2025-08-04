import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useAddProgramMutation, useGetTeacherProgramsQuery } from "../../../store/apiSlice";
import { motion } from 'framer-motion';
import { Container, Typography, TextField, Button, CircularProgress, Box, List, ListItem, ListItemText, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [addProgram, { isLoading: isAdding }] = useAddProgramMutation();
  const { data: programs = [], isLoading: isLoadingPrograms } = useGetTeacherProgramsQuery(user?.uid);

  const onSubmit = async (data) => {
    try {
      await addProgram({ 
        ...data, 
        teacherId: user.uid,
        createdAt: new Date().toISOString()
      }).unwrap();
      reset();
    } catch (error) {
      console.error('Error adding program:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.displayName || 'Teacher'}!
        </Typography>
        <Typography variant="h5" gutterBottom>
          Add New Program
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 400 }}>
          <TextField
            {...register('title', { required: true })}
            label="Program Title"
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            {...register('description', { required: true })}
            label="Description"
            fullWidth
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Add Program'}
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default TeacherDashboard;