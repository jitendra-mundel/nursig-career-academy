/**
 * Frontend Pagination Integration Guide
 * 
 * Updated API Responses Now Include:
 * {
 *   success: true,
 *   count: 20,
 *   pagination: {
 *     currentPage: 1,
 *     totalPages: 5,
 *     total[EntityName]: 100,
 *     perPage: 20
 *   },
 *   data: [...]
 * }
 */

// ============================================
// 1. EXAMPLE: Updating an API Call
// ============================================

// BEFORE:
// export const getTests = async () => {
//   const response = await apiClient.get('/tests');
//   return response.data.tests;
// };

// AFTER:
export const getTests = async (page = 1, limit = 20) => {
  const response = await apiClient.get('/tests', {
    params: { page, limit }
  });
  return {
    tests: response.data.tests,
    pagination: response.data.pagination
  };
};

// ============================================
// 2. EXAMPLE: React Hook for Pagination
// ============================================

import { useState, useEffect } from 'react';

const usePagination = (fetchFunction) => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 20,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchFunction(page, pagination.perPage);
        setItems(result.tests || result.data || result.items || []);
        // setItems(result.data || result.items || result);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } catch (error) {
        console.error('Pagination error:', error);
      }
      setLoading(false);
    };
    load();
  }, [page]);

  return {
    page,
    setPage,
    items,
    pagination,
    loading,
  };
};

// ============================================
// 3. EXAMPLE: Paginated List Component
// ============================================

import React from 'react';

const PaginatedList = ({ fetchFunction, renderItem }) => {
  const { page, setPage, items, pagination, loading } = usePagination(fetchFunction);

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      
      <div className="items-container">
        {items.map(item => renderItem(item))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button 
          onClick={handlePrevPage} 
          disabled={page === 1 || loading}
        >
          Previous
        </button>
        
        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        
        <button 
          onClick={handleNextPage} 
          disabled={page === pagination.totalPages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ============================================
// 4. EXAMPLE: Using in a Page Component
// ============================================

import { getTests } from '../api/endpoints.js';

const TestsPage = () => {
  return (
    <PaginatedList
      fetchFunction={getTests}
      renderItem={(test) => (
        <div key={test._id} className="test-card">
          <h3>{test.title}</h3>
          <p>Subject: {test.subject}</p>
          <p>Marks: {test.totalMarks}</p>
        </div>
      )}
    />
  );
};

export default TestsPage;

// ============================================
// 5. API ENDPOINTS TO UPDATE
// ============================================

/**
 * All these endpoints now support pagination:
 * 
 * GET /api/tests?page=1&limit=20
 * GET /api/notes?page=1&limit=20&category=Math&search=quadratic
 * GET /api/questions/test/:testId?page=1&limit=50
 * GET /api/results/user?page=1&limit=20
 * GET /api/results?page=1&limit=50&userId=...&testId=...
 * GET /api/users?page=1&limit=50&role=user
 */

// ============================================
// 6. UPDATED endpoints.js TEMPLATE
// ============================================

/*
import apiClient from './apiClient.js';

const API_BASE = '/api';

export const testAPI = {
  getAllTests: (page = 1, limit = 20, subject = '') => 
    apiClient.get(`${API_BASE}/tests`, { params: { page, limit, subject } }),
  
  getTestById: (id) => 
    apiClient.get(`${API_BASE}/tests/${id}`),
};

export const notesAPI = {
  getAllNotes: (page = 1, limit = 20, category = '', search = '') =>
    apiClient.get(`${API_BASE}/notes`, { params: { page, limit, category, search } }),
  
  getNoteById: (id) =>
    apiClient.get(`${API_BASE}/notes/${id}`),
};

export const resultAPI = {
  getUserResults: (page = 1, limit = 20) =>
    apiClient.get(`${API_BASE}/results/user`, { params: { page, limit } }),
  
  getAllResults: (page = 1, limit = 50, userId = '', testId = '') =>
    apiClient.get(`${API_BASE}/results`, { params: { page, limit, userId, testId } }),
};

export const userAPI = {
  getAllUsers: (page = 1, limit = 50, role = '') =>
    apiClient.get(`${API_BASE}/users`, { params: { page, limit, role } }),
};
*/

// ============================================
// 7. PERFORMANCE TIPS
// ============================================

/*
1. Don't change page size too frequently
   - Stick with 20-50 items per page for best UX

2. Cache pagination data
   - Consider caching page 1 results to avoid refetch

3. Preload next page (optional)
   - Load page N+1 when user is on page N

4. Show "go to page" for large datasets
   - For 3000+ users, add numeric page selector

5. Use limit wisely
   - 20: Good for mobile (fast load)
   - 50: Good for desktop
   - 100: Max for performance reasons

6. Monitor pagination in browser
   - Check Network tab to verify params
   - Check response size reduction
*/
