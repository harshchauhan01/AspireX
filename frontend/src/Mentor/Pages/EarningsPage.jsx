import React from 'react';
import './CSS/PageStyles.css';

const EarningsPage = () => {
  // Sample data for the table
  const earningsData = [
    { id: 1, studentName: 'John Doe', sessionTime: '2023-05-15 14:30', earning: '$25.00' },
    { id: 2, studentName: 'Jane Smith', sessionTime: '2023-05-16 10:15', earning: '$30.00' },
    { id: 3, studentName: 'Robert Johnson', sessionTime: '2023-05-17 16:45', earning: '$20.00' },
    { id: 4, studentName: 'Emily Davis', sessionTime: '2023-05-18 11:00', earning: '$35.00' },
    { id: 5, studentName: 'Michael Wilson', sessionTime: '2023-05-19 13:20', earning: '$28.00' },
  ];

  // Stats data
  const stats = {
    totalSessions: 48,
    totalStudents: 32,
    totalEarnings: '$1,245.50',
    availableBalance: '$845.50'
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Earnings</h1>
        <div className="page-actions">
          <button className="secondary-button">Export Data</button>
          <button className="primary-button">Withdraw</button>
        </div>
      </header>
      
      <div className="page-content">
        {/* Stats Cards Section */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className="stat-info">
              <h3>Total Sessions</h3>
              <p>{stats.totalSessions}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-info">
              <h3>Total Students</h3>
              <p>{stats.totalStudents}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="stat-info">
              <h3>Earnings</h3>
              <p>{stats.totalEarnings}</p>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="balance-card">
          <h3>Available Balance</h3>
          <p className="balance-amount">{stats.availableBalance}</p>
          <p className="balance-note">Minimum withdrawal amount is $50.00</p>
        </div>

        {/* Earnings Table */}
        <div className="table-container">
          <div className="table-header">
            <h3>Recent Earnings</h3>
            <div className="table-actions">
              <select className="time-filter">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>All time</option>
              </select>
            </div>
          </div>
          
          <table className="earnings-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Student Name</th>
                <th>Session Time</th>
                <th>Earning</th>
              </tr>
            </thead>
            <tbody>
              {earningsData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.studentName}</td>
                  <td>{item.sessionTime}</td>
                  <td>{item.earning}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="table-footer">
            <span>Showing 1 to 5 of {earningsData.length} entries</span>
            <div className="pagination">
              <button disabled>Previous</button>
              <button className="active">1</button>
              <button>2</button>
              <button>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;