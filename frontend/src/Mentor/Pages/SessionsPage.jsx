import React, { useState } from 'react';
import './CSS/PageStyles.css';
import './CSS/Sessions.css';

const SessionsPage = ({ sessions = [] }) => {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [showFilters, setShowFilters] = useState(false);

  // Categorize sessions based on status
  const categorizedSessions = sessions.reduce((acc, session) => {

    if (session.status === 'scheduled') {
      acc.scheduled.push(session);
    } else if (session.status === 'ongoing' || session.status === 'missed') {
      acc.pending.push(session);
    } else if (session.status === 'completed') {
      acc.completed.push(session);
    }
    return acc;
  }, { scheduled: [], pending: [], completed: [] });
  
  

  // Format session data for display
  const formatSession = (session) => {
    const dateObj = new Date(session.scheduled_time);
    const date = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const time = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Extract avatar initials with null check
    let studentName = '';
    if (session.student) {
      studentName = session.student.split(' - ')[1] || session.student;
    } else {
      studentName = 'Unknown';
    }
    const avatar = studentName.split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();

    return {
      ...session,
      displayDate: date,
      displayTime: `${time} (${session.duration} mins)`,
      menteeAvatar: avatar.slice(0, 2),
      menteeName: studentName
    };
  };

  const renderSessionActions = (session) => {
    switch (session.status) {
      case 'scheduled':
        return (
          <div className="session-actions">
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button small"
            >
              Join Session
            </a>
            <button className="secondary-button small">Reschedule</button>
          </div>
        );
      case 'ongoing':
        return (
          <div className="session-actions">
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button small"
            >
              Join Now
            </a>
            <button className="secondary-button small">Cancel</button>
          </div>
        );
      case 'missed':
        return (
          <div className="session-actions">
            <button className="primary-button small">Reschedule</button>
            <button className="secondary-button small">Mark Completed</button>
          </div>
        );
      case 'completed':
        return (
          <div className="session-feedback">
            {session.notes && (
              <>
                <div className="rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < (session.rating || 0) ? 'filled' : ''}>★</span>
                  ))}
                </div>
                <p className="feedback-text">{session.notes}</p>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container sessions-page">
      <header className="page-header">
        <h1>Sessions</h1>
        <div className="page-actions">
          <button
            className={`filter-button ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {showFilters ? '▲' : '▼'}
          </button>
          <button className="primary-button">+ New Session</button>
        </div>
      </header>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-inputs">
              <input type="date" placeholder="From" />
              <input type="date" placeholder="To" />
            </div>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select>
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="missed">Missed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Student</label>
            <input type="text" placeholder="Filter by student" />
          </div>
          <div className="filter-actions">
            <button className="secondary-button">Reset</button>
            <button className="primary-button">Apply</button>
          </div>
        </div>
      )}

      <div className="sessions-tabs">
        <button
          className={activeTab === 'scheduled' ? 'active' : ''}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled ({categorizedSessions.scheduled.length})
        </button>
        <button
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({categorizedSessions.pending.length})
        </button>
        <button
          className={activeTab === 'completed' ? 'active' : ''}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({categorizedSessions.completed.length})
        </button>
      </div>

      <div className="sessions-list">
        {categorizedSessions[activeTab].length > 0 ? (
          categorizedSessions[activeTab].map(session => {
            const formattedSession = formatSession(session);
            return (
              <div key={session.meeting_id} className="session-card">
                <div className="session-info">
                  <div className="mentee-avatar">
                    {formattedSession.menteeAvatar}
                  </div>
                  <div className="session-details">
                    <h3>{session.title}</h3>
                    <p>With {formattedSession.menteeName}</p>
                    <div className="session-time">
                      <span>{formattedSession.displayDate}</span>
                      <span>{formattedSession.displayTime}</span>
                    </div>
                    {session.description && (
                      <p className="session-description">{session.description}</p>
                    )}
                  </div>
                </div>
                {renderSessionActions(session)}
              </div>
            );
          })
        ) : (
          <div className="no-sessions">
            <p>No {activeTab} sessions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;