import React, { useState } from 'react';
import API from '../../BackendConn/api';
import styled from 'styled-components';
import { useNavigate } from "react-router-dom";
import Modal from '../../components/ui/Modal';

const LICENSE_AGREEMENT = `
User License Agreement\n\nEffective Date: 2024-07-09\n\nWelcome to AspireX! Please read this User License Agreement (“Agreement”) carefully before using our platform. By accessing or using AspireX, you agree to be bound by the terms of this Agreement.\n\n1. License Grant\nAspireX grants you a limited, non-exclusive, non-transferable, and revocable license to use the platform for your personal, non-commercial educational purposes, subject to the terms of this Agreement.\n\n2. User Roles\n- Student: An individual seeking to learn, book sessions, and interact with mentors on AspireX.\n- Mentor: An individual providing educational sessions, guidance, and support to students via AspireX.\n- Administrator: AspireX staff responsible for managing the platform, resolving disputes, and ensuring compliance.\n\n3. User Obligations\n- You agree to use AspireX in compliance with all applicable laws and regulations.\n- You will not misuse the platform, attempt unauthorized access, or disrupt the service.\n\n4. Session Conduct\n- All users must maintain professionalism and respect during sessions.\n- Harassment, discrimination, or inappropriate behavior is strictly prohibited and may result in suspension or termination of your account.\n- Sessions must be conducted through AspireX’s approved communication channels, including the in-platform chat and video tools. Communication outside these channels is discouraged and AspireX is not responsible for any issues arising from such interactions.\n\n5. Payment and Refund Policy\n- Students are required to pay session fees in advance through approved payment gateways.\n- AspireX is not responsible for any failed or delayed transactions; if a payment fails, it is the user’s responsibility to resolve the issue with their payment provider.\n- If a scheduled meeting/session is cancelled by the mentor or AspireX, the student will receive a full refund within 5-7 business days.\n- No refunds will be issued for completed sessions or for cancellations initiated by the student, except as outlined in AspireX’s refund policy.\n- Mentors will receive payments for completed sessions as per the payout schedule.\n\n6. Age Restriction\n- You must be at least 16 years old to use AspireX. By registering, you confirm that you meet this age requirement.\n\n7. Intellectual Property\nAll content, trademarks, and data on AspireX are the property of AspireX or its licensors. You may not copy, modify, distribute, or create derivative works without express written permission.\n\n8. Privacy\nYour use of AspireX is also governed by our Privacy Policy. Please review it to understand our practices.\n\n9. Termination\nAspireX reserves the right to suspend or terminate your access at any time for violation of this Agreement.\n\n10. Disclaimer\nAspireX is provided “as is” without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of the platform.\n\n11. Limitation of Liability\nAspireX shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.\n\n12. Arbitration Clause\nAny disputes arising out of or relating to this Agreement or your use of AspireX shall be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996. The decision of the arbitrator shall be final and binding on both parties.\n\n13. Governing Law and Jurisdiction\nThis Agreement shall be governed by and construed in accordance with the laws of India. Any legal action or proceeding arising under this Agreement shall be subject to the exclusive jurisdiction of the courts located in India.\n\n14. Changes to Agreement\nWe may update this Agreement from time to time. Continued use of AspireX after changes constitutes acceptance of the new terms.\n\nContact Us\nIf you have any questions about this Agreement, please contact us at [support@aspirex.com].
`;

const TERMS_AND_CONDITIONS = `\nTerms & Conditions\n\nBy using AspireX, you agree to abide by all platform rules, policies, and applicable laws. You must not use AspireX for any unlawful or prohibited purpose. For full details, please refer to the User License Agreement.\n\nContact support@aspirex.com for any questions.`;

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(null);
  const [showLicense, setShowLicense] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  function isStrongPassword(password) {
    // At least 8 chars, 1 upper, 1 lower, 1 digit, 1 special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to register.');
      return;
    }
    if (!isStrongPassword(form.password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      return;
    }
    try {
      const res = await API.post('mentor/register/', { ...form, accepted_terms: true });
      localStorage.setItem('Mentortoken', res.data.token);
      alert('Registration successful! \nYour Mentor ID : ' + res.data.mentor.mentor_id);
      navigate('/login');
    } catch (err) {
      setError('Error during registration');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <StyledPageWrapper>
      <StyledWrapper>
        <div className="container">
          <StudentSwitch href="">Login as a Mentor</StudentSwitch>
          <div className="heading">Sign Up</div>
          {error && <p className="text-red-500">{error}</p>}
          <form className="form" onSubmit={handleSubmit}>
            <input placeholder="Name" id="text" name="name" type="text" className="input" onChange={handleChange} required />
            <input placeholder="Email" id="email" name="email" type="email" className="input" onChange={handleChange} required />
            <input placeholder="Password" id="password" name="password" type="password" className="input" onChange={handleChange} required autoComplete="new-password" />
            <span className="forgot-password"><a href="#">Forgot Password ?</a></span>
            <div style={{ marginTop: '12px', fontSize: '11px' }}>
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                required
                style={{ marginRight: '6px' }}
              />
              I accept the{' '}
              <a href="#" onClick={e => { e.preventDefault(); setShowTerms(true); }} style={{ color: '#0099ff', textDecoration: 'underline' }}>
                Terms & Conditions
              </a>
              {' '}and{' '}
              <a href="#" onClick={e => { e.preventDefault(); setShowLicense(true); }} style={{ color: '#0099ff', textDecoration: 'underline' }}>
                User License Agreement
              </a>
              .
            </div>
            <input defaultValue="Sign Up" type="submit" className="login-button" />
          </form>
          <div className="social-account-container">
            <span className="title">Or Sign in with</span>
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
          <span className="agreement"><a href="#" onClick={e => { e.preventDefault(); setShowLicense(true); }}>Learn user licence agreement</a></span>
        </div>
        <Modal isOpen={showLicense} onClose={() => setShowLicense(false)} title="User License Agreement">
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', maxHeight: '60vh', overflowY: 'auto' }}>{LICENSE_AGREEMENT}</pre>
        </Modal>
        <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms & Conditions">
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', maxHeight: '60vh', overflowY: 'auto' }}>{TERMS_AND_CONDITIONS}</pre>
        </Modal>
      </StyledWrapper>
    </StyledPageWrapper>
  );
}

export default Register;




const StyledWrapper = styled.div`
  .container {
    max-width: 350px;
    background: #f8f9fd;
    background: linear-gradient(
      0deg,
      rgb(255, 255, 255) 0%,
      rgb(244, 247, 251) 100%
    );
    border-radius: 40px;
    padding: 25px 35px;
    border: 5px solid rgb(255, 255, 255);
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 30px 30px -20px;
    margin: 20px;
  }

  .heading {
    text-align: center;
    font-weight: 900;
    font-size: 30px;
    color: rgb(16, 137, 211);
  }

  .form {
    margin-top: 20px;
  }

  .form .input {
    width: 100%;
    background: white;
    border: none;
    padding: 15px 20px;
    border-radius: 20px;
    margin-top: 15px;
    box-shadow: #cff0ff 0px 10px 10px -5px;
    border-inline: 2px solid transparent;
  }

  .form .input::-moz-placeholder {
    color: rgb(170, 170, 170);
  }

  .form .input::placeholder {
    color: rgb(170, 170, 170);
  }

  .form .input:focus {
    outline: none;
    border-inline: 2px solid #12b1d1;
  }

  .form .forgot-password {
    display: block;
    margin-top: 10px;
    margin-left: 10px;
  }

  .form .forgot-password a {
    font-size: 11px;
    color: #0099ff;
    text-decoration: none;
  }

  .form .login-button {
    display: block;
    width: 100%;
    font-weight: bold;
    background: linear-gradient(
      45deg,
      rgb(16, 137, 211) 0%,
      rgb(18, 177, 209) 100%
    );
    color: white;
    padding-block: 15px;
    margin: 20px auto;
    border-radius: 20px;
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 20px 10px -15px;
    border: none;
    transition: all 0.2s ease-in-out;
  }

  .form .login-button:hover {
    transform: scale(1.03);
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 23px 10px -20px;
  }

  .form .login-button:active {
    transform: scale(0.95);
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 15px 10px -10px;
  }

  .social-account-container {
    margin-top: 25px;
  }

  .social-account-container .title {
    display: block;
    text-align: center;
    font-size: 10px;
    color: rgb(170, 170, 170);
  }

  .social-account-container .social-accounts {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 5px;
  }

  .social-account-container .social-accounts .social-button {
    background: linear-gradient(45deg, rgb(0, 0, 0) 0%, rgb(112, 112, 112) 100%);
    border: 5px solid white;
    padding: 5px;
    border-radius: 50%;
    width: 40px;
    aspect-ratio: 1;
    display: grid;
    place-content: center;
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 12px 10px -8px;
    transition: all 0.2s ease-in-out;
  }

  .social-account-container .social-accounts .social-button .svg {
    fill: white;
    margin: auto;
  }

  .social-account-container .social-accounts .social-button:hover {
    transform: scale(1.2);
  }

  .social-account-container .social-accounts .social-button:active {
    transform: scale(0.9);
  }

  .agreement {
    display: block;
    text-align: center;
    margin-top: 15px;
  }

  .agreement a {
    text-decoration: none;
    color: #0099ff;
    font-size: 9px;
  }`;

const StyledPageWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%);
  padding: 0;
`;

const StudentSwitch = styled.a`
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
