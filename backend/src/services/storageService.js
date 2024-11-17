// src/services/storageService.js
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class StorageService {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.analysesFile = path.join(this.dataDir, 'analyses.json');
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // Ensure data directory exists
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Check if analyses file exists, create if it doesn't
      try {
        await fs.access(this.analysesFile);
      } catch {
        await fs.writeFile(this.analysesFile, JSON.stringify([]));
      }
      
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  async saveAnalysis(analysis) {
    try {
      await this.init();
      
      // Read current analyses
      let analyses = [];
      try {
        const data = await fs.readFile(this.analysesFile, 'utf8');
        analyses = JSON.parse(data);
      } catch (error) {
        logger.warn('Could not read existing analyses, starting fresh:', error);
      }

      // Add new analysis
      analyses.push({
        ...analysis,
        timestamp: new Date().toISOString()
      });

      // Keep only last 1000 analyses
      if (analyses.length > 1000) {
        analyses = analyses.slice(-1000);
      }

      // Save back to file
      await fs.writeFile(this.analysesFile, JSON.stringify(analyses, null, 2));
      
      return analysis;
    } catch (error) {
      logger.error('Failed to save analysis:', error);
      throw error;
    }
  }

  async getAnalyses(limit = 50, offset = 0) {
    try {
      await this.init();
      
      const data = await fs.readFile(this.analysesFile, 'utf8');
      const analyses = JSON.parse(data);
      
      return {
        analyses: analyses.slice(offset, offset + limit),
        total: analyses.length,
        lastUpdated: analyses[analyses.length - 1]?.timestamp || null
      };
    } catch (error) {
      logger.error('Failed to get analyses:', error);
      return {
        analyses: [],
        total: 0,
        lastUpdated: null
      };
    }
  }

  async getAnalysisByTokenId(tokenId) {
    try {
      await this.init();
      
      const data = await fs.readFile(this.analysesFile, 'utf8');
      const analyses = JSON.parse(data);
      
      return analyses.find(a => a.coin_id === tokenId) || null;
    } catch (error) {
      logger.error(`Failed to get analysis for token ${tokenId}:`, error);
      return null;
    }
  }
}

module.exports = new StorageService();