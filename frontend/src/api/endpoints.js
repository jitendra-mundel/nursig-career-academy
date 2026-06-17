import apiClient from './apiClient.js';

/**
 * Notes API Functions
 */
export const notesAPI = {
  // Get all notes
  getAllNotes: (category = '', search = '', page = 1, limit = 20) => {
    return apiClient.get('/notes', {
      params: { category, search, page, limit },
    });
  },

  // Get all notes (admin only - includes unpublished)
  getAdminNotes: (category = '', search = '', page = 1, limit = 20) => {
    return apiClient.get('/notes/admin/all', {
      params: { category, search, page, limit },
    });
  },

  // Get single note
  getNoteById: (id) => {
    return apiClient.get(`/notes/${id}`);
  },

  // Upload note (admin)
  uploadNote: (formData) => {
    return apiClient.post('/notes', formData);
  },

  // Update note (admin)
  updateNote: (id, data) => {
    return apiClient.put(`/notes/${id}`, data);
  },

  // Delete note (admin)
  deleteNote: (id) => {
    return apiClient.delete(`/notes/${id}`);
  },
};

/**
 * Test API Functions
 */
export const testAPI = {
  // Get all tests
  getAllTests: (subject = '') => {
    return apiClient.get('/tests', {
      params: { subject },
    });
  },

  // Get single test
  getTestById: (id) => {
    return apiClient.get(`/tests/${id}`);
  },

  // Create test (admin)
  createTest: (data) => {
    return apiClient.post('/tests', data);
  },

  // Update test (admin)
  updateTest: (id, data) => {
    return apiClient.put(`/tests/${id}`, data);
  },

  // Delete test (admin)
  deleteTest: (id) => {
    return apiClient.delete(`/tests/${id}`);
  },

  // Publish test (admin)
  publishTest: (id) => {
    return apiClient.put(`/tests/${id}/publish`);
  },
};

/**
 * Question API Functions
 */
export const questionAPI = {
  // Get questions for test
  getQuestionsByTest: (testId) => {
    return apiClient.get(`/questions/test/${testId}`);
  },

  // Get single question
  getQuestionById: (id) => {
    return apiClient.get(`/questions/${id}`);
  },

  // Create question (admin)
  createQuestion: (data) => {
    return apiClient.post('/questions', data);
  },

  // Create questions in bulk (admin)
  createQuestionsBulk: (data) => {
    return apiClient.post('/questions/bulk', data);
  },

  // Update question (admin)
  updateQuestion: (id, data) => {
    return apiClient.put(`/questions/${id}`, data);
  },

  // Delete question (admin)
  deleteQuestion: (id) => {
    return apiClient.delete(`/questions/${id}`);
  },
};

/**
 * Result API Functions
 */
export const resultAPI = {
  // Submit test
  submitTest: (data) => {
    return apiClient.post('/results/submit', data);
  },

  // Get user results
  getUserResults: () => {
    return apiClient.get('/results/user');
  },

  // Get all results (admin)
  getAllResults: (userId = '', testId = '') => {
    return apiClient.get('/results/all', {
      params: { userId, testId },
    });
  },

  // Get single result
  getResultById: (id) => {
    return apiClient.get(`/results/${id}`);
  },
  // Delete result (admin)
  deleteResult: (id) => {
    return apiClient.delete(`/results/${id}`);
  },
};

/**
 * User API Functions
 */
export const userAPI = {
  // Get all users (admin)
  getAllUsers: () => {
    return apiClient.get('/users');
  },

  // Get user by id
  getUserById: (id) => {
    return apiClient.get(`/users/${id}`);
  },

  // Update user
  updateUser: (id, data) => {
    return apiClient.put(`/users/${id}`, data);
  },

  // Deactivate user (admin)
  deactivateUser: (id) => {
    return apiClient.put(`/users/${id}/deactivate`);
  },
};
