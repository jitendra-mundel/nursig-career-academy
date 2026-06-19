import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ECGWave from './ECGWave';

/**
 * Navbar Component
 * Top navigation bar with user menu
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    navigate(user?.role === 'admin' ? '/admin/profile' : '/user/profile');
    handleClose();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, rgba(124,58,237,0.96), rgba(14,165,233,0.92))',
        color: theme.palette.primary.contrastText,
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <ECGWave variant="navbar" />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 72 } }}>
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexGrow: 1,
              cursor: 'pointer',
              maxWidth: { xs: '58vw', sm: 'none' },
            }}
          >
            <Box
              component="img"
              src="/website%20logo.png"
              alt="Nursing Career Academy"
              sx={{ height: 40, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 900,
                letterSpacing: '0.08em',
                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Nursing Career Academy
            </Typography>
          </Box>

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <Typography
                variant="body2"
                sx={{
                  display: { xs: 'none', sm: 'inline' },
                  maxWidth: 160,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name}
              </Typography>
              <Avatar
                onClick={handleMenu}
                sx={{ cursor: 'pointer', width: 40, height: 40, bgcolor: 'secondary.main' }}
                src={user.profileImage || undefined}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.16)',
                  },
                }}
              >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size={isSmallScreen ? 'small' : 'medium'}
                onClick={() => navigate('/login')}
                sx={{ borderRadius: 999 }}
              >
                Login
              </Button>
              <Button
                color="secondary"
                variant="contained"
                size={isSmallScreen ? 'small' : 'medium'}
                onClick={() => navigate('/register')}
                sx={{ borderRadius: 999 }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
