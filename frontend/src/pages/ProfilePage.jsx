import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/endpoints';

const ProfilePage = () => {
  const { user, updateUserProfile, initializing } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (initializing) {
      setLoading(true);
      return;
    }

    if (user?.id) {
      setProfile(user);
    }

    setLoading(false);
  }, [initializing, user]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setProfile((current) => ({ ...current, photoFile: file }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.id) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('name', profile?.name || '');
      formData.append('email', profile?.email || '');
      formData.append('enrollmentNumber', profile?.enrollmentNumber || '');
      if (profile?.photoFile) {
        formData.append('profileImage', profile.photoFile);
      }

      const response = await userAPI.updateUser(user.id, formData);

      updateUserProfile(response.data.user);
      setProfile(response.data.user);
      setPhotoPreview(null);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = user?.role === 'admin' ? 'Admin Profile' : 'My Profile';
  const pageDescription = user?.role === 'admin'
    ? 'Admin ke basic details aur photo yahan manage karo.'
    : 'Apna photo, email, aur roll number yahan update karo.';

  const avatarLabel = profile?.name || user?.name || 'U';

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            {pageTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {pageDescription}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                  <Avatar
                    src={photoPreview || profile?.profileImage || ''}
                    sx={{ width: 96, height: 96, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 32 }}
                  >
                    {avatarLabel.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {profile?.name || user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {profile?.email || user?.email}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
                    <Chip label={profile?.role || user?.role || 'user'} color="primary" />
                    <Chip label={profile?.enrollmentNumber || 'Roll number missing'} variant="outlined" />
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 4 }} component="form" onSubmit={handleSubmit}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Edit Profile
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={profile?.name || ''}
                        disabled
                        slotProps={{
                          input: { readOnly: true }
                        }}
                        helperText="Name cannot be changed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={profile?.email || ''}
                        disabled
                        slotProps={{
                          input: { readOnly: true }
                        }}
                        helperText="Email cannot be changed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Roll Number / Enrollment"
                        name="enrollmentNumber"
                        value={profile?.enrollmentNumber || ''}
                        disabled
                        slotProps={{
                          input: { readOnly: true }
                        }}
                        helperText="Roll number cannot be changed"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Profile Photo</Typography>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          disabled={saving}
                          sx={{ textTransform: 'none', justifyContent: 'flex-start', pl: 2 }}
                        >
                          {photoPreview || profile?.profileImage ? 'Change Photo' : 'Select Photo'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handlePhotoChange}
                            style={{ display: 'none' }}
                          />
                        </Button>
                        {(photoPreview || profile?.profileImage) && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {photoPreview ? 'New photo selected' : 'Current photo set'}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ProfilePage;