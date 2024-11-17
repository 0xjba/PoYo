const NodeCache = require('node-cache');

const marketDataCache = new NodeCache({ stdTTL: 300 }); // 5 minute default TTL
const tokenListCache = new NodeCache({ stdTTL: 86400 }); // 24 hour default TTL

module.exports = {
  marketDataCache,
  tokenListCache
};