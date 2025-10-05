import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import LoadingSpinner from './LoadingSpinner';

const PredictionPanel: React.FC = () => {
  const { predictions, loading, error, trainModel, fetchPredictions } = useCrypto();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [trainingStatus, setTrainingStatus] = useState<{ [key: string]: 'idle' | 'training' | 'success' | 'error' }>({});

  const symbols = ['BTC', 'ETH'];

  const handleTrainModel = async (symbol: string) => {
    setTrainingStatus(prev => ({ ...prev, [symbol]: 'training' }));
    try {
      await trainModel(symbol);
      setTrainingStatus(prev => ({ ...prev, [symbol]: 'success' }));
      setTimeout(() => {
        setTrainingStatus(prev => ({ ...prev, [symbol]: 'idle' }));
      }, 3000);
    } catch (err) {
      setTrainingStatus(prev => ({ ...prev, [symbol]: 'error' }));
      setTimeout(() => {
        setTrainingStatus(prev => ({ ...prev, [symbol]: 'idle' }));
      }, 3000);
    }
  };

  const handleRefreshPredictions = async () => {
    await fetchPredictions();
  };

  if (loading && predictions.length === 0) {
    return <LoadingSpinner message="Загрузка прогнозов..." />;
  }

  return (
    <div className="prediction-panel">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">🔮 Прогнозы BTC & ETH</h1>
          <button 
            className="btn btn-primary"
            onClick={handleRefreshPredictions}
            disabled={loading}
          >
            {loading ? 'Обновление...' : 'Обновить'}
          </button>
        </div>
        <p>Обучение моделей и получение прогнозов для Bitcoin и Ethereum</p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 className="card-title">🎯 Обучение моделей</h2>
          <p className="mb-3">Выберите криптовалюту для обучения модели машинного обучения:</p>
          
          <div className="grid grid-2">
            {symbols.map(symbol => (
              <div key={symbol} className="crypto-card">
                <div className="crypto-header">
                  <div className="crypto-symbol">{symbol}</div>
                  <div className={`status-indicator ${
                    trainingStatus[symbol] === 'success' ? 'success' :
                    trainingStatus[symbol] === 'error' ? 'error' :
                    trainingStatus[symbol] === 'training' ? 'warning' : ''
                  }`}>
                    {trainingStatus[symbol] === 'training' && '⏳'}
                    {trainingStatus[symbol] === 'success' && '✅'}
                    {trainingStatus[symbol] === 'error' && '❌'}
                    {trainingStatus[symbol] === 'idle' && '⭕'}
                  </div>
                </div>
                
                <button
                  className={`btn ${
                    trainingStatus[symbol] === 'training' ? 'btn-secondary' : 'btn-primary'
                  } w-full`}
                  onClick={() => handleTrainModel(symbol)}
                  disabled={trainingStatus[symbol] === 'training'}
                >
                  {trainingStatus[symbol] === 'training' ? 'Обучение...' : 'Обучить модель'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">📊 Текущие прогнозы</h2>
          {error && (
            <div className="status-indicator error mb-3">
              {error}
            </div>
          )}
          
          {predictions.length > 0 ? (
            <div className="grid">
              {predictions.map(prediction => (
                <div key={prediction.symbol} className="prediction-card">
                  <div className="prediction-header">
                    <div className="prediction-symbol">
                      {prediction.direction === 'bullish' ? '🚀' : 
                       prediction.direction === 'bearish' ? '📉' : '➡️'} 
                      {prediction.symbol}
                    </div>
                    <div className={`prediction-direction ${prediction.direction}`}>
                      {prediction.direction === 'bullish' ? 'Рост' :
                       prediction.direction === 'bearish' ? 'Падение' : 'Нейтрально'}
                    </div>
                  </div>
                  
                  <div className="prediction-details">
                    <div className="prediction-detail">
                      <div className="prediction-detail-label">Прогноз</div>
                      <div className="prediction-detail-value">
                        {(prediction.prediction * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="prediction-detail">
                      <div className="prediction-detail-label">Уверенность</div>
                      <div className="prediction-detail-value">
                        {prediction.confidence}%
                      </div>
                    </div>
                    
                    <div className="prediction-detail">
                      <div className="prediction-detail-label">Точность</div>
                      <div className="prediction-detail-value">
                        {prediction.modelAccuracy.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="prediction-detail">
                      <div className="prediction-detail-label">Время</div>
                      <div className="prediction-detail-value">
                        {new Date(prediction.timestamp).toLocaleTimeString('ru-RU')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-3">
              <p>Нет обученных моделей</p>
              <p className="text-sm text-gray-400">Обучите модели для получения прогнозов</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">ℹ️ Информация о прогнозах</h2>
        <div className="grid grid-3">
          <div>
            <h3 className="font-bold mb-2">Как работают прогнозы?</h3>
            <p className="text-sm text-gray-400">
              Модели анализируют технические индикаторы (RSI, MACD, скользящие средние) 
              и исторические данные для предсказания направления движения цены.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Точность прогнозов</h3>
            <p className="text-sm text-gray-400">
              Точность зависит от качества данных и рыночных условий. 
              Рекомендуется использовать прогнозы как дополнительный инструмент анализа.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Обновление данных</h3>
            <p className="text-sm text-gray-400">
              Модели автоматически обновляются каждые 30 секунд. 
              Для лучших результатов обучите модели на свежих данных.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionPanel;