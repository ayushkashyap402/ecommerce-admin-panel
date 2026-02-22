// services/api.js

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL || '/api').trim();

/* ===============================
   Cookie Helpers
================================ */

function getCookie(name) {
  const v = document.cookie.match(
    '(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'
  );
  return v ? v.pop() : null;
}

export function setAuthCookie(token, maxAge = 86400) {
  document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

export function clearAuthCookie() {
  document.cookie = 'token=; path=/; max-age=0';
}

/* ===============================
   Core Request Function
================================ */

async function request(path, options = {}) {
  // Check sessionStorage first (for impersonated sessions - tab-specific)
  // Then check cookie (for normal sessions - shared across tabs)
  const sessionToken = sessionStorage.getItem('impersonated_token');
  const cookieToken = getCookie('token');
  const token = sessionToken || cookieToken;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // Increased to 30 seconds

  try {
    const res = await fetch(
      `${API_BASE_URL}${path.trim()}`,
      {
        ...options,
        headers,
        credentials: 'include',
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await res.json().catch(() => ({}));

    // Only clear auth on 401 Unauthorized, not on other errors like 404
    if (res.status === 401) {
      clearAuthCookie();
      // Dispatch logout action to Redux store
      if (window.store) {
        window.store.dispatch({ type: 'auth/logout' });
      }
      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (!res.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        res.statusText ||
        'Request failed'
      );
    }

    return data;

  } catch (err) {
    clearTimeout(timeout);

    if (err.name === 'AbortError') {
      throw new Error(
        'Request timed out. Please check your internet connection and try again.'
      );
    }

    if (err.message.includes('Failed to fetch')) {
      throw new Error(
        'Network error. Unable to connect to the server. Please check if the backend is running.'
      );
    }

    if (err.message.includes('CORS')) {
      throw new Error(
        'CORS error. Please check server configuration.'
      );
    }

    // Add more specific error handling
    if (err.code === 'ECONNREFUSED') {
      throw new Error(
        'Connection refused. Please check if the server is running.'
      );
    }

    if (err.code === 'ENOTFOUND') {
      throw new Error(
        'Server not found. Please check the server URL.'
      );
    }

    if (err.code === 'ETIMEDOUT') {
      throw new Error(
        'Request timed out. Please try again.'
      );
    }

    // Log detailed error for debugging
    console.error('API Request Error:', {
      error: err.message,
      code: err.code,
      stack: err.stack,
      timestamp: new Date().toISOString(),
      url: `${API_BASE_URL}${path}`
    });

    throw err;
  }
}

/* ===============================
   API Methods
================================ */

export const api = {
  get: (path) =>
    request(path, { method: 'GET' }),

  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: (path, body) =>
    request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: (path, body) =>
    request(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: (path) =>
    request(path, { method: 'DELETE' }),
};
