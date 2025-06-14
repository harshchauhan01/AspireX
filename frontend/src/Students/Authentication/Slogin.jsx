import React, { useState, useEffect } from "react";
import './Slogin.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faApple, faTwitter } from '@fortawesome/free-brands-svg-icons';
import Navone from "/src/components/Navone";
// import {loginuser} from "../services/api"
import { Link,useNavigate } from 'react-router-dom';
import axios from 'axios';

const Typewriter = ({ text, speed = 10 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0); // Track index as state
  
  useEffect(() => {
    if (index < text.length) {
      const interval = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, speed);

      return () => clearTimeout(interval);
    }
  }, [index, text, speed]); // Dependency array includes index

  return <span>{displayedText}</span>;
};


const Slogin = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authTokens, setAuthTokens] = useState(null);
  const navigate = useNavigate(); // Use useNavigate for redirection

  const handleSubmit = async (e) => {
    e.preventDefault();
    const credentials = { email: username, password };
    console.log("Sending credentials:", credentials);


    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/student/login/",
        credentials,
        { headers: { "Content-Type": "application/json" } }
      );
      setAuthTokens(response.data);

      console.log("Login successful:", response.data);
      
      // Redirect to home page after login
      navigate("/Home_student");
    } catch (error) {
      console.error(
        "Login failed:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div>
      <Navone/>
      <div id="Middle">
        <div className="heading">
          <h2 id="Perfect"> <Typewriter text="Want the Perfect Guidance ?" speed={100} /></h2>
          <div className="wantimg">
            {/* <img src={signinImg} alt="" id="img1" /> */}
            <img src="/signinimg.svg" alt="" id="img1"/>
          </div>
          <div>
          </div>
        </div>
        {/* Sign-in Form */}
        <div className="Signinbutton">
          <div className="container">
            <div className="heading">Sign In</div>
            <form onSubmit={handleSubmit} className="form">
              <input
                required
                className="input"
                type="text"
                name="email"
                id="email"
                placeholder="E-mail"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                required
                className="input"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <span className="forgot-password">
                <a href="#">Forgot Password ?</a>
              </span>
              <input className="login-button" type="submit" value="Sign In" />
            </form>

            {/* Social Media Sign-In */}
            <div className="social-account-container">
              <span className="title">Or Sign in with</span>
              <div className="social-accounts">
                <button className="social-button google">
                  <FontAwesomeIcon icon={faGoogle} />
                </button>
                <button className="social-button apple">
                  <FontAwesomeIcon icon={faApple} />
                </button>
                <button className="social-button twitter">
                  <FontAwesomeIcon icon={faTwitter} />
                </button>
              </div>
            </div>
            <span className="agreement">
              <a href="#">Learn user licence agreement</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slogin;
