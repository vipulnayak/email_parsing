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
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
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
    type: Number,
    unique: true
  }
}, {
  timestamps: true
});

// Index for searching
emailSchema.index({ subject: 'text', sender: 'text' });
emailSchema.index({ messageId: 1 });

module.exports = mongoose.model('Email', emailSchema); 