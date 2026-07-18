import axios from 'axios';

const api = axios.create({
  baseURL: '', // Proxied automatically via Vite server config
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
