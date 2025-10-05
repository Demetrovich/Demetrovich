const axios = require('axios');

class CryptoDataService {
  constructor() {
    this.baseURL = 'https://api.binance.com/api/v3';
    this.coinmarketcapURL = 'https://pro-api.coinmarketcap.com/v1';
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 минута
  }

  // Получение исторических данных с Binance
  async getHistoricalData(symbol, interval = '1h', limit = 500) {
    const cacheKey = `historical_${symbol}_${interval}_${limit}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(`${this.baseURL}/klines`, {
        params: {
          symbol: symbol,
          interval: interval,
          limit: limit
        }
      });

      const data = response.data.map(kline => ({
        timestamp: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        closeTime: kline[6],
        quoteVolume: parseFloat(kline[7]),
        trades: kline[8],
        takerBuyBaseVolume: parseFloat(kline[9]),
        takerBuyQuoteVolume: parseFloat(kline[10])
      }));

      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Ошибка получения исторических данных:', error.message);
      throw new Error('Не удалось получить исторические данные');
    }
  }

  // Получение текущих цен
  async getCurrentPrices(symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT']) {
    try {
      const response = await axios.get(`${this.baseURL}/ticker/price`);
      const allPrices = response.data;
      
      return allPrices.filter(price => symbols.includes(price.symbol));
    } catch (error) {
      console.error('Ошибка получения текущих цен:', error.message);
      throw new Error('Не удалось получить текущие цены');
    }
  }

  // Получение информации о криптовалютах
  async getCryptoInfo(symbols = ['BTC', 'ETH', 'ADA', 'DOT']) {
    try {
      const response = await axios.get(`${this.baseURL}/exchangeInfo`);
      const symbolsInfo = response.data.symbols;
      
      return symbolsInfo.filter(info => 
        symbols.some(symbol => info.symbol.includes(symbol))
      );
    } catch (error) {
      console.error('Ошибка получения информации о криптовалютах:', error.message);
      throw new Error('Не удалось получить информацию о криптовалютах');
    }
  }

  // Получение 24-часовой статистики
  async get24hStats(symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'DOTUSDT']) {
    try {
      const response = await axios.get(`${this.baseURL}/ticker/24hr`);
      const allStats = response.data;
      
      return allStats.filter(stat => symbols.includes(stat.symbol));
    } catch (error) {
      console.error('Ошибка получения 24-часовой статистики:', error.message);
      throw new Error('Не удалось получить 24-часовую статистику');
    }
  }

  // Очистка кэша
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new CryptoDataService();