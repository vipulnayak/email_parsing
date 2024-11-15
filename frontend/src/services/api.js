// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = (username, password) => api.post('/auth/login', { username, password });
export const fetchEmails = (page = 1, limit = 10) => api.get(`/emails?page=${page}&limit=${limit}`);
export const fetchEmailById = (id) => api.get(`/emails/${id}`);
export const triggerEmailFetch = () => api.get('/emails/fetch');
export const searchEmails = (query, page = 1, limit = 10) => api.get(`/emails/search?query=${query}&page=${page}&limit=${limit}`);