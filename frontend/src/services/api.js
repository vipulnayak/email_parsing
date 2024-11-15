import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const fetchEmails = () => api.get('/emails');
export const fetchEmailById = (id) => api.get(`/emails/${id}`);
export const triggerEmailFetch = () => api.get('/emails/fetch');