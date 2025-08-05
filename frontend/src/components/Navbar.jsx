import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/NavbarCommunity.css';
import logo from '../assets/logo.png';

const Navbar = ({ setActiveTab, setShowProfile }) => {
  return (
    <nav className="navbar-community">
      <div className="navbar-logo"> 
        <img src={logo} alt="AspireX Logo" />
      </div>
      <div className="navbar-center">
        <button onClick={() => setActiveTab('all')} className="navbar-link">All Posts</button>
      </div>
      <div className="navbar-profile" onClick={() => setShowProfile(true)}>
        <span className="navbar-profile-icon">👤</span>
      </div>
    </nav>
  );
};

export default Navbar;
