const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', emailController.getEmails);

module.exports = router; 