const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimeType: String,
  isInvoice: { type: Boolean, default: false },
  invoiceDetails: {
    amount: String,
    dueDate: String
  }
});

const emailSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    required: true
  },
  subject: String,
  sender: String,
  recipient: String,
  body: String,
  receivedDate: Date,
  hasInvoice: Boolean,
  invoiceDetails: {
    amount: String,
    dueDate: String
  },
  attachments: [attachmentSchema],
  processed: {
    type: Boolean,
    default: false
  },
  invoiceSource: {
    type: String,
    enum: ['body', 'attachment', null],
    default: null
  }
}, {
  timestamps: true
});

// Index for searching and sorting
emailSchema.index({ subject: 'text', sender: 'text' });
emailSchema.index({ messageId: 1 });
emailSchema.index({ receivedDate: -1 });

module.exports = mongoose.model('Email', emailSchema); 