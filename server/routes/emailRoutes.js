const express = require('express');
const router = express.Router();
const { 
  getEmails, 
  getEmail, 
  getAttachment, 
  fetchNewEmails 
} = require('../controllers/emailController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all emails with pagination
router.get('/', getEmails);

// Fetch new emails
router.post('/fetch', fetchNewEmails);

// Get a single email
router.get('/:id', getEmail);

// Download attachment
router.get('/attachments/:filename', getAttachment);

module.exports = router; 