const browserDefaultApiBase = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000'
  : '';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || browserDefaultApiBase;

export const apiFetch = (path, options = {}) => {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  return fetch(url, {
    ...options,
    credentials: options.credentials ?? 'include',
  });
};
