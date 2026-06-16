import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the JWT token dynamically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to catch global auth errors (e.g. expired tokens)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear local session and reload
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request! Logging user out...');
      useAuthStore.getState().logout();
    }
    
    // Pass errors down to React Query
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
