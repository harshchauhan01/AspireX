import React from 'react';
import './CSS/PageStyles.css';

const EarningsPage = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Earnings</h1>
        <div className="page-actions">
          <button className="secondary-button">Export</button>
          <button className="primary-button">Withdraw</button>
        </div>
      </header>
      
      <div className="page-content">
        <div className="coming-soon">
          <h2>Earnings Dashboard</h2>
          <p>This section will display your earnings, payment history, and withdrawal options.</p>
          <p>We're working hard to implement all the financial features you need.</p>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;