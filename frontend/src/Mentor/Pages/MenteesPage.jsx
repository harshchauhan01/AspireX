import React from 'react';
import './CSS/PageStyles.css';

const MenteesPage = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Mentees</h1>
        <div className="page-actions">
          <button className="primary-button">Add New Mentee</button>
        </div>
      </header>
      
      <div className="page-content">
        <div className="coming-soon">
          <h2>Mentees Management</h2>
          <p>This page is under development and will be available soon.</p>
          <p>Here you'll be able to manage all your mentees, track their progress, and schedule sessions.</p>
        </div>
      </div>
    </div>
  );
};

export default MenteesPage;