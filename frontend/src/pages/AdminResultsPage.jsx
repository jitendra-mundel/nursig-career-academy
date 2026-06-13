import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Skeleton,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import { resultAPI } from '../api/endpoints';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await resultAPI.getAllResults();
      setResults(response.data.results || []);
    } catch (err) {
      setError('Results load nahi ho paye.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tests = useMemo(() => {
    const map = new Map();

    results.forEach((result) => {
      const test = result.testId;
      if (!test?._id) return;
      const existing = map.get(test._id) || {
        testId: test._id,
        title: test.title || 'Unknown Test',
        subject: test.subject || 'Unknown Subject',
        date: test.startDate || test.createdAt,
        count: 0,
        results: [],
      };

      existing.count += 1;
      existing.results.push(result);
      map.set(test._id, existing);
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [results]);

  const selectedTest = useMemo(() => {
    if (!selectedTestId) return null;
    return tests.find((test) => test.testId === selectedTestId) || null;
  }, [selectedTestId, tests]);

  const testResults = useMemo(() => {
    if (!selectedTest) return [];
    const sorted = [...selectedTest.results].sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return b.marksObtained - a.marksObtained;
    });
    return sorted.map((result, index) => ({ ...result, rank: index + 1 }));
  }, [selectedTest]);

  const filteredTests = useMemo(() => {
    const needle = search.toLowerCase();
    return tests.filter(
      (test) =>
        test.title.toLowerCase().includes(needle) ||
        test.subject.toLowerCase().includes(needle) ||
        String(test.date || '').toLowerCase().includes(needle)
    );
  }, [search, tests]);

  const summary = useMemo(() => {
    const total = results.length;
    const passed = results.filter((result) => result.isPassed).length;
    const avg = total ? (results.reduce((sum, result) => sum + (result.percentage || 0), 0) / total).toFixed(2) : '0.00';
    return { total, passed, avg };
  }, [results]);

  const handleDelete = async (id) => {
    if (!window.confirm('Kya aap sure hain? Is result ko delete karna hai?')) return;
    try {
      setDeletingId(id);
      await resultAPI.deleteResult(id);
      await fetchResults();
    } catch (err) {
      console.error(err);
      setError('Result delete nahi hua.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            View Results
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a test first, then dekhiye ranked user list according to marks and percentage.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">Total Attempts</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{summary.total}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">Passed</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{summary.passed}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">Average Score</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{summary.avg}%</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Search by test title or subject"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Paper>

          {loading ? (
            <Grid container spacing={3}>
              {[...Array(3)].map((_, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper className="glass-panel skeleton-glow" sx={{ p: 3, minHeight: 140 }} />
                </Grid>
              ))}
            </Grid>
          ) : selectedTest ? (
            <>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedTest.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedTest.subject} • {new Date(selectedTest.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Attempts: {selectedTest.count}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Button variant="outlined" onClick={() => setSelectedTestId(null)}>
                      Back to Tests
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              <TableContainer component={Paper} className="glass-panel" sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 860 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Marks</TableCell>
                      <TableCell>Percentage</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {testResults.map((result) => (
                      <TableRow key={result._id} hover>
                        <TableCell>{result.rank}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{result.userId?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{result.userId?.email}</Typography>
                        </TableCell>
                        <TableCell>{result.marksObtained} / {result.totalMarks}</TableCell>
                        <TableCell>{result.percentage}%</TableCell>
                        <TableCell>
                          <Chip
                            label={result.isPassed ? 'Passed' : 'Failed'}
                            color={result.isPassed ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(result.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(result._id)}
                            disabled={deletingId === result._id}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <TableContainer component={Paper} className="glass-panel" sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 860 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Test Name</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Attempts</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                      <TableRow key={test.testId} hover>
                        <TableCell>{test.title}</TableCell>
                        <TableCell>{test.subject}</TableCell>
                        <TableCell>{new Date(test.date).toLocaleDateString()}</TableCell>
                        <TableCell>{test.count}</TableCell>
                        <TableCell>
                          <Button variant="contained" size="small" onClick={() => setSelectedTestId(test.testId)}>
                            View Rankings
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
                        No tests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminResultsPage;