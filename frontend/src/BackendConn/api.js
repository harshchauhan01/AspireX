import axios from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:8000';

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

API.interceptors.request.use((config) => {
  // Check for both student and mentor tokens
  const studentToken = localStorage.getItem('token');
  const mentorToken = localStorage.getItem('Mentortoken');
  const token = mentorToken || studentToken;
  
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const postMeetingAttendance = async (data, tokenOverride) => {
  const { meeting_id, role, attendance_key } = data;
  if (!meeting_id || !role || !attendance_key) throw new Error('Missing required fields');
  const mentorToken = localStorage.getItem('Mentortoken');
  const studentToken = localStorage.getItem('token');
  const token = tokenOverride || mentorToken || studentToken;
  if (!token) throw new Error('No auth token found');
  const response = await fetch('http://127.0.0.1:8000/api/mentor/meeting/attendance/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({ meeting_id, role, attendance_key })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to record attendance');
  return result;
};

export const fetchMeetingAttendance = async (meeting_id) => {
  if (!meeting_id) return { attended_roles: [] };
  const mentorToken = localStorage.getItem('Mentortoken');
  const studentToken = localStorage.getItem('token');
  const token = mentorToken || studentToken;
  if (!token) throw new Error('No auth token found');
  const response = await fetch(`http://127.0.0.1:8000/api/mentor/meeting/attendance/?meeting_id=${meeting_id}`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch attendance');
  return response.json();
};

export default API;
