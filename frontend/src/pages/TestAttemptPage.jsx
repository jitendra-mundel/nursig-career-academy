import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Chip,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { questionAPI, resultAPI, testAPI } from '../api/endpoints';

const stripInlineRationale = (text) => {
  if (!text) return '';
  const match = text.match(/\b(?:rationale|explanation)\s*[:\-]?\s*[\s\S]*$/i);
  return match ? text.slice(0, match.index).trim() : text.trim();
};

const TestAttemptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [warning, setWarning] = useState('');
  const [switchCount, setSwitchCount] = useState(0);
  const switchCooldownRef = useRef(0);
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        const [testResponse, questionsResponse] = await Promise.all([
          testAPI.getTestById(id),
          questionAPI.getQuestionsByTest(id),
        ]);

        setTest(testResponse.data.test);
        setQuestions(questionsResponse.data.questions || []);
        // check if user already attempted this test
        try {
          const myResults = await resultAPI.getUserResults();
          const already = (myResults.data.results || []).find(r => r.testId?._id === id || r.testId === id);
          if (already) {
            // redirect to detailed result view
            navigate(`/user/results/${already._id}`);
            return;
          }
        } catch (e) {
          // ignore
        }

        // start timer
        const durationMinutes = Number(testResponse.data.test?.duration || 0);
        if (durationMinutes > 0) {
          setSecondsLeft(durationMinutes * 60);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Test load nahi ho paya.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTest();
    }
  }, [id]);

  useEffect(() => {
    const shouldHandleSwitch = () => {
      const now = Date.now();
      if (switchCooldownRef.current && now - switchCooldownRef.current < 1000) {
        return false;
      }
      switchCooldownRef.current = now;
      return true;
    };

    const handleSwitch = async () => {
      if (!shouldHandleSwitch()) return;
      setSwitchCount((count) => {
        const next = count + 1;
        if (next === 1) {
          setWarning('Warning: aapne test page se bahar jana shuru kiya hai. Behtar hai page par hi rahen.');
        } else if (next === 2) {
          setWarning('Second warning: aapne 2 baar switch kiya. Agli baar auto-submit ho jayega.');
        } else if (next >= 3) {
          setWarning('Aapne 3 baar switch kiya. Test automatically submit ho jayega.');
          autoSubmitRef.current = true;
          if (!submitting) {
            handleSubmit();
          }
        }
        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleSwitch();
      }
    };

    const handleWindowBlur = () => {
      handleSwitch();
    };

    const handleWindowFocus = () => {
      if (warning) setWarning('');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [warning, submitting]);

  const totalMarks = useMemo(
    () => questions.reduce((sum, question) => sum + (Number(question.marks) || 1), 0),
    [questions]
  );

  const handleAnswerChange = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const timeSpent = test?.duration ? (Number(test.duration) * 60 - (secondsLeft || 0)) : 0;
      const response = await resultAPI.submitTest({ testId: id, answers, timeSpent });

      setSuccess('Test submitted successfully.');
      const rid = response.data.result?._id || response.data.result?.id;
      navigate(`/user/results/${rid}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Test submit nahi hua.');
    } finally {
      setSubmitting(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      // auto-submit
      if (!submitting) handleSubmit();
      return;
    }

    const t = setInterval(() => setSecondsLeft((s) => (s !== null ? s - 1 : s)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1.5, sm: 3 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {test?.title || 'Test'}
                </Typography>
                <Chip label="Premium" color="secondary" size="small" sx={{ fontWeight: 700 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {test?.subject} | Duration: {test?.duration} minutes | Total Marks: {test?.totalMarks || totalMarks}
                {secondsLeft !== null && (
                  <span style={{ marginLeft: 12, fontWeight: '600' }}>Time left: {Math.floor(secondsLeft/60)}:{String(secondsLeft%60).padStart(2,'0')}</span>
                )}
              </Typography>

              {warning && <Alert severity="warning" sx={{ mb: 2 }}>{warning}</Alert>}
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <Paper sx={{ p: 3 }}>
                {questions.length === 0 ? (
                  <Alert severity="warning">Is test ke liye abhi koi question available nahi hai.</Alert>
                ) : (
                  <Stack spacing={3}>
                    {questions.map((question, index) => (
                      <Paper key={question._id} variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Question {index + 1} | Marks: {question.marks}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                          {stripInlineRationale(question.questionText)}
                        </Typography>

                        {question.questionType === 'mcq' ? (
                          <RadioGroup
                            value={answers[question._id] || ''}
                            onChange={(event) => handleAnswerChange(question._id, event.target.value)}
                          >
                            {question.options?.map((option) => (
                              <FormControlLabel
                                key={option}
                                value={option}
                                control={<Radio />}
                                label={option}
                              />
                            ))}
                          </RadioGroup>
                        ) : (
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="Your Answer"
                            value={answers[question._id] || ''}
                            onChange={(event) => handleAnswerChange(question._id, event.target.value)}
                          />
                        )}
                      </Paper>
                    ))}

                    <Divider />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                      <Button variant="outlined" onClick={() => navigate('/user/tests')} disabled={submitting}>
                        Back to Tests
                      </Button>
                      <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Test'}
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Paper>
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default TestAttemptPage;