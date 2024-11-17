// src/config/config.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  coinmarketcap: {
    baseUrl: process.env.CMC_API_URL || 'https://pro-api.coinmarketcap.com/v1',
    apiKey: process.env.CMC_API_KEY,
    requestTimeout: 10000,
    updateInterval: 60 * 60 * 1000 // 1 hour
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
};