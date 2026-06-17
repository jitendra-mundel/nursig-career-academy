import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import { notesAPI } from '../api/endpoints';

/**
 * Admin Notes Management Page
 * View and manage all uploaded notes with delete functionality
 */
const AdminNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  useEffect(() => {
    fetchNotes();
  }, [page]);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await notesAPI.getAdminNotes('', '', page, limit);
      setNotes(response.data.notes || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = notes.filter((note) =>
      note.title.toLowerCase().includes(query) ||
      note.description?.toLowerCase().includes(query) ||
      note.subject?.toLowerCase().includes(query) ||
      note.category?.toLowerCase().includes(query)
    );
    setFilteredNotes(filtered);
  };

  const handleDeleteClick = (note) => {
    setSelectedNote(note);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedNote) return;

    try {
      setDeleting(true);
      await notesAPI.deleteNote(selectedNote._id);
      setSuccess(`Note "${selectedNote.title}" deleted successfully!`);
      setDeleteDialogOpen(false);
      setSelectedNote(null);
      fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (note) => {
    if (!note.fileUrl) return;

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
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = note.fileName || note.title || 'note';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      setError('Unable to download note. Please try again.');
      console.error(error);
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedNote(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1.5, sm: 3 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 900 }}>
              📚 Manage Notes
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search notes by title, subject, or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredNotes.length === 0 ? (
            <Paper className="glass-panel" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#94a3b8' }}>
                {notes.length === 0 ? 'No notes uploaded yet' : 'No notes match your search'}
              </Typography>
            </Paper>
          ) : (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {filteredNotes.map((note) => (
                  <Grid item xs={12} sm={6} md={4} key={note._id}>
                    <Card
                      className="glass-panel"
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(124, 58, 237, 0.2)',
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#e2e8f0' }}>
                          {note.title}
                        </Typography>

                        {note.description && (
                          <Typography variant="body2" sx={{ mb: 2, color: '#cbd5e1' }}>
                            {note.description.length > 100
                              ? `${note.description.substring(0, 100)}...`
                              : note.description}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                          {note.subject && (
                            <Chip
                              label={note.subject}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(124, 58, 237, 0.2)',
                                color: '#a78bfa',
                              }}
                            />
                          )}
                          {note.category && (
                            <Chip
                              label={note.category}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                              }}
                            />
                          )}
                        </Stack>

                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
                          📤 Uploaded: {new Date(note.uploadedAt || note.createdAt).toLocaleDateString()}
                        </Typography>

                        {note.uploadedBy?.name && (
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                            👤 By: {note.uploadedBy.name}
                          </Typography>
                        )}
                      </CardContent>

                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<FileDownloadIcon />}
                          onClick={() => handleDownload(note)}
                          sx={{ color: '#60a5fa' }}
                        >
                          Download
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteClick(note)}
                          sx={{ color: '#f87171', ml: 'auto' }}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 4 }}>
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    variant="outlined"
                  >
                    Previous
                  </Button>
                  <Typography sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                    Page {page} of {totalPages}
                  </Typography>
                  <Button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    variant="outlined"
                  >
                    Next
                  </Button>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Note?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{selectedNote?.title}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNotesPage;
