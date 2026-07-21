import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || '', // Support VITE_API_URL in production, fallback to relative proxied path
});

// Automatically inject JWT session token into requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vigilops_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
