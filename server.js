// server.js
const config = require('./config');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const designRoutes = require('./routes/design');
const { startPolling } = require('./services/pollOrders');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const rateLimiter = require('./middleware/rateLimiter');

/**
 * Initializes and starts the Express server.
 * Sets up middleware, routes, MongoDB connection, and polling.
 */
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: config.jsonLimit }));
app.use(express.urlencoded({ limit: config.urlencodedLimit, extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.allowedOrigins.includes(origin)) {
        callback(null, origin || true); // Allow requests with no origin (e.g., server-to-server) or allowed origins
      } else {
        callback(new Error('Not allowed by CORS')); // Reject unallowed origins
      }
    },
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use('/api', rateLimiter);
app.use('/api', designRoutes);

app.use(errorHandler);

mongoose
  .connect(config.mongoUri)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((err) => logger.error('MongoDB connection error:', err));

startPolling();

app.listen(config.port, () => logger.info(`Server running on port ${config.port}`));
