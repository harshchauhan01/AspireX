import React from 'react'
import "./Navtwo.css";
import { useState } from "react";
import { faUser, faMagnifyingGlass, faBell } from "@fortawesome/free-solid-svg-icons"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faIdCard} from "@fortawesome/free-solid-svg-icons";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons"; 
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
const Navtwo = () => {
  return (
    <>
         <div id="wel-nav">
                        <div id="nav-inside">
                          <div id="c-name">Aspire X</div>
                          <div id="nav-options">
                            <a href="#">Home</a>
                            <a href="#">Explore</a>
                            <a href="#">Top Mentors</a>
                            <a href="#">Name</a>
                            <div className="dropdown">
                            <a href="#">
                              <FontAwesomeIcon icon={faUser} />
                             </a>
                             <div className="dropdown-content">
                              <a href="#" className="page-logout"> <FontAwesomeIcon icon={faIdCard} />View Profile</a>
                              <a href="#" className="page-logout"> <FontAwesomeIcon icon={faRightFromBracket} />Logout</a>
                             </div>
                
                            </div>
                            
                            
                          </div>
                        </div>
                      </div>
                      <div id="wel-line"></div>
    </>
  )
}

export default Navtwo
