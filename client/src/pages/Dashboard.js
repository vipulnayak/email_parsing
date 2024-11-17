import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailList from '../components/EmailList';
import SearchBar from '../components/SearchBar';
import { fetchEmails } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('receivedDate:desc');
  const navigate = useNavigate();

  const loadEmails = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetchEmails({ 
        page: pageNum, 
        limit: 20,
        search: searchQuery, 
        sort: sortOption 
      });
      
      if (response.success && response.data) {
        setEmails(response.data.emails);
        setTotalPages(response.data.totalPages);
      }
      setError('');
    } catch (error) {
      console.error('Error loading emails:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load emails. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortOption, navigate]);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setPage(1);
    loadEmails(1);
  }, [searchQuery, sortOption, loadEmails, navigate]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Handle sort
  const handleSort = (option) => {
    setSortOption(option);
    setPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadEmails(newPage);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <SearchBar 
          onSearch={handleSearch}
          onSort={handleSort}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-indicator">Loading emails...</div>
      ) : (
        <>
          <EmailList emails={emails} />
          
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            
            <button 
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || loading}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard; 