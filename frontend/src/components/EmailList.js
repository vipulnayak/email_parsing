// src/components/EmailList.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchEmails, searchEmails } from '../services/api';

const EmailList = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const fetchEmailsData = useCallback(async (page) => {
    try {
      setLoading(true);
      const response = searchQuery
        ? await searchEmails(searchQuery, page)
        : await fetchEmails(page);
      setEmails(response.data.emails);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch emails');
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchEmailsData(currentPage);
  }, [currentPage, fetchEmailsData]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmailsData(1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8"
    >
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <motion.h1 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
            className="text-4xl font-bold text-center mb-8 text-gray-800"
          >
            Email Inbox
          </motion.h1>
          
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-full border-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors duration-300"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>

          {loading ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-t-4 border-purple-500 border-solid rounded-full mx-auto"
            />
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center p-4"
            >
              {error}
            </motion.div>
          ) : (
            <AnimatePresence>
              {emails.map((email, index) => (
                <motion.div
                  key={email._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-4 bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <button
                    onClick={() => setSelectedEmail(email)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">
                        {email.sender || 'Unknown Sender'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(email.receivedDate)}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {email.subject || 'No Subject'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {email.body || 'No content'}
                    </p>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {emails.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-gray-500"
            >
              No emails found
            </motion.div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEmail(null)}
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <div className="text-xl font-bold text-gray-800 mb-2">{selectedEmail.subject}</div>
                <div className="text-sm text-gray-600">From: {selectedEmail.sender || 'Unknown'}</div>
                <div className="text-sm text-gray-600">
                  Sent: {formatDate(selectedEmail.receivedDate)}
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{selectedEmail.body}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmailList;