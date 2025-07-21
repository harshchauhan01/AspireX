import React, { useState, useEffect } from 'react';
import { earningsService } from '../services/earningsService';
import './CSS/PageStyles.css';

const EarningsPage = () => {
  const [earningsData, setEarningsData] = useState([]);
  const [withdrawalsData, setWithdrawalsData] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalStudents: 0,
    totalEarnings: 0,
    availableBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('earnings'); // 'earnings' or 'withdrawals'
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    count: 0
  });
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState('');

  // Fetch earnings data
  const fetchEarnings = async (filter = timeFilter, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await earningsService.getEarningsPage(page, filter);
      
      setEarningsData(data.earnings);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch earnings data');
      console.error('Error fetching earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch withdrawals data
  const fetchWithdrawals = async () => {
    try {
      setWithdrawalsLoading(true);
      setError(null);
      const data = await earningsService.getWithdrawals();
      setWithdrawalsData(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch withdrawals data');
      console.error('Error fetching withdrawals:', err);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  // Handle time filter change
  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
    fetchEarnings(newFilter, 1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchEarnings(timeFilter, page);
  };

  // Handle withdrawal request
  const handleWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) < 50) {
      setWithdrawalError('Minimum withdrawal amount is ₹50.00');
      return;
    }

    try {
      setWithdrawalLoading(true);
      setWithdrawalError('');
      
      await earningsService.requestWithdrawal(parseFloat(withdrawalAmount));
      
      // Close modal and refresh data
      setShowWithdrawalModal(false);
      setWithdrawalAmount('');
      fetchEarnings(timeFilter, pagination.current_page);
      fetchWithdrawals();
      
      // Show success message (you could add a toast notification here)
      alert('Withdrawal request submitted successfully!');
    } catch (err) {
      setWithdrawalError(err.response?.data?.error || 'Failed to process withdrawal');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Handle export data
  const handleExportData = async () => {
    try {
      const data = await earningsService.exportEarnings(timeFilter);
      if (!data.earnings || !Array.isArray(data.earnings) || data.earnings.length === 0) {
        alert('No earnings data to export for the selected period.');
        return;
      }
      // Create and download CSV file
      const csvContent = generateCSV(data.earnings);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earnings_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    }
  };

  // Generate CSV content
  const generateCSV = (earnings) => {
    const headers = ['Date', 'Source', 'Amount (INR)', 'Status', 'Transaction ID'];
    const rows = earnings.map(earning => [
      earning.date,
      earning.source,
      `₹${earning.amount}`,
      earning.status,
      earning.transaction_id
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  // Load data on component mount
  useEffect(() => {
    fetchEarnings();
    fetchWithdrawals();
  }, []);

  if (loading && earningsData.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading earnings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Earnings</h1>
        <div className="page-actions">
          <button 
            className="secondary-button" 
            onClick={handleExportData}
            disabled={loading}
          >
            Export Data
          </button>
          <button 
            className="primary-button" 
            onClick={() => setShowWithdrawalModal(true)}
            disabled={loading || (stats.availableBalance || 0) < 50}
          >
            Withdraw
          </button>
        </div>
      </header>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchEarnings()}>Retry</button>
        </div>
      )}
      
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
              <p>₹{(stats.totalEarnings || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="balance-card">
          <h3>Available Balance</h3>
          <p className="balance-amount">₹{(stats.availableBalance || 0).toFixed(2)}</p>
          <p className="balance-note">Minimum withdrawal amount is ₹50.00</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            Earnings
          </button>
          <button 
            className={`tab-button ${activeTab === 'withdrawals' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Withdrawal History
          </button>
        </div>

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="table-container">
            <div className="table-header">
              <h3>Recent Earnings</h3>
              <div className="table-actions">
                <select 
                  className="time-filter"
                  value={timeFilter}
                  onChange={(e) => handleTimeFilterChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="all">All time</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="3months">Last 3 months</option>
                </select>
              </div>
            </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading earnings...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="earnings-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Source</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningsData.map((item, index) => (
                      <tr key={item.transaction_id}>
                        <td>{(pagination.current_page - 1) * 10 + index + 1}</td>
                        <td>{item.source}</td>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        <td>₹{(parseFloat(item.amount) || 0).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge status-${item.status}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="table-footer">
                <span>
                  Showing {((pagination.current_page - 1) * 10) + 1} to {Math.min(pagination.current_page * 10, pagination.count)} of {pagination.count} entries
                </span>
                <div className="pagination">
                  <button 
                    disabled={pagination.current_page === 1}
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={pageNum === pagination.current_page ? 'active' : ''}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button 
                    disabled={pagination.current_page === pagination.total_pages}
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="table-container">
            <div className="table-header">
              <h3>Withdrawal History</h3>
            </div>
            
            {withdrawalsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading withdrawals...</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="earnings-table">
                    <thead>
                      <tr>
                        <th>S.No.</th>
                        <th>Amount</th>
                        <th>Request Date</th>
                        <th>Status</th>
                        <th>Payment Method</th>
                        <th>Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawalsData.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="no-data">
                            No withdrawal requests found
                          </td>
                        </tr>
                      ) : (
                        withdrawalsData.map((item, index) => (
                          <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>₹{(parseFloat(item.amount) || 0).toFixed(2)}</td>
                            <td>{new Date(item.request_date).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge status-${item.status}`}>
                                {item.status}
                              </span>
                            </td>
                            <td>{item.payment_method}</td>
                            <td>{item.transaction_id}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request Withdrawal</h3>
              <button 
                className="modal-close"
                onClick={() => setShowWithdrawalModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="withdrawal-amount">Amount (INR)</label>
                <input
                  type="number"
                  id="withdrawal-amount"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  min="50"
                  step="0.01"
                  placeholder="Enter amount (minimum ₹50)"
                />
              </div>
              {withdrawalError && (
                <div className="error-message">
                  <p>{withdrawalError}</p>
                </div>
              )}
              <div className="modal-actions">
                <button 
                  className="secondary-button"
                  onClick={() => setShowWithdrawalModal(false)}
                  disabled={withdrawalLoading}
                >
                  Cancel
                </button>
                <button 
                  className="primary-button"
                  onClick={handleWithdrawal}
                  disabled={withdrawalLoading || !withdrawalAmount || parseFloat(withdrawalAmount) < 50}
                >
                  {withdrawalLoading ? 'Processing...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsPage;