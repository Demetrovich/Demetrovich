import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface CryptoData {
  symbol: string;
  price: string;
  change24h: string;
  volume24h: string;
}

interface Prediction {
  symbol: string;
  prediction: number;
  confidence: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  timestamp: string;
  modelAccuracy: number;
}

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

interface TrendAnalysis {
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  confidence: number;
}

interface CryptoContextType {
  cryptoData: CryptoData[];
  predictions: Prediction[];
  loading: boolean;
  error: string | null;
  fetchCryptoData: () => Promise<void>;
  fetchPredictions: () => Promise<void>;
  trainModel: (symbol: string) => Promise<void>;
  getTechnicalAnalysis: (symbol: string) => Promise<{
    indicators: TechnicalIndicators;
    trendAnalysis: TrendAnalysis;
  }>;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};

interface CryptoProviderProps {
  children: ReactNode;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const CryptoProvider: React.FC<CryptoProviderProps> = ({ children }) => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/crypto/prices`);
      
      if (response.data.success) {
        const formattedData = response.data.data.map((crypto: any) => ({
          symbol: crypto.symbol.replace('USDT', ''),
          price: parseFloat(crypto.price).toFixed(2),
          change24h: '0.00', // Will be updated with 24h stats
          volume24h: '0.00'
        }));
        
        setCryptoData(formattedData);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки данных');
      console.error('Error fetching crypto data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/prediction/predict/batch`);
      
      if (response.data.success) {
        setPredictions(response.data.data.predictions);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки прогнозов');
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const trainModel = async (symbol: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/prediction/train/${symbol}`, {
        interval: '1h',
        limit: 1000
      });
      
      if (response.data.success) {
        console.log(`Модель для ${symbol} обучена успешно`);
        // Обновляем прогнозы после обучения
        await fetchPredictions();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка обучения модели');
      console.error('Error training model:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTechnicalAnalysis = async (symbol: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analysis/trend/${symbol}`);
      
      if (response.data.success) {
        return {
          indicators: response.data.data.indicators,
          trendAnalysis: {
            trend: response.data.data.trend,
            strength: response.data.data.strength,
            confidence: response.data.data.confidence
          }
        };
      }
      throw new Error('Не удалось получить технический анализ');
    } catch (err: any) {
      console.error('Error fetching technical analysis:', err);
      throw err;
    }
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchCryptoData();
    fetchPredictions();
  }, []);

  const value: CryptoContextType = {
    cryptoData,
    predictions,
    loading,
    error,
    fetchCryptoData,
    fetchPredictions,
    trainModel,
    getTechnicalAnalysis
  };

  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
};