import React, { useState, useEffect } from "react";
import './Login.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faApple, faTwitter } from '@fortawesome/free-brands-svg-icons';
import signinImg from '../assets/signinimg.svg';
import Navone from "./Navone";
import {loginuser} from "../services/api"
import { Link,useNavigate } from 'react-router-dom';

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


const SigninPage = () => {

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, seterror] = useState(null);
const navigate = useNavigate();

const handleEmailChange=(e)=>{
  setEmail(e.target.value);
}
const handlePasswordChange=(e)=>{
  setPassword(e.target.value);
}
const handleSubmit= async(e)=>{
    e.preventDefault();
    try{
      const res = await loginuser({ username, password }); 
            localStorage.setItem("token", res.data.access); 
            alert("Logged in Successfully!");
            navigate("/Landing");
    }catch(err){
        console.log(error);
        alert("Login failed! Check credentials.");
    }
  };
  return (
    <div>
      <Navone/>
      <div id="Middle">
        <div className="heading">
          <h2 id="Perfect"> <Typewriter text="Want the Perfect Guidance ?" speed={100} /></h2>
          <div className="wantimg">
            <img src={signinImg} alt="" id="img1" />
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
                type="email"
                name="email"
                id="email"
                placeholder="E-mail"
                value={email}
                onChange={handleEmailChange}
              />
              <input
                required
                className="input"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              />
               {error && <span className="error-message">{error}</span>}
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

export default SigninPage;
