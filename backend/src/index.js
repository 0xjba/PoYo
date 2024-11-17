// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const { captureWebhook } = require('./middleware/webhookMonitor');
const cryptoAnalysisRoutes = require('./routes/cryptoAnalysis');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(captureWebhook); // Add webhook monitoring middleware

// Routes
app.use('/', cryptoAnalysisRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});