const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  console.error('Error details:', err);
  logger.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication Error',
      details: 'Invalid or missing token'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message || 'Something went wrong'
  });
};

module.exports = errorHandler; 