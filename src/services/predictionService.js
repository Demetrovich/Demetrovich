const { Matrix } = require('ml-matrix');
const { SimpleLinearRegression } = require('ml-regression');

class PredictionService {
  constructor() {
    this.models = new Map();
    this.featureWeights = {
      rsi: 0.2,
      macd: 0.25,
      sma_ratio: 0.15,
      volume_trend: 0.1,
      price_momentum: 0.2,
      bollinger_position: 0.1
    };
  }

  // Подготовка признаков для машинного обучения
  prepareFeatures(historicalData, indicators) {
    const features = [];
    const targets = [];
    
    const minLength = Math.min(
      historicalData.length,
      indicators.rsi.length,
      indicators.macd.macd.length,
      indicators.sma20.length,
      indicators.sma50.length
    );

    for (let i = 50; i < minLength - 1; i++) {
      const feature = this.extractFeatureVector(historicalData, indicators, i);
      const target = this.calculateTarget(historicalData, i);
      
      if (feature && target !== null) {
        features.push(feature);
        targets.push(target);
      }
    }

    return { features, targets };
  }

  // Извлечение вектора признаков
  extractFeatureVector(data, indicators, index) {
    try {
      const currentPrice = data[index].close;
      const previousPrice = data[index - 1].close;
      
      // RSI нормализация
      const rsi = indicators.rsi[index] || 50;
      const normalizedRSI = (rsi - 50) / 50; // -1 to 1
      
      // MACD сигнал
      const macd = indicators.macd.macd[index] || 0;
      const macdSignal = indicators.macd.signal[index] || 0;
      const macdDiff = macd - macdSignal;
      
      // Отношение скользящих средних
      const sma20 = indicators.sma20[index] || currentPrice;
      const sma50 = indicators.sma50[index] || currentPrice;
      const smaRatio = (sma20 - sma50) / sma50;
      
      // Тренд объема
      const currentVolume = data[index].volume;
      const avgVolume = data.slice(Math.max(0, index - 20), index)
        .reduce((sum, d) => sum + d.volume, 0) / 20;
      const volumeTrend = (currentVolume - avgVolume) / avgVolume;
      
      // Моментум цены
      const priceMomentum = (currentPrice - previousPrice) / previousPrice;
      
      // Позиция в полосах Боллинджера
      const bbUpper = indicators.bollinger.upper[index] || currentPrice;
      const bbLower = indicators.bollinger.lower[index] || currentPrice;
      const bbPosition = (currentPrice - bbLower) / (bbUpper - bbLower);
      
      return [
        normalizedRSI,
        macdDiff,
        smaRatio,
        volumeTrend,
        priceMomentum,
        bbPosition
      ];
    } catch (error) {
      console.error('Ошибка извлечения признаков:', error);
      return null;
    }
  }

  // Расчет целевой переменной (направление движения цены)
  calculateTarget(data, index) {
    const currentPrice = data[index].close;
    const futurePrice = data[index + 1].close;
    
    const priceChange = (futurePrice - currentPrice) / currentPrice;
    
    // Классификация: 1 - рост, 0 - падение, 0.5 - нейтрально
    if (priceChange > 0.02) return 1; // Рост более 2%
    if (priceChange < -0.02) return 0; // Падение более 2%
    return 0.5; // Нейтрально
  }

  // Обучение модели для конкретной криптовалюты
  trainModel(symbol, historicalData, indicators) {
    const { features, targets } = this.prepareFeatures(historicalData, indicators);
    
    if (features.length < 10) {
      throw new Error('Недостаточно данных для обучения модели');
    }

    // Простая линейная регрессия
    const X = new Matrix(features);
    const y = targets;
    
    const model = new SimpleLinearRegression(X.to1DArray(), y);
    
    this.models.set(symbol, {
      model: model,
      features: features,
      targets: targets,
      lastTrained: new Date(),
      accuracy: this.calculateAccuracy(model, features, targets)
    });

    return this.models.get(symbol);
  }

  // Расчет точности модели
  calculateAccuracy(model, features, targets) {
    let correct = 0;
    const threshold = 0.1; // Порог для классификации
    
    for (let i = 0; i < features.length; i++) {
      const prediction = model.predict(features[i]);
      const actual = targets[i];
      
      // Классификация предсказания
      let predictedClass;
      if (prediction > 0.5 + threshold) predictedClass = 1;
      else if (prediction < 0.5 - threshold) predictedClass = 0;
      else predictedClass = 0.5;
      
      if (Math.abs(predictedClass - actual) < 0.1) {
        correct++;
      }
    }
    
    return (correct / features.length) * 100;
  }

  // Прогнозирование для криптовалюты
  predict(symbol, currentData, currentIndicators) {
    const modelData = this.models.get(symbol);
    
    if (!modelData) {
      throw new Error(`Модель для ${symbol} не обучена`);
    }

    const featureVector = this.extractFeatureVector(
      [currentData], 
      currentIndicators, 
      0
    );
    
    if (!featureVector) {
      throw new Error('Не удалось извлечь признаки для прогноза');
    }

    const prediction = modelData.model.predict(featureVector);
    const confidence = this.calculatePredictionConfidence(featureVector, modelData);
    
    return {
      symbol: symbol,
      prediction: prediction,
      confidence: confidence,
      direction: this.interpretPrediction(prediction),
      timestamp: new Date(),
      modelAccuracy: modelData.accuracy
    };
  }

  // Интерпретация предсказания
  interpretPrediction(prediction) {
    if (prediction > 0.6) return 'bullish';
    if (prediction < 0.4) return 'bearish';
    return 'neutral';
  }

  // Расчет уверенности в предсказании
  calculatePredictionConfidence(featureVector, modelData) {
    // Простая эвристика на основе близости к обучающим данным
    const distances = modelData.features.map(features => 
      this.euclideanDistance(featureVector, features)
    );
    
    const minDistance = Math.min(...distances);
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    
    // Нормализация уверенности (0-100)
    const confidence = Math.max(0, Math.min(100, 
      100 - (minDistance / avgDistance) * 50
    ));
    
    return Math.round(confidence);
  }

  // Евклидово расстояние между векторами
  euclideanDistance(vec1, vec2) {
    if (vec1.length !== vec2.length) return Infinity;
    
    const sum = vec1.reduce((acc, val, i) => 
      acc + Math.pow(val - vec2[i], 2), 0
    );
    
    return Math.sqrt(sum);
  }

  // Получение всех обученных моделей
  getModels() {
    const modelsInfo = {};
    
    for (const [symbol, modelData] of this.models) {
      modelsInfo[symbol] = {
        accuracy: modelData.accuracy,
        lastTrained: modelData.lastTrained,
        featuresCount: modelData.features.length
      };
    }
    
    return modelsInfo;
  }

  // Обновление весов признаков
  updateFeatureWeights(newWeights) {
    this.featureWeights = { ...this.featureWeights, ...newWeights };
  }

  // Очистка старых моделей
  cleanupOldModels(maxAge = 24 * 60 * 60 * 1000) { // 24 часа
    const now = new Date();
    
    for (const [symbol, modelData] of this.models) {
      if (now - modelData.lastTrained > maxAge) {
        this.models.delete(symbol);
        console.log(`Удалена устаревшая модель для ${symbol}`);
      }
    }
  }
}

module.exports = new PredictionService();