const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  subject: String,
  sender: String,
  body: String,
  attachments: [{
    filename: String,
    content: Buffer,
    contentType: String
  }],
  ocrText: String,
  isInvoice: Boolean,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Email', emailSchema);