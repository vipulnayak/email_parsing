import React, { useState, useEffect } from 'react';
import { fetchEmails } from '../api/api';
import EmailList from './EmailList';
import InvoiceList from './InvoiceList';

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('receivedDate:desc');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'invoices'

  useEffect(() => {
    loadEmails();
  }, [page, activeTab]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const data = await fetchEmails(page, 20, search, sortBy, activeTab === 'invoices');
      setEmails(data.emails);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error loading emails:', err);
      setError('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-secondary text-center mb-4">
            Email Invoice System
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Emails
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'invoices'
                    ? 'bg-success text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Invoices Only
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button 
              onClick={loadEmails}
              className="btn btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Total: {emails.length}</span>
              {activeTab === 'all' && (
                <span>Invoices: {emails.filter(email => email.hasInvoice).length}</span>
              )}
            </div>
          </div>
        </header>

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1"
          />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-48"
          >
            <option value="receivedDate:desc">Date (Newest)</option>
            <option value="receivedDate:asc">Date (Oldest)</option>
            <option value="sender:asc">Sender (A-Z)</option>
            {activeTab === 'invoices' && (
              <option value="invoiceAmount:desc">Amount (High to Low)</option>
            )}
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            {activeTab === 'invoices' ? (
              <InvoiceList emails={emails.filter(email => email.hasInvoice)} />
            ) : (
              <EmailList emails={emails} />
            )}
            
            <div className="flex justify-center items-center gap-4 mt-8">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 