import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import { notesAPI } from '../api/endpoints';

/**
 * Upload Notes Page (Admin Only)
 * Allow admins to upload PDF notes
 */
const UploadNotesPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    fileType: '',
    subject: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!formData.fileType) {
      setError('Please select the file type (PDF, JPG, etc.)');
      return;
    }

    // simple extension check unless 'any' selected
    if (formData.fileType !== 'any') {
      const name = file.name.toLowerCase();
      if (!name.endsWith('.' + formData.fileType)) {
        setError(`Selected file does not match chosen type ${formData.fileType.toUpperCase()}`);
        return;
      }
    }

    try {
      setLoading(true);
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category);
      uploadData.append('fileType', formData.fileType);
      uploadData.append('subject', formData.subject);

      await notesAPI.uploadNote(uploadData);

      setSuccess('Note uploaded successfully!');
      setFormData({ title: '', description: '', category: 'General', fileType: '', subject: '' });
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="md" sx={{ py: 4, px: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 900 }}>
            📤 Upload Notes
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Paper className="glass-panel" sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Note Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Type of Note</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {['pdf', 'png', 'jpg', 'jpeg', 'docx', 'pptx'].map((t) => (
                      <Button
                        key={t}
                        size="small"
                        variant={formData.fileType === t ? 'contained' : 'outlined'}
                        onClick={() => setFormData((s) => ({ ...s, fileType: t }))}
                        disabled={loading}
                      >
                        {t.toUpperCase()}
                      </Button>
                    ))}
                    <Button
                      size="small"
                      variant={formData.fileType === 'any' ? 'contained' : 'outlined'}
                      onClick={() => setFormData((s) => ({ ...s, fileType: 'any' }))}
                      disabled={loading}
                    >
                      ANY
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="file"
                    inputProps={{ accept: '.pdf,.png,.jpg,.jpeg,.docx,.pptx' }}
                    onChange={handleFileChange}
                    disabled={loading}
                    label="File"
                    InputLabelProps={{ shrink: true }}
                  />
                  {file && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected: {file.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Upload Note'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default UploadNotesPage;
