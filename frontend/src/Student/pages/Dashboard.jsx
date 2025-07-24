
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import MenteesPage from './MenteesPage';
import EarningsPage from './EarningsPage';
import Messages from './Messages';
import ProfilePage from './ProfilePage';
import SessionsPage from './SessionsPage';
import MentorProfile from './MentorProfile';
import Loader from '../../components/ui/loader';
import './CSS/Dashboard.css';
import API from "../../BackendConn/api";
import CustomerServicePage from './CustomerServicePage';
import Modal from '../../components/ui/Modal';

const StuDashboard = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [mentor, setMentor] = useState(null);
  const [error, setError] = useState('');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceMeeting, setAttendanceMeeting] = useState(null);
  const [attendanceKey, setAttendanceKey] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [attendanceError, setAttendanceError] = useState('');

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await API.get('student/profile/',{
          headers: {
            Authorization: `Token ${token}`,
          }
        });
        
        setMentor(response.data);
      } catch (err) {
        setError('Failed to fetch mentor profile');
      }
    };

    fetchMentorProfile();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set active tab based on URL
  useEffect(() => {
    if (mentorId) {
      setActiveTab('mentees'); // Show mentees as active when viewing a mentor profile
    }
  }, [mentorId]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
    }
    }, []);

  // Function to open modal for a meeting
  const openAttendanceModal = (meeting) => {
    setAttendanceMeeting(meeting);
    setAttendanceKey('');
    setAttendanceStatus('');
    setAttendanceError('');
    setShowAttendanceModal(true);
  };

  // Function to submit attendance key
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
      const res = await API.post('mentor/record_meeting_attendance/', {
        meeting_id: attendanceMeeting.meeting_id,
        role: 'student',
        attendance_key: attendanceKey
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      if (res.data.success) {
        setAttendanceStatus('Attendance marked successfully!');
        setAttendanceError('');
        // Optionally update meeting status in UI
      } else if (res.data.message) {
        setAttendanceStatus(res.data.message);
        setAttendanceError('');
      } else {
        setAttendanceError(res.data.error || 'Failed to mark attendance.');
      }
    } catch (err) {
      setAttendanceError(err.response?.data?.error || 'Failed to mark attendance.');
    }
  };


  if (error) return <div className="text-red-600">{error}</div>;
  if (!mentor) return <Loader />;



  
  
  // Mock profile data
  const mentorProfile = {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@mentor.com',
    expertise: 'Career Counseling & Leadership',
    rating: 4.9,
    sessionsCompleted: 142
  };

  // Render the appropriate page based on activeTab or mentorId
  const renderPage = () => {
    // If there's a mentorId in the URL, show the mentor profile
    if (mentorId) {
      return (
        <MentorProfile 
          mentorId={mentorId} 
          onBack={() => {
            navigate('/student/dashboard');
            setActiveTab('mentees');
          }}
        />
      );
    }

    // Otherwise, render based on activeTab
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome mentorProfile={mentorProfile} mentor={mentor} />;
      case 'mentees':
        return <MenteesPage />;
      case 'earning':
        return <EarningsPage />;
      case 'messages':
        return <Messages />;
      case 'profile':
        return <ProfilePage mentorProfile={mentor} />;
      case 'sessions':
        return <SessionsPage sessions={mentor.meetings || []} />;
      case 'customerService':
        return <CustomerServicePage />;
      default:
        return <DashboardHome mentorProfile={mentorProfile} />;
    }
  };

  return (
    <div className={`mentor-dashboard${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}> 
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mentorProfile={mentor || {}}
        mentor={mentor}
        isMobile={isMobile}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header>
          <div className="header-left">
            {/* Hamburger for mobile */}
            {isMobile && (
              <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)} style={{marginRight: 12}}>
                {sidebarOpen ? '\u25c0' : '\u2630'}
              </button>
            )}
            {/* Collapse button for desktop */}
            {!isMobile && (
              <button className="toggle-sidebar" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{marginRight: 12}}>
                {sidebarCollapsed ? '\u25b6' : '\u25c0'}
              </button>
            )}
            <h1>Welcome, <span>{mentor?.name || 'Student'}!</span></h1>
            <div className="welcome-message">Manage all the things from single dashboard. See latest info sessions, recent conversation and update your recommendations.</div>
          </div>
        </header>
        {renderPage()}
      </div>
      <Modal isOpen={showAttendanceModal} onClose={() => setShowAttendanceModal(false)} title="Mark Attendance">
        <div style={{ marginBottom: 12 }}>
          Ask your mentor for their attendance key and enter it below to mark your attendance for this meeting.
        </div>
        <input
          type="text"
          value={attendanceKey}
          onChange={e => setAttendanceKey(e.target.value)}
          placeholder="Enter mentor's attendance key"
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />
        <button onClick={submitAttendanceKey} style={{ width: '100%', padding: 10, background: '#1089d3', color: 'white', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>
          Submit
        </button>
        {attendanceStatus && <div style={{ color: 'green', marginTop: 8 }}>{attendanceStatus}</div>}
        {attendanceError && <div style={{ color: 'red', marginTop: 8 }}>{attendanceError}</div>}
      </Modal>
    </div>
  );
};

export default StuDashboard;