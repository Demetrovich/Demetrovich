import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  data: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  symbol: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, symbol }) => {
  // Преобразуем данные для графика
  const chartData = data.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    price: item.close,
    high: item.high,
    low: item.low,
    volume: item.volume
  }));

  return (
    <div className="chart-container">
      <h3 className="chart-title">📈 График цены {symbol}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="#888"
            fontSize={12}
          />
          <YAxis 
            stroke="#888"
            fontSize={12}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#ffffff'
            }}
            formatter={(value: any, name: string) => [
              `$${value.toFixed(2)}`,
              name === 'price' ? 'Цена' : name
            ]}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#00d4ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#00ff88' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;