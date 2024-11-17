// src/middleware/webhookMonitor.js
const webhookHistory = [];
const MAX_HISTORY = 50;

const captureWebhook = (req, res, next) => {
  if (req.path === '/crypto-analysis' && req.method === 'POST') {
    const requestData = {
      timestamp: new Date().toISOString(),
      session_id: req.query.session_id,
      uid: req.query.uid,
      segments: req.body,
      headers: req.headers
    };

    webhookHistory.unshift(requestData);
    if (webhookHistory.length > MAX_HISTORY) {
      webhookHistory.pop();
    }
  }
  next();
};

const getWebhookHistory = () => webhookHistory;
const clearWebhookHistory = () => {
  webhookHistory.length = 0;
};

module.exports = {
  captureWebhook,
  getWebhookHistory,
  clearWebhookHistory
};