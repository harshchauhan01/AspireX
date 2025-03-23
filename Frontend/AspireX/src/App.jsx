import './App.css'

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';  // Import Login component
import Register from './components/Register';  // Import Register component

function App() {
  return (
    <Router>
      <div>
        <h1>Welcome to the Mentorship Platform</h1>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
