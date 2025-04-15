import React, { useState } from 'react';
import './BecomeMentor.css';
import Navone from "./Navone";
import mentorplantimg from '../assets/mentorplantimg.png';
const BecomeMentor = () => {
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup

  return (
    <>
        <Navone/>
       
      <section className="auth-forms">
        <div className="form-toggle">
          <button
            onClick={() => setIsLogin(true)}
            className={isLogin ? 'active' : ''}
            style={{ backgroundColor: isLogin ? '#00B8E6' : '#ccc', color: 'white' }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={!isLogin ? 'active' : ''}
            style={{ backgroundColor: !isLogin ? '#00B8E6' : '#ccc', color: 'white' }}
          >
            Sign Up
          </button>
        </div>
        <div className="form-slider">
          <div className={`form-container ${isLogin ? 'slide-left' : 'slide-right'}`}>
            {/* Login Form */}
            <div className="form-box">
              <h3>Login</h3>
              <form>
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Password" required />
                <button type="submit" style={{ backgroundColor: '#00B8E6', color: 'white' }}>
                  Log In
                </button>
              </form>
            </div>

            {/* Signup Form */}
            <div className="form-box">
              <h3>Sign Up</h3>
              <form>
                <input type="text" placeholder="Full Name" required />
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Password" required />
                <button type="submit" style={{ backgroundColor: '#00B8E6', color: 'white' }}>
                  Sign Up
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    
    
    </>
  );
};

export default BecomeMentor;