import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (!error.response && error.message === 'Network Error') {
      console.error('Network error - server might be down');
      return Promise.reject({
        message: 'Server is not responding. Please try again later.'
      });
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const fetchEmails = async ({ page = 1, limit = 20, search = '', sort = 'receivedDate:desc' }) => {
  try {
    console.log('Fetching emails...');
    const response = await api.get('/emails', {
      params: { page, limit, search, sort }
    });
    console.log('Emails fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fetch emails error:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export default api; 