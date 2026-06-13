import React from 'react';
import { Card, CardContent, CardActions, CardActionArea, Typography, Button, Chip, Box } from '@mui/material';

/**
 * TestCard Component
 * Displays test information in a compact card
 */
const TestCard = ({ test, onStart, onEdit, onDelete, isAdmin = false }) => {
  const dateLabel = test.startDate
    ? new Date(test.startDate).toLocaleDateString()
    : new Date(test.createdAt).toLocaleDateString();

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
      <CardActionArea onClick={onStart} sx={{ textAlign: 'left' }}>
        <Box sx={{ p: 3, background: 'linear-gradient(135deg, rgba(124,58,237,0.16), rgba(14,165,233,0.1))' }}>
          <Typography gutterBottom variant="h6" sx={{ fontWeight: 700 }}>
            {test.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 1 }}>
            <Chip label={`Questions: ${test.totalQuestions}`} size="small" color="secondary" variant="outlined" />
            <Chip label={`Date: ${dateLabel}`} size="small" color="default" variant="outlined" />
          </Box>
          {!test.isPublished && (
            <Chip label="Draft" size="small" color="warning" sx={{ mt: 1 }} />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Click to view questions and start this test.
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ marginTop: 'auto', flexWrap: 'wrap', gap: 1, p: 2 }}>
        {isAdmin ? (
          <>
            {onEdit && (
              <Button size="small" color="secondary" variant="contained" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button size="small" color="error" variant="contained" onClick={onDelete}>
                Delete
              </Button>
            )}
          </>
        ) : (
          onStart && (
            <Button size="small" color="secondary" variant="contained" onClick={onStart}>
              View Questions
            </Button>
          )
        )}
      </CardActions>
    </Card>
  );
};

export default TestCard;
