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
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('receivedDate:desc');
  const navigate = useNavigate();

  const loadEmails = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await fetchEmails({
        page: pageNum,
        limit: 10,
        search: searchQuery,
        sort: sortOption
      });

      if (response.success && response.data) {
        setEmails(prevEmails => {
          if (append) {
            return [...prevEmails, ...response.data.emails];
          }
          return response.data.emails;
        });
        setHasMore(response.data.hasMore);
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
    loadEmails(1, false);
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

  // Load more
  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await loadEmails(nextPage, true);
    }
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

      <EmailList emails={emails} />

      {hasMore && (
        <div className="load-more">
          <button
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {loading && <div className="loading-indicator">Loading...</div>}
    </div>
  );
}

export default Dashboard; 