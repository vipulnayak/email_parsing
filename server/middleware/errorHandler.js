const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'IMAPError') {
    return res.status(503).json({
      error: 'Email service unavailable',
      message: err.message
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler; 