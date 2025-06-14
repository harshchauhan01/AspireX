import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Mentor/Authentication/Login';
import Register from './Mentor/Authentication/Register';
import Dashboard from './Mentor/Pages/Dashboard';
import Slogin from "./Students/Authentication/Slogin";
import Sreg from "./Students/Authentication/Sreg";
import Home_student from "./Students/Authentication/Home_student";
import Home from './components/Home';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mentor/login" element={<Login />} />
        <Route path="/mentor/signup" element={<Register />} />
        <Route path="/mentor/dashboard" element={<Dashboard />} />
        <Route path="/Students/Authentication/Slogin" element={<Slogin />} />
        <Route path="/Students/Authentication/Sreg" element={<Sreg />} />
        <Route path="/Students/Authentication/Home_student" element={<Home_student />} />
      </Routes>
    </Router>
  );
}

export default App;
