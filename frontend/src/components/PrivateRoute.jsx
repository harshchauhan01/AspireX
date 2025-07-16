import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, role }) {
  let token = null;
  let loginPath = '/login';

  if (role === 'mentor') {
    token = localStorage.getItem('Mentortoken');
    loginPath = '/mentor/login';
  } else if (role === 'student') {
    token = localStorage.getItem('token');
    loginPath = '/student/login';
  } else {
    // fallback: check for either token, default to student login
    token = localStorage.getItem('token') || localStorage.getItem('Mentortoken');
    loginPath = '/login';
  }

  return token ? children : <Navigate to={loginPath} />;
}
