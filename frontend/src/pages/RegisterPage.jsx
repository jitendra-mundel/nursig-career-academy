import React, { useState } from 'react';
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
 * Register Page
 * New user registration
 */
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [error, setError] = useState('');
  const { registerWithOtp, sendOtp, loading } = useAuth();
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleChange = (e) => {
    const nextValue = e.target.value;
    if (e.target.name === 'email' && nextValue !== formData.email) {
      setOtpSent(false);
      setFormData((current) => ({ ...current, otp: '' }));
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      if (!otpSent) {
        setError('Please request OTP first');
        return;
      }
      const response = await registerWithOtp(formData.name, formData.email, formData.password, formData.otp);
      navigate(response?.user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter email to receive OTP');
      return;
    }
    setSendingOtp(true);
    setError('');
    try {
      await sendOtp(formData.email);
      setOtpSent(true);
      setError('OTP sent to your email');
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ position: 'relative', py: { xs: 6, md: 12 } }}>
      <Box className="auth-illustration top" />
      <Box className="auth-illustration bottom" />
      <Box className="auth-ecg-bg">
        <Box className="auth-ecg-line line1" />
        <Box className="auth-ecg-line line2" />
        <Box className="auth-ecg-line line3" />
        <Box className="auth-ecg-line line4" />
        <Box className="auth-ecg-line line5" />
        <Box className="auth-ecg-line line6" />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, width: '100%', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: '900', letterSpacing: '0.12em', background: 'linear-gradient(135deg, #7c3aed, #22d3ee)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Create your account
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { backdropFilter: 'blur(10px)' } }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                disabled={loading}
                sx={{ '& .MuiOutlinedInput-root': { backdropFilter: 'blur(10px)' } }}
              />
              <Button
                type="button"
                variant="outlined"
                onClick={handleSendOtp}
                disabled={sendingOtp || loading}
                sx={{ height: 56, mt: 1, borderRadius: 999, fontWeight: 600, border: '1.5px solid rgba(124, 58, 237, 0.5)', color: '#7c3aed', '&:hover': { border: '1.5px solid #7c3aed', backgroundColor: 'rgba(124, 58, 237, 0.08)' } }}
              >
                {sendingOtp ? 'Sending...' : (otpSent ? 'Sent' : 'Send OTP')}
              </Button>
            </Box>
            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { backdropFilter: 'blur(10px)' } }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { backdropFilter: 'blur(10px)' } }}
            />

            {otpSent && (
              <TextField
                fullWidth
                label="OTP (5 digits)"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                margin="normal"
                required
                disabled={loading}
                sx={{ '& .MuiOutlinedInput-root': { backdropFilter: 'blur(10px)' } }}
              />
            )}

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.7, fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(135deg, #7c3aed, #22d3ee)', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)', '&:hover': { boxShadow: '0 12px 32px rgba(124, 58, 237, 0.4)' } }}
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already have an account?{' '}
              <Link href="/login" sx={{ cursor: 'pointer' }}>
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
