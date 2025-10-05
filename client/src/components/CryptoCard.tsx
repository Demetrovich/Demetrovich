import React from 'react';

interface CryptoCardProps {
  crypto: {
    symbol: string;
    price: string;
    change24h: string;
    volume24h: string;
  };
}

const CryptoCard: React.FC<CryptoCardProps> = ({ crypto }) => {
  const changeValue = parseFloat(crypto.change24h);
  const isPositive = changeValue > 0;
  const isNegative = changeValue < 0;

  return (
    <div className="crypto-card">
      <div className="crypto-header">
        <div className="crypto-symbol">{crypto.symbol}</div>
        <div className="crypto-price">${crypto.price}</div>
      </div>
      
      <div className="price-change">
        <span className={`price-change ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}>
          {isPositive ? '↗' : isNegative ? '↘' : '→'} {crypto.change24h}%
        </span>
      </div>
      
      <div className="mt-2 text-sm text-gray-400">
        Объем: ${parseFloat(crypto.volume24h).toLocaleString()}
      </div>
    </div>
  );
};

export default CryptoCard;