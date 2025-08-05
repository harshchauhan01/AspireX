import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on app load
    const checkAuth = () => {
      const mentorToken = localStorage.getItem('Mentortoken');
      const studentToken = localStorage.getItem('token');
      const storedUserRole = localStorage.getItem('userRole');
      const storedUserData = localStorage.getItem('userData');

      if (mentorToken || studentToken) {
        setUserRole(storedUserRole);
        setIsAuthenticated(true);
        if (storedUserData) {
          try {
            setUser(JSON.parse(storedUserData));
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData, token, role) => {
    if (role === 'mentor') {
      localStorage.setItem('Mentortoken', token);
    } else {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('userRole', role);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    setUser(userData);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('Mentortoken');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const value = {
    user,
    userRole,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 