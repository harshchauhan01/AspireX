import React, { useState } from 'react';
import API from '../../BackendConn/api';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

function SRegister() {
  const [form, setForm] = useState({ email: '',name: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('')
  const [token, setToken] = useState(null)
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
        const res = await API.post('student/register/', form);
      
      localStorage.setItem('token', res.data.token);
      alert('Registration successful! \nYour Student ID : ' + res.data.student.student_id);
      navigate('/student/login');
      
      
    } catch (err) {
        setError(err.response?.data?.detail || 'Error during registration');
    }
  };

  return (
    <StyledPageWrapper>
      <StyledWrapper>
        <div className="container">
          <MentorSwitch href="/mentor/login">Login as a Mentor</MentorSwitch>
          <div className="heading">Sign Up</div>
          {error && <p className="text-red-500">{error}</p>}
          <form className="form" onSubmit={handleSubmit}>
            <input placeholder="Name" id="text" name="name" type="text" className="input" onChange={handleChange} required />
            <input placeholder="Email" id="email" name="email" type="email" className="input" onChange={handleChange} required />
            <input placeholder="Password" id="password" name="password" type="password" className="input" onChange={handleChange} required />
            <span className="forgot-password"><a href="#">Forgot Password?</a></span>
            <input defaultValue="Sign Up" type="submit" className="login-button" />
          </form>
          <div className="social-account-container">
            <span className="title">Or Sign up with</span>
            <div className="social-accounts">
              <button className="social-button google">
                <svg viewBox="0 0 488 512" height="1em" xmlns="http://www.w3.org/2000/svg" className="svg">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                </svg>
              </button>
              <button className="social-button apple">
                <svg viewBox="0 0 384 512" height="1em" xmlns="http://www.w3.org/2000/svg" className="svg">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
              </button>
              <button className="social-button twitter">
                <svg viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg" className="svg">
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </button>
            </div>
          </div>
          <span className="agreement"><a href="#">Learn user licence agreement</a></span>
        </div>
      </StyledWrapper>
    </StyledPageWrapper>
  );
}

export default SRegister;




const StyledWrapper = styled.div`
  .container {
    max-width: 380px;
    width: 100%;
    background: #fff;
    border-radius: 32px;
    padding: 40px 35px 32px 35px;
    border: none;
    box-shadow: 0 8px 32px rgba(16,137,211,0.10), 0 1.5px 6px rgba(16,137,211,0.08);
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .heading {
    text-align: center;
    font-weight: 900;
    font-size: 2.2rem;
    color: #1089d3;
    margin-bottom: 10px;
    letter-spacing: 1px;
  }

  .form {
    margin-top: 20px;
    width: 100%;
  }

  .form .input {
    width: 100%;
    background: #f4f7fb;
    border: none;
    padding: 14px 18px;
    border-radius: 16px;
    margin-top: 15px;
    box-shadow: 0 2px 8px #cff0ff44;
    border-inline: 2px solid transparent;
    font-size: 1rem;
    transition: border 0.2s;
  }

  .form .input:focus {
    outline: none;
    border-inline: 2px solid #12b1d1;
    background: #fff;
  }

  .form .forgot-password {
    display: block;
    margin-top: 10px;
    margin-left: 2px;
    text-align: right;
    width: 100%;
  }

  .form .forgot-password a {
    font-size: 12px;
    color: #0099ff;
    text-decoration: none;
    transition: color 0.2s;
  }
  .form .forgot-password a:hover {
    color: #1089d3;
    text-decoration: underline;
  }

  .form .login-button {
    display: block;
    width: 100%;
    font-weight: bold;
    background: linear-gradient(45deg, #1089d3 0%, #12b1d1 100%);
    color: white;
    padding-block: 14px;
    margin: 22px auto 0 auto;
    border-radius: 16px;
    box-shadow: 0 4px 16px #85bdd733;
    border: none;
    font-size: 1.1rem;
    transition: all 0.2s;
    letter-spacing: 1px;
  }

  .form .login-button:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 24px #85bdd744;
  }

  .form .login-button:active {
    transform: scale(0.97);
    box-shadow: 0 2px 8px #85bdd744;
  }

  .social-account-container {
    margin-top: 25px;
    width: 100%;
  }

  .social-account-container .title {
    display: block;
    text-align: center;
    font-size: 11px;
    color: #aaaaaa;
    margin-bottom: 8px;
  }

  .social-account-container .social-accounts {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 18px;
    margin-top: 5px;
  }

  .social-account-container .social-accounts .social-button {
    background: linear-gradient(45deg, #000 0%, #707070 100%);
    border: 4px solid #fff;
    padding: 7px;
    border-radius: 50%;
    width: 40px;
    aspect-ratio: 1;
    display: grid;
    place-content: center;
    box-shadow: 0 4px 12px #85bdd744;
    transition: all 0.2s;
  }

  .social-account-container .social-accounts .social-button .svg {
    fill: white;
    margin: auto;
    width: 20px;
    height: 20px;
  }

  .social-account-container .social-accounts .social-button:hover {
    transform: scale(1.15);
    box-shadow: 0 8px 24px #85bdd744;
  }

  .social-account-container .social-accounts .social-button:active {
    transform: scale(0.92);
  }

  .agreement {
    display: block;
    text-align: center;
    margin-top: 18px;
  }

  .agreement a {
    text-decoration: none;
    color: #0099ff;
    font-size: 10px;
    transition: color 0.2s;
  }
  .agreement a:hover {
    color: #1089d3;
    text-decoration: underline;
  }

  /* Error message styling */
  .text-red-500 {
    color: #e74c3c;
    text-align: center;
    margin-top: 8px;
    font-size: 0.98rem;
    font-weight: 500;
  }
`;

const StyledPageWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%);
  padding: 0;
`;

const MentorSwitch = styled.a`
  display: block;
  text-align: right;
  color: #145af2;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  transition: color 0.2s;
  cursor: pointer;
  &:hover {
    color: #0d3ea1;
    text-decoration: underline;
  }
`;
