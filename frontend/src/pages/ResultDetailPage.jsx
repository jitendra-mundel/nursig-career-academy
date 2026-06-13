import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { resultAPI } from '../api/endpoints';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

const ResultDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await resultAPI.getResultById(id);
        setResult(res.data.result);
      } catch (err) {
        setError(err.response?.data?.message || 'Result load failed');
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const stats = result?.stats || { correct: 0, wrong: 0, skipped: 0 };
  const rank = result?.rank || null;

  if (loading) return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="md" sx={{ py: 6 }}>
          <CircularProgress />
        </Container>
      </Box>
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>{result.testId?.title || 'Result'}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Marks: {result.marksObtained} / {result.totalMarks} | Percentage: {result.percentage}% | Percentile: {result.percentile !== undefined ? `${result.percentile}%` : 'N/A'}
          </Typography>

          {rank && rank.position > 0 && (
            <Paper sx={{ p: 2.5, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Your Rank</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{rank.position} / {rank.totalParticipants}</Typography>
            </Paper>
          )}

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', background: '#e8f5e9' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'green' }}>{stats.correct}</Typography>
                <Typography variant="caption" color="text.secondary">Correct</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', background: '#ffebee' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'red' }}>{stats.wrong}</Typography>
                <Typography variant="caption" color="text.secondary">Wrong</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', background: '#fff3e0' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>{stats.skipped}</Typography>
                <Typography variant="caption" color="text.secondary">Skipped</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', background: '#f3e5f5' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>{result.detailed?.length || 0}</Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 2 }}>
            <List>
              {result.detailed?.map((q, idx) => (
                <React.Fragment key={q.questionId}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <Typography variant="caption">{`Q${idx + 1}`}</Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={q.questionText}
                      secondary={(
                        <Box component="div" sx={{ mt: 1 }}>
                          {q.options?.map((opt) => {
                            const isUser = String(opt) === String(q.userAnswer);
                            const isCorrect = String(opt) === String(q.correctAnswer);
                            const color = isCorrect ? 'green' : isUser && !isCorrect ? 'red' : 'inherit';
                            return (
                              <Box key={opt} sx={{ display: 'flex', alignItems: 'center', gap: 1, color, mb: 0.5 }}>
                                {isCorrect ? <RadioButtonCheckedIcon fontSize="small" sx={{ color: 'green' }} /> : <RadioButtonUncheckedIcon fontSize="small" />}
                                <Typography variant="body2">{opt}</Typography>
                                {isUser && <Typography variant="caption" sx={{ ml: 1, color: isCorrect ? 'green' : 'red' }}> (Your choice)</Typography>}
                              </Box>
                            );
                          })}
                          {q.correctAnswer && (
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                              Correct answer: {q.correctAnswer}
                            </Typography>
                          )}
                          {q.explanation && (
                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                              Rationale: {q.explanation}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default ResultDetailPage;
