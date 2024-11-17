const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    
    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret-key');
    
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: { email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check against environment variables
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      // Create token
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

module.exports = router; 