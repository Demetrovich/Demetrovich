import React, { useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import CryptoCard from './CryptoCard';
import PredictionCard from './PredictionCard';
import LoadingSpinner from './LoadingSpinner';

const Dashboard: React.FC = () => {
  const { cryptoData, predictions, loading, error, fetchCryptoData, fetchPredictions } = useCrypto();

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCryptoData();
      fetchPredictions();
    }, 30000); // Обновляем каждые 30 секунд

    return () => clearInterval(interval);
  }, [fetchCryptoData, fetchPredictions]);

  if (loading && cryptoData.length === 0) {
    return <LoadingSpinner message="Загрузка данных..." />;
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center">
          <h2>Ошибка загрузки данных</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-2"
            onClick={() => {
              fetchCryptoData();
              fetchPredictions();
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">📊 Дашборд криптовалют</h1>
          <div className="status-indicator success">
            <span>🟢</span>
            <span>Активно</span>
          </div>
        </div>
        <p>Мониторинг цен и прогнозов в реальном времени</p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 className="card-title">💰 Текущие цены</h2>
          <div className="grid grid-2">
            {cryptoData.map(crypto => (
              <CryptoCard key={crypto.symbol} crypto={crypto} />
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">🔮 Прогнозы</h2>
          <div className="grid">
            {predictions.length > 0 ? (
              predictions.map(prediction => (
                <PredictionCard key={prediction.symbol} prediction={prediction} />
              ))
            ) : (
              <div className="text-center p-3">
                <p>Нет доступных прогнозов</p>
                <p className="text-sm">Обучите модели для получения прогнозов</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">📈 Статистика</h2>
        <div className="grid grid-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{cryptoData.length}</div>
            <div className="text-sm text-gray-400">Криптовалют</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{predictions.length}</div>
            <div className="text-sm text-gray-400">Прогнозов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {predictions.filter(p => p.direction === 'bullish').length}
            </div>
            <div className="text-sm text-gray-400">Рост</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {predictions.filter(p => p.direction === 'bearish').length}
            </div>
            <div className="text-sm text-gray-400">Падение</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;