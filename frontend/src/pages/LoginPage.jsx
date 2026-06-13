import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Login Page
 * User authentication entry point
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
  }, [logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login(email, password);
      navigate(response?.user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ position: 'relative', py: { xs: 6, md: 12 } }}>
      <Box className="auth-illustration top" />
      <Box className="auth-illustration bottom" />
      <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, width: '100%', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: '900', letterSpacing: '0.12em', background: 'linear-gradient(135deg, #7c3aed, #22d3ee)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Nursing Career Academy
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { backdropFilter: 'blur(10px)' } }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { backdropFilter: 'blur(10px)' } }}
            />

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.7, fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(135deg, #7c3aed, #22d3ee)', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)', '&:hover': { boxShadow: '0 12px 32px rgba(124, 58, 237, 0.4)' } }}
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Link href="/register" sx={{ cursor: 'pointer' }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
