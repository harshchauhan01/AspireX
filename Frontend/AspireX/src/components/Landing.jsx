import React from "react";
import { useState } from "react";

import "./Landing.css";
import Navone from "./Navone";
function Landing() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Navone/>
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
