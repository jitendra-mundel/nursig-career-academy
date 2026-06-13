import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Button,
  Alert,
  Skeleton,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TestCard from '../components/TestCard';
import { testAPI } from '../api/endpoints';

/**
 * Tests Page
 * Display available tests for users
 */
const TestsPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await testAPI.getAllTests();
      setTests(response.data.tests || []);
    } catch (err) {
      setError('Failed to fetch tests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (test) => {
    navigate(`/user/tests/${test._id}`);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
            🎯 Available Tests
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper className="glass-panel skeleton-glow" sx={{ p: 3, minHeight: 260 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {tests.map((test) => (
                <Grid item xs={12} sm={6} md={4} key={test._id}>
                  <TestCard
                    test={test}
                    onStart={() => handleStartTest(test)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {!loading && tests.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 6, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                No tests available at this moment 📚
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admins need to create and publish tests first.
              </Typography>
            </Box>
          )}

        </Container>
      </Box>
    </Box>
  );
};

export default TestsPage;
