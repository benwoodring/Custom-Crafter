// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

/**
 * Rate-limits API requests to prevent abuse.
 * Limits each IP to 100 requests per 15 minutes.
 * Exceeding the limit triggers an error passed to the error handler.
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res, next) => {
    const error = new Error('Too many requests from this IP, please try again later');
    error.statusCode = 429;
    next(error);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = rateLimiter;
