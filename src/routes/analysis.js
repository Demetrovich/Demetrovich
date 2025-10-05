const express = require('express');
const router = express.Router();
const technicalAnalysisService = require('../services/technicalAnalysisService');
const cryptoDataService = require('../services/cryptoDataService');

// Получение технических индикаторов
router.get('/indicators/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 500 } = req.query;
    
    // Получаем исторические данные
    const historicalData = await cryptoDataService.getHistoricalData(
      symbol.toUpperCase() + 'USDT',
      interval,
      parseInt(limit)
    );
    
    if (historicalData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Данные не найдены'
      });
    }
    
    // Вычисляем технические индикаторы
    const indicators = technicalAnalysisService.getAllIndicators(historicalData);
    
    // Анализируем тренд
    const trendAnalysis = technicalAnalysisService.analyzeTrend(indicators);
    
    res.json({
      success: true,
      data: {
        symbol: symbol,
        interval: interval,
        indicators: indicators,
        trendAnalysis: trendAnalysis,
        dataPoints: historicalData.length,
        lastUpdate: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Анализ тренда
router.get('/trend/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 200 } = req.query;
    
    const historicalData = await cryptoDataService.getHistoricalData(
      symbol.toUpperCase() + 'USDT',
      interval,
      parseInt(limit)
    );
    
    if (historicalData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Данные не найдены'
      });
    }
    
    const indicators = technicalAnalysisService.getAllIndicators(historicalData);
    const trendAnalysis = technicalAnalysisService.analyzeTrend(indicators);
    
    res.json({
      success: true,
      data: {
        symbol: symbol,
        trend: trendAnalysis.trend,
        strength: trendAnalysis.strength,
        confidence: trendAnalysis.confidence,
        indicators: {
          rsi: indicators.rsi[indicators.rsi.length - 1] || null,
          macd: {
            macd: indicators.macd.macd[indicators.macd.macd.length - 1] || null,
            signal: indicators.macd.signal[indicators.macd.signal.length - 1] || null,
            histogram: indicators.macd.histogram[indicators.macd.histogram.length - 1] || null
          },
          sma20: indicators.sma20[indicators.sma20.length - 1] || null,
          sma50: indicators.sma50[indicators.sma50.length - 1] || null,
          currentPrice: historicalData[historicalData.length - 1].close
        },
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

// Сравнение индикаторов для нескольких криптовалют
router.get('/compare', async (req, res) => {
  try {
    const { symbols = 'BTC,ETH,ADA,DOT', interval = '1h' } = req.query;
    const symbolList = symbols.split(',');
    
    const comparisons = [];
    
    for (const symbol of symbolList) {
      try {
        const historicalData = await cryptoDataService.getHistoricalData(
          symbol.toUpperCase() + 'USDT',
          interval,
          200
        );
        
        if (historicalData.length > 0) {
          const indicators = technicalAnalysisService.getAllIndicators(historicalData);
          const trendAnalysis = technicalAnalysisService.analyzeTrend(indicators);
          
          comparisons.push({
            symbol: symbol,
            trend: trendAnalysis.trend,
            strength: trendAnalysis.strength,
            confidence: trendAnalysis.confidence,
            currentPrice: historicalData[historicalData.length - 1].close,
            rsi: indicators.rsi[indicators.rsi.length - 1] || null,
            sma20: indicators.sma20[indicators.sma20.length - 1] || null,
            sma50: indicators.sma50[indicators.sma50.length - 1] || null
          });
        }
      } catch (error) {
        console.error(`Ошибка анализа ${symbol}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      data: {
        comparisons: comparisons,
        timestamp: new Date(),
        interval: interval
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Получение сигналов покупки/продажи
router.get('/signals/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 100 } = req.query;
    
    const historicalData = await cryptoDataService.getHistoricalData(
      symbol.toUpperCase() + 'USDT',
      interval,
      parseInt(limit)
    );
    
    if (historicalData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Данные не найдены'
      });
    }
    
    const indicators = technicalAnalysisService.getAllIndicators(historicalData);
    const trendAnalysis = technicalAnalysisService.analyzeTrend(indicators);
    
    // Генерация торговых сигналов
    const signals = generateTradingSignals(indicators, trendAnalysis);
    
    res.json({
      success: true,
      data: {
        symbol: symbol,
        signals: signals,
        trendAnalysis: trendAnalysis,
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

// Функция генерации торговых сигналов
function generateTradingSignals(indicators, trendAnalysis) {
  const signals = [];
  
  // RSI сигналы
  if (indicators.rsi.length > 0) {
    const rsi = indicators.rsi[indicators.rsi.length - 1];
    if (rsi < 30) {
      signals.push({
        type: 'BUY',
        indicator: 'RSI',
        strength: 'STRONG',
        message: 'RSI показывает перепроданность',
        value: rsi
      });
    } else if (rsi > 70) {
      signals.push({
        type: 'SELL',
        indicator: 'RSI',
        strength: 'STRONG',
        message: 'RSI показывает перекупленность',
        value: rsi
      });
    }
  }
  
  // MACD сигналы
  if (indicators.macd.macd.length > 0 && indicators.macd.signal.length > 0) {
    const macd = indicators.macd.macd[indicators.macd.macd.length - 1];
    const signal = indicators.macd.signal[indicators.macd.signal.length - 1];
    
    if (macd > signal) {
      signals.push({
        type: 'BUY',
        indicator: 'MACD',
        strength: 'MEDIUM',
        message: 'MACD выше сигнальной линии',
        value: { macd, signal }
      });
    } else {
      signals.push({
        type: 'SELL',
        indicator: 'MACD',
        strength: 'MEDIUM',
        message: 'MACD ниже сигнальной линии',
        value: { macd, signal }
      });
    }
  }
  
  // SMA сигналы
  if (indicators.sma20.length > 0 && indicators.sma50.length > 0) {
    const sma20 = indicators.sma20[indicators.sma20.length - 1];
    const sma50 = indicators.sma50[indicators.sma50.length - 1];
    
    if (sma20 > sma50) {
      signals.push({
        type: 'BUY',
        indicator: 'SMA',
        strength: 'WEAK',
        message: 'Краткосрочная SMA выше долгосрочной',
        value: { sma20, sma50 }
      });
    } else {
      signals.push({
        type: 'SELL',
        indicator: 'SMA',
        strength: 'WEAK',
        message: 'Краткосрочная SMA ниже долгосрочной',
        value: { sma20, sma50 }
      });
    }
  }
  
  return signals;
}

module.exports = router;