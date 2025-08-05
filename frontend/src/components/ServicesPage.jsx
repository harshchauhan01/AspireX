import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/ServicesPage.css';
import { GiHamburgerMenu } from 'react-icons/gi';
import { IoMdClose } from 'react-icons/io';
import Services from './services';

const ServicesPage = () => {
  const navigate = useNavigate();
  const profileInitials = 'SA';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user role and authentication status
  const userRole = localStorage.getItem('userRole');
  const mentorToken = localStorage.getItem('Mentortoken');
  const studentToken = localStorage.getItem('token');
  const isAuthenticated = mentorToken || studentToken;

  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.removeItem('Mentortoken');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleDashboardClick = () => {
    setDropdownOpen(false);
    if (userRole === 'mentor') {
      navigate('/mentor/dashboard');
    } else if (userRole === 'student') {
      navigate('/student/dashboard');
    } else {
      // Fallback - try to determine role from token
      if (mentorToken) {
        navigate('/mentor/dashboard');
      } else if (studentToken) {
        navigate('/student/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  // Detect mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="services-root">
      <nav className="services-navbar">
        <div className="services-navbar-logo" onClick={() => navigate('/')}>AspireX</div>
        {isMobile && (
          <div className="services-hamburger" onClick={() => setMobileMenuOpen(open => !open)}>
            {mobileMenuOpen ? <IoMdClose size={28} /> : <GiHamburgerMenu size={28} />}
          </div>
        )}
        <div className={`services-navbar-menu${isMobile ? (mobileMenuOpen ? ' open' : '') : ''}`}> 
          <ul className="services-navbar-links">
            <li onClick={() => {navigate('/services/share'); setMobileMenuOpen(false);}}>Share</li>
            <li onClick={() => {navigate('/services/problems'); setMobileMenuOpen(false);}}>Problems</li>
            <li onClick={() => {navigate('/services/hackathons'); setMobileMenuOpen(false);}}>Hackathons</li>
            <li onClick={() => {navigate('/services/events'); setMobileMenuOpen(false);}}>Events</li>
          </ul>
          <div className="services-navbar-profile">
            <span
              className="services-profile-avatar"
              tabIndex={0}
              onClick={() => setDropdownOpen(open => !open)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            >
              {profileInitials}
            </span>
            {dropdownOpen && (
              <div className="services-dropdown-menu">
                {isAuthenticated && (
                  <button onClick={handleDashboardClick}>Dashboard</button>
                )}
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="services-content">
        {/* <h1>Services</h1> */}
        {/* <p>Welcome to the Services page! Choose an option from the navbar above.</p> */}
        <Services/>
      </div>
    </div>
  );
};

export default ServicesPage; 