import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Загрузка...' }) => {
  return (
    <div className="loading">
      <div className="text-center">
        <div className="spinner"></div>
        <p className="mt-2">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;