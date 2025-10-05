const express = require('express');
const router = express.Router();
const cryptoDataService = require('../services/cryptoDataService');

// Получение исторических данных
router.get('/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 500 } = req.query;
    
    const data = await cryptoDataService.getHistoricalData(
      symbol.toUpperCase() + 'USDT', 
      interval, 
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: data,
      symbol: symbol,
      interval: interval,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Получение текущих цен
router.get('/prices', async (req, res) => {
  try {
    const { symbols } = req.query;
    const symbolList = symbols ? symbols.split(',') : ['BTCUSDT', 'ETHUSDT'];
    
    const prices = await cryptoDataService.getCurrentPrices(symbolList);
    
    res.json({
      success: true,
      data: prices,
      count: prices.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Получение 24-часовой статистики
router.get('/stats/24h', async (req, res) => {
  try {
    const { symbols } = req.query;
    const symbolList = symbols ? symbols.split(',') : ['BTCUSDT', 'ETHUSDT'];
    
    const stats = await cryptoDataService.get24hStats(symbolList);
    
    res.json({
      success: true,
      data: stats,
      count: stats.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Получение информации о криптовалютах
router.get('/info', async (req, res) => {
  try {
    const { symbols } = req.query;
    const symbolList = symbols ? symbols.split(',') : ['BTC', 'ETH'];
    
    const info = await cryptoDataService.getCryptoInfo(symbolList);
    
    res.json({
      success: true,
      data: info,
      count: info.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Очистка кэша
router.post('/cache/clear', (req, res) => {
  try {
    cryptoDataService.clearCache();
    res.json({
      success: true,
      message: 'Кэш очищен'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;