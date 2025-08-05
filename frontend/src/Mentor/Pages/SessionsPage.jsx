import React, { useState, useEffect } from 'react';
import './CSS/PageStyles.css';
import './CSS/Sessions.css';
import { postMeetingAttendance, fetchMeetingAttendance } from '../../BackendConn/api';
import Modal from '../../components/ui/Modal';
import { formatMeetingTime, formatMeetingDate } from '../../lib/utils';
import { useRef } from 'react';
import { API_BASE_URL } from '../../BackendConn/api.js';

const SessionsPage = ({ sessions = [] }) => {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [showFilters, setShowFilters] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceMeeting, setAttendanceMeeting] = useState(null);
  const [attendanceKey, setAttendanceKey] = useState('');
  const [attendanceStatusMsg, setAttendanceStatusMsg] = useState('');
  const [attendanceError, setAttendanceError] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleMeeting, setRescheduleMeeting] = useState(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const rescheduleInputRef = useRef();

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

  const getMeetingTime = (session) => {
    // Always use UTC for consistency
    return new Date(session.scheduled_time);
  };

  const now = new Date();

  // Categorize sessions based on status and time
  const categorizedSessions = sessions.reduce((acc, session) => {
    const dateObj = getMeetingTime(session);
    if (session.status === 'scheduled' && dateObj >= now) {
      acc.scheduled.push(session);
    } else if ((session.status === 'ongoing' || session.status === 'missed')) {
      acc.pending.push(session);
    } else if (session.status === 'completed') {
      acc.completed.push(session);
    }
    return acc;
  }, { scheduled: [], pending: [], completed: [] });
  
  

  // Format session data for display
  const formatSession = (session) => {
    const dateObj = getMeetingTime(session);
    const date = formatMeetingDate(dateObj);
    const time = formatMeetingTime(dateObj);

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

  const handleJoinSession = async (session) => {
    try {
      // Do not mark attendance here, just open the meeting link
      window.open(session.meeting_link, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert('Failed to open meeting link. Please try again.');
    }
  };

  const openAttendanceModal = (meeting) => {
    setAttendanceMeeting(meeting);
    setAttendanceKey('');
    setAttendanceStatusMsg('');
    setAttendanceError('');
    setShowAttendanceModal(true);
  };
  const submitAttendanceKey = async () => {
    if (!attendanceMeeting || !attendanceMeeting.meeting_id) {
      setAttendanceError('Meeting ID is missing. Please refresh and try again.');
      return;
    }
    if (!attendanceKey) {
      setAttendanceError('Please enter the student\'s attendance key.');
      return;
    }
    try {
      const token = localStorage.getItem('Mentortoken');
      const res = await postMeetingAttendance({
        meeting_id: attendanceMeeting.meeting_id,
        role: 'mentor',
        attendance_key: attendanceKey
      }, token);
      if (res.success) {
        setAttendanceStatusMsg('Attendance marked successfully!');
        setAttendanceError('');
        setShowAttendanceModal(false);
        // Refresh attendance status for this meeting
        const attRes = await fetchMeetingAttendance(attendanceMeeting.meeting_id);
        setAttendanceStatus(prev => ({
          ...prev,
          [attendanceMeeting.meeting_id]: attRes.attended_roles || []
        }));
      } else if (res.message) {
        setAttendanceStatusMsg(res.message);
        setAttendanceError('');
      } else {
        setAttendanceError(res.error || 'Failed to mark attendance.');
      }
    } catch (err) {
      setAttendanceError('Failed to mark attendance.');
    }
  };

  const openRescheduleModal = (meeting) => {
    setRescheduleMeeting(meeting);
    setRescheduleDateTime('');
    setRescheduleError('');
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleMeeting || !rescheduleDateTime) {
      setRescheduleError('Please select a new date and time.');
      return;
    }
    const now = new Date();
    const newTime = new Date(rescheduleDateTime);
    const oldTime = new Date(rescheduleMeeting.scheduled_time);
    // Only enforce the 2-hour rule for scheduled meetings in the future
    if (rescheduleMeeting.status === 'scheduled' && (oldTime - now) / (1000 * 60 * 60) >= 2) {
      if ((oldTime - now) / (1000 * 60 * 60) < 2) {
        setRescheduleError('Cannot reschedule less than 2 hours before the meeting.');
        return;
      }
      if ((newTime - now) / (1000 * 60 * 60) < 2) {
        setRescheduleError('New meeting time must be at least 2 hours from now.');
        return;
      }
    }
    // For missed or pending meetings, allow rescheduling at any time
    try {
      const token = localStorage.getItem('Mentortoken');
      if (!token) {
        setRescheduleError('Mentor not authenticated. Please log in again.');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/mentor/meeting/${rescheduleMeeting.meeting_id}/reschedule/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ new_time: rescheduleDateTime })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setShowRescheduleModal(false);
        window.location.reload(); // Or refetch sessions
      } else {
        setRescheduleError(result.error || 'Failed to reschedule.');
      }
    } catch (err) {
      setRescheduleError('Server error. Try again.');
    }
  };

  const renderSessionActions = (session) => {
    const attendedRoles = attendanceStatus[session.meeting_id] || [];
    const mentorAttended = attendedRoles.includes('mentor');
    const studentAttended = attendedRoles.includes('student');
    const canMark = !mentorAttended && (session.status === 'scheduled' || session.status === 'ongoing' || session.status === 'pending');
    const now = new Date();
    const meetingTime = getMeetingTime(session);

    // Add Reschedule button for missed and scheduled meetings
    if (session.status === 'missed' || session.status === 'scheduled') {
      return (
        <div className="session-actions">
          <button className="primary-button small" onClick={() => openRescheduleModal(session)}>Reschedule</button>
        </div>
      );
    }
    return (
      <div className="session-actions">
        <button
          className="primary-button small"
          onClick={() => handleJoinSession(session)}
        >
          {mentorAttended ? '\u2713 Attended' : 'Join Session'}
        </button>
        {canMark && (
          <button className="secondary-button small" onClick={() => openAttendanceModal(session)}>
            Mark Attendance
          </button>
        )}
        {/* Reschedule button is now handled by the new logic */}
        <div className="attendance-status">
          <span className={mentorAttended ? 'attended' : ''}>Mentor {mentorAttended ? '\u2713' : ''}</span>
          <span className={studentAttended ? 'attended' : ''}>Student {studentAttended ? '\u2713' : ''}</span>
        </div>
      </div>
    );
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
      <Modal isOpen={showAttendanceModal} onClose={() => setShowAttendanceModal(false)} title="Mark Attendance">
        <form style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 260 }} onSubmit={e => { e.preventDefault(); submitAttendanceKey(); }}>
          <div style={{ fontSize: '1rem', color: '#333', marginBottom: 0 }}>
            Enter the <b>student's attendance key</b> to mark your attendance for this meeting.
          </div>
          <input
            type="text"
            value={attendanceKey}
            onChange={e => setAttendanceKey(e.target.value)}
            placeholder="Enter student's attendance key"
            className="attendance-key-input"
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1.5px solid #bcdffb',
              fontSize: '1rem',
              outline: 'none',
              marginBottom: 0
            }}
            autoFocus
          />
          {attendanceError && <div className="error-message" style={{ color: '#d32f2f', fontSize: '0.95rem' }}>{attendanceError}</div>}
          {attendanceStatusMsg && <div className="success-message" style={{ color: '#388e3c', fontSize: '0.95rem' }}>{attendanceStatusMsg}</div>}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 0 }}>
            <button type="button" className="secondary-button" onClick={() => setShowAttendanceModal(false)} style={{ minWidth: 90 }}>Cancel</button>
            <button type="submit" className="primary-button" style={{ minWidth: 110 }}>Submit</button>
          </div>
        </form>
      </Modal>
      {/* Reschedule Modal */}
      <Modal isOpen={showRescheduleModal} onClose={() => setShowRescheduleModal(false)} title="Reschedule Meeting">
        <div style={{ padding: '1rem' }}>
          <label>New Date & Time:</label>
          <input
            type="datetime-local"
            ref={rescheduleInputRef}
            value={rescheduleDateTime}
            onChange={e => setRescheduleDateTime(e.target.value)}
            min={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)}
            required
            style={{ display: 'block', margin: '1rem 0' }}
          />
          {rescheduleError && <div style={{ color: 'red', marginBottom: '1rem' }}>{rescheduleError}</div>}
          <button className="primary-button" onClick={handleRescheduleSubmit}>Submit</button>
        </div>
      </Modal>
    </div>
  );
};

export default SessionsPage;