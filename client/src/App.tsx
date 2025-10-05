import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PredictionPanel from './components/PredictionPanel';
import TechnicalAnalysis from './components/TechnicalAnalysis';
import { CryptoProvider } from './context/CryptoContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <CryptoProvider>
      <div className="App">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="main-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'prediction' && <PredictionPanel />}
          {activeTab === 'analysis' && <TechnicalAnalysis />}
        </main>
      </div>
    </CryptoProvider>
  );
}

export default App;