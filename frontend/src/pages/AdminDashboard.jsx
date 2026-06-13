import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Button,
  Divider,
  Skeleton,
} from '@mui/material';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { resultAPI, notesAPI, testAPI, userAPI } from '../api/endpoints';

/**
 * Admin Dashboard Page
 * Main dashboard for admin users
 */
const AdminDashboard = () => {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTests: 0,
    totalNotes: 0,
    totalResults: 0,
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!initializing && user?.id) {
      fetchStats();
    }
  }, [initializing, user?.id]);

  useEffect(() => {
    if (containerRef.current && !loading) {
      gsap.from(containerRef.current.children, {
        duration: 0.6,
        opacity: 0,
        y: 20,
        stagger: 0.06,
        ease: 'power2.out',
      });
    }
  }, [loading]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setProfile(user || null);

      const [usersRes, testsRes, notesRes, resultsRes] = await Promise.allSettled([
        userAPI.getAllUsers(),
        testAPI.getAllTests(),
        notesAPI.getAllNotes(),
        resultAPI.getAllResults(),
      ]);

      setStats({
        totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.data.count || 0 : 0,
        totalTests: testsRes.status === 'fulfilled' ? testsRes.value.data.count || 0 : 0,
        totalNotes: notesRes.status === 'fulfilled' ? notesRes.value.data.count || 0 : 0,
        totalResults: resultsRes.status === 'fulfilled' ? resultsRes.value.data.count || 0 : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1.5, sm: 3 }, opacity: loading ? 0 : 1, transition: 'opacity 0.3s ease' }} ref={containerRef}>
          {loading ? (
            <>
              <Skeleton variant="text" width={280} height={52} sx={{ mb: 3 }} />
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Paper className="glass-panel skeleton-glow" sx={{ p: 3, minHeight: 320 }}>
                    <Skeleton variant="circular" width={96} height={96} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="80%" />
                  </Paper>
                </Grid>
                {[...Array(3)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper className="glass-panel skeleton-glow" sx={{ p: 3, minHeight: 160 }}>
                      <Skeleton variant="text" width="70%" sx={{ mb: 2 }} />
                      <Skeleton variant="text" width="40%" />
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={3}>
                {[...Array(4)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper className="glass-panel skeleton-glow" sx={{ p: 3, minHeight: 200 }} />
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <>
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 900 }}>
                Admin Dashboard 🎯
              </Typography>

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Paper className="glass-panel-strong" sx={{ p: 3, height: '100%' }}>
                    <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
                      <Avatar src={profile?.profileImage || ''} sx={{ width: 96, height: 96, bgcolor: 'secondary.main' }}>
                        {profile?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile?.name || user?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{profile?.email || user?.email}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
                          Role: {profile?.role || user?.role}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
                    <Stack spacing={1}>
                      <Button variant="contained" onClick={() => navigate('/admin/profile')}>Edit Profile</Button>
                      <Button variant="outlined" onClick={() => navigate('/admin/settings')}>Theme Settings</Button>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card className="glass-panel">
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>
                            Total Users
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalUsers}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card className="glass-panel">
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>
                            Total Tests
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalTests}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card className="glass-panel">
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>
                            Total Notes
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalNotes}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card className="glass-panel">
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>
                            Total Results
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalResults}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Paper className="glass-panel" sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Admin Functions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use the sidebar to manage notes, tests, questions, users, and view test results.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={() => navigate('/admin/upload-notes')}>Upload Notes</Button>
                  <Button variant="outlined" onClick={() => navigate('/admin/tests')}>Manage Tests</Button>
                  <Button variant="outlined" onClick={() => navigate('/admin/users')}>Manage Users</Button>
                  <Button variant="outlined" onClick={() => navigate('/admin/results')}>View Results</Button>
                </Stack>
              </Paper>
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
