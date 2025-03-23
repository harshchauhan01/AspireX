import React from "react";
import { useState } from "react";
import images from  "../assets/";
function Landing() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="land-nav">
        <div className="land-nav-logo">Aspire X</div>
        <ul className="land-nav-ul">
          <li className="land-nav-li">Log in</li>
          <li className="land-nav-li">Sign up</li>
          <li className="land-nav-li">Become a mentor</li>
        </ul>
          <div className="hamburger" onClick={toggleNav}>☰</div>
      </div>
      <div className="land-nav-sprtor"></div>
      <div className={`side-nav ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleNav}>×</button>
        <ul>
          <li><a href="#">Log in</a></li>
          <li><a href="#">Sign up</a></li>
          <li><a href="#">Become a mentor</a></li>
        </ul>
      </div>
      <div className="land-hero">
              <div className="land-text-part">
                <div className="land-text1">Hi, there!</div>
                <div className="land-text2">
                  Your Journey, Our Guidance! <br />
                  <span>Aspire</span> for More!
                </div>
                <div className="land-text3">
                  An adaptive mentorship platform designed to connect aspiring
                  individuals with expert mentors, fostering growth through
                  personalized guidance and meaningful connections.
                </div>
                <button className="land-join-btn">Join Now</button>
              </div>
        <div className="land-img-part">
          <div className="image-container">
            <div className="background-square"></div>
            <div className="image-wrapper">
              <img src="/1stimg-removebg-preview.png" alt="Smiling person" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Landing;
