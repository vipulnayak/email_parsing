const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password match the environment variables
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      // Generate JWT token
      const token = jwt.sign(
        { email: email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Send success response
      res.json({
        success: true,
        token,
        user: { email }
      });
    } else {
      // Send error for invalid credentials
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
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

module.exports = router; 