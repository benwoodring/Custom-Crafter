// middleware/errorHandler.js
const logger = require('../utils/logger');

/**
 * Handles errors thrown in the application, sending a standardized JSON response.
 * @param {Error} err - The error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {void} Sends JSON error response
 */
const errorHandler = (err, req, res, _next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  const errorResponse = {
    error: {
      message: err.message || 'Internal server error',
      code: statusCode.toString(), // Convert to string for consistency
    },
  };

  if (err.name === 'ValidationError') {
    errorResponse.error.message = 'Invalid input data';
    errorResponse.error.code = '400';
    errorResponse.error.details = err.errors;
  } else if (err.name === 'MongoError' && err.code === 11000) {
    errorResponse.error.message = 'Duplicate key error';
    errorResponse.error.code = '400';
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
