const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.get('/', emailController.getEmailList);
router.get('/:emailId/previews', emailController.getPDFPreviews);
// ... other routes

module.exports = router; 