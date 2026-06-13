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
  Chip,
  Skeleton,
} from '@mui/material';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { resultAPI, userAPI } from '../api/endpoints';

/**
 * User Dashboard Page
 * Main dashboard for regular users
 */
const UserDashboard = () => {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTests: 0,
    testsPassed: 0,
    testsFailed: 0,
    averageScore: 0,
  });
  const [profile, setProfile] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!initializing && user?.id) {
      fetchDashboardData();
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

  const fetchDashboardData = async () => {
    try {
      const [profileResponse, resultsResponse] = await Promise.all([
        userAPI.getUserById(user.id),
        resultAPI.getUserResults(),
      ]);

      const results = resultsResponse.data.results || [];
      setProfile(profileResponse.data.user);
      setRecentResults(results.slice(0, 5));

      const passed = results.filter((r) => r.isPassed).length;
      const failed = results.filter((r) => !r.isPassed).length;
      const avgScore =
        results.length > 0
          ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2)
          : 0;

      setStats({
        totalTests: results.length,
        testsPassed: passed,
        testsFailed: failed,
        averageScore: avgScore,
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
              <Skeleton variant="text" width={260} height={48} sx={{ mb: 3 }} />
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
                {[...Array(3)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper className="glass-panel skeleton-glow" sx={{ p: 3, minHeight: 240 }} />
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <>
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 900 }}>
                Welcome, {user?.name}! 👋
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
                        <Chip label={profile?.enrollmentNumber || 'Enrollment missing'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' }} />
                        <Chip label={profile?.role || user?.role || 'user'} size="small" color="secondary" />
                      </Stack>
                    </Stack>
                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.12)' }} />
                    <Stack spacing={1}>
                      <Button variant="contained" onClick={() => navigate('/user/profile')}>Edit Profile</Button>
                      <Button variant="outlined" onClick={() => navigate('/user/settings')}>Theme Settings</Button>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={6}>
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
                            Tests Passed
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#22c55e' }}>
                            {stats.testsPassed}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card className="glass-panel">
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>
                            Tests Failed
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#f87171' }}>
                            {stats.testsFailed}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card className="glass-panel">
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>
                            Average Score
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.averageScore}%</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Paper className="glass-panel" sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Quick Links
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button variant="contained" onClick={() => navigate('/user/notes')}>Open Notes</Button>
                  <Button variant="outlined" onClick={() => navigate('/user/tests')}>Open Tests</Button>
                  <Button variant="outlined" onClick={() => navigate('/user/results')}>View Results</Button>
                </Stack>
              </Paper>

              <Paper className="glass-panel" sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Recent Results
                </Typography>
                {recentResults.length > 0 ? (
                  <Grid container spacing={2}>
                    {recentResults.map((result) => (
                      <Grid item xs={12} sm={6} md={4} key={result._id}>
                        <Card className="glass-panel">
                          <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {result.testId?.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {result.testId?.subject}
                            </Typography>
                            <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                              {result.percentage}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {result.marksObtained} / {result.totalMarks} marks
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No test results yet. Take a test to see your history here.
                  </Typography>
                )}
              </Paper>
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default UserDashboard;
