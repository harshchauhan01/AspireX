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


function App() {
  return (
    <Router>
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="/student/login" element={<SLogin />} />
        <Route path="/student/signup" element={<SRegister />} />
        <Route path="/student/dashboard" element={<StuDashboard />} />
        <Route path="/student/dashboard/mentor/:mentorId" element={<StuDashboard />} />
        <Route path="/mentor/:id" element={<MentorProfile />} />
        <Route path="/mentor/login" element={<Login />} />
        <Route path="/mentor/signup" element={<Register />} />
        <Route path="/mentor/dashboard" element={<Dashboard />} />
        <Route path="/mentor/dashboardLayout" element={<DashboardLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
