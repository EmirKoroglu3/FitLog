import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT token ekle
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// One refresh at a time: when several requests get 401 together they all wait for the
// same refresh call (refresh tokens rotate, so parallel refreshes would log the user out).
let refreshing: Promise<string> | null = null;

const refreshAccessToken = () => {
  if (!refreshing) {
    const refreshToken = localStorage.getItem('refreshToken');
    refreshing = (refreshToken
      ? axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }).then((response) => {
          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          return token as string;
        })
      : Promise.reject(new Error('no refresh token'))
    ).finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
};

// Response interceptor - Hata yönetimi
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Login/register/refresh failures are real errors, not an expired session
    const isAuthCall = String(originalRequest?.url ?? '').includes('/auth/');
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthCall) {
      originalRequest._retry = true;
      try {
        const token = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed: sign out
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

