import React, { useEffect } from 'react';
import './CSS/Dashboard.css';

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, mentorProfile, mentor, isMobile, sidebarCollapsed, setSidebarCollapsed }) => {
  const isVerified = mentor?.details?.is_approved || false;
  const profilePhoto = mentor?.details?.profile_photo || '';

  // Close sidebar on ESC for accessibility
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [sidebarOpen, setSidebarOpen]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  // Calculate total sessions from mentor.meetings if available
  const totalSessions = mentor?.meetings ? mentor.meetings.filter(m => m.status !== 'cancelled').length : (mentorProfile.sessionsCompleted || 0);

  // Backdrop for mobile overlay
  const backdrop = isMobile && sidebarOpen ? (
    <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>
  ) : null;

  return (
    <>
      {backdrop}
      <div className={`sidebar${isMobile ? ' sidebar-mobile' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}> 
        <div className="sidebar-header">
          <h2>AspireX</h2>
          {/* Only show collapse toggle in sidebar on desktop */}
          {!isMobile && (
            <button className="toggle-sidebar" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? '\u25b6' : '\u25c0'}
            </button>
          )}
          {/* Only show open/close toggle in sidebar on mobile */}
          {isMobile && (
            <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? '\u25c0' : '\u25b6'}
            </button>
          )}
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
          </div>
          {(!sidebarCollapsed && sidebarOpen) && (
            <div className="profile-info">
              <h3>{mentor?.name || mentorProfile.name}</h3>
              <p>{mentor?.email || mentorProfile.email}</p>
              <div className="mentor-stats">
                <span>🎯 {totalSessions} sessions</span>
              </div>
            </div>
          )}
        </div>
        {/* Navigation */}
        <nav>
          <ul>
            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              <span>📊</span> {(!sidebarCollapsed && sidebarOpen) && 'Dashboard'}
            </li>
            <li className={activeTab === 'mentees' ? 'active' : ''} onClick={() => setActiveTab('mentees')}>
              <span>👥</span> {(!sidebarCollapsed && sidebarOpen) && 'Mentees'}
            </li>
            <li className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
              <span>✉️</span> {(!sidebarCollapsed && sidebarOpen) && 'Messages'}
            </li>
            <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
              <span>👤</span> {(!sidebarCollapsed && sidebarOpen) && 'Profile'}
            </li>
            <li className={activeTab === 'sessions' ? 'active' : ''} onClick={() => setActiveTab('sessions')}>
              <span>🗓️</span> {(!sidebarCollapsed && sidebarOpen) && 'Sessions'}
            </li>
            <li className={activeTab === 'customerService' ? 'active' : ''} onClick={() => setActiveTab('customerService')}>
              <span>🎧</span> {(!sidebarCollapsed && sidebarOpen) && 'Customer Service'}
            </li>
          </ul>
        </nav>
        {/* Logout */}
        <div className="logout-section">
          <button className="logout-button" onClick={handleLogout}>
            <span>🚪</span> {(!sidebarCollapsed && sidebarOpen) && 'Logout'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;