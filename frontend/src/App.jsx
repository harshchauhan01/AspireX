import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Mentor/Authentication/Login';
import Register from './Mentor/Authentication/Register';
import Dashboard from './Mentor/Pages/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import Home from './components/Home';
import SLogin from './Student/Authentication/login';
import SRegister from './Student/Authentication/register';
import StuDashboard from './Student/pages/Dashboard';
import MentorProfile from './Student/pages/MentorProfile';
import ContactPage from './components/ContactPage';
import PrivateRoute from './components/PrivateRoute';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="/student/login" element={<SLogin />} />
        <Route path="/student/signup" element={<SRegister />} />
        <Route path="/mentor/login" element={<Login />} />
        <Route path="/mentor/signup" element={<Register />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* Protected Student Routes */}
        <Route path="/student/dashboard" element={<PrivateRoute role="student"><StuDashboard /></PrivateRoute>} />
        <Route path="/student/dashboard/mentor/:mentorId" element={<PrivateRoute role="student"><StuDashboard /></PrivateRoute>} />
        {/* Protected Mentor Routes */}
        <Route path="/mentor/dashboard" element={<PrivateRoute role="mentor"><Dashboard /></PrivateRoute>} />
        <Route path="/mentor/dashboardLayout" element={<PrivateRoute role="mentor"><DashboardLayout /></PrivateRoute>} />
        {/* Mentor profile is public, do not protect: */}
        <Route path="/mentor/:id" element={<MentorProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
