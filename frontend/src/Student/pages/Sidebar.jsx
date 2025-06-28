import React from 'react';
import './CSS/Dashboard.css';

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, mentorProfile, mentor }) => {
  const isVerified = mentor?.details?.is_approved || false;
  const profilePhoto = mentor?.details?.profile_photo || '';
  // console.log(profilePhoto);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>AspireX</h2>
        <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>
      
      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-photo-container">
          {profilePhoto ? (
            <img 
              src={`http://127.0.0.1:8000${profilePhoto}`} 
              alt="Profile" 
              className="profile-photo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : <div className="profile-photo">
            {mentor?.name.split(' ').map(n => n[0]).join('') || mentorProfile.name.split(' ').map(n => n[0]).join('')}
          </div>}
          
          {/* <div className={`verification-badge ${isVerified ? 'verified' : 'not-verified'}`}>
            {isVerified ? '✓' : '✗'}
          </div> */}
        </div>
        {sidebarOpen && (
          <div className="profile-info">
            <h3>{mentor?.name || mentorProfile.name}</h3>
            <p>{mentor?.email || mentorProfile.email}</p>
            <div className="mentor-stats">
              <span>🎯 {mentor?.details?.total_sessions || mentorProfile.sessionsCompleted} sessions</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <span>📊</span> {sidebarOpen && 'Dashboard'}
          </li>
          <li className={activeTab === 'mentees' ? 'active' : ''} onClick={() => setActiveTab('mentees')}>
            <span>👥</span> {sidebarOpen && 'Mentees'}
          </li>
          <li className={activeTab === 'earning' ? 'active' : ''} onClick={() => setActiveTab('earning')}>
            <span>💰</span> {sidebarOpen && 'Earnings'}
          </li>
          <li className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
            <span>✉️</span> {sidebarOpen && 'Messages'}
          </li>
          <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            <span>👤</span> {sidebarOpen && 'Profile'}
          </li>
          <li className={activeTab === 'sessions' ? 'active' : ''} onClick={() => setActiveTab('sessions')}>
            <span>🗓️</span> {sidebarOpen && 'Sessions'}
          </li>
        </ul>
      </nav>
      
      {/* Logout */}
      <div className="logout-section">
        <button className="logout-button" onClick={handleLogout}>
          <span>🚪</span> {sidebarOpen && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;