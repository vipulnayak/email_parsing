const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.get('/fetch', emailController.fetchEmails);
router.get('/', emailController.getEmails);
router.get('/search', emailController.searchEmails);
router.get('/:id', emailController.getEmailById);

module.exports = router;