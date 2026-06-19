import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';

/**
 * NoteCard Component
 * Displays note information in a card
 */
const NoteCard = ({ note, onDownload, onDelete }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(14,165,233,0.08))' }}>
        <Typography gutterBottom variant="h6" sx={{ fontWeight: 700 }}>
          {note.title}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          <strong>Subject:</strong> {note.subject}
        </Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          <strong>Category:</strong> {note.category}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {note.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ marginTop: 'auto', flexWrap: 'wrap', gap: 1, p: 2 }}>
        {onDownload && (
          <Button size="small" color="secondary" variant="contained" onClick={onDownload}>
            {note.fileType === 'pdf' ? 'Download PDF' : `Download ${note.fileType?.toUpperCase() || 'File'}`}
          </Button>
        )}
        {onDelete && (
          <Button size="small" color="error" variant="contained" onClick={onDelete}>
            Delete
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default NoteCard;
