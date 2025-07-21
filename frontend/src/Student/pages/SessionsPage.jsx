import React, { useState, useEffect } from 'react';
import './CSS/PageStyles.css';
import './CSS/Sessions.css';
import FeedbackModal from '../components/FeedbackModal';
import API from '../../BackendConn/api';
import { postMeetingAttendance, fetchMeetingAttendance } from '../../BackendConn/api';

const SessionsPage = ({ sessions = [] }) => {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [showFilters, setShowFilters] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [attendanceStatus, setAttendanceStatus] = useState({});

  // Check feedback status for completed sessions
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      const completedSessions = sessions.filter(session => session.status === 'completed');
      const status = {};
      
      for (const session of completedSessions) {
        try {
          const token = localStorage.getItem('token');
          const response = await API.get(`student/feedback/check/${session.meeting_id}/`, {
            headers: {
              Authorization: `Token ${token}`,
            }
          });
          status[session.meeting_id] = response.data;
        } catch (error) {
          console.error('Error checking feedback status:', error);
          status[session.meeting_id] = { exists: false };
        }
      }
      
      setFeedbackStatus(status);
    };
    
    if (sessions.length > 0) {
      checkFeedbackStatus();
    }
  }, [sessions]);

  // Fetch attendance status for all sessions
  useEffect(() => {
    const fetchAllAttendance = async () => {
      const status = {};
      for (const session of sessions) {
        if (!session.meeting_id) {
          status[session.meeting_id || 'unknown'] = [];
          continue;
        }
        try {
          const res = await fetchMeetingAttendance(session.meeting_id);
          status[session.meeting_id] = res.attended_roles || [];
        } catch {
          status[session.meeting_id] = [];
        }
      }
      setAttendanceStatus(status);
    };
    if (sessions.length > 0) fetchAllAttendance();
  }, [sessions]);

  // Categorize sessions based on status
  const categorizedSessions = sessions.reduce((acc, session) => {
    const category = session.status || 'pending';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(session);
    return acc;
  }, { scheduled: [], ongoing: [], pending: [], completed: [], missed: [] });

  // Sort each category by date in descending order
  for (const category in categorizedSessions) {
    categorizedSessions[category].sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));
  }

  // Combine scheduled, ongoing, and missed for the 'pending' tab
  const pendingSessions = [
    ...(categorizedSessions.scheduled || []),
    ...(categorizedSessions.ongoing || []),
    ...(categorizedSessions.missed || [])
  ];

  // Helper to determine which sessions to show based on activeTab
  const getSessionsForTab = () => {
    if (activeTab === 'pending') return pendingSessions;
    if (activeTab === 'completed') return categorizedSessions.completed || [];
    // Add more tabs if needed
    return [];
  };

  // Format session data for display
  const formatSession = (session) => {
    const dateObj = new Date(session.scheduled_time);
    const date = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
    const time = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });

    // Extract avatar initials - for students, show mentor info
    let mentorName = session.mentor_name || 'Unknown Mentor';
    let avatar = mentorName.split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();

    return {
      ...session,
      displayDate: date,
      displayTime: `${time} (${session.duration} mins)`,
      mentorAvatar: avatar.slice(0, 2),
      mentorName: mentorName
    };
  };

  const now = new Date();

  const renderSessionCard = (session) => {
    const formattedSession = formatSession(session);
    const attendedRoles = attendanceStatus[session.meeting_id] || [];
    const studentAttended = attendedRoles.includes('student');
    const mentorAttended = attendedRoles.includes('mentor');
    const scheduledTime = new Date(session.scheduled_time);
    // Enable 2 minutes before scheduled time
    const canJoin = now >= new Date(scheduledTime.getTime() - 2 * 60 * 1000);
    return (
      <div key={session.meeting_id} className="session-card">
        <div className="session-info">
          <div className="mentee-avatar">{formattedSession.mentorAvatar}</div>
          <div className="session-details">
            <h3>{session.title}</h3>
            <p>With {formattedSession.mentorName !== 'Unknown Mentor' ? formattedSession.mentorName : ''}</p>
            <div className="session-time">
              <span>{formattedSession.displayDate}</span>
              <span>{formattedSession.displayTime}</span>
            </div>
            {session.description && (
              <p className="session-description">{session.description}</p>
            )}
            <div className="attendance-status-bar">
              <span className={studentAttended ? 'attended-badge' : 'not-attended-badge'}>
                Student {studentAttended ? '✓ Attended' : 'Not Attended'}
              </span>
              <span className={mentorAttended ? 'attended-badge' : 'not-attended-badge'}>
                Mentor {mentorAttended ? '✓ Attended' : 'Not Attended'}
              </span>
            </div>
          </div>
        </div>
        {renderSessionActions(session, canJoin, studentAttended)}
      </div>
    );
  };

  const handleJoinSession = async (session) => {
    const scheduledTime = new Date(session.scheduled_time);
    if (now < scheduledTime) return; // Prevent joining early
    try {
      // Do not mark attendance here, just open the meeting link
      window.open(session.meeting_link, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert('Failed to open meeting link. Please try again.');
    }
  };

  const renderSessionActions = (session, canJoin, studentAttended) => {
    switch (session.status) {
      case 'scheduled':
      case 'pending':
      case 'ongoing':
        return (
          <div className="session-actions">
            <button
              className="primary-button small"
              onClick={() => canJoin && handleJoinSession(session)}
              disabled={!canJoin || studentAttended}
            >
              {studentAttended ? '✓ Attended' : canJoin ? 'Join Session' : 'Join Disabled'}
            </button>
            {!studentAttended && (
              <button className="secondary-button small" onClick={() => openAttendanceModal(session)}>
                Mark Attendance
              </button>
            )}
          </div>
        );
      case 'missed':
        return (
          <div className="session-actions">
            <button className="secondary-button small">Mark Completed</button>
          </div>
        );
      case 'completed':
        const hasFeedback = feedbackStatus[session.meeting_id]?.exists;
        return (
          <div className="session-actions">
            {hasFeedback ? (
              <div className="feedback-given">
                <span className="feedback-badge">✓ Feedback Given</span>
                <button 
                  className="secondary-button small"
                  onClick={() => {
                    // Show existing feedback details
                  }}
                >
                  View Feedback
                </button>
              </div>
            ) : (
              <button
                className="primary-button small"
                onClick={() => {
                  setSelectedSession(session);
                  setShowFeedbackModal(true);
                }}
              >
                Give Feedback
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Placeholder for reschedule handler
  const handleReschedule = (session) => {
    alert(`Reschedule requested for meeting: ${session.title}`);
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
            <label>Mentor</label>
            <input type="text" placeholder="Filter by mentor" />
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
          className={activeTab === 'ongoing' ? 'active' : ''}
          onClick={() => setActiveTab('ongoing')}
        >
          Ongoing ({categorizedSessions.ongoing.length})
        </button>
        <button
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingSessions.length})
        </button>
        <button
          className={activeTab === 'completed' ? 'active' : ''}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({categorizedSessions.completed.length})
        </button>
      </div>

      <div className="sessions-list">
        {getSessionsForTab().length > 0 ? (
          getSessionsForTab().map(renderSessionCard)
        ) : (
          <div className="no-sessions">
            No sessions found.
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onSubmitSuccess={(feedbackData) => {
          // console.log('Feedback submitted successfully:', feedbackData);
          // Refresh feedback status
          setFeedbackStatus(prev => ({
            ...prev,
            [selectedSession.meeting_id]: {
              exists: true,
              feedback: {
                rating: feedbackData.rating,
                feedback_text: feedbackData.feedback_text,
                created_at: new Date().toISOString()
              }
            }
          }));
          setShowFeedbackModal(false);
          setSelectedSession(null);
        }}
      />
    </div>
  );
};

export default SessionsPage;