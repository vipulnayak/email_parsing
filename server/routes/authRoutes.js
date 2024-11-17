const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email verification token storage (in production, use Redis or database)
const verificationTokens = new Map();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Login route with email verification
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      verificationTokens.set(email, {
        token: verificationToken,
        timestamp: Date.now()
      });

      // Send verification email
      const verificationLink = `http://localhost:3000/verify?token=${verificationToken}&email=${email}`;
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Login Verification',
        html: `
          <h2>Verify Your Login</h2>
          <p>Click the link below to complete your login:</p>
          <a href="${verificationLink}">${verificationLink}</a>
          <p>This link will expire in 10 minutes.</p>
        `
      });

      res.json({
        success: true,
        message: 'Verification email sent',
        requiresVerification: true
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Verify email token
router.post('/verify', (req, res) => {
  const { token, email } = req.body;
  const storedData = verificationTokens.get(email);

  if (!storedData) {
    return res.status(400).json({ message: 'Invalid verification request' });
  }

  if (Date.now() - storedData.timestamp > 600000) { // 10 minutes expiry
    verificationTokens.delete(email);
    return res.status(400).json({ message: 'Verification link expired' });
  }

  if (token === storedData.token) {
    verificationTokens.delete(email);
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: jwtToken,
      user: { email }
    });
  } else {
    res.status(400).json({ message: 'Invalid verification token' });
  }
});

module.exports = router; 