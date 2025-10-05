import React from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Дашборд', icon: '📊' },
    { id: 'prediction', label: 'Прогнозы', icon: '🔮' },
    { id: 'analysis', label: 'Анализ', icon: '📈' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          🚀 CryptoPredict
        </div>
        <nav className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;