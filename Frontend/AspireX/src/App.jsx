import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';  // Import Login component
import Register from './components/Register';  // Import Register component
import Landing from './components/Landing';
import "./App.css"
import Mentlogin from './components/Mentlogin';
function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mentorlogin" element={<Mentlogin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
