import React, { useState, useEffect } from 'react';
import { fetchEmails } from '../api/api';
import EmailList from './EmailList';
import './Dashboard.css';

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadEmails();
  }, [page]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const data = await fetchEmails(page);
      console.log('Fetched emails:', data.emails); // Debug log
      setEmails(data.emails);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error loading emails:', err);
      setError('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadEmails();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div>Loading emails...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Email Inbox</h1>
        <div className="dashboard-actions">
          <button onClick={handleRefresh} className="refresh-button">
            🔄 Refresh
          </button>
          <div className="email-stats">
            <span>Total Emails: {emails.length}</span>
            <span>With Invoices: {emails.filter(email => email.hasInvoice).length}</span>
          </div>
        </div>
      </header>

      <EmailList emails={emails} />

      <div className="pagination">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="page-info">Page {page} of {totalPages}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 