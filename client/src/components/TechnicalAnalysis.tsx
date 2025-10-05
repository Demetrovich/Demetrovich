import React, { useState, useEffect } from 'react';
import { useCrypto } from '../context/CryptoContext';
import LoadingSpinner from './LoadingSpinner';
import PriceChart from './PriceChart';

interface TechnicalIndicators {
  rsi: number | null;
  macd: {
    macd: number | null;
    signal: number | null;
    histogram: number | null;
  };
  sma20: number | null;
  sma50: number | null;
  currentPrice: number;
}

interface HistoricalData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TrendAnalysis {
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  confidence: number;
}

const TechnicalAnalysis: React.FC = () => {
  const { getTechnicalAnalysis } = useCrypto();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symbols = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'UNI', 'AAVE', 'SOL'];

  const fetchAnalysis = async (symbol: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем технический анализ
      const analysis = await getTechnicalAnalysis(symbol);
      setIndicators(analysis.indicators);
      setTrendAnalysis(analysis.trendAnalysis);
      
      // Получаем исторические данные для графика
      const response = await fetch(`http://localhost:3001/api/crypto/historical/${symbol}?limit=100`);
      const data = await response.json();
      
      if (data.success) {
        setHistoricalData(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки анализа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(selectedSymbol);
  }, [selectedSymbol]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return '🚀';
      case 'bearish': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRSIStatus = (rsi: number | null) => {
    if (rsi === null) return { status: 'Недоступно', color: 'text-gray-400' };
    if (rsi < 30) return { status: 'Перепроданность', color: 'text-green-400' };
    if (rsi > 70) return { status: 'Перекупленность', color: 'text-red-400' };
    return { status: 'Нейтрально', color: 'text-yellow-400' };
  };

  const getMACDStatus = (macd: number | null, signal: number | null) => {
    if (macd === null || signal === null) return { status: 'Недоступно', color: 'text-gray-400' };
    if (macd > signal) return { status: 'Бычий сигнал', color: 'text-green-400' };
    return { status: 'Медвежий сигнал', color: 'text-red-400' };
  };

  const getSMAStatus = (sma20: number | null, sma50: number | null) => {
    if (sma20 === null || sma50 === null) return { status: 'Недоступно', color: 'text-gray-400' };
    if (sma20 > sma50) return { status: 'Восходящий тренд', color: 'text-green-400' };
    return { status: 'Нисходящий тренд', color: 'text-red-400' };
  };

  if (loading && !indicators) {
    return <LoadingSpinner message="Загрузка технического анализа..." />;
  }

  return (
    <div className="technical-analysis">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">📈 Технический анализ</h1>
          <div className="flex gap-2">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="btn btn-secondary"
            >
              {symbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
            <button 
              className="btn btn-primary"
              onClick={() => fetchAnalysis(selectedSymbol)}
              disabled={loading}
            >
              {loading ? 'Обновление...' : 'Обновить'}
            </button>
          </div>
        </div>
        <p>Анализ технических индикаторов и трендов для {selectedSymbol}</p>
      </div>

      {error && (
        <div className="card">
          <div className="status-indicator error">
            {error}
          </div>
        </div>
      )}

      {indicators && trendAnalysis && (
        <>
          {/* График цены */}
          {historicalData.length > 0 && (
            <div className="card">
              <PriceChart data={historicalData} symbol={selectedSymbol} />
            </div>
          )}
          
          <div className="grid grid-2">
            <div className="card">
              <h2 className="card-title">📊 Общий тренд</h2>
              <div className="text-center">
                <div className="text-4xl mb-2">{getTrendIcon(trendAnalysis.trend)}</div>
                <div className={`text-2xl font-bold mb-2 ${getTrendColor(trendAnalysis.trend)}`}>
                  {trendAnalysis.trend === 'bullish' ? 'Бычий тренд' :
                   trendAnalysis.trend === 'bearish' ? 'Медвежий тренд' : 'Нейтральный тренд'}
                </div>
                <div className="grid grid-2 mt-4">
                  <div>
                    <div className="text-sm text-gray-400">Сила тренда</div>
                    <div className="text-xl font-bold">{trendAnalysis.strength}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Уверенность</div>
                    <div className="text-xl font-bold">{trendAnalysis.confidence}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">💰 Текущая цена</h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  ${indicators.currentPrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">{selectedSymbol}/USDT</div>
              </div>
            </div>
          </div>

          <div className="grid grid-3">
            <div className="card">
              <h3 className="card-title">📊 RSI (14)</h3>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {indicators.rsi ? indicators.rsi.toFixed(2) : 'N/A'}
                </div>
                <div className={`text-sm ${getRSIStatus(indicators.rsi).color}`}>
                  {getRSIStatus(indicators.rsi).status}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  RSI показывает перекупленность/перепроданность
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">📈 MACD</h3>
              <div className="text-center">
                <div className="text-lg font-bold mb-1">
                  MACD: {indicators.macd.macd ? indicators.macd.macd.toFixed(4) : 'N/A'}
                </div>
                <div className="text-lg font-bold mb-2">
                  Signal: {indicators.macd.signal ? indicators.macd.signal.toFixed(4) : 'N/A'}
                </div>
                <div className={`text-sm ${getMACDStatus(indicators.macd.macd, indicators.macd.signal).color}`}>
                  {getMACDStatus(indicators.macd.macd, indicators.macd.signal).status}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  MACD показывает импульс тренда
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">📊 Скользящие средние</h3>
              <div className="text-center">
                <div className="text-lg font-bold mb-1">
                  SMA 20: {indicators.sma20 ? indicators.sma20.toFixed(2) : 'N/A'}
                </div>
                <div className="text-lg font-bold mb-2">
                  SMA 50: {indicators.sma50 ? indicators.sma50.toFixed(2) : 'N/A'}
                </div>
                <div className={`text-sm ${getSMAStatus(indicators.sma20, indicators.sma50).color}`}>
                  {getSMAStatus(indicators.sma20, indicators.sma50).status}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Сравнение краткосрочного и долгосрочного трендов
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">📋 Интерпретация индикаторов</h2>
            <div className="grid grid-2">
              <div>
                <h3 className="font-bold mb-2 text-green-400">Бычьи сигналы</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• RSI < 30 (перепроданность)</li>
                  <li>• MACD выше сигнальной линии</li>
                  <li>• SMA 20 > SMA 50</li>
                  <li>• Цена выше полос Боллинджера</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-red-400">Медвежьи сигналы</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• RSI > 70 (перекупленность)</li>
                  <li>• MACD ниже сигнальной линии</li>
                  <li>• SMA 20 < SMA 50</li>
                  <li>• Цена ниже полос Боллинджера</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TechnicalAnalysis;