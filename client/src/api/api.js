import { getAuthToken } from '../services/authService';

const API_URL = 'http://localhost:5000/api';

export const fetchEmails = async (page = 1, limit = 20, search = '', sort = 'receivedDate:desc') => {
  try {
    const token = getAuthToken();
    const response = await fetch(
      `${API_URL}/emails?page=${page}&limit=${limit}&search=${search}&sort=${sort}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }

    const data = await response.json();
    console.log('Emails fetched:', data);
    return data;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}; 