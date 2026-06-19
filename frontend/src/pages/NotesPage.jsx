import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import { notesAPI } from '../api/endpoints';

/**
 * Notes Page
 * Display and manage notes for users
 */
const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [search, fileType]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAllNotes('', search, 1, 20, fileType);
      setNotes(response.data.notes || []);
    } catch (err) {
      setError('Failed to fetch notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (note) => {
    if (!note?.fileUrl) return;

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const backendBase = apiUrl.replace(/\/api\/?$/, '');
      let fileUrl = note.fileUrl;

      if (fileUrl.startsWith('http')) {
        try {
          const parsed = new URL(fileUrl);
          const backendOrigin = new URL(backendBase);

          if (parsed.pathname.startsWith('/api/')) {
            parsed.pathname = parsed.pathname.replace(/^\/api/, '');
          }

          if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            parsed.protocol = backendOrigin.protocol;
            parsed.hostname = backendOrigin.hostname;
            parsed.port = backendOrigin.port;
          }

          fileUrl = parsed.toString();
        } catch (e) {
          // fallback to raw URL if parsing fails
        }
      } else {
        if (fileUrl.startsWith('/api/')) {
          fileUrl = fileUrl.replace(/^\/api/, '');
        }
        if (!fileUrl.startsWith('/')) {
          fileUrl = `/${fileUrl}`;
        }
        fileUrl = `${backendBase}${fileUrl}`;
      }

      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const fileName = note.fileName || note.title || fileUrl.split('/').pop() || 'note';
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      setError('Unable to download note. Please try again.');
      console.error(error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
            📖 My Notes
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  label="Search Notes"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="File Type"
                  select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  size="small"
                  SelectProps={{ native: true }}
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="docx">DOCX</option>
                  <option value="pptx">PPTX</option>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {loading ? (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper className="glass-panel skeleton-glow" sx={{ p: 3, minHeight: 240 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {notes.map((note) => (
                <Grid item xs={12} sm={6} md={4} key={note._id}>
                  <NoteCard
                    note={note}
                    onDownload={() => handleDownload(note)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {!loading && notes.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
              No notes found. Try adjusting your search or filter.
            </Typography>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default NotesPage;
