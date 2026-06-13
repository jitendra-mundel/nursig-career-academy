import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import { resultAPI } from '../api/endpoints';
import { useNavigate } from 'react-router-dom';

/**
 * Results Page
 * Display user test results
 */
const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await resultAPI.getUserResults();
      setResults(response.data.results || []);
    } catch (err) {
      setError('Failed to fetch results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isPassed) => {
    return isPassed ? 'success' : 'error';
  };

  const getStatusLabel = (isPassed) => {
    return isPassed ? 'Passed' : 'Failed';
  };

  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
            📊 My Test Results
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : results.length > 0 ? (
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Test Name</strong></TableCell>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell align="right"><strong>Marks</strong></TableCell>
                    <TableCell align="right"><strong>Percentage</strong></TableCell>
                    <TableCell align="right"><strong>Percentile</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result._id}>
                      <TableCell>{result.testId?.title}</TableCell>
                      <TableCell>{result.testId?.subject}</TableCell>
                      <TableCell align="right">
                        {result.marksObtained} / {result.totalMarks}
                      </TableCell>
                      <TableCell align="right">{result.percentage}%</TableCell>
                      <TableCell align="right">{result.percentile !== undefined ? `${result.percentile}%` : '-'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusLabel(result.isPassed)}
                          color={getStatusColor(result.isPassed)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => navigate(`/user/results/${result._id}`)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
              No test results yet. Take a test to see your results here.
            </Typography>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ResultsPage;
