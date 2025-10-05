import React from 'react';

interface PredictionCardProps {
  prediction: {
    symbol: string;
    prediction: number;
    confidence: number;
    direction: 'bullish' | 'bearish' | 'neutral';
    timestamp: string;
    modelAccuracy: number;
  };
}

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction }) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'bullish': return '🚀';
      case 'bearish': return '📉';
      default: return '➡️';
    }
  };

  const getDirectionText = (direction: string) => {
    switch (direction) {
      case 'bullish': return 'Рост';
      case 'bearish': return 'Падение';
      default: return 'Нейтрально';
    }
  };

  return (
    <div className="prediction-card">
      <div className="prediction-header">
        <div className="prediction-symbol">
          {getDirectionIcon(prediction.direction)} {prediction.symbol}
        </div>
        <div className={`prediction-direction ${prediction.direction}`}>
          {getDirectionText(prediction.direction)}
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
          <div className="prediction-detail-label">Точность модели</div>
          <div className="prediction-detail-value">
            {prediction.modelAccuracy.toFixed(1)}%
          </div>
        </div>
        
        <div className="prediction-detail">
          <div className="prediction-detail-label">Время</div>
          <div className="prediction-detail-value">
            {formatTimestamp(prediction.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;