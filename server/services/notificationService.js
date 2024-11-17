const Email = require('../models/Email');
const logger = require('../utils/logger');
const WebSocket = require('ws');

class NotificationService {
  constructor() {
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  broadcastNotification(notification) {
    if (global.wss) {
      global.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(notification));
        }
      });
    }
  }

  async notifyInvoiceDetected(email, invoiceDetails) {
    const notification = {
      type: 'INVOICE_DETECTED',
      timestamp: new Date(),
      emailId: email._id,
      subject: email.subject,
      sender: email.sender,
      invoiceDetails
    };

    this.broadcastNotification(notification);
    console.log('Invoice detected:', notification);
  }

  async saveNotification(notification) {
    // Save to database if needed
  }
}

module.exports = new NotificationService(); 