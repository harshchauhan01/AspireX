import { Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

export default function PrivateRoute({ children, role }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      let token = null;
      
      if (role === 'mentor') {
        token = localStorage.getItem('Mentortoken');
      } else if (role === 'student') {
        token = localStorage.getItem('token');
      } else {
        // fallback: check for either token
        token = localStorage.getItem('token') || localStorage.getItem('Mentortoken');
      }

      if (!token) {
        setIsAuthenticated(false);
        // Show a more user-friendly message
        console.warn('Authentication required. Please log in to access this page.');
      } else {
        setIsAuthenticated(true);
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [role]);

  if (isChecking) {
    // Show loading state while checking authentication
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to home page with a message
    return <Navigate to="/" replace />;
  }

  return children;
}
