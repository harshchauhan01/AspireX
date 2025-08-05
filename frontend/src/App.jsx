import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchSiteStatus } from './BackendConn/api';
import './App.css';
import { AuthProvider } from './components/AuthContext';
import UnifiedLogin from './components/UnifiedLogin';
import UnifiedSignup from './components/UnifiedSignup';
import Dashboard from './Mentor/Pages/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import Home from './components/Home';
import StuDashboard from './Student/pages/Dashboard';
import MentorProfile from './Student/pages/MentorProfile';
import ContactPage from './components/ContactPage';
import PrivateRoute from './components/PrivateRoute';
import CommunityFeed from './components/CommunityFeed';
import ServicesPage from './components/ServicesPage';
import ScrollToTopButton from './components/ScrollToTopButton';

function App() {
  const [maintenance, setMaintenance] = useState(false);
  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetchSiteStatus();
        if (mounted) setMaintenance(!!res.maintenance_mode);
      } catch {}
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (maintenance) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(255,255,255,0.98)',
        zIndex: 99999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src="/server-down.svg" alt="Server Down" style={{ maxWidth: 320, width: '90%', marginBottom: 32 }} />
        <h1 style={{ fontSize: 48, color: '#5e72e4', marginBottom: 16 }}>🚧 Site Under Construction</h1>
        <p style={{ fontSize: 20, color: '#333', marginBottom: 32 }}>We'll be back soon. Thank you for your patience!</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/signup" element={<UnifiedSignup />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/student/community" element={<CommunityFeed />} />
          <Route path="/mentor/community" element={<CommunityFeed />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/share" element={<PrivateRoute><CommunityFeed /></PrivateRoute>} />
          <Route path="/services/problems" element={<PrivateRoute><div>Problems Page (Coming Soon)</div></PrivateRoute>} />
          <Route path="/services/hackathons" element={<PrivateRoute><div>Hackathons Page (Coming Soon)</div></PrivateRoute>} />
          <Route path="/services/events" element={<PrivateRoute><div>Events Page (Coming Soon)</div></PrivateRoute>} />
          {/* Protected Student Routes */}
          <Route path="/student/dashboard" element={<PrivateRoute role="student"><StuDashboard /></PrivateRoute>} />
          <Route path="/student/dashboard/mentor/:mentorId" element={<PrivateRoute role="student"><StuDashboard /></PrivateRoute>} />
          {/* Protected Mentor Routes */}
          <Route path="/mentor/dashboard" element={<PrivateRoute role="mentor"><Dashboard /></PrivateRoute>} />
          <Route path="/mentor/dashboardLayout" element={<PrivateRoute role="mentor"><DashboardLayout /></PrivateRoute>} />
          {/* Mentor profile is public, do not protect: */}
          <Route path="/mentor/:id" element={<MentorProfile />} />
        </Routes>
        <ScrollToTopButton />
      </Router>
    </AuthProvider>
  );
}

export default App;
