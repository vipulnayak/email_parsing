// backend/src/routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // In a real application, you would verify these credentials against a database
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ userId: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.send({ token });
  } else {
    res.status(400).send({ error: 'Invalid credentials' });
  }
});

module.exports = router;