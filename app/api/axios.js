// client/src/api/axios.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Your backend URL
});

// This is the new part: an interceptor
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

export default apiClient;