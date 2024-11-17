const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');

router.get('/', auth, invoiceController.getInvoices);
router.get('/:id', auth, invoiceController.getInvoiceById);

module.exports = router; 