const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    required: true
  },
  invoiceNumber: String,
  amount: Number,
  currency: String,
  dueDate: Date,
  vendor: String,
  status: {
    type: String,
    enum: ['pending', 'processed', 'error'],
    default: 'pending'
  },
  extractedData: {
    type: Map,
    of: String
  },
  originalFile: {
    filename: String,
    path: String
  },
  processedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema); 