const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  email: {
    host: process.env.EMAIL_HOST || 'imap.gmail.com',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    port: parseInt(process.env.EMAIL_PORT) || 993,
    tls: process.env.EMAIL_TLS === 'true',
    tlsOptions: { 
      rejectUnauthorized: false,
      servername: 'imap.gmail.com'
    },
    authTimeout: 30000,
    connTimeout: 30000,
    debug: console.log,
    mailbox: "INBOX"
  }
}; 