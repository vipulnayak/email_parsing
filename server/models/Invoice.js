const mongoose = require('mongoose');

// Flexible schema to handle various types of documents (invoice, receipt, bill, etc.)
const documentSchema = new mongoose.Schema({
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    required: true
  },
  documentType: {
    type: String,
    enum: ['invoice', 'receipt', 'bill', 'statement', 'payment', 'quotation', 'purchase order', 'delivery note', 'other'], // allows for different document types
    required: true
  },
  documentNumber: String,  // Could be invoice number, receipt number, etc.
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  dueDate: Date,  // Optional, as not all documents may have a due date (e.g., receipts)
  issuedDate: {
    type: Date,
    required: true
  },
  vendor: {
    name: String,
    address: String,
    contact: String
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid', 'error'],
    default: 'pending'
  },
  extractedData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed // Stores any kind of data extracted from the document (product details, taxes, dates, etc.)
  },
  originalFiles: [
    {
      filename: String,
      path: String,
      fileType: String // Tracks the file type (pdf, jpg, etc.)
    }
  ],
  processedAt: Date, // Date when the document was processed or verified
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create a model based on the schema
module.exports = mongoose.model('Document', documentSchema);
