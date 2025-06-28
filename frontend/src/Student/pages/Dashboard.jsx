
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import MenteesPage from './MenteesPage';
import EarningsPage from './EarningsPage';
import Messages from './Messages';
import ProfilePage from './ProfilePage';
import SessionsPage from './SessionsPage';
import './CSS/Dashboard.css';
import API from "../../BackendConn/api";

const StuDashboard = () => {

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mentor, setMentor] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log(token);
        
        const response = await API.get('/api/student/profile/',{
          headers: {
            Authorization: `Token ${token}`,
          }
        });
        console.log(response.data);
        
        setMentor(response.data);
      } catch (err) {
        setError('Failed to fetch mentor profile');
        console.error(err);
      }
    };

    fetchMentorProfile();
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
    }
    }, []);


  if (error) return <div className="text-red-600">{error}</div>;



  
  
  // Mock profile data
  const mentorProfile = {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@mentor.com',
    expertise: 'Career Counseling & Leadership',
    rating: 4.9,
    sessionsCompleted: 142
  };

  // Render the appropriate page based on activeTab
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome mentorProfile={mentorProfile} mentor = {mentor} />;
      case 'mentees':
        return <MenteesPage />;
      case 'earning':
        return <EarningsPage />;
      case 'messages':
        return <Messages />;
      case 'profile':
        return <ProfilePage mentorProfile={mentor} />;
      case 'sessions':
        return <SessionsPage sessions = {mentor.meetings}/>;
      default:
        return <DashboardHome mentorProfile={mentorProfile} />;
    }
  };

  return (
    <div className={`mentor-dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mentorProfile={mentorProfile}
        mentor={mentor}
      />
      
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  );
};

export default StuDashboard;