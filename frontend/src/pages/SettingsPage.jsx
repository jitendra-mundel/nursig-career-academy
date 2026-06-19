import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  FormControlLabel,
  Switch,
  Stack,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';
import { userAPI } from '../api/endpoints';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  const pageTitle = user?.role === 'admin' ? 'Admin Settings' : 'Settings';

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            {pageTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Theme aur account preferences yahan se control karo.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Appearance
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
                    label={mode === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
                  />
                  <Chip
                    label={`Current theme: ${mode}`}
                    color="primary"
                    variant="outlined"
                    sx={{ width: 'fit-content' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Theme browser me localStorage me save hota hai, isliye next time bhi same mode rahega.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Account Shortcuts
                </Typography>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Profile me photo, email aur roll number update kar sakte ho.
                  </Typography>
                  <Button variant="contained" onClick={() => navigate(user?.role === 'admin' ? '/admin/profile' : '/user/profile')}>
                    Open Profile
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={async () => {
                      if (!window.confirm('This will permanently delete your account and all data. Continue?')) return;
                      try {
                          await userAPI.deleteCurrentUser();
                        // Clear local session
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/';
                      } catch (err) {
                        console.error(err);
                        alert('Failed to delete account. Try again later.');
                      }
                    }}
                  >
                    Remove My Account
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default SettingsPage;