import React from 'react'
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navone = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const toggleNav = () => {
      setIsOpen(!isOpen);
    };
    const handleNavigation = (path) => {
      // alert("clicked");
        navigate(path);
      };
    
  return (
    <>
         <div className="land-nav">
        <div className="land-nav-logo"><a onClick={() => handleNavigation("/")}>Aspire X</a></div>
        <ul className="land-nav-ul">
            <li className='land-nav-li'><a onClick={() => handleNavigation("/student/login")}>Log in</a></li>
            <li className='land-nav-li'><a onClick={() => handleNavigation("/student/signup")}>Sign up</a></li>
            <li className='land-nav-li'><a onClick={() => handleNavigation("/mentor/signup")}>Become a mentor</a></li>
            <li className='land-nav-li'><a onClick={() => handleNavigation("/contact")}>Contact</a></li>
        </ul>
          <div className="hamburger" onClick={toggleNav}>☰</div>
      </div>
      <div className="land-nav-sprtor"></div>
      <div className={`side-nav ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleNav}>×</button>
        <ul>
            <li><a onClick={() => handleNavigation("/student/login")}>Log in</a></li>
            <li><a onClick={() => handleNavigation("/student/signup")}>Sign up</a></li>
            <li><a onClick={() => handleNavigation("/mentor/signup")}>Become a mentor</a></li>
            <li><a onClick={() => handleNavigation("/contact")}>Contact</a></li>
        </ul>
      </div>
    </>
  )
}

export default Navone
