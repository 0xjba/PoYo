// src/routes/cryptoAnalysis.js
const express = require('express');
const router = express.Router();
const cryptoDetectionService = require('../services/cryptoDetectionService');
const coinMarketService = require('../services/coinMarketService');
const storageService = require('../services/storageService');
const logger = require('../utils/logger');
const config = require('../config/config');

async function analyzeTokenWithAI(tokenData) {
  try {
    // Early return if no API key configured
    if (!process.env.REDPILL_API_KEY) {
      logger.info('Skipping AI analysis - RedPill API key not configured');
      return null;
    }

    const apiKey = process.env.REDPILL_API_KEY;
    const baseUrl = 'https://api.red-pill.ai/v1'; // Hardcoded fallback URL
    
    const formatUSD = (num) => {
      if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
      return `$${num.toFixed(2)}`;
    };

    const prompt = `Analyze this cryptocurrency briefly:
    
    Name: ${tokenData.name} (${tokenData.symbol.toUpperCase()})
    Current Price: ${formatUSD(tokenData.quote.USD.price)}
    Market Cap Rank: #${tokenData.cmc_rank || 'N/A'}
    24h Change: ${tokenData.quote.USD.percent_change_24h?.toFixed(2)}%
    7d Change: ${tokenData.quote.USD.percent_change_7d?.toFixed(2)}%
    Market Dominance: ${tokenData.quote.USD.market_cap_dominance?.toFixed(2)}%
    
    Provide:
    1. A 2-3 line market summary
    2. A score out of 5 based on current market metrics (where 5 is very bullish)
    
    Format response as:
    Summary: [2-3 line summary]
    Score: [X/5]`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "claude-3-5-sonnet-20241022",
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ],
        "temperature": 1
      })
    });

    if (!response.ok) {
      throw new Error(`AI API returned ${response.status}: ${await response.text()}`);
    }

    const aiResponse = await response.json();
    return aiResponse.choices[0].message.content;

  } catch (error) {
    logger.error('Error in AI analysis:', error);
    return null;
  }
}

// In the /crypto-analysis route, update the early returns and response handling:

router.post('/crypto-analysis', async (req, res) => {
  try {
    const { session_id, uid } = req.query;
    const segments = Array.isArray(req.body) ? req.body : (req.body.segments || []);
    
    // Silently complete for empty segments
    if (!segments?.[0]?.text?.trim()) {
      return res.end();
    }

    const fullText = segments.map(segment => segment.text).join(' ');
    const detectedTokens = await cryptoDetectionService.detectMentions(fullText);
    
    // Silently complete if no tokens detected
    if (detectedTokens.length === 0) {
      return res.end();
    }

    const coinIds = detectedTokens.map(token => token.id);
    const marketDataResults = await coinMarketService.getMarketData(coinIds);

    // Process only the first detected token for real-time response
    const primaryToken = detectedTokens[0];
    const marketData = marketDataResults.find(data => data.id === primaryToken.id);
    
    if (!marketData || !process.env.REDPILL_API_KEY) {
      return res.end();
    }

    // Get AI analysis for primary token
    const aiAnalysis = await analyzeTokenWithAI(marketData);

    // Only proceed if we have AI analysis
    if (!aiAnalysis) {
      return res.end();
    }

    // Store the full analysis
    const analysis = {
      coin_id: primaryToken.id,
      name: primaryToken.name,
      symbol: primaryToken.symbol,
      market_data: {
        current_price: marketData.quote.USD.price,
        market_cap: marketData.quote.USD.market_cap,
        volume_24h: marketData.quote.USD.volume_24h,
        volume_change_24h: marketData.quote.USD.volume_change_24h,
        price_change_24h: marketData.quote.USD.percent_change_24h,
        price_change_7d: marketData.quote.USD.percent_change_7d,
        market_cap_rank: marketData.cmc_rank,
        market_cap_dominance: marketData.quote.USD.market_cap_dominance
      },
      detection_context: {
        original_text: fullText,
        matched_term: primaryToken.name,
        confidence: 'high'
      },
      ai_analysis: aiAnalysis,
      timestamp: new Date().toISOString()
    };

    await storageService.saveAnalysis(analysis);

    // Only send notification for successful analysis
    return res.status(200).json({
      status: 'success',
      message: `Analysis for ${primaryToken.name}`,
      app_response: [{
        app_id: "poyo",
        content: {
          token: `${primaryToken.name} (${primaryToken.symbol})`,
          analysis: aiAnalysis
        }
      }]
    });

  } catch (error) {
    logger.error('Analysis Error:', error);
    return res.end();
  }
});

router.get('/analyses', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    logger.info('Fetching analyses', { limit, offset });

    const analysesData = await storageService.getAnalyses(
      parseInt(limit), 
      parseInt(offset)
    );

    return res.json({
      analyses: analysesData.analyses,
      total: analysesData.total,
      lastUpdated: analysesData.lastUpdated
    });
  } catch (error) {
    logger.error('Error fetching analyses:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch analyses',
      message: error.message 
    });
  }
});

router.get('/analyses/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    logger.info('Fetching analysis for token:', tokenId);

    const analysis = await storageService.getAnalysisByTokenId(tokenId);
    if (!analysis) {
      return res.status(404).json({ 
        error: 'Analysis not found',
        message: `No analysis found for token ${tokenId}`
      });
    }

    return res.json(analysis);
  } catch (error) {
    logger.error('Error fetching analysis:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch analysis',
      message: error.message 
    });
  }
});

module.exports = router;