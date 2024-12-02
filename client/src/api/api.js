import { getAuthToken } from '../services/authService';
import { API_URL } from './config';

export const fetchEmails = async (page = 1, limit = 20, search = '', sort = 'receivedDate:desc') => {
  try {
    const token = getAuthToken();
    const response = await fetch(
      `${API_URL}/emails?page=${page}&limit=${limit}&search=${search}&sort=${sort}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}; 