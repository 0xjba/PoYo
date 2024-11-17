// src/services/cryptoDetectionService.js
const config = require('../config/config');
const logger = require('../utils/logger');
const { tokenListCache } = require('../utils/cache');
const axios = require('axios');

class CryptoDetectionService {
  constructor() {
    this.baseUrl = 'https://pro-api.coinmarketcap.com/v1';
    this.apiKey = process.env.CMC_API_KEY;
    this.topTokens = null;
    this.lastTopTokensUpdate = null;
    this.topTokensUpdateInterval = 15 * 60 * 1000; // 15 minutes
  }

  async updateTopTokens() {
    try {
      // Use cached list if available and fresh
      if (this.topTokens && this.lastTopTokensUpdate && 
          (Date.now() - this.lastTopTokensUpdate) < this.topTokensUpdateInterval) {
        return this.topTokens;
      }

      // Check cache
      const cachedTopTokens = tokenListCache.get('top_tokens');
      if (cachedTopTokens) {
        this.topTokens = cachedTopTokens;
        this.lastTopTokensUpdate = Date.now();
        return this.topTokens;
      }

      logger.info('Fetching top 50 tokens from CoinMarketCap...');
      
      const response = await axios.get(`${this.baseUrl}/cryptocurrency/listings/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          start: 1,
          limit: 50,
          sort: 'market_cap',
          sort_dir: 'desc'
        }
      });

      if (response.status !== 200) {
        throw new Error(`CoinMarketCap API error: ${response.status}`);
      }

      const topTokensData = response.data.data;
      
      // Create an optimized lookup structure for top tokens
      this.topTokens = topTokensData.reduce((acc, token) => {
        const variations = this.generateTokenVariations(token);
        return { ...acc, ...variations };
      }, {});

      // Cache for 15 minutes
      tokenListCache.set('top_tokens', this.topTokens, 900);
      
      this.lastTopTokensUpdate = Date.now();
      logger.info(`Updated top tokens list with ${topTokensData.length} tokens`);
      return this.topTokens;

    } catch (error) {
      logger.error('Error updating top tokens:', error);
      if (this.topTokens) {
        logger.info('Using cached top tokens');
        return this.topTokens;
      }
      throw error;
    }
  }

  generateTokenVariations(token) {
    const variations = {};
    const addVariation = (key, value) => {
      variations[key.toLowerCase()] = {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        slug: token.slug,
        rank: token.cmc_rank
      };
    };

    // Add name variations
    if (token.name) {
      addVariation(token.name, token);
      // Add name without spaces
      addVariation(token.name.replace(/\s+/g, ''), token);
    }
    
    // Add symbol variations
    if (token.symbol) {
      addVariation(token.symbol, token);
      addVariation(`$${token.symbol}`, token);
      addVariation(` ${token.symbol} `, token);
    }

    return variations;
  }

  async detectMentions(text) {
    try {
      // Get and check top tokens only
      const topTokens = await this.updateTopTokens();
      const detectedTokens = new Set();
      
      // Convert text to lowercase for case-insensitive matching
      const lowerText = text.toLowerCase();
      
      // Check for top ranked tokens
      Object.entries(topTokens).forEach(([key, token]) => {
        // Use word boundary check for more accurate matching
        const regex = new RegExp(`\\b${key}\\b`, 'i');
        if (regex.test(lowerText)) {
          detectedTokens.add(token);
        }
      });

      // Convert to array and sort by rank
      const results = Array.from(detectedTokens)
        .sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));

      if (results.length > 0) {
        logger.info('Detected tokens:', {
          text,
          detected: results.map(t => `${t.name} (${t.symbol}) Rank: ${t.rank || 'N/A'}`)
        });
      }

      return results;

    } catch (error) {
      logger.error('Error in detectMentions:', error);
      return [];
    }
  }
}

module.exports = new CryptoDetectionService();