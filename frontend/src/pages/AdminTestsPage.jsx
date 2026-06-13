import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Sidebar from '../components/Sidebar';
import { questionAPI, testAPI } from '../api/endpoints';

const blankTestForm = {
  title: '',
  description: '',
  subject: '',
  totalQuestions: '',
  totalMarks: '',
  duration: '',
  passingMarks: '',
  instructions: '',
  publishImmediately: true,
};

const blankQuestionForm = {
  testId: '',
  questionText: '',
  questionType: 'mcq',
  optionsText: 'Option 1\nOption 2\nOption 3\nOption 4',
  correctAnswer: '',
  marks: '1',
  explanation: '',
  difficulty: 'medium',
};

const buildNextQuestionForm = (currentForm) => ({
  ...blankQuestionForm,
  testId: currentForm.testId,
  questionType: currentForm.questionType,
  difficulty: currentForm.difficulty,
  marks: currentForm.marks,
});

/**
 * Parse pasted bulk questions into structured objects.
 * Supports numbered blocks like:
 * 1. Question?
 * A. Option
 * B. Option
 * Answer: B. Option
 */
const parseBulkQuestions = (text) => {
  if (!text) return [];
  const parsed = [];

  const questionNumberRegex = /^(?:\*+\s*)?(\d+)\s*[\.)]\s*/;
  const optionRegex = /^([A-Za-z])\s*[\.)]\s*(.+)$/; // e.g. A. or B)
  const bulletRegex = /^[-–•*]\s*(.+)$/;
  const answerRegex = /(?:^|\W)(?:answer|ans|correct answer)\s*[:\-]?\s*(.+)$/i;
  const rationaleRegex = /\b(?:rationale|explanation)\s*[:\-]?\s*(.+)$/i;

  const normalizeText = (value) => value
    .replace(/^\s*[\*`_✅✔️]+\s*/, '')
    .replace(/\s*[\*`_✅✔️]+\s*$/, '')
    .trim();

  const extractRationale = (value) => {
    const match = value.match(rationaleRegex);
    if (!match) return { text: value, rationale: '' };
    return {
      text: value.slice(0, match.index).trim(),
      rationale: normalizeText(match[1]),
    };
  };

  let current = null;

  const flushCurrent = () => {
    if (!current) return;

    const questionText = (current.questionText || '').trim();
    const options = current.options || [];
    let correctAnswer = current.correctAnswer || '';
    const explicitAnswerRef = current.explicitAnswerRef || '';

    if (!correctAnswer && explicitAnswerRef) {
      const ref = explicitAnswerRef.trim();
      const letterMatch = ref.match(/^([A-Za-z])(?:[\.)]?\s*(.*))?$/);
      if (letterMatch) {
        const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
        if (options[idx]) correctAnswer = options[idx];
        else if (letterMatch[2] && letterMatch[2].trim()) {
          const after = letterMatch[2].trim();
          const byText = options.find((o) => o.toLowerCase() === after.toLowerCase());
          if (byText) correctAnswer = byText;
        }
      } else {
        const byText = options.find((o) => o.toLowerCase() === ref.toLowerCase());
        if (byText) correctAnswer = byText;
      }
    }

    if (questionText || options.length) {
      parsed.push({ questionText, options, correctAnswer, explanation: current.explanation?.trim() || '' });
    }

    current = null;
  };

  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const sanitizedLine = normalizeText(line);
    if (!sanitizedLine) continue;

    const answerMatch = sanitizedLine.match(answerRegex);
    const rationaleMatch = sanitizedLine.match(rationaleRegex);

    if (answerMatch) {
      if (!current) {
        current = { questionText: '', options: [], correctAnswer: '', explicitAnswerRef: '', explanation: '' };
      }
      current.explicitAnswerRef = normalizeText(answerMatch[1]);
      continue;
    }

    if (rationaleMatch) {
      if (!current) {
        current = { questionText: '', options: [], correctAnswer: '', explicitAnswerRef: '', explanation: '' };
      }
      const explanationText = normalizeText(rationaleMatch[1]);
      current.explanation = [current.explanation, explanationText].filter(Boolean).join(' ');
      continue;
    }

    const questionMatch = sanitizedLine.match(questionNumberRegex);
    if (questionMatch) {
      flushCurrent();
      const questionTextRaw = normalizeText(sanitizedLine.replace(questionNumberRegex, ''));
      const { text: questionTextClean, rationale: inlineRationale } = extractRationale(questionTextRaw);
      current = {
        questionText: questionTextClean,
        options: [],
        correctAnswer: '',
        explicitAnswerRef: '',
        explanation: inlineRationale,
      };
      continue;
    }

    const optionMatch = sanitizedLine.match(optionRegex);
    const bulletMatch = sanitizedLine.match(bulletRegex);
    if (optionMatch || bulletMatch) {
      if (!current) {
        current = { questionText: '', options: [], correctAnswer: '', explicitAnswerRef: '', explanation: '' };
      }

      const optionText = normalizeText(optionMatch ? optionMatch[2] : bulletMatch[1]);
      let cleanedOption = optionText;

      if (cleanedOption.startsWith('*')) {
        cleanedOption = cleanedOption.slice(1).trim();
        current.correctAnswer = cleanedOption;
      }

      if (cleanedOption.endsWith('*')) {
        cleanedOption = cleanedOption.slice(0, -1).trim();
        current.correctAnswer = cleanedOption;
      }

      current.options.push(cleanedOption);
      continue;
    }

    if (!current) {
      current = { questionText: '', options: [], correctAnswer: '', explicitAnswerRef: '', explanation: '' };
    }

    if (!current.questionText) {
      const questionTextRaw = normalizeText(sanitizedLine.replace(questionNumberRegex, ''));
      const { text: questionTextClean, rationale: inlineRationale } = extractRationale(questionTextRaw);
      current.questionText = questionTextClean;
      if (inlineRationale) {
        current.explanation = [current.explanation, inlineRationale].filter(Boolean).join(' ');
      }
    } else {
      const { text: questionTextClean, rationale: inlineRationale } = extractRationale(normalizeText(sanitizedLine));
      current.questionText += ` ${questionTextClean}`;
      if (inlineRationale) {
        current.explanation = [current.explanation, inlineRationale].filter(Boolean).join(' ');
      }
    }
  }

  flushCurrent();

  return parsed;
};

const AdminTestsPage = () => {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [testForm, setTestForm] = useState(blankTestForm);
  const [questionForm, setQuestionForm] = useState(blankQuestionForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkReport, setBulkReport] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  // Only load questions when a test is selected AND questions are requested to be shown
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    if (selectedTestId && showQuestions) {
      fetchQuestions(selectedTestId);
      setQuestionForm((current) => ({ ...current, testId: selectedTestId }));
    } else {
      setQuestions([]);
    }
  }, [selectedTestId, showQuestions]);

  const fetchTests = async ({ autoSelectFirst = false } = {}) => {
    try {
      setLoading(true);
      const response = await testAPI.getAllTests();
      setTests(response.data.tests || []);
      if (autoSelectFirst && response.data.tests?.length) {
        setSelectedTestId(response.data.tests[0]._id);
      }
    } catch (err) {
      setError('Tests load nahi ho paye.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (testId) => {
    try {
      const response = await questionAPI.getQuestionsByTest(testId);
      setQuestions(response.data.questions || []);
    } catch (err) {
      console.error(err);
      setQuestions([]);
    }
  };

  const filteredTests = useMemo(() => {
    const needle = search.toLowerCase();
    return tests.filter((test) => (
      test.title?.toLowerCase().includes(needle) ||
      test.subject?.toLowerCase().includes(needle)
    ));
  }, [tests, search]);

  const handleTestChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTestForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleQuestionChange = (event) => {
    const { name, value } = event.target;
    setQuestionForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateTest = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await testAPI.createTest({
        title: testForm.title,
        description: testForm.description,
        subject: testForm.subject,
        totalQuestions: Number(testForm.totalQuestions),
        totalMarks: Number(testForm.totalMarks),
        duration: Number(testForm.duration),
        passingMarks: Number(testForm.passingMarks),
        instructions: testForm.instructions,
      });

      if (testForm.publishImmediately && response.data.test?._id) {
        await testAPI.publishTest(response.data.test._id);
      }

      setSuccess('Test created successfully.');
      setTestForm(blankTestForm);
      await fetchTests();
      if (response.data.test?._id) {
        // Select the newly created test in the forms but keep questions hidden
        setSelectedTestId(response.data.test._id);
        setShowQuestions(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Test create nahi hua.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    const confirmDelete = window.confirm('Kya aap is test ko delete karna chahte ho? Iske saare questions bhi delete ho jayenge.');
    if (!confirmDelete) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await testAPI.deleteTest(testId);

      const wasSelected = selectedTestId === testId;

      setSuccess('Test deleted successfully.');
      setQuestions([]);

      if (wasSelected) {
        setSelectedTestId('');
        setShowQuestions(false);
      }

      await fetchTests({ autoSelectFirst: wasSelected });
    } catch (err) {
      setError(err.response?.data?.message || 'Test delete nahi hua.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateQuestion = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        testId: questionForm.testId,
        questionText: questionForm.questionText,
        questionType: questionForm.questionType,
        options:
          questionForm.questionType === 'mcq'
            ? questionForm.optionsText.split('\n').map((item) => item.trim()).filter(Boolean)
            : [],
        correctAnswer: questionForm.correctAnswer,
        marks: Number(questionForm.marks || 1),
        explanation: questionForm.explanation,
        difficulty: questionForm.difficulty,
      };

      await questionAPI.createQuestion(payload);
      setSuccess('Question added successfully.');
      setQuestionForm((current) => buildNextQuestionForm(current));

      if (questionForm.testId) {
        await fetchQuestions(questionForm.testId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Question create nahi hua.');
    } finally {
      setSaving(false);
    }
  };

  const currentTest = tests.find((test) => test._id === selectedTestId);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 1.5, sm: 3 } }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            Manage Tests
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Yahan se test create karo, questions add karo, aur existing published tests ko review karo.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">Published Tests</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{tests.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">Selected Test</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }} noWrap>{currentTest?.title || 'No test selected'}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">Questions Loaded</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{questions.length}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Bulk Upload Questions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Paste multiple questions separated by a blank line. Use the same numbered format you copied:
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
              1. Question text
              A. Option one
              B. Option two
              C. Option three
              D. Option four
              Answer: B. Option two
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={6}
              placeholder={`1. Human body ki sabse badi gland kaunsi hai?\n\nA. Pancreas\nB. Liver\nC. Thyroid\nD. Spleen\n\nAnswer: B. Liver\n\n2. Normal adult pulse rate kitni hoti hai?\n\nA. 40–60/min\nB. 60–100/min\nC. 100–120/min\nD. 120–140/min\n\nAnswer: B. 60–100/min`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                disabled={bulkLoading || !selectedTestId}
                onClick={async () => {
                  if (!selectedTestId) {
                    setError('Select a test first to attach questions to.');
                    return;
                  }
                  setBulkLoading(true);
                  setBulkReport(null);
                  setError('');
                  try {
                    const parsed = parseBulkQuestions(bulkText);
                    if (parsed.length === 0) {
                      setError('No questions parsed from input.');
                      setBulkLoading(false);
                      return;
                    }

                    // Try single-request bulk upload
                    try {
                      const bulkPayload = parsed.map((q) => ({
                        testId: selectedTestId,
                        questionText: q.questionText,
                        questionType: q.options.length > 0 ? 'mcq' : 'short_answer',
                        options: q.options,
                        correctAnswer: q.correctAnswer || (q.options[0] || ''),
                        marks: 1,
                        difficulty: 'medium',
                        explanation: q.explanation || '',
                      }));

                      const res = await questionAPI.createQuestionsBulk({ questions: bulkPayload });
                        const createdCount = res.data.count || (res.data.questions || []).length || 0;
                        setBulkReport(bulkPayload.map((p) => ({ ok: true, title: p.questionText })));
                        setSuccess(`${createdCount} questions created`);
                        // Do not auto-fetch questions after upload; only fetch when admin opens the test
                        if (selectedTestId && showQuestions) await fetchQuestions(selectedTestId);
                    } catch (bulkErr) {
                      // Fallback to per-item creation if bulk endpoint fails
                      const results = [];
                      for (const q of parsed) {
                        const payload = {
                          testId: selectedTestId,
                          questionText: q.questionText,
                          questionType: q.options.length > 0 ? 'mcq' : 'short_answer',
                          options: q.options,
                          correctAnswer: q.correctAnswer || (q.options[0] || ''),
                          marks: 1,
                          difficulty: 'medium',
                        };

                        try {
                          const r = await questionAPI.createQuestion(payload);
                          results.push({ ok: true, id: r.data.question?._id, title: q.questionText });
                        } catch (err) {
                          results.push({ ok: false, error: err?.response?.data?.message || err.message, title: q.questionText });
                        }
                      }

                      setBulkReport(results);
                      setSuccess(`${results.filter(r => r.ok).length} uploaded, ${results.filter(r => !r.ok).length} failed.`);
                      // Only refresh loaded questions when admin has explicitly opened the test
                      if (selectedTestId && showQuestions) await fetchQuestions(selectedTestId);
                    }
                  } catch (err) {
                    setError(err.message || 'Bulk upload failed');
                  } finally {
                    setBulkLoading(false);
                  }
                }}
              >
                {bulkLoading ? 'Uploading...' : 'Parse & Upload'}
              </Button>
              <Button variant="outlined" onClick={() => { setBulkText(''); setBulkReport(null); setError(''); setSuccess(''); }}>
                Clear
              </Button>
            </Box>

            {bulkReport && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Upload Report</Typography>
                {bulkReport.map((r, idx) => (
                  <Typography key={idx} variant="body2" sx={{ color: r.ok ? 'success.main' : 'error.main' }}>
                    {r.ok ? `✓ ${r.title}` : `✗ ${r.title} — ${r.error}`}
                  </Typography>
                ))}
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Search tests"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {filteredTests.map((test) => (
                <Grid item xs={12} md={6} key={test._id}>
                  <Paper
                    sx={{ p: 3, cursor: 'pointer', border: selectedTestId === test._id ? '2px solid' : '1px solid', borderColor: selectedTestId === test._id ? 'primary.main' : 'divider' }}
                    onClick={() => {
                      // toggle selection and question visibility
                      if (selectedTestId === test._id && showQuestions) {
                        setSelectedTestId('');
                        setShowQuestions(false);
                      } else {
                        setSelectedTestId(test._id);
                        setShowQuestions(true);
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{test.title}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={test.isPublished ? 'Published' : 'Draft'} color={test.isPublished ? 'success' : 'warning'} size="small" />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteTest(test._id);
                          }}
                          disabled={saving}
                          aria-label={`Delete ${test.title}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{test.subject}</Typography>
                    <Typography variant="body2" color="text.secondary">Marks: {test.totalMarks} | Questions: {test.totalQuestions} | Duration: {test.duration} min</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, height: '100%' }} component="form" onSubmit={handleCreateTest}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Create Test</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Title" name="title" value={testForm.title} onChange={handleTestChange} required disabled={saving} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Subject" name="subject" value={testForm.subject} onChange={handleTestChange} required disabled={saving} /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Description" name="description" value={testForm.description} onChange={handleTestChange} multiline rows={3} disabled={saving} /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth label="Questions" name="totalQuestions" type="number" value={testForm.totalQuestions} onChange={handleTestChange} required disabled={saving} /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth label="Total Marks" name="totalMarks" type="number" value={testForm.totalMarks} onChange={handleTestChange} required disabled={saving} /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth label="Duration (min)" name="duration" type="number" value={testForm.duration} onChange={handleTestChange} required disabled={saving} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Passing Marks" name="passingMarks" type="number" value={testForm.passingMarks} onChange={handleTestChange} required disabled={saving} /></Grid>
                  <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={testForm.publishImmediately} onChange={handleTestChange} name="publishImmediately" />} label="Publish immediately" /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Instructions" name="instructions" value={testForm.instructions} onChange={handleTestChange} multiline rows={4} disabled={saving} /></Grid>
                  <Grid item xs={12}><Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Create Test'}</Button></Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, height: '100%' }} component="form" onSubmit={handleCreateQuestion}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Add Question</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Ek hi test select karke yahin se baar-baar questions add kar sakte ho. Save ke baad test selected rahega.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Test"
                      name="testId"
                      value={questionForm.testId}
                      onChange={handleQuestionChange}
                      SelectProps={{ native: true }}
                      required
                      disabled={saving}
                    >
                      <option value="">Select test</option>
                      {tests.map((test) => (
                        <option key={test._id} value={test._id}>{test.title}</option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}><TextField fullWidth label="Question Text" name="questionText" value={questionForm.questionText} onChange={handleQuestionChange} multiline rows={3} required disabled={saving} autoFocus /></Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth label="Question Type" name="questionType" value={questionForm.questionType} onChange={handleQuestionChange} SelectProps={{ native: true }} disabled={saving}>
                      <option value="mcq">MCQ</option>
                      <option value="short_answer">Short Answer</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField select fullWidth label="Difficulty" name="difficulty" value={questionForm.difficulty} onChange={handleQuestionChange} SelectProps={{ native: true }} disabled={saving}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Options (one per line)"
                      name="optionsText"
                      value={questionForm.optionsText}
                      onChange={handleQuestionChange}
                      multiline
                      rows={4}
                      disabled={saving || questionForm.questionType !== 'mcq'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Correct Answer" name="correctAnswer" value={questionForm.correctAnswer} onChange={handleQuestionChange} required disabled={saving} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Marks" name="marks" type="number" value={questionForm.marks} onChange={handleQuestionChange} required disabled={saving} /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Explanation" name="explanation" value={questionForm.explanation} onChange={handleQuestionChange} multiline rows={3} disabled={saving} /></Grid>
                  <Grid item xs={12}><Button type="submit" variant="contained" disabled={saving || !questionForm.testId}>{saving ? 'Saving...' : 'Add Question'}</Button></Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Questions for {currentTest?.title || 'Selected Test'}
          </Typography>

          {questions.length > 0 ? (
            <Grid container spacing={2}>
              {questions.map((question) => (
                <Grid item xs={12} md={6} key={question._id}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{question.questionText}</Typography>
                    <Typography variant="body2" color="text.secondary">Type: {question.questionType} | Difficulty: {question.difficulty} | Marks: {question.marks}</Typography>
                    {question.questionType === 'mcq' && question.options?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        {question.options.map((option) => (
                          <Chip key={option} label={option} variant="outlined" sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Is test ke liye abhi koi question load nahi hua.
            </Typography>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminTestsPage;