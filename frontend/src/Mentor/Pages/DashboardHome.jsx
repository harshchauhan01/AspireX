import React, { useState, useEffect } from 'react';
import './CSS/Dashboard.css';
import './CSS/PageStyles.css';
import Modal from '../../components/ui/Modal';
import API, { postMeetingAttendance, fetchMeetingAttendance } from '../../BackendConn/api';
import { useRef } from 'react';
import Calendar from './Calendar';

const DashboardHome = ({ mentorProfile, mentor }) => {
  // State for notes
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  
  // State for conversations
  const [conversations, setConversations] = useState([]);
  const [pinnedConversations, setPinnedConversations] = useState([]);

  // State for attendance
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceMeeting, setAttendanceMeeting] = useState(null);
  const [attendanceKey, setAttendanceKey] = useState('');
  const [attendanceStatusMsg, setAttendanceStatusMsg] = useState('');
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState({});

  // State for rescheduling
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleMeeting, setRescheduleMeeting] = useState(null);
  const [rescheduleDateTime, setRescheduleDateTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const rescheduleInputRef = useRef();

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('mentorNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mentorNotes', JSON.stringify(notes));
  }, [notes]);

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await API.get('chat/conversations/');
        setConversations(response.data);
        
        // Filter pinned conversations
        const pinned = response.data.filter(conv => conv.pinned);
        setPinnedConversations(pinned);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  // Pin/Unpin conversation
  const togglePinConversation = async (conversationId, isPinned) => {
    try {
      const endpoint = isPinned ? 'unpin' : 'pin';
      await API.put(`chat/conversations/${conversationId}/${endpoint}/`);

      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, pinned: !isPinned }
            : conv
        )
      );

      // Update pinned conversations
      if (isPinned) {
        setPinnedConversations(prev => prev.filter(conv => conv.id !== conversationId));
      } else {
        const conversation = conversations.find(conv => conv.id === conversationId);
        if (conversation) {
          setPinnedConversations(prev => [...prev, { ...conversation, pinned: true }]);
        }
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return minutes === 0 ? 'Just now' : `${minutes}m ago`;
      }
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  // Format notifications from mentor messages
  const formatNotifications = (messages = []) => {
    return messages.map((message, index) => ({
      id: index + 1,
      text: `${message.subject}: ${message.message}`,
      time: formatTimeAgo(message.sent_at),
      read: message.is_read,
      sender: "Admin"
      // sender: message.admin_sender
    }));
  };

  // Format upcoming sessions from mentor meetings
  const formatUpcomingSessions = (meetings = []) => {
    return meetings
      .filter(meeting => meeting.status === 'scheduled' || meeting.status === 'ongoing')
      .map(meeting => {
        const dateObj = new Date(meeting.scheduled_time);
        const date = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
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
        
        const studentName = meeting.student.includes(' - ') 
          ? meeting.student.split(' - ')[1] 
          : meeting.student;

        return {
          id: meeting.meeting_id,
          mentee: studentName,
          date: date,
          time: `${time} (${meeting.duration} mins)`,
          topic: meeting.title,
          description: meeting.description,
          meeting_link: meeting.meeting_link,
          status: meeting.status
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Helper function to format time ago
  const formatTimeAgo = (isoString) => {
    const now = new Date();
    const date = new Date(isoString);
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    
    return 'Just now';
  };

  // Format current date
  const formatCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
      const fetchNotes = async () => {
        try {
          const res = await API.get('mentor/notes/');
          setNotes(res.data);
        } catch (err) {
          console.error('Error fetching notes:', err);
        }
      };
  
      fetchNotes();
    }, []);

  // Add a new note
  const addNote = async () => {
    if (newNoteTitle.trim() && newNoteContent.trim()) {
      try {
        const res = await API.post('mentor/notes/', {
          title: newNoteTitle,
          content: newNoteContent
        });

        const newNote = res.data;
        setNotes([newNote, ...notes]);
        setNewNoteTitle('');
        setNewNoteContent('');
        setShowNoteForm(false);
      } catch (err) {
        console.error('Error adding note:', err);
      }
    }
  };


  // Delete a note
  const deleteNote = async (id) => {
    try {
      await API.delete(`mentor/notes/${id}/`);
      setNotes(notes.filter(note => note.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  // Get data from mentor
  const notifications = formatNotifications(mentor?.messages || []);
  const upcomingSessions = formatUpcomingSessions(mentor?.meetings || []);

  const [showNotificationsSidebar, setShowNotificationsSidebar] = useState(false);
    const topNotifications = notifications.slice(0, 3);
    const hasMoreNotifications = notifications.length > 3;

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

  // Fetch attendance status for all meetings on mount or when mentor.meetings changes
  useEffect(() => {
    const fetchAllAttendance = async () => {
      const status = {};
      if (mentor?.meetings) {
        for (const meeting of mentor.meetings) {
          try {
            const res = await fetchMeetingAttendance(meeting.meeting_id);
            status[meeting.meeting_id] = res.attended_roles || [];
          } catch {
            status[meeting.meeting_id] = [];
          }
        }
      }
      setAttendanceStatus(status);
    };
    if (mentor?.meetings && mentor.meetings.length > 0) fetchAllAttendance();
  }, [mentor]);

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
    const oldTime = new Date(rescheduleMeeting.scheduled_time || rescheduleMeeting.date + 'T' + rescheduleMeeting.time.split(' ')[0]);
    if ((oldTime - now) / (1000 * 60 * 60) < 2) {
      setRescheduleError('Cannot reschedule less than 2 hours before the meeting.');
      return;
    }
    if ((newTime - now) / (1000 * 60 * 60) < 2) {
      setRescheduleError('New meeting time must be at least 2 hours from now.');
      return;
    }
    try {
      await API.post(`mentor/meeting/${rescheduleMeeting.meeting_id || rescheduleMeeting.id}/reschedule/`, { new_time: rescheduleDateTime });
      setShowRescheduleModal(false);
      window.location.reload(); // Or refetch sessions
    } catch (err) {
      setRescheduleError(err.response?.data?.error || 'Server error. Try again.');
    }
  };

  return (
    <>
      {/* Upcoming Sessions */}
      <section className="upcoming-sessions">
        <h2>Upcoming Sessions</h2>
        <div className="sessions-list">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-date">
                  <p className="day">{new Date(session.date).getDate()}</p>
                  <p className="month">{new Date(session.date).toLocaleString('default', { month: 'short' })}</p>
                </div>
                <div className="session-details">
                  <h3>{session.topic}</h3>
                  <p>With {session.mentee}</p>
                  <p className="session-time">{session.time}</p>
                  {session.description && (
                    <p className="session-description">{session.description}</p>
                  )}
                  <div className="attendance-status-bar">
                    <span className={attendanceStatus[session.id]?.includes('mentor') ? 'attended-badge' : 'not-attended-badge'}>
                      Mentor {attendanceStatus[session.id]?.includes('mentor') ? '✓ Attended' : 'Not Attended'}
                    </span>
                    <span className={attendanceStatus[session.id]?.includes('student') ? 'attended-badge' : 'not-attended-badge'}>
                      Student {attendanceStatus[session.id]?.includes('student') ? '✓ Attended' : 'Not Attended'}
                    </span>
                  </div>
                </div>
                <div className="session-actions">
                  <a 
                    href={session.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="primary-button"
                  >
                    {session.status === 'ongoing' ? 'Join Now' : 'Prepare'}
                  </a>
                  {session.status === 'scheduled' && (new Date(session.date + 'T' + session.time.split(' ')[0]) - new Date()) / (1000 * 60 * 60) > 2 && (
                    <button className="secondary-button" onClick={() => {
                      const meetingObj = (mentor.meetings || []).find(m => m.meeting_id === session.id) || session.meetingObj || session;
                      openRescheduleModal(meetingObj);
                    }}>
                      Reschedule
                    </button>
                  )}
                  {(session.status === 'scheduled' || session.status === 'ongoing' || session.status === 'completed') && !attendanceStatus[session.id]?.includes('mentor') && (
                    <button className="secondary-button small" onClick={() => {
                      const meetingObj = (mentor.meetings || []).find(m => m.meeting_id === session.id) || session.meetingObj || session;
                      openAttendanceModal(meetingObj);
                    }}>
                      Mark Attendance
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-sessions">No upcoming sessions scheduled</p>
          )}
        </div>
      </section>

      {/* Calendar and Notifications */}
      <div className="middle-section">
        <section className="calendar-section">
          <h2>Calendar</h2>
          <div className="calendar">
            {/* Calendar implementation would go here */}
            <Calendar meetings={mentor?.meetings || []} />
          </div>
        </section>

        <section className="notifications-section">
          <h2>Notifications</h2>
          <div className="notifications-list">
            {topNotifications.length > 0 ? (
              topNotifications.map(notification => (
                <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                  <p>
                    <strong>{notification.sender}:</strong> {notification.text}
                  </p>
                  <span className="notification-time">{notification.time}</span>
                  {!notification.read && <span className="unread-badge"></span>}
                </div>
              ))
            ) : (
              <p className="no-notifications">No new notifications</p>
            )}
            
            {hasMoreNotifications && (
              <button 
                className="view-all-button"
                onClick={() => setShowNotificationsSidebar(true)}
              >
                View All Messages ({notifications.length})
              </button>
            )}
          </div>
        </section>
      </div>

      {showNotificationsSidebar && (
        <div className="notifications-sidebar-overlay" onClick={() => setShowNotificationsSidebar(false)}>
          <div className="notifications-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <h3>All Notifications</h3>
              <button 
                className="close-sidebar"
                onClick={() => setShowNotificationsSidebar(false)}
              >
                ×
              </button>
            </div>
            <div className="sidebar-content">
              {notifications.map(notification => (
                <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                  <p>
                    <strong>{notification.sender}:</strong> {notification.text}
                  </p>
                  <span className="notification-time">{notification.time}</span>
                  {!notification.read && <span className="unread-badge"></span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pinned Conversations and Notes */}
      <div className="bottom-section">
        <section className="pinned-conversations">
          <h2>Pinned Conversations</h2>
          <div className="conversations-list">
            {pinnedConversations.length > 0 ? (
              pinnedConversations.map(conversation => (
                <div key={conversation.id} className="conversation-item">
                  <div className="conversation-avatar">
                    {conversation.other_person_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="conversation-details">
                    <h3>{conversation.other_person_name}</h3>
                    <p>
                      {conversation.last_message_content 
                        ? conversation.last_message_content.length > 50 
                          ? conversation.last_message_content.substring(0, 50) + '...'
                          : conversation.last_message_content
                        : 'No message yet'
                      }
                    </p>
                    <span className="conversation-time">
                      {conversation.last_message_time ? formatTime(conversation.last_message_time) : ''}
                    </span>
                  </div>
                  <div className="conversation-actions">
                    <button 
                      onClick={() => togglePinConversation(conversation.id, true)}
                      className="pin-button pinned"
                      title="Unpin conversation"
                    >
                      📌
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-conversations">No pinned conversations</p>
            )}
          </div>
        </section>

        <section className="notes-section">
          <h2>Quick Notes</h2>
          <div className="notes-list">
            {showNoteForm && (
              <div className="note-form">
                <input
                  type="text"
                  placeholder="Note title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="note-input"
                />
                <textarea
                  placeholder="Note content"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="note-textarea"
                  rows="3"
                />
                <div className="note-form-actions">
                  <button onClick={addNote} className="primary-button small">
                    Save Note
                  </button>
                  <button 
                    onClick={() => setShowNoteForm(false)} 
                    className="secondary-button small"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {notes.map(note => (
              <div key={note.id} className="note-item">
                <div className="note-header">
                  <h3>{note.title}</h3>
                  <button 
                    onClick={() => deleteNote(note.id)} 
                    className="delete-note-button"
                  >
                    ×
                  </button>
                </div>
                <p>{note.content}</p>
                <span className="note-date">{note.date}</span>
              </div>
            ))}

            {!showNoteForm && (
              <button 
                onClick={() => setShowNoteForm(true)} 
                className="add-note-button"
              >
                + Add New Note
              </button>
            )}
          </div>
        </section>
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
    </>
  );
};

export default DashboardHome;

