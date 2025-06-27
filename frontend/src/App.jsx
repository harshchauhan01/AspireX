import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Mentor/Authentication/Login';
import Register from './Mentor/Authentication/Register';
import Dashboard from './Mentor/Pages/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import Home from './components/Home';
import SLogin from './Student/Authentication/login';
import SRegister from './Student/Authentication/register';
import SDashboard from './Student/pages/Dashboard';
import StuHomepage from './Student/pages/StuHomepage';
import Expore from './Student/pages/Expore';
import En_mentor from './Student/pages/En_mentor';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="/student/login" element={<SLogin />} />
        <Route path="/student/signup" element={<SRegister />} />
        <Route path="/student/dashboard" element={<SDashboard />} />
        <Route path="/student/Home_student" element={<StuHomepage />} />
        <Route path="/student/Expore" element={<Expore />} />
        <Route path="/student/En_mentor" element={<En_mentor />} />
        <Route path="/mentor/login" element={<Login />} />
        <Route path="/mentor/signup" element={<Register />} />
        <Route path="/mentor/dashboard" element={<Dashboard />} />
        <Route path="/mentor/dashboardLayout" element={<DashboardLayout />} />  
      </Routes>
    </Router>
  );
}

export default App;
