import React, { useState } from 'react';
import { formatMeetingTime } from '../../lib/utils';

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
    if (!meetings || meetings.length === 0) {
      return false;
    }
    return meetings.some(meeting => {
      const meetingDate = new Date(meeting.scheduled_time).toDateString();
      return meetingDate === date.toDateString();
    });
  };

  // Get meetings for a specific date
  const getMeetingsForDate = (date) => {
    if (!meetings) {
      return [];
    }
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
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasMeeting ? 'has-meeting' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <span className="day-number">{day}</span>
          {hasMeeting && (
            <span className="meeting-indicator">•</span>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>&lt;</button>
        <h3>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={nextMonth}>&gt;</button>
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
                  <strong>{meeting.title}</strong> with {meeting.mentor_name || 'Mentor'}<br/>
                  {formatMeetingTime(meeting.scheduled_time)}
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

export default Calendar;