const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const buildUrl = (path, params = {}) => {
  const normalizedBaseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBaseURL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const raw = await response.text();

  if (!raw || raw.trim() === '') {
    return null;
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  return raw;
};

const createRequest = async (method, path, data, config = {}) => {
  const headers = { ...(config.headers || {}) };
  const token = localStorage.getItem('token');

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body;
  if (data !== undefined && data !== null) {
    if (data instanceof FormData) {
      body = data;
      delete headers['Content-Type'];
    } else {
      body = JSON.stringify(data);
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
  }

  const response = await fetch(buildUrl(path, config.params), {
    method,
    headers,
    body,
  });

  const responseData = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    const error = new Error(responseData?.message || 'Request failed');
    error.response = {
      status: response.status,
      data: responseData,
    };
    throw error;
  }

  return {
    data: responseData,
    status: response.status,
    ok: response.ok,
    headers: response.headers,
  };
};

const apiClient = {
  get: (path, config = {}) => createRequest('GET', path, undefined, config),
  post: (path, data, config = {}) => createRequest('POST', path, data, config),
  put: (path, data, config = {}) => createRequest('PUT', path, data, config),
  delete: (path, config = {}) => createRequest('DELETE', path, undefined, config),
};

export default apiClient;
