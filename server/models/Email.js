const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimeType: String,
  isInvoice: { type: Boolean, default: false },
  ocrText: String
});

const emailSchema = new mongoose.Schema({
  subject: {
    type: String,
    default: 'No Subject'
  },
  sender: {
    type: String,
    default: 'Unknown Sender'
  },
  recipient: {
    type: String,
    default: ''
  },
  body: {
    type: String,
    default: ''
  },
  attachments: [attachmentSchema],
  receivedDate: {
    type: Date,
    default: Date.now
  },
  processed: {
    type: Boolean,
    default: false
  },
  messageId: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Index for searching and sorting
emailSchema.index({ subject: 'text', sender: 'text' });
emailSchema.index({ messageId: 1 });
emailSchema.index({ receivedDate: -1 });

module.exports = mongoose.model('Email', emailSchema); 