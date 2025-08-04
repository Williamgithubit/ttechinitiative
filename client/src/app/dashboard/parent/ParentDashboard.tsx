'use client'
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Container, Card, CardContent, Typography, Button } from '@mui/material';
import Grid from '@/components/ui/Grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { RootState } from '@/store/types';

const ParentDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  // Mock children data until Firebase is integrated
  const children = [{ id: 'child1', name: 'Child Name' }];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h1" gutterBottom>
          Welcome, {user?.displayName || 'Parent'}!
        </Typography>
        <Typography variant="h2" gutterBottom>
          Your Children
        </Typography>
        <Grid container spacing={3}>
          {children.map((child) => (
            <Grid item xs={12} sm={6} key={child.id}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {child.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monitor your child&apos;s progress.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => alert('View progress clicked')}
                    >
                      View Progress
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default ParentDashboard;