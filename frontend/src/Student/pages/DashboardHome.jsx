import React, { useState, useEffect } from 'react';
import './CSS/Dashboard.css';
import './CSS/PageStyles.css';
import FeedbackModal from '../components/FeedbackModal';
import API from '../../BackendConn/api';
import { postMeetingAttendance, fetchMeetingAttendance } from '../../BackendConn/api';
import Modal from '../../components/ui/Modal';
import Calendar from "./Calendar";

const now = new Date();

const DashboardHome = ({ mentorProfile, mentor }) => {
  // State for notes
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  
  // State for conversations
  const [conversations, setConversations] = useState([]);
  const [pinnedConversations, setPinnedConversations] = useState([]);

  // State for feedback
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState({});

  // State for notifications
  const [showNotificationsSidebar, setShowNotificationsSidebar] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // State for attendance
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceMeeting, setAttendanceMeeting] = useState(null);
  const [attendanceKey, setAttendanceKey] = useState('');
  const [attendanceStatusMsg, setAttendanceStatusMsg] = useState('');
  const [attendanceError, setAttendanceError] = useState('');

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

  // Fetch notifications (messages) from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await API.get('student/messages/');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  // Format notifications from student messages
  const formatNotifications = (messages = []) => {
    return messages.map((message, index) => ({
      id: index + 1,
      text: `${message.subject}: ${message.message}`,
      time: formatTimeAgo(message.sent_at),
      read: message.is_read,
      sender: "Admin"
    }));
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

  const getMeetingTime = (meeting) => {
    // Always use scheduled_time if available, fallback to date+time
    if (meeting.scheduled_time) return new Date(meeting.scheduled_time);
    if (meeting.date && meeting.time) {
      // Remove any extra text after the time (e.g., ' (60 mins)')
      const timePart = meeting.time.split(' ')[0];
      return new Date(`${meeting.date}T${timePart}`);
    }
    return new Date();
  };

  // Update formatUpcomingSessions to include ongoing meetings
  const formatUpcomingSessions = (meetings = []) => {
    return meetings
      .filter(meeting => {
        const meetingTime = getMeetingTime(meeting);
        const attendedRoles = attendanceStatus[meeting.meeting_id] || [];
        const studentAttended = attendedRoles.includes('student');
        const oneHourAfter = new Date(meetingTime.getTime() + 60 * 60 * 1000);
        // Show as upcoming if now < meetingTime + 1hr and status is scheduled or ongoing
        return (meeting.status === 'scheduled' || meeting.status === 'ongoing') && now < oneHourAfter;
      })
      .sort((a, b) => getMeetingTime(b.meetingObj) - getMeetingTime(a.meetingObj)) // Sort by most recent
      .map(meeting => {
        const dateObj = getMeetingTime(meeting);
        const date = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        const time = dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZoneName: 'short'
        });
        const studentName = typeof meeting.student === 'string' && meeting.student.includes(' - ')
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
          status: meeting.status,
          meetingObj: meeting
        };
      });
  };

  const formatCompletedSessions = (meetings = []) => {
    return meetings
      .filter(meeting => {
        const meetingTime = getMeetingTime(meeting);
        const attendedRoles = attendanceStatus[meeting.meeting_id] || [];
        const studentAttended = attendedRoles.includes('student');
        const oneHourAfter = new Date(meetingTime.getTime() + 60 * 60 * 1000);
        // Completed if status is completed, or attended and >1hr past scheduled time
        return (
          meeting.status === 'completed' ||
          (meeting.status === 'scheduled' && studentAttended && now > oneHourAfter)
        );
      })
      .sort((a, b) => getMeetingTime(b) - getMeetingTime(a)) // Most recent first
      .map(meeting => {
        const dateObj = getMeetingTime(meeting);
        const date = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        const time = dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZoneName: 'short'
        });
        const mentorName = meeting.mentor_name || 'Unknown Mentor';
        return {
          id: meeting.meeting_id,
          mentor: mentorName,
          mentor_id: meeting.mentor_id,
          date: date,
          time: `${time} (${meeting.duration} mins)`,
          topic: meeting.title,
          description: meeting.description,
          meeting_link: meeting.meeting_link,
          status: meeting.status
        };
      })
      .sort((a, b) => getMeetingTime(b) - getMeetingTime(a)); // Most recent first
  };

  const formatMissedSessions = (meetings = []) => {
    return meetings
      .filter(meeting => {
        const meetingTime = getMeetingTime(meeting);
        const attendedRoles = attendanceStatus[meeting.meeting_id] || [];
        const studentAttended = attendedRoles.includes('student');
        const oneHourAfter = new Date(meetingTime.getTime() + 60 * 60 * 1000);
        // Missed if status is scheduled, not attended, and now > 1hr after scheduled time
        return (
          meeting.status === 'scheduled' && !studentAttended && now > oneHourAfter
        );
      })
      .sort((a, b) => getMeetingTime(b) - getMeetingTime(a))
      .map(meeting => {
        const dateObj = getMeetingTime(meeting);
        const date = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        const time = dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZoneName: 'short'
        });
        const studentName = typeof meeting.student === 'string' && meeting.student.includes(' - ')
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
          status: 'missed'
        };
      })
      .sort((a, b) => getMeetingTime(b) - getMeetingTime(a));
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await API.get('student/notes/');
        setNotes(response.data);
      } catch (err) {
        console.error('Error fetching notes:', err);
      }
    };

    fetchNotes();
  }, []);

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


  // Format current date
  const formatCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Add a new note
  const addNote = async () => {
    if (newNoteTitle.trim() && newNoteContent.trim()) {
      try {
        const response = await API.post('student/notes/', {
          title: newNoteTitle,
          content: newNoteContent
        });
        const newNote = response.data;
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
      await API.delete(`student/notes/${id}/`);
      setNotes(notes.filter(note => note.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };


  

  // Check feedback status for completed sessions
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      const completedSessions = formatCompletedSessions(mentor?.meetings || []);
      const status = {};
      
      for (const session of completedSessions) {
        try {
          const token = localStorage.getItem('token');
          const response = await API.get(`student/feedback/check/${session.id}/`, {
            headers: {
              Authorization: `Token ${token}`,
            }
          });
          status[session.id] = response.data;
        } catch (error) {
          console.error('Error checking feedback status:', error);
          status[session.id] = { exists: false };
        }
      }
      
      setFeedbackStatus(status);
    };
    
    if (mentor?.meetings) {
      checkFeedbackStatus();
    }
  }, [mentor?.meetings]);

  // Get data from mentor
  const studentNotifications = formatNotifications(notifications);
  const upcomingSessions = formatUpcomingSessions(mentor?.meetings || []);
  const completedSessions = formatCompletedSessions(mentor?.meetings || []);
  const missedSessions = formatMissedSessions(mentor?.meetings || []);
  
  // Check if all completed sessions have feedback
  const hasUnfeedbackedSessions = completedSessions.some(session => !feedbackStatus[session.id]?.exists);
  
  const topNotifications = studentNotifications.slice(0, 3);
  const hasMoreNotifications = studentNotifications.length > 3;

  // Helper to determine if Mark Attendance should be enabled
  const canMarkAttendance = (meeting) => {
    if (!meeting || !meeting.scheduled_time) return false;
    const scheduledTime = new Date(meeting.scheduled_time);
    const now = new Date();
    // Enable 2 minutes before scheduled time
    return now >= new Date(scheduledTime.getTime() - 2 * 60 * 1000);
  };

  // Handler to open the meeting link for the student
  const handleJoinMeeting = (meeting) => {
    if (meeting && meeting.meeting_link) {
      window.open(meeting.meeting_link, '_blank', 'noopener,noreferrer');
    } else {
      alert('Meeting link is not available.');
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
      setAttendanceError('Please enter the mentor\'s attendance key.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await postMeetingAttendance({
        meeting_id: attendanceMeeting.meeting_id,
        role: 'student',
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

  return (
    <>
      <header>
        <div className="header-left-container">
          <div className="header-left">
            <h1>Welcome Back <span>{mentor?.name}</span></h1>
            <p className="welcome-message">Manage all the things from single Dashboard. See latest info sessions, recent conversations and update your recommendations.</p>
          </div>
        </div>
      </header>

      {/* Upcoming Sessions */}
      <section className="upcoming-sessions">
        <h2>Upcoming Sessions</h2>
        <div className="sessions-list">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map(session => {
              const attendedRoles = attendanceStatus[session.id] || [];
              const studentAttended = attendedRoles.includes('student');
              const mentorAttended = attendedRoles.includes('mentor');
              const scheduledTime = getMeetingTime(session);
              const canJoin = now >= scheduledTime;
              return (
                <div key={session.id} className="session-card">
                  <div className="session-info">
                    <div className="mentee-avatar">{session.mentee && session.mentee[0]}</div>
                    <div className="session-details">
                      <h3>{session.topic}</h3>
                      <p>With {session.mentee}</p>
                      <div className="session-time">
                        <span>{session.date}</span>
                        <span>{session.time}</span>
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
                  <div className="session-actions">
                    <button
                      className="primary-button small"
                      onClick={() => canMarkAttendance(session.meetingObj) && handleJoinMeeting(session)}
                      disabled={!canMarkAttendance(session.meetingObj) || studentAttended}
                    >
                      {studentAttended ? '\u2713 Attended' : (canMarkAttendance(session.meetingObj) ? 'Join Session' : 'Join Disabled')}
                    </button>
                    {(session.status === 'scheduled' || session.status === 'ongoing' || session.status === 'completed') && !attendanceStatus[session.id]?.includes('student') && (
                      <button className="secondary-button small" onClick={() => openAttendanceModal(session.meetingObj || session)}>
                        Mark Attendance
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-sessions">No upcoming sessions scheduled</p>
          )}
        </div>
      </section>

      {/* Completed Sessions */}
      {hasUnfeedbackedSessions && (
        <section className="completed-sessions">
          <h2>Recent Completed Sessions</h2>
          <div className="sessions-list">
            {completedSessions.slice(0, 3).map(session => (
              <div key={session.id} className="session-card completed">
                <div className="session-date">
                  <p className="day">{new Date(session.date).getDate()}</p>
                  <p className="month">{new Date(session.date).toLocaleString('default', { month: 'short' })}</p>
                </div>
                <div className="session-details">
                  <h3>{session.topic}</h3>
                  <p>With {session.mentor}</p>
                  <p className="session-time">{session.time}</p>
                  {session.description && (
                    <p className="session-description">{session.description}</p>
                  )}
                </div>
                <div className="session-actions">
                  {feedbackStatus[session.id]?.exists ? (
                    <div className="feedback-given">
                      <span className="feedback-badge">✓ Feedback Given</span>
                      <button 
                        className="secondary-button"
                        onClick={() => {
                          // Show existing feedback details
                          alert(`Your feedback: ${feedbackStatus[session.id].feedback.feedback_text}\nRating: ${feedbackStatus[session.id].feedback.rating}/5`);
                        }}
                      >
                        View Feedback
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="primary-button"
                      onClick={() => {
                        setSelectedSession(session);
                        setShowFeedbackModal(true);
                      }}
                    >
                      Give Feedback
                    </button>
                  )}
                  <button className="secondary-button">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Missed Sessions */}
      {missedSessions.length > 0 && (
        <section className="missed-sessions">
          <h2>Missed Sessions</h2>
          <div className="sessions-list">
            {missedSessions.map(session => (
              <div key={session.id} className="session-card missed">
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
                </div>
                <div className="session-actions">
                  <button className="primary-button">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Calendar and Notifications */}
      <div className="middle-section">
        <section className="calendar-section">
          <h2>Calendar</h2>
          <div className="calendar">
            {/* Calendar implementation would go here */}
            <Calendar meetings={mentor?.meetings || []} />
            {/* <p>Calendar component will be implemented here</p> */}
          </div>
        </section>

        <section className="notifications-section">
        <h2>Notifications</h2>
        <div className="notifications-list">
          {topNotifications.length > 0 ? (
            topNotifications.map(notification => (
              <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                <p>
                  <strong>Admin:</strong><br/> {notification.text}
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
              View All Messages ({studentNotifications.length})
            </button>
          )}
        </div>
      </section>

      {/* Notifications Sidebar */}
      {showNotificationsSidebar && (
        <div className="notifications-sidebar-overlay">
          <div className="notifications-sidebar">
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
              {studentNotifications.map(notification => (
                <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                  <p>
                    <strong>Admin:</strong><br/> {notification.text}
                  </p>
                  <span className="notification-time">{notification.time}</span>
                  {!notification.read && <span className="unread-badge"></span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>

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
            [selectedSession.id]: {
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

      <Modal isOpen={showAttendanceModal} onClose={() => setShowAttendanceModal(false)} title="Mark Attendance">
        <form style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 260 }} onSubmit={e => { e.preventDefault(); submitAttendanceKey(); }}>
          <div style={{ fontSize: '1rem', color: '#333', marginBottom: 0 }}>
            Enter the <b>mentor's attendance key</b> to mark your attendance for this meeting.
          </div>
          <input
            type="text"
            value={attendanceKey}
            onChange={e => setAttendanceKey(e.target.value)}
            placeholder="Enter mentor's attendance key"
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
    </>
  );
};

export default DashboardHome;