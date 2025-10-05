class TechnicalAnalysisService {
  constructor() {
    this.indicators = {};
  }

  // Простое скользящее среднее (SMA)
  calculateSMA(prices, period) {
    if (prices.length < period) return [];
    
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  // Экспоненциальное скользящее среднее (EMA)
  calculateEMA(prices, period) {
    if (prices.length < period) return [];
    
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    // Первое значение - простое среднее
    const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(firstSMA);
    
    for (let i = period; i < prices.length; i++) {
      const currentEMA = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
      ema.push(currentEMA);
    }
    
    return ema;
  }

  // RSI (Relative Strength Index)
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return [];
    
    const gains = [];
    const losses = [];
    
    // Вычисляем изменения цен
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const rsi = [];
    
    // Первое значение RSI
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      
      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(rsiValue);
    }
    
    return rsi;
  }

  // MACD (Moving Average Convergence Divergence)
  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    if (fastEMA.length === 0 || slowEMA.length === 0) return { macd: [], signal: [], histogram: [] };
    
    const macd = [];
    const minLength = Math.min(fastEMA.length, slowEMA.length);
    
    for (let i = 0; i < minLength; i++) {
      const fastIndex = fastEMA.length - minLength + i;
      const slowIndex = slowEMA.length - minLength + i;
      macd.push(fastEMA[fastIndex] - slowEMA[slowIndex]);
    }
    
    const signal = this.calculateEMA(macd, signalPeriod);
    const histogram = [];
    
    for (let i = 0; i < Math.min(macd.length, signal.length); i++) {
      histogram.push(macd[i] - signal[i]);
    }
    
    return { macd, signal, histogram };
  }

  // Bollinger Bands
  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    const sma = this.calculateSMA(prices, period);
    const bands = { upper: [], middle: [], lower: [] };
    
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      bands.upper.push(mean + (stdDev * standardDeviation));
      bands.middle.push(mean);
      bands.lower.push(mean - (stdDev * standardDeviation));
    }
    
    return bands;
  }

  // Stochastic Oscillator
  calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
    if (highs.length < kPeriod || lows.length < kPeriod || closes.length < kPeriod) {
      return { k: [], d: [] };
    }
    
    const k = [];
    
    for (let i = kPeriod - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
      const currentClose = closes[i];
      
      const kValue = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      k.push(kValue);
    }
    
    const d = this.calculateSMA(k, dPeriod);
    
    return { k, d };
  }

  // Williams %R
  calculateWilliamsR(highs, lows, closes, period = 14) {
    if (highs.length < period || lows.length < period || closes.length < period) {
      return [];
    }
    
    const williamsR = [];
    
    for (let i = period - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - period + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - period + 1, i + 1));
      const currentClose = closes[i];
      
      const wr = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
      williamsR.push(wr);
    }
    
    return williamsR;
  }

  // Получение всех технических индикаторов для данных
  getAllIndicators(data) {
    const closes = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const volumes = data.map(d => d.volume);
    
    return {
      sma20: this.calculateSMA(closes, 20),
      sma50: this.calculateSMA(closes, 50),
      ema12: this.calculateEMA(closes, 12),
      ema26: this.calculateEMA(closes, 26),
      rsi: this.calculateRSI(closes, 14),
      macd: this.calculateMACD(closes),
      bollinger: this.calculateBollingerBands(closes, 20, 2),
      stochastic: this.calculateStochastic(highs, lows, closes),
      williamsR: this.calculateWilliamsR(highs, lows, closes),
      volume: volumes
    };
  }

  // Анализ тренда на основе индикаторов
  analyzeTrend(indicators) {
    const signals = {
      trend: 'neutral', // bullish, bearish, neutral
      strength: 0, // 0-100
      confidence: 0 // 0-100
    };

    let bullishSignals = 0;
    let bearishSignals = 0;
    let totalSignals = 0;

    // Анализ скользящих средних
    if (indicators.sma20.length > 0 && indicators.sma50.length > 0) {
      const sma20Last = indicators.sma20[indicators.sma20.length - 1];
      const sma50Last = indicators.sma50[indicators.sma50.length - 1];
      
      if (sma20Last > sma50Last) {
        bullishSignals += 2;
      } else {
        bearishSignals += 2;
      }
      totalSignals += 2;
    }

    // Анализ RSI
    if (indicators.rsi.length > 0) {
      const rsiLast = indicators.rsi[indicators.rsi.length - 1];
      
      if (rsiLast < 30) {
        bullishSignals += 1; // Oversold
      } else if (rsiLast > 70) {
        bearishSignals += 1; // Overbought
      }
      totalSignals += 1;
    }

    // Анализ MACD
    if (indicators.macd.macd.length > 0 && indicators.macd.signal.length > 0) {
      const macdLast = indicators.macd.macd[indicators.macd.macd.length - 1];
      const signalLast = indicators.macd.signal[indicators.macd.signal.length - 1];
      
      if (macdLast > signalLast) {
        bullishSignals += 1;
      } else {
        bearishSignals += 1;
      }
      totalSignals += 1;
    }

    // Определение тренда
    if (totalSignals > 0) {
      const bullishRatio = bullishSignals / totalSignals;
      
      if (bullishRatio > 0.6) {
        signals.trend = 'bullish';
        signals.strength = Math.round(bullishRatio * 100);
      } else if (bullishRatio < 0.4) {
        signals.trend = 'bearish';
        signals.strength = Math.round((1 - bullishRatio) * 100);
      } else {
        signals.trend = 'neutral';
        signals.strength = 50;
      }
      
      signals.confidence = Math.round((Math.abs(bullishRatio - 0.5) * 2) * 100);
    }

    return signals;
  }
}

module.exports = new TechnicalAnalysisService();