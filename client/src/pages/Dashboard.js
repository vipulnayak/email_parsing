import React, { useState, useEffect } from 'react';
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

  const loadEmails = async () => {
    try {
      setLoading(true);
      const response = await fetchEmails({ 
        page, 
        search: searchQuery, 
        sort: sortOption 
      });
      
      if (response.success && response.data) {
        setEmails(prevEmails => {
          if (page === 1) {
            return response.data.emails;
          }
          return [...prevEmails, ...response.data.emails];
        });
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
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setPage(1);
    loadEmails();
  }, [searchQuery, sortOption, navigate]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <SearchBar 
          onSearch={setSearchQuery}
          onSort={setSortOption}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {loading && page === 1 ? (
        <div className="loading">Loading emails...</div>
      ) : (
        <>
          <EmailList emails={emails} />
          {page < totalPages && (
            <div className="load-more">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard; 