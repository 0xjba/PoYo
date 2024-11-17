// src/services/coinMarketService.js
const axios = require('axios');
const { marketDataCache } = require('../utils/cache');
const logger = require('../utils/logger');
const config = require('../config/config');

class CoinMarketService {
  constructor() {
    this.baseUrl = config.coinmarketcap.baseUrl || 'https://pro-api.coinmarketcap.com/v1';
    this.apiKey = config.coinmarketcap.apiKey || process.env.CMC_API_KEY;
  }

  async getMarketData(coinIds) {
    try {
      if (!Array.isArray(coinIds) || coinIds.length === 0) {
        throw new Error('coinIds must be a non-empty array');
      }

      const coinIdStr = coinIds.join(',');
      logger.info('Fetching market data for coins:', coinIdStr);

      // Check cache first
      const cacheKey = `market_data_${coinIdStr}`;
      const cachedData = marketDataCache.get(cacheKey);
      if (cachedData) {
        logger.info('Returning cached market data');
        return cachedData;
      }

      // Make request to CMC API
      const response = await axios.get(`${this.baseUrl}/cryptocurrency/quotes/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          id: coinIdStr,
          aux: 'num_market_pairs,cmc_rank,date_added,tags,platform,max_supply,circulating_supply,total_supply'
        }
      });

      if (response.status !== 200) {
        throw new Error(`CoinMarketCap API error: ${response.status}`);
      }

      const data = response.data.data;
      logger.info('Raw market data results:', data);

      const formattedData = Object.values(data).map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        slug: coin.slug,
        cmc_rank: coin.cmc_rank,
        num_market_pairs: coin.num_market_pairs,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        platform: coin.platform,
        quote: {
          USD: {
            price: coin.quote.USD.price,
            volume_24h: coin.quote.USD.volume_24h,
            volume_change_24h: coin.quote.USD.volume_change_24h,
            percent_change_1h: coin.quote.USD.percent_change_1h,
            percent_change_24h: coin.quote.USD.percent_change_24h,
            percent_change_7d: coin.quote.USD.percent_change_7d,
            percent_change_30d: coin.quote.USD.percent_change_30d,
            market_cap: coin.quote.USD.market_cap,
            market_cap_dominance: coin.quote.USD.market_cap_dominance,
            fully_diluted_market_cap: coin.quote.USD.fully_diluted_market_cap,
            last_updated: coin.quote.USD.last_updated
          }
        },
        last_updated: coin.last_updated
      }));

      // Cache the formatted data (60 second TTL)
      marketDataCache.set(cacheKey, formattedData, 60);

      return formattedData;

    } catch (error) {
      logger.error('Failed to get market data:', error);
      throw error;
    }
  }
}

module.exports = new CoinMarketService();