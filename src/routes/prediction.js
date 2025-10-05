const express = require('express');
const router = express.Router();
const predictionService = require('../services/predictionService');
const technicalAnalysisService = require('../services/technicalAnalysisService');
const cryptoDataService = require('../services/cryptoDataService');

// Обучение модели для криптовалюты
router.post('/train/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 1000 } = req.body;
    
    // Получаем исторические данные
    const historicalData = await cryptoDataService.getHistoricalData(
      symbol.toUpperCase() + 'USDT',
      interval,
      limit
    );
    
    if (historicalData.length < 100) {
      return res.status(400).json({
        success: false,
        error: 'Недостаточно данных для обучения (минимум 100 точек)'
      });
    }
    
    // Вычисляем технические индикаторы
    const indicators = technicalAnalysisService.getAllIndicators(historicalData);
    
    // Обучаем модель
    const model = predictionService.trainModel(symbol, historicalData, indicators);
    
    res.json({
      success: true,
      data: {
        symbol: symbol,
        accuracy: model.accuracy,
        featuresCount: model.features.length,
        lastTrained: model.lastTrained,
        message: 'Модель успешно обучена'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Получение прогноза
router.get('/predict/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h' } = req.query;
    
    // Получаем последние данные
    const historicalData = await cryptoDataService.getHistoricalData(
      symbol.toUpperCase() + 'USDT',
      interval,
      100
    );
    
    if (historicalData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Данные не найдены'
      });
    }
    
    // Вычисляем индикаторы
    const indicators = technicalAnalysisService.getAllIndicators(historicalData);
    
    // Получаем последние данные для прогноза
    const currentData = historicalData[historicalData.length - 1];
    
    // Делаем прогноз
    const prediction = predictionService.predict(symbol, currentData, indicators);
    
    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Массовое прогнозирование для нескольких криптовалют
router.get('/predict/batch', async (req, res) => {
  try {
    const { symbols = 'BTC,ETH,ADA,DOT', interval = '1h' } = req.query;
    const symbolList = symbols.split(',');
    
    const predictions = [];
    
    for (const symbol of symbolList) {
      try {
        const historicalData = await cryptoDataService.getHistoricalData(
          symbol.toUpperCase() + 'USDT',
          interval,
          100
        );
        
        if (historicalData.length > 0) {
          const indicators = technicalAnalysisService.getAllIndicators(historicalData);
          const currentData = historicalData[historicalData.length - 1];
          
          const prediction = predictionService.predict(symbol, currentData, indicators);
          predictions.push(prediction);
        }
      } catch (error) {
        console.error(`Ошибка прогнозирования ${symbol}:`, error.message);
        predictions.push({
          symbol: symbol,
          error: error.message,
          prediction: null
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        predictions: predictions,
        timestamp: new Date(),
        count: predictions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Получение информации о моделях
router.get('/models', (req, res) => {
  try {
    const models = predictionService.getModels();
    
    res.json({
      success: true,
      data: {
        models: models,
        count: Object.keys(models).length,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Обновление весов признаков
router.put('/weights', (req, res) => {
  try {
    const { weights } = req.body;
    
    if (!weights || typeof weights !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Неверный формат весов'
      });
    }
    
    predictionService.updateFeatureWeights(weights);
    
    res.json({
      success: true,
      message: 'Веса признаков обновлены',
      weights: weights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Очистка старых моделей
router.post('/cleanup', (req, res) => {
  try {
    const { maxAge = 24 } = req.body; // в часах
    
    predictionService.cleanupOldModels(maxAge * 60 * 60 * 1000);
    
    res.json({
      success: true,
      message: `Очищены модели старше ${maxAge} часов`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Получение статистики прогнозов
router.get('/stats', async (req, res) => {
  try {
    const models = predictionService.getModels();
    const modelStats = Object.values(models);
    
    const stats = {
      totalModels: modelStats.length,
      averageAccuracy: modelStats.length > 0 
        ? modelStats.reduce((sum, model) => sum + model.accuracy, 0) / modelStats.length 
        : 0,
      totalFeatures: modelStats.reduce((sum, model) => sum + model.featuresCount, 0),
      oldestModel: modelStats.length > 0 
        ? new Date(Math.min(...modelStats.map(m => new Date(m.lastTrained))))
        : null,
      newestModel: modelStats.length > 0 
        ? new Date(Math.max(...modelStats.map(m => new Date(m.lastTrained))))
        : null
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;