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
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Skeleton,
  Stack,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import { userAPI, resultAPI } from '../api/endpoints';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersResponse, resultsResponse] = await Promise.all([
        userAPI.getAllUsers(),
        resultAPI.getAllResults(),
      ]);

      setUsers(usersResponse.data.users || []);
      setResults(resultsResponse.data.results || []);
    } catch (err) {
      setError('Users load nahi ho paye.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data?')) return;
    try {
      await userAPI.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete user');
    }
  };

  const performanceByUser = useMemo(() => {
    return results.reduce((accumulator, result) => {
      const key = result.userId?._id || result.userId;
      if (!accumulator[key]) {
        accumulator[key] = { total: 0, count: 0, lastTest: result.testId?.title || '-', attempts: 0 };
      }

      accumulator[key].total += result.percentage || 0;
      accumulator[key].count += 1;
      accumulator[key].attempts += 1;
      accumulator[key].lastTest = result.testId?.title || accumulator[key].lastTest;
      return accumulator;
    }, {});
  }, [results]);

  const filteredUsers = users.filter((userItem) => {
    const needle = search.toLowerCase();
    return (
      userItem.name?.toLowerCase().includes(needle) ||
      userItem.email?.toLowerCase().includes(needle) ||
      userItem.enrollmentNumber?.toLowerCase().includes(needle)
    );
  });

  const activeUsers = users.filter((userItem) => userItem.isActive !== false).length;
  const averagePerformance = filteredUsers.length
    ? (
        filteredUsers.reduce((sum, userItem) => {
          const stats = performanceByUser[userItem._id];
          return sum + (stats?.count ? stats.total / stats.count : 0);
        }, 0) / filteredUsers.length
      ).toFixed(2)
    : '0.00';

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            Manage Users
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            User ka naam, photo, performance aur current payment status yahan dikhta hai.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper className="glass-panel" sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">Total Users</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{users.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper className="glass-panel" sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">Active Users</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{activeUsers}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper className="glass-panel" sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">Average Performance</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{averagePerformance}%</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper className="glass-panel" sx={{ p: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Search users"
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
          ) : (
            <TableContainer component={Paper} className="glass-panel" sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 980 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Roll Number</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Performance</TableCell>
                    <TableCell>Tests Taken</TableCell>
                    <TableCell>Payment Details</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((userItem) => {
                    const stats = performanceByUser[userItem._id];
                    const average = stats?.count ? (stats.total / stats.count).toFixed(2) : '0.00';

                    return (
                      <TableRow key={userItem._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={userItem.profileImage || ''}>
                              {userItem.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{userItem.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{userItem.role}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{userItem.enrollmentNumber || '-'}</TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>{average}%</TableCell>
                        <TableCell>{stats?.attempts || 0}</TableCell>
                        <TableCell>{userItem.paymentStatus || 'Not tracked in backend'}</TableCell>
                        <TableCell>
                          <Chip
                            label={userItem.isActive === false ? 'Inactive' : 'Active'}
                            color={userItem.isActive === false ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Chip label="Delete" color="error" size="small" onClick={() => handleDeleteUser(userItem._id)} />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminUsersPage;