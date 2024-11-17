const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all emails with pagination
router.get('/', emailController.getEmails);

// Get a single email
router.get('/:id', emailController.getEmail);

// Download attachment
router.get('/attachments/:emailId/:filename', emailController.getAttachment);

module.exports = router; 