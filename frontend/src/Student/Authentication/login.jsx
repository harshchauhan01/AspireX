import React, { useState, useEffect } from 'react';
import API from '../../BackendConn/api';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Modal from '../../components/ui/Modal';

const LICENSE_AGREEMENT = `
User License Agreement\n\nEffective Date: 2024-07-09\n\nWelcome to AspireX! Please read this User License Agreement ("Agreement") carefully before using our platform. By accessing or using AspireX, you agree to be bound by the terms of this Agreement.\n\n1. License Grant\nAspireX grants you a limited, non-exclusive, non-transferable, and revocable license to use the platform for your personal, non-commercial educational purposes, subject to the terms of this Agreement.\n\n2. User Roles\n- Student: An individual seeking to learn, book sessions, and interact with mentors on AspireX.\n- Mentor: An individual providing educational sessions, guidance, and support to students via AspireX.\n- Administrator: AspireX staff responsible for managing the platform, resolving disputes, and ensuring compliance.\n\n3. User Obligations\n- You agree to use AspireX in compliance with all applicable laws and regulations.\n- You will not misuse the platform, attempt unauthorized access, or disrupt the service.\n\n4. Session Conduct\n- All users must maintain professionalism and respect during sessions.\n- Harassment, discrimination, or inappropriate behavior is strictly prohibited and may result in suspension or termination of your account.\n- Sessions must be conducted through AspireX's approved communication channels, including the in-platform chat and video tools. Communication outside these channels is discouraged and AspireX is not responsible for any issues arising from such interactions.\n\n5. Payment and Refund Policy\n- Students are required to pay session fees in advance through approved payment gateways.\n- AspireX is not responsible for any failed or delayed transactions; if a payment fails, it is the user's responsibility to resolve the issue with their payment provider.\n- If a scheduled meeting/session is cancelled by the mentor or AspireX, the student will receive a full refund within 5-7 business days.\n- No refunds will be issued for completed sessions or for cancellations initiated by the student, except as outlined in AspireX's refund policy.\n- Mentors will receive payments for completed sessions as per the payout schedule.\n\n6. Age Restriction\n- You must be at least 16 years old to use AspireX. By registering, you confirm that you meet this age requirement.\n\n7. Intellectual Property\nAll content, trademarks, and data on AspireX are the property of AspireX or its licensors. You may not copy, modify, distribute, or create derivative works without express written permission.\n\n8. Privacy\nYour use of AspireX is also governed by our Privacy Policy. Please review it to understand our practices.\n\n9. Termination\nAspireX reserves the right to suspend or terminate your access at any time for violation of this Agreement.\n\n10. Disclaimer\nAspireX is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of the platform.\n\n11. Limitation of Liability\nAspireX shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.\n\n12. Arbitration Clause\nAny disputes arising out of or relating to this Agreement or your use of AspireX shall be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996. The decision of the arbitrator shall be final and binding on both parties.\n\n13. Governing Law and Jurisdiction\nThis Agreement shall be governed by and construed in accordance with the laws of India. Any legal action or proceeding arising under this Agreement shall be subject to the exclusive jurisdiction of the courts located in India.\n\n14. Changes to Agreement\nWe may update this Agreement from time to time. Continued use of AspireX after changes constitutes acceptance of the new terms.\n\nContact Us\nIf you have any questions about this Agreement, please contact us at [support@aspirex.com].
`;

const TERMS_AND_CONDITIONS = `\nTerms & Conditions\n\nBy using AspireX, you agree to abide by all platform rules, policies, and applicable laws. You must not use AspireX for any unlawful or prohibited purpose. For full details, please refer to the User License Agreement.\n\nContact support@aspirex.com for any questions.`;

function SLogin() {
  const [form, setForm] = useState({ student_id: '', password: '' });
  const [error, setError] = useState('');
  const [showLicense, setShowLicense] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize Google Sign-In
  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: handleGoogleSignIn,
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { 
            theme: 'outline', 
            size: 'large',
            width: '100%',
            text: 'signin_with'
          }
        );
      }
    };

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleGoogleSignIn = async (response) => {
    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to login.');
      return;
    }

    setIsGoogleLoading(true);
    setError('');

    try {
      // Send the ID token to our unified auth backend
      const result = await API.post('auth/google/verify/', {
        id_token: response.credential,
        user_type: 'student'
      });

      // Store the token
      localStorage.removeItem('Mentortoken');
      localStorage.setItem('token', result.data.token);
      
      alert('Google login successful! Check your email for your credentials.');
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.response?.data?.error || 'Google authentication failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to login.');
      return;
    }
    // Clear previous tokens
    localStorage.removeItem('Mentortoken');
    localStorage.removeItem('token');
    try {
      const res = await API.post('student/login/', form);
      localStorage.setItem('token', res.data.token);
      alert('Login successful!');
      navigate('/student/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

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

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="p-6 bg-white rounded shadow">
        <StyledWrapper>
          <div className="container">
            <MentorSwitch href="">Login as a Student</MentorSwitch>
            <div className="heading">Sign In</div>
            {error && <p className="text-red-500">{error}</p>}
            <form className="form" action onSubmit={handleSubmit}>
              <input placeholder="Student ID" id="text" name="student_id" type="text" className="input" onChange={handleChange} required />
              <input placeholder="Password" id="password" name="password" type="password" className="input" onChange={handleChange} required autoComplete="current-password" />
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
              <input defaultValue="Sign In" type="submit" className="login-button" />
            </form>
            <div className="social-account-container">
              <span className="title">Or Sign in with</span>
              <div className="social-accounts">
                <div id="google-signin-button" style={{ width: '100%', marginBottom: '10px' }}></div>
                {isGoogleLoading && <div style={{ textAlign: 'center', color: '#666' }}>Processing...</div>}
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
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
              Don't have an account?{' '}
              <a href="#" style={{ color: '#0099ff', textDecoration: 'underline' }} onClick={e => { e.preventDefault(); navigate('/signup'); }}>
                Sign Up
              </a>
            </div>
          </div>
          <Modal isOpen={showLicense} onClose={() => setShowLicense(false)} title="User License Agreement">
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', maxHeight: '60vh', overflowY: 'auto' }}>{LICENSE_AGREEMENT}</pre>
          </Modal>
          <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms & Conditions">
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', maxHeight: '60vh', overflowY: 'auto' }}>{TERMS_AND_CONDITIONS}</pre>
          </Modal>
        </StyledWrapper>
      </div>
    </div>
  );
}

export default SLogin;






const StyledWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%);
  padding: 0;

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
