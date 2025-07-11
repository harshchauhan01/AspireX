import React, { useState, useEffect } from 'react';
import './CSS/Dashboard.css';
import './CSS/PageStyles.css';
// import Calendar from "./Calendar";

const DashboardHome = ({ mentorProfile, mentor }) => {
  // State for notes
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  

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

  // Format notifications from mentor messages
  const formatNotifications = (messages = []) => {
    return messages.map((message, index) => ({
      id: index + 1,
      text: `(${message.subject})  ${message.message}`,
      time: formatTimeAgo(message.sent_at),
      read: message.is_read,
      sender: message.admin_sender
    }));
  };

  // Format upcoming sessions from mentor meetings
  const formatUpcomingSessions = (meetings = []) => {
    return meetings
      .filter(meeting => meeting.status === 'scheduled' || meeting.status === 'ongoing')
      .map(meeting => {
        const dateObj = new Date(meeting.scheduled_time);
        const date = dateObj.toISOString().split('T')[0];
        const time = dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
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

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://127.0.0.1:8000/api/student/notes/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.error('Error fetching notes:', err);
      }
    };

    fetchNotes();
  }, []);


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
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://127.0.0.1:8000/api/student/notes/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            title: newNoteTitle,
            content: newNoteContent
          })
        });

        if (res.ok) {
          const newNote = await res.json();
          setNotes([newNote, ...notes]);
          setNewNoteTitle('');
          setNewNoteContent('');
          setShowNoteForm(false);
        }
      } catch (err) {
        console.error('Error adding note:', err);
      }
    }
  };


  // Delete a note
  const deleteNote = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`http://127.0.0.1:8000/api/student/notes/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (res.ok) {
        setNotes(notes.filter(note => note.id !== id));
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };


  

  // Get data from mentor
  const notifications = formatNotifications(mentor?.messages || []);
  const upcomingSessions = formatUpcomingSessions(mentor?.meetings || []);
  
  // Mock data for other sections
  const pinnedConversations = [
    { id: 1, mentee: 'Alex Chen', lastMessage: 'Thanks for the resources!', time: 'Yesterday' },
  ];

  const [showNotificationsSidebar, setShowNotificationsSidebar] = useState(false);
  const topNotifications = notifications.slice(0, 3);
  const hasMoreNotifications = notifications.length > 3;

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
                  <button className="secondary-button">Reschedule</button>
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
              View All Messages ({notifications.length})
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
              {notifications.map(notification => (
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
            {pinnedConversations.map(conversation => (
              <div key={conversation.id} className="conversation-item">
                <div className="conversation-avatar">
                  {conversation.mentee.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="conversation-details">
                  <h3>{conversation.mentee}</h3>
                  <p>{conversation.lastMessage}</p>
                  <span className="conversation-time">{conversation.time}</span>
                </div>
              </div>
            ))}
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
    </>
  );
};

export default DashboardHome;




// import React, { useState } from 'react';
// ... (other imports remain the same)

const Calendar = ({ meetings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Get days in month
  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month
  const firstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if date has meetings
  const hasMeetings = (date) => {
    return meetings.some(meeting => {
      const meetingDate = new Date(meeting.scheduled_time).toDateString();
      return meetingDate === date.toDateString();
    });
  };

  // Get meetings for a specific date
  const getMeetingsForDate = (date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.scheduled_time).toDateString();
      return meetingDate === date.toDateString();
    });
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Render calendar days
  const renderDays = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const totalDays = daysInMonth(month, year);
    const firstDay = firstDayOfMonth(month, year);
    
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Render day names
    dayNames.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="calendar-day-header">
          {day}
        </div>
      );
    });
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const hasMeeting = hasMeetings(date);
      
      days.push(
        <div
          key={`day-${day}`}
          className={`calendar-day 
            ${isToday ? 'today' : ''} 
            ${isSelected ? 'selected' : ''}
            ${hasMeeting ? 'has-meeting' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <span className="day-number">{day}</span>
          {hasMeeting && (
            <div className="meeting-indicator">
              {getMeetingsForDate(date).length > 1 && 
                <span className="meeting-count">{getMeetingsForDate(date).length}</span>}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  // Format month and year for display
  const monthYearString = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="calendar-nav-button">
          &lt;
        </button>
        <h3>{monthYearString}</h3>
        <button onClick={nextMonth} className="calendar-nav-button">
          &gt;
        </button>
      </div>
      
      <div className="calendar-grid">
        {renderDays()}
      </div>
      
      {selectedDate && (
        <div className="calendar-meetings-detail">
          <h4>Meetings on {selectedDate.toLocaleDateString()}</h4>
          {getMeetingsForDate(selectedDate).length > 0 ? (
            <ul>
              {getMeetingsForDate(selectedDate).map((meeting, index) => (
                <li key={index}>
                  <strong>{meeting.title}</strong> with {meeting.student}<br/>
                  {new Date(meeting.scheduled_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </li>
              ))}
            </ul>
          ) : (
            <p>No meetings scheduled</p>
          )}
        </div>
      )}
    </div>
  );
};

